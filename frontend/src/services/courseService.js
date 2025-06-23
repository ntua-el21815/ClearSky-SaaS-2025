import { gradeAPI, reviewAPI } from '../api/index';

/* ===== COURSES LIST ===== */
export async function fetchStudentCourses() {
  const { data } = await gradeAPI.get('/grades/courses');
  return data;         // array
}