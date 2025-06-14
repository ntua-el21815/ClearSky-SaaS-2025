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
    gradingStatus: 'Open'
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    gradingStatus: 'Closed'
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    gradingStatus: 'Closed'
  }
];

const mockReviews = [
  { course: 'physics', status: 'Pending', instructorResponse: null },
  { course: 'software', status: 'Reviewed', instructorResponse: 'Regrade not approved' },
  { course: 'mathematics', status: 'Reviewed', instructorResponse: 'Regrade granted: New grade 8.5' }
];

export default function MyCourses() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCourseName = location.state?.courseName;
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [reviewMessages, setReviewMessages] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  const handleToggleReview = (courseName) => {
    setExpandedCourse(prev => (prev === courseName ? null : courseName));
  };

  const handleReviewSubmit = (courseName) => {
    const message = reviewMessages[courseName]?.trim();
    if (!message) {
      alert('Please enter a message before submitting.');
      return;
    }
    console.log(`Review submitted for ${courseName}:`, message);
    alert('Review submitted!');
    setReviewMessages((prev) => ({ ...prev, [courseName]: '' }));
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
                  const review = mockReviews.find(r => r.course === course.name);
                  const isExpanded = expandedCourse === course.name;

                  return (
                    <React.Fragment key={idx}>
                      <tr className={`border-t ${course.name === selectedCourseName ? 'bg-yellow-50 font-semibold' : ''}`}>
                        <td className="px-4 py-2 font-semibold">{course.name}</td>
                        <td className="px-4 py-2">{course.examPeriod}</td>
                        <td className={`px-4 py-2 ${isReviewDisabled ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                          {course.gradingStatus}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                navigate('/student/personal_grades', { state: { courseName: course.name } })
                              }
                            >
                              View Grades
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={isReviewDisabled}
                              className={isReviewDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                              onClick={() => setExpandedCourse(course.name)}
                            >
                              Request Review
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleToggleReview(course.name)}
                            >
                              Review Status
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan="4" className="px-6 py-4">
                            {!isReviewDisabled && (
                              <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">Message to instructor:</label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded mb-2"
                                  rows="4"
                                  value={reviewMessages[course.name] || ''}
                                  onChange={(e) =>
                                    setReviewMessages((prev) => ({ ...prev, [course.name]: e.target.value }))
                                  }
                                />
                                <Button onClick={() => handleReviewSubmit(course.name)}>
                                  Submit Review Request
                                </Button>
                              </div>
                            )}
                            {review && (
  <div className="text-gray-700">
    <strong>Instructor Response:</strong>{' '}
    {course.gradingStatus.toLowerCase() === 'open'
      ? 'No review has been sent to instructor.'
      : review.instructorResponse || 'No response yet.'}
  </div>
)}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
