import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const mockInstructor = {
  name: 'Dr. Maria Ioannidou',
  email: 'instructor@example.com'
};

const mockReviewRequests = [
  {
    course: 'software II',
    examPeriod: 'spring 2025',
    student: 'john doe'
  },
  {
    course: 'software II',
    examPeriod: 'spring 2025',
    student: 'jane doe'
  },
  {
    course: 'software I',
    examPeriod: 'fall 2024',
    student: 'george smith'
  }
];

export default function InstructorReviewRequests() {
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
        <h1 className="text-xl font-bold">ClearSky - Review Requests</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Back to Courses
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

      <h2 className="text-lg font-semibold mb-4">{mockInstructor.name}</h2>

      <table className="w-full table-auto border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Course Name</th>
            <th className="border px-2 py-1">Exam Period</th>
            <th className="border px-2 py-1">Student</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockReviewRequests.map((req, idx) => (
            <tr key={idx} className="text-center">
              <td className="border px-2 py-1">{req.course}</td>
              <td className="border px-2 py-1">{req.examPeriod}</td>
              <td className="border px-2 py-1">{req.student}</td>
              <td className="border px-2 py-1">
                <button 
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                  onClick={() => navigate('/instructor/review_reply', { state: req })}
                  >
                  Reply
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}