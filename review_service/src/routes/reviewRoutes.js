// src/routes/reviewRoutes.js
import express from 'express';
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByCourseId,
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', createReview);
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview); // Optional
router.get('/course/:courseId', getReviewsByCourseId);

export default router;