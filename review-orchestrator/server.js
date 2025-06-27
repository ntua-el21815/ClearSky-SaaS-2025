// Review Orchestrator Service
const express = require('express');
const amqp = require('amqplib');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Environment variables
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const REVIEW_SERVICE_URL = process.env.REVIEW_SERVICE_URL || 'http://review-service:3001';
const GRADE_SERVICE_URL = process.env.GRADE_SERVICE_URL || 'http://review-service:3002';
const NOTIFICATION_QUEUE = 'review_notifications';

let rabbitChannel = null;

// Initialize RabbitMQ connection
async function initRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    rabbitChannel = await connection.createChannel();
    
    // Ensure notification queue exists
    await rabbitChannel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
    
    console.log('RabbitMQ connected successfully');
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    // Retry connection after 5 seconds
    setTimeout(initRabbitMQ, 5000);
  }
}

// Send notification via RabbitMQ
async function sendNotification(notificationData) {
  if (!rabbitChannel) {
    console.error('RabbitMQ channel not available');
    return false;
  }
  
  try {
    await rabbitChannel.sendToQueue(
      NOTIFICATION_QUEUE,
      Buffer.from(JSON.stringify(notificationData)),
      { persistent: true }
    );
    console.log('Notification sent:', notificationData.type);
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'review-orchestrator',
    timestamp: new Date().toISOString() 
  });
});

// UC03: Grade review request orchestration
app.post('/api/review-requests', async (req, res) => {
  try {
    const {
      studentCode,
      courseId,
      reason,
      institutionId,
      academicPeriod
    } = req.body;

    // Validate required fields
    if (!studentCode || !courseId || !reason || !institutionId || !academicPeriod) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: studentCode, courseId, reason, institutionId, or academicPeriod'
      });
    }

    console.log('🔍 Checking course grade status before review request...');

    // Step 0: Check grade status via orchestrator route
    const gradeStatusResponse = await axios.get(
      `${GRADE_SERVICE_URL}/gradeRoutes/course-status`,
      {
        params: {
          courseId,
          institutionId,
          academicPeriod
        },
        timeout: 5000
      }
    );

    const status = gradeStatusResponse.data.status;

    if (status !== "Open") {
      return res.status(403).json({
        success: false,
        error: `Cannot submit review for closed course. Current status: ${status}`
      });
    }

    console.log(`✅ Course status is ${status}, proceeding with review creation`);

    // Step 1: Create review request in Review Service
    const reviewData = {
      studentCode,
      courseId,
      reason,
      institutionId,
      academicPeriod,
      status: 'PENDING',
      requestedAt: new Date().toISOString()
    };


    const reviewResponse = await axios.post(`${REVIEW_SERVICE_URL}`, reviewData, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const createdReview = reviewResponse.data;
    console.log('✅ Review request created with ID:', createdReview.id);

    // Step 2: Send notification
    const notificationData = {
      type: 'REVIEW_REQUEST_CREATED',
      reviewId: createdReview.id,
      studentId: createdReview.studentCode,
      courseId: createdReview.courseId,
      message: `New grade review request from student ${createdReview.studentCode}`,
      timestamp: new Date().toISOString()
    };

    await sendNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Review request submitted successfully',
      reviewId: createdReview.id,
      data: createdReview
    });

  } catch (error) {
    console.error('❌ Error processing review request:', error.message);

    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Course not found or does not belong to student.'
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Grade service unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process review request',
      details: error.response?.data || error.message
    });
  }
});
;

// UC04: Reply to review request orchestration
app.post('/api/review-requests/:reviewId/reply', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { instructorResponse, reviewedGrade} = req.body;
    
    let resolution = 'RESOLVED_REJECTED';

    if (reviewedGrade !== undefined) {
      resolution = 'RESOLVED_APPROVED';
    }

    // Validate required fields
    if (!instructorResponse) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: instructorResponse'
      });
    }

    console.log('Processing review reply for review ID:', reviewId);

    // Step 1: Update review with instructor response in Review Service
    const updateData = {
      type: 'REVIEW_REPLY',
      instructorResponse,
      reviewedGrade: reviewedGrade || null,
      status: resolution,
      resolvedAt: new Date().toISOString()
    };

    const updateResponse = await axios.put(
      `${REVIEW_SERVICE_URL}/${reviewId}`,
      updateData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const updatedReview = updateResponse.data;
    console.log('Review updated successfully:', reviewId);

    // Step 2: Send notification about review completion
    const notificationData = {
      type: 'REVIEW_REQUEST_COMPLETED',
      reviewId: updatedReview.id,
      studentId: updatedReview.studentCode,
      courseId: updatedReview.courseId,
      message: `Your grade review request has been processed`,
      timestamp: new Date().toISOString()
    };

    await sendNotification(notificationData);

    // Step 3: Trigger cleanup notification for temporary grade data (REQ016)
    const cleanupNotification = {
      type: 'CLEANUP_TEMP_GRADES',
      reviewId: updatedReview.id,
      //gradeId: updatedReview.gradeId,
      message: 'Delete temporary personal grade details',
      timestamp: new Date().toISOString()
    };

    await sendNotification(cleanupNotification);

    res.json({
      success: true,
      message: 'Review reply processed successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error processing review reply:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Review service unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process review reply',
      details: error.response?.data || error.message
    });
  }
});

// Get review requests (for instructor dashboard)
app.get('/api/review-requests', async (req, res) => {
  try {
    // Pass query parameters directly to the review service
    const response = await axios.get(REVIEW_SERVICE_URL, {
      params: req.query,
      timeout: 10000
    });

    console.log('Fetching review requests with filters:', req.query);
    
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error fetching review requests:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Review service unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch review requests',
      details: error.response?.data || error.message
    });
  }
});

// Get specific review request
app.get('/api/review-requests/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    
    const response = await axios.get(`${REVIEW_SERVICE_URL}/${reviewId}`, {
      timeout: 10000
    });
    
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Error fetching review request:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Review service unavailable'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch review request',
      details: error.response?.data || error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (rabbitChannel) {
    await rabbitChannel.close();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  if (rabbitChannel) {
    await rabbitChannel.close();
  }
  process.exit(0);
});

// Start server
async function startServer() {
  await initRabbitMQ();
  
  app.listen(PORT, () => {
    console.log(`Review Orchestrator Service running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();