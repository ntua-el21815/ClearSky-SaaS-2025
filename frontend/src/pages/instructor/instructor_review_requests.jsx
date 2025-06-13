import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../../components/layout/index";

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
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Requests</h1>
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
                {mockReviewRequests.map((req, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2 font-medium text-gray-900">{req.course}</td>
                    <td className="px-4 py-2 text-gray-700">{req.examPeriod}</td>
                    <td className="px-4 py-2 text-gray-700">{req.student}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate('/instructor/review_reply', { state: req })}
                        className="bg-[#0A2A72] text-white px-4 py-1.5 rounded-md text-sm"
                      >
                        Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </Layout>
  );
}