import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const mockInstructor = {
  name: 'Dr. Maria Ioannidou',
  email: 'instructor@example.com'
};

const mockReviewRequests = [
  { course: 'software II', examPeriod: 'spring 2025', student: 'john doe' },
  { course: 'software II', examPeriod: 'spring 2025', student: 'jane doe' },
  { course: 'software I', examPeriod: 'fall 2024', student: 'george smith' }
];

export default function InstructorReviewReply() {
  const navigate = useNavigate();
  const location = useLocation();
  const selected = location.state;

  const [action, setAction] = useState('Total accept');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'instructor') {
      navigate('/login');
    }
  }, [navigate]);

  const handleUpload = () => {
    if (!message.trim()) {
      alert('Please write a message.');
      return;
    }
    alert(`Review reply submitted: ${action}\nMessage: ${message}`);
    navigate('/instructor/instructor_review_requests');
  };

  return (
    <div className="p-4">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky - Reply to Request</h1>
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

      <table className="w-full table-auto border mb-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">Course Name</th>
            <th className="border px-2 py-1">Exam Period</th>
            <th className="border px-2 py-1">Student</th>
            <th className="border px-2 py-1">Action</th>
          </tr>
        </thead>
        <tbody>
          {mockReviewRequests.map((req, idx) => {
            const isSelected = req.course === selected?.course && req.examPeriod === selected?.examPeriod && req.student === selected?.student;
            return (
              <tr key={idx} className={`text-center ${isSelected ? 'bg-yellow-100 font-semibold' : ''}`}>
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
            );
          })}
        </tbody>
      </table>

      {selected && (
        <section className="bg-gray-100 p-4 rounded shadow">
          <h3 className="text-md font-semibold mb-2">Reply to Grade Review Request — {selected.course} ({selected.examPeriod}) - {selected.student}</h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Student's Message</label>
            <div className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800">
              This is the review message from the student regarding the grade. {/* Αν έχεις δυναμικά δεδομένα, άλλαξε εδώ */}
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option>Total accept</option>
              <option>Partial accept</option>
              <option>Decline</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">Instructor's Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 p-2 border border-gray-300 rounded"
            />
          </div>
          <button
            onClick={handleUpload}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            Send Reply
          </button>
        </section>
      )}
    </div>
  );
}