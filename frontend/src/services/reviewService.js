// src/services/reviewService.js
import { reviewAPI } from '../api/index';

export async function getReviewStatus(courseId) {
  const { data } = await reviewAPI.get(`/reviews/student/${courseId}`);
  return data;                     // → { status, instructorResponse }
}

export async function submitReview(courseId, message) {
  return reviewAPI.post('/reviews', { courseId, message });
}