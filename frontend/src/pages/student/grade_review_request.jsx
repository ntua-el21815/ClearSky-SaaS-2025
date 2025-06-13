import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout';
import Button from '../../components/Button';

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
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
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

          <div className="overflow-auto bg-white shadow rounded-xl mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Course Name</th>
                  <th className="px-4 py-2 text-left">Exam Period</th>
                  <th className="px-4 py-2 text-left">Grading Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockCourses.map((course, idx) => {
                  const isReviewDisabled = course.gradingStatus.toLowerCase() !== 'open';
                  return (
                    <tr key={idx} className={`border-t ${course.name === selectedCourseName ? 'bg-yellow-50 font-semibold' : ''}`}>
                      <td className="px-4 py-2 font-semibold">{course.name}</td>
                      <td className="px-4 py-2">{course.examPeriod}</td>
                      <td className={`px-4 py-2 ${isReviewDisabled ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                        {course.gradingStatus}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-row gap-2">
                          <Button
                            size="sm"
                            onClick={() => navigate('/student/personal_grades', { state: { courseName: course.name } })}
                          >
                            View Grades
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={isReviewDisabled}
                            className={isReviewDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            onClick={() => navigate('/student/grade_review_request', { state: { courseName: course.name } })}
                          >
                            Request Review
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate('/student/review_status', { state: { courseName: course.name } })}
                          >
                            Review Status
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {selectedCourseName && (
            <section className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-md font-semibold mb-3 text-gray-900">
                New Review Request — <span className="capitalize">{selectedCourseName}</span>
              </h3>
              <textarea
                placeholder="Message to instructor"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded mb-4"
              />
              <Button onClick={handleSubmit}>Submit grade review request</Button>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}