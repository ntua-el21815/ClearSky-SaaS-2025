import { gradeAPI } from '../api/index';

export async function fetchStudentStatistics(courseId) {
  const { data } = await gradeAPI.get(`api/course/${courseId}/statistics`);
  return data;                                                // 200 => array
}

export async function fetchPersonalGrades(courseId) {
  const { data } = await gradeAPI.get(`/grades/personal/${courseId}`);
  return data;                               // -> αντικείμενο όπως στο table
}