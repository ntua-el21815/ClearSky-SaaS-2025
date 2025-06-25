import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../../components/layout/index";

const mockInstructor = {
  name: 'Dr. Maria Ioannidou',
  email: 'instructor@example.com'
};

const mockCourses = [
  { name: 'Advanced Mathematics', examPeriod: 'Fall 2024', students: 45 }
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
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600">Manage courses, grades, and student reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold">105</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Pending Reviews</p>
              <p className="text-2xl font-semibold">3</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Active Courses</p>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Management */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Course Management</h2>
              <p className="text-sm text-gray-500 mb-4">Manage grades and course content</p>
              
              <button
                onClick={() => navigate('/instructor/post_initial_grades')}
                className="w-full bg-[#0A2A72] text-white py-2 rounded-md font-medium flex items-center justify-center gap-2 mb-2"
              >
                Post Initial Grades
              </button>

              <button
                onClick={() => navigate('/instructor/post_final_grades')}
                className="w-full border border-gray-300 py-2 rounded-md text-sm"
              >
                Post Final Grades
              </button>
            </div>

            {/* Student Interaction */}
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold text-gray-900 mb-1">Student Interaction</h2>
              <p className="text-sm text-gray-500 mb-4">Handle reviews and view analytics</p>
              
              <button
                onClick={() => navigate('/instructor/instructor_review_requests')}
                className="w-full bg-[#0A2A72] text-white py-2 rounded-md font-medium flex items-center justify-center gap-2 mb-2 relative"
              >
                Review Requests
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
              </button>

              <button
                onClick={() => navigate('/instructor/statistics')}
                className="w-full border border-gray-300 py-2 rounded-md text-sm flex items-center justify-center gap-1"
              >
               Show Statistics
              </button>
            </div>
          </div>

          {/* My Courses Section */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-900 mb-1">My Courses</h2>
            <p className="text-sm text-gray-500 mb-4">Overview of your teaching assignments</p>
            
            {mockCourses.map((course, idx) => (
              <div key={idx} className="bg-gray-100 px-4 py-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{course.name}</p>
                  <p className="text-sm text-gray-600">{course.examPeriod} • {course.students} students</p>
                </div>
                <button
                  onClick={() => navigate('/instructor/post_final_grades')}
                  className="text-sm text-gray-700 hover:underline"
                >
                  Manage
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}