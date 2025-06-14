import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout';
import Button from '../../components/Button';

const mockUser = {
  name: 'Aggeliki Papadopoulou',
  email: 'student@example.com'
};

const mockReviews = [
  { course: 'physics', status: 'Pending', instructorResponse: null },
  { course: 'software', status: 'Reviewed', instructorResponse: 'Regrade not approved' },
  { course: 'mathematics', status: 'Reviewed', instructorResponse: 'Regrade granted: New grade 8.5' }
];

export default function ReviewStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCourseName = location.state?.courseName;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Review Requests</h1>
              <p className="text-gray-600">{mockUser.name}, {mockUser.email}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button className="min-w-[120px]" onClick={() => navigate('/student/grade_statistics')}>
                Statistics
              </Button>
              <Button
                className="min-w-[120px]"
                variant="secondary"
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="overflow-auto bg-white shadow rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Course</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Instructor Response</th>
                </tr>
              </thead>
              <tbody>
                {mockReviews.map((review, idx) => (
                  <tr
                    key={idx}
                    className={`border-t ${review.course === selectedCourseName ? 'bg-yellow-50 font-semibold' : ''}`}
                  >
                    <td className="px-4 py-2 font-semibold capitalize">{review.course}</td>
                    <td className="px-4 py-2">{review.status}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {review.instructorResponse ? review.instructorResponse : '—'}
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