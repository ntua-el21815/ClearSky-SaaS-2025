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
  const { data } = await gradeAPI.post('/api/grade/submissions', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
}

export async function fetchAllGradesByCourse() {
  const { data } = await gradeAPI.get('/api/grades/by-course');  // από orchestrator
  return data;
}

export async function fetchPersonalGrades(courseId) {
  const user = JSON.parse(localStorage.getItem('user'));
  const studentId = user?.id;

  if (!studentId) throw new Error('No student ID found');

  const res = await fetch(`/api/grades/student?courseId=${courseId}&studentId=${studentId}`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || 'Failed to fetch grades');
  }

  return res.json(); // αναμένουμε JSON με fields: name, examPeriod, grades, stats
}

export async function fetchAllStatistics() {
  const res = await fetch('/api/statistics/all');
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}
