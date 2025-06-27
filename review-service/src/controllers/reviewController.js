// src/controllers/reviewController.js
import Review from '../models/reviewModel.js';

// Create a new review [corresponds to "Review Requested" by Review Orchestrator]
export const createReview = async (req, res) => {
  try {
    const {
      studentCode,
      courseId,
      academicPeriod,
      institutionId,
      reason,
    } = req.body;

    // Basic validation
    if (
      !studentCode || !courseId || !academicPeriod || !institutionId || !reason ||
      typeof studentCode !== 'string' ||
      typeof courseId !== 'string' ||
      typeof academicPeriod !== 'string' ||
      typeof institutionId !== 'string' ||
      typeof reason !== 'string'
    ) {
      return res.status(400).json({ message: 'Missing or invalid input fields' });
    }

    // 🚫 Duplicate check
    const existingReview = await Review.findOne({
      studentCode: studentCode.trim(),
      courseId: courseId.trim(),
      academicPeriod: academicPeriod.trim(),
      institutionId: institutionId.trim()
    });

    if (existingReview) {
      return res.status(409).json({
        message: 'Duplicate review request already exists for this course and student.'
      });
    }

    // ✅ Create new review
    const review = new Review({
      studentCode: studentCode.trim(),
      courseId: courseId.trim(),
      academicPeriod: academicPeriod.trim(),
      institutionId: institutionId.trim(),
      reason: reason.trim(),
      status: 'PENDING',
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
};;

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
    const { academicPeriod, institutionId } = req.query;

    // Validate all required inputs
    if (
      !courseId || typeof courseId !== 'string' || !courseId.trim() ||
      !academicPeriod || typeof academicPeriod !== 'string' || !academicPeriod.trim() ||
      !institutionId || typeof institutionId !== 'string' || !institutionId.trim()
    ) {
      return res.status(400).json({
        message: 'Missing or invalid parameters: courseId, academicPeriod, and institutionId are required'
      });
    }

    const reviews = await Review.find({
      courseId: courseId.trim(),
      academicPeriod: academicPeriod.trim(),
      institutionId: institutionId.trim()
    });

    res.status(200).json({ success: true, data: reviews });
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