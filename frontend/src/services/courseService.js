import { gradeAPI, reviewAPI } from '../api/index';

/* ===== COURSES LIST ===== */
export async function fetchStudentCourses() {
  const { data } = await gradeAPI.get('/grades/courses');
  return data;         // array
<<<<<<< HEAD
}

/* ===== REVIEW STATUS ===== */
export async function getReviewStatus(courseId) {
  const { data } = await reviewAPI.get(`/reviews/status/${courseId}`);
  return data;         // { status, instructorResponse }
}

/* ===== SUBMIT REVIEW ===== */
export async function submitReview(courseId, message) {
  const { data } = await reviewAPI.post('/reviews', { courseId, message });
  return data;         // whatever the API στέλνει (π.χ. 201 + obj)
=======
>>>>>>> origin/Harris
}