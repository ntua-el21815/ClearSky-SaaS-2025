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
      typeof reason !== 'string' ||
      !studentId ||
      !courseId ||
      !gradeId ||
      !reason
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
      studentRegistrationNumber: studentRegistrationNumber ? studentRegistrationNumber.trim() : null,
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
    res.status(200).json({ success: true, data: reviews });
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

export const getReviewsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId || typeof courseId !== 'string' || !courseId.trim()) {
      return res.status(400).json({ message: 'Invalid courseId' });
    }
    const reviews = await Review.find({ courseId: courseId.trim() });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review [corresponds to "Review Finished" by Review Orchestrator [cite: 3]]
// (e.g., status, instructorResponse, reviewedGrade)
export const updateReview = async (req, res) => {
  try {
    const { status, instructorResponse, reviewedGrade } = req.body;

    // Require all fields to be present and non-empty
    if (
      typeof status !== 'string' ||
      typeof instructorResponse !== 'string' ||
      !status.trim() ||
      !instructorResponse.trim() 
    ) {
      return res.status(400).json({ message: 'Fields (status, instructorResponse) are required and must be non-empty strings' });
    }

    if (reviewedGrade && typeof reviewedGrade !== 'string') {
      return res.status(400).json({ message: 'reviewedGrade must be a string if provided' });
    }

    const updateData = {
      status: status.trim(),
      instructorResponse: instructorResponse.trim(),
      reviewedGrade: reviewedGrade ? reviewedGrade.trim() : undefined,
    };

    const review = await Review.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
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
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};