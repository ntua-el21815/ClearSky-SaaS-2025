// src/services/reviewService.js
import { reviewAPI } from '../api/index';


export async function createReviewRequest({
    courseId,
    gradeId,
    reason
  }) {
  const studentId = Cookies.get('userId');

  const payload = {studentId, courseId, gradeId, reason};

  const { data } = await reviewAPI.post('/review-requests', payload);
  return data;
}

export async function getReviewRequests({ courseId, status } = {}) {
  const { data } = await reviewAPI.get('/review-requests', {
    params: { courseId, status }
  });
  return data;
}

export async function getReviewRequestById(reviewId) {
  const { data } = await reviewAPI.get(`/review-requests/${reviewId}`);
  return data;
}

export async function replyToReviewRequest(reviewId, payload) {
  const { data } = await reviewAPI.post(
    `/review-requests/${reviewId}/reply`,
    payload               // ➜ body
  );
  return data;            // → { success:true, message: '...' }
}
