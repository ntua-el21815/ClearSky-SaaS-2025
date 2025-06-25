const express = require('express');
const axios = require('axios');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const { initRabbit, publishUserCreated } = require('./rabbitmq');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

const USER_AUTH_SERVICE_URL = process.env.USER_AUTH_SERVICE_URL || 'http://localhost:5000';
const USER_MANAGEMENT_SERVICE_URL = process.env.USER_MANAGEMENT_SERVICE_URL || 'http://localhost:6000';
const CREDIT_SERVICE_URL = process.env.CREDIT_SERVICE_URL || 'http://localhost:3000';

// Auth orchestration endpoint
app.post('/api/auth', async (req, res) => {

  let token, email, password;
  if (req.body && typeof req.body === 'object') {
    if ('token' in req.body) token = req.body.token;
    if ('email' in req.body) email = req.body.email;
    if ('password' in req.body) password = req.body.password;
  }

  console.log('🔍 Auth request received:', { token, email, password });
  try {
    if (token) {
      try {
        const verifyResponse = await axios.get(`${USER_AUTH_SERVICE_URL}/auth/verify-token`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        return res.json({
          success: true,
          message: 'Token is valid',
          user: verifyResponse.data.user,
          token
        });
      } catch (verifyErr) {
        console.warn('⚠️ Token verification failed:', verifyErr.response?.data || verifyErr.message);
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const loginResponse = await axios.post(`${USER_AUTH_SERVICE_URL}/auth/login`, { email, password });

    return res.json({
      success: true,
      message: 'Login successful',
      user: loginResponse.data.user,
      token: loginResponse.data.token
    });

  } catch (err) {
    console.error('❌ Auth orchestration error:', err.message);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      details: err.response?.data || err.message
    });
  }
});

app.post('/api/signup', async (req, res) => {
  const { email, password, fullName, role, userCode, repCode } = req.body;

  if (!email || !password || !fullName || !role || !userCode || !repCode) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, password, fullName, role, userCode, repCode'
    });
  }

  let institutionId;
  try {
    const userResp = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${repCode}`, { timeout: 5000 });
    institutionId = userResp.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'Creator user does not have an institutionId'
      });
    }
  } catch (err) {
    console.error('Failed to fetch creator user:', err.message);
    return res.status(502).json({
      success: false,
      error: 'Failed to fetch creator user',
      details: err.response?.data || err.message
    });
  }

  try {
    const registerResponse = await axios.post(`${USER_MANAGEMENT_SERVICE_URL}/users/register`, {
      email,
      password,
      fullName,
      role,
      userCode,
      institutionId
    }, { timeout: 5000 });

    const createdUser = registerResponse.data.user;
    const userId = createdUser.id;

    console.log("Forwarding user ID:", createdUser.id);

    // Publish to RabbitMQ with ID
    await publishUserCreated({
      id: userId,
      email,
      password,
      fullName,
      role,
      userCode,
      institutionId
    });

    return res.status(201).json({
      success: true,
      message: 'Signup successful',
      user: createdUser,
      token: registerResponse.data.token
    });

  } catch (err) {
    console.error('Signup orchestration error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Signup failed',
      details: err.response?.data || err.message
    });
  }
});


app.post('/api/credits/user-code/:userCode/add', async (req, res) => {
  const { userCode } = req.params;
  const { credits } = req.body;

  try {
    // Step 1: Get institutionId from user-management service using userCode
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResponse.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Forward the credit addition request to the credit service
    const response = await axios.post(
      `${CREDIT_SERVICE_URL}/api/credits/institution/${institutionId}/add`,
      { credits }
    );

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('❌ Error processing credit addition:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to add credits',
      error: error.response?.data || error.message
    });
  }
});



// Forward GET /users/:id/courses to user management service
app.get('/api/users/:id/courses', async (req, res) => {
  try {
    const response = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/${req.params.id}/courses`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error fetching student courses:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get student courses',
      error: error.response?.data || error.message
    });
  }
});

// Forward GET /users/:id/instructor-courses
app.get('/api/users/:id/instructor-courses', async (req, res) => {
  try {
    const response = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/${req.params.id}/instructor-courses`);
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('❌ Error fetching instructor courses:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get instructor courses',
      error: error.response?.data || error.message
    });
  }
});

// get users for institution
app.get('/api/users/count/by-user/:userCode', async (req, res) => {
  const { userCode } = req.params;

  try {
    // Step 1: Get institutionId from user-management service
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResponse.data?.institutionId;

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Use institutionId to get user count
    const countResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/count/by-institution/${institutionId}`);
    res.status(countResponse.status).json(countResponse.data);

  } catch (error) {
    console.error('❌ Error fetching user count by institution:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get user count by institution',
      error: error.response?.data || error.message
    });
  }
});

// GET available credits for institution using user
app.get('/api/credits/by-user/:userCode/available', async (req, res) => {
  const { userCode } = req.params;

  try {
    // Step 1: Get institutionId from user-management
    const userResponse = await axios.get(`${USER_MANAGEMENT_SERVICE_URL}/users/by-code/${userCode}`, {
      timeout: 5000
    });

    const institutionId = userResponse.data?.institutionId;
    if (!institutionId) {
      return res.status(400).json({
        success: false,
        error: 'User does not have an institutionId'
      });
    }

    // Step 2: Get available credits from credit service
    const creditResponse = await axios.get(`${CREDIT_SERVICE_URL}/api/credits/institution/${institutionId}/balance`);
    const { availableCredits } = creditResponse.data;

    return res.json({ institutionId, availableCredits });

  } catch (error) {
    console.error('❌ Error fetching available credits:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Failed to get available credits',
      error: error.response?.data || error.message
    });
  }
});


app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'auth-orchestrator', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Auth Orchestrator running at http://localhost:${PORT}`);
});

// 👇 Start RabbitMQ connection (with retry logic in rabbitmq.js)
initRabbit();
