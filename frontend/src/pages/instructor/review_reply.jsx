import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from "../../components/layout/index";

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
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reply to Grade Review Request</h1>
              <p className="text-gray-600">{mockInstructor.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="bg-[#0A2A72] text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="overflow-auto bg-white shadow rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Course Name</th>
                  <th className="px-4 py-2 text-left">Exam Period</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockReviewRequests.map((req, idx) => {
                  const isSelected =
                    req.course === selected?.course &&
                    req.examPeriod === selected?.examPeriod &&
                    req.student === selected?.student;
                  return (
                    <tr key={idx} className={`border-t ${isSelected ? 'bg-yellow-50 font-semibold' : ''}`}>
                      <td className="px-4 py-2">{req.course}</td>
                      <td className="px-4 py-2">{req.examPeriod}</td>
                      <td className="px-4 py-2">{req.student}</td>
                      <td className="px-4 py-2">
                        <button
                          className="bg-[#0A2A72] text-white px-4 py-1.5 rounded-md text-sm"
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
          </div>

          {selected && (
            <section className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Reply to {selected.course} ({selected.examPeriod}) - {selected.student}
              </h3>

              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">Student's Message</label>
                <div className="w-full p-3 border border-gray-300 rounded bg-gray-50 text-gray-800 text-sm">
                  This is the review message from the student regarding the grade.
                </div>
              </div>

              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">Action</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full border border-gray-300 p-2 rounded text-sm"
                >
                  <option>Total accept</option>
                  <option>Partial accept</option>
                  <option>Decline</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block font-medium text-gray-700 mb-1">Instructor's Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded text-sm"
                />
              </div>

              <button
                onClick={handleUpload}
                className="bg-[#0A2A72] text-white px-6 py-2 rounded-md text-sm font-medium"
              >
                Send Reply
              </button>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}