import { gradeAPI } from '../api/index';

export async function fetchStudentStatistics() {
  const { data } = await gradeAPI.get('/grades/statistics');  // interceptor ⇒ userId
  return data;                                               // 200 => array
}

export async function fetchPersonalGrades(courseId) {
  const { data } = await gradeAPI.get(`/grades/personal/${courseId}`);
  return data;                               // -> αντικείμενο όπως στο table
}

export async function uploadGradeFile({
  file,
  institutionId,
  userId,
  isFinal = false          // false → initial, true → final
}) {
  const fd = new FormData();
  fd.append('file',          file);
  fd.append('institutionId', institutionId);
  fd.append('userId',        userId);
  fd.append('final',         String(isFinal));   // "true" | "false"

  // ✱ επιστρέφει το response data για consistency
  const { data } = await gradeAPI.post('/grade/submission', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}
