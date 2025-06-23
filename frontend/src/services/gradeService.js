import { gradeAPI } from '../api/index';

export async function fetchStudentStatistics() {
  const { data } = await gradeAPI.get('/grades/statistics');  // interceptor ⇒ userId
  return data;                                               // 200 => array
}

export async function fetchPersonalGrades(courseId) {
  const { data } = await gradeAPI.get(`/grades/personal/${courseId}`);
  return data;                               // -> αντικείμενο όπως στο table
}