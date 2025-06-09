import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mockInstructor = {
  name: 'Dr. Maria Ioannidou',
  email: 'instructor@example.com'
};

const mockCourses = [
  { name: 'physics', examPeriod: 'spring 2025' },
  { name: 'software', examPeriod: 'fall 2024' },
  { name: 'mathematics', examPeriod: 'fall 2024' }
];

export default function InstructorCourses() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'instructor') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="p-4">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky - Instructor</h1>
        <div className="space-x-4">
          <button 
            className="bg-green-600 text-white px-2 py-1 rounded"
            onClick={() => navigate('/instructor/post_initial_grades')}
          >
            Post Initial Grades
          </button>
          <button
            onClick={() => navigate('/instructor/instructor_review_requests')}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Review Requests
          </button>
          <button
            onClick={() => navigate('/instructor/statistics')}
            className="px-4 py-1 bg-indigo-600 text-white rounded"
          >
            Show Statistics
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-1 bg-gray-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <h2 className="text-lg font-semibold mb-4">{mockInstructor.name}, {mockInstructor.email}</h2>

      <table className="w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Course Name</th>
            <th className="border px-2 py-1">Exam Period</th>
          </tr>
        </thead>
        <tbody>
          {mockCourses.map((course, idx) => (
            <tr key={idx} className="text-center">
              <td className="border px-2 py-1">{course.name}</td>
              <td className="border px-2 py-1">{course.examPeriod}</td>
              <td className="border px-2 py-1 space-x-2">
                <button 
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => navigate('/instructor/post_final_grades')}
                  >
                  Post Final Grades
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}