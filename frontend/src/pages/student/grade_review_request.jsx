import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const mockUser = {
  name: 'Aggeliki Papadopoulou',
  email: 'student@example.com'
};

const mockCourses = [
  {
    name: 'physics',
    examPeriod: 'spring 2025',
    gradingStatus: 'open'
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    gradingStatus: 'closed'
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    gradingStatus: 'closed'
  }
];

export default function GradeReviewRequest() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('');
  const selectedCourseName = location.state?.courseName;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = () => {
    if (!message.trim()) {
      alert('Please write a message before submitting.');
      return;
    }
    console.log(`Review submitted for ${selectedCourseName}:`, message);
    alert('Review submitted!');
    navigate('/student/courses');
  };

  return (
    <div className="p-4">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/student/grade_statistics')} className="px-4 py-1 bg-blue-500 text-white rounded">
            Statistics
          </button>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="px-4 py-1 bg-gray-500 text-white rounded">
            Logout
          </button>
        </div>
      </header>

      <h2 className="text-lg font-semibold mb-4">{mockUser.name}, {mockUser.email}</h2>

      <table className="w-full table-auto border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Course Name</th>
            <th className="border px-2 py-1">Exam Period</th>
            <th className="border px-2 py-1">Grading Status</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockCourses.map((course, idx) => (
            <tr
              key={idx}
              className={`text-center ${course.name === selectedCourseName ? 'bg-yellow-100 font-semibold' : ''}`}
            >
              <td className="border px-2 py-1">{course.name}</td>
              <td className="border px-2 py-1">{course.examPeriod}</td>
              <td className="border px-2 py-1">{course.gradingStatus}</td>
              <td className="border px-2 py-1 space-x-2">
                <button 
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() => navigate('/student/personal_grades', { state: { courseName: course.name } })}
                >
                View My Grades
                </button>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  disabled={course.gradingStatus !== 'open'}
                  onClick={() => navigate('/student/grade_review_request', { state: { courseName: course.name } })}
                >
                  Ask for Review
                </button>
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded"
                  onClick={() => navigate('/student/review_status', { state: { courseName: course.name } })}
                >
                  View Review Status
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCourseName && (
        <section className="bg-gray-100 p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2">NEW REVIEW REQUEST — {selectedCourseName}</h3>
          <textarea
            placeholder="Message to instructor"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full h-32 p-2 border border-gray-300 rounded mb-4"
          />
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
            Submit grade review request
          </button>
        </section>
      )}
    </div>
  );
}