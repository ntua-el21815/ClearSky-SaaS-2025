// src/controllers/reviewController.js
import Review from '../models/reviewModel.js';

// Create a new review [corresponds to "Review Requested" by Review Orchestrator [cite: 3]]
export const createReview = async (req, res) => {
  try {
    const {
      studentId,
      courseId,
      gradeId,
      studentRegistrationNumber,
      reason,
    } = req.body;

    // Basic sanitization and validation
    if (
      typeof studentId !== 'string' ||
      typeof courseId !== 'string' ||
      typeof gradeId !== 'string' ||
      typeof studentRegistrationNumber !== 'string' ||
      typeof reason !== 'string' ||
      !studentId.trim() ||
      !courseId.trim() ||
      !gradeId.trim() ||
      !studentRegistrationNumber.trim() ||
      !reason.trim()
    ) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Check if the student exists, remember to reapply later
    // const student = await Student.findOne({ id: studentId.trim() });
    // if (!student) {
    //   return res.status(404).json({ message: 'Student not found' });
    // }
    
    const review = new Review({
      studentId: studentId.trim(),
      courseId: courseId.trim(),
      gradeId: gradeId.trim(),
      studentRegistrationNumber: studentRegistrationNumber.trim(),
      reason: reason.trim(),
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find(req.query); // Basic filtering via query params
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single review by ID
export const getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review [corresponds to "Review Finished" by Review Orchestrator [cite: 3]]
// (e.g., status, instructorResponse, reviewedGrade)
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Publish event to RabbitMQ
    await publishReviewEvent(`review.updated.${review.status.toLowerCase()}`, review);
    res.status(200).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a review (optional, for administrative purposes)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await publishReviewEvent('review.deleted', { id: req.params.id });
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};