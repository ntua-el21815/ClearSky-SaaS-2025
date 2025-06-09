// src/routes/student/personal_grades/personalgrades.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const mockUser = {
  name: 'Aggeliki Papadopoulou',
  email: 'student@example.com'
};

const mockCourses = [
  {
    name: 'physics',
    examPeriod: 'spring 2025',
    gradingStatus: 'open',
    grades: { total: 7.5, Q1: 8, Q2: 7, Q3: 7 },
    stats: {
      total: [0, 0, 0, 0, 10, 8, 0, 35, 61, 42, 12],
      questions: {
        Q1: [0, 0, 2, 5, 12, 20, 15, 8, 3, 1, 0],
        Q2: [0, 1, 4, 10, 18, 22, 9, 6, 4, 1, 0],
        Q3: [0, 0, 1, 2, 8, 30, 40, 10, 3, 1, 0]
      }
    }
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    gradingStatus: 'closed',
    grades: { total: 9.0 },
    stats: null
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    gradingStatus: 'closed',
    grades: { total: 8.5 },
    stats: null
  }
];

export default function PersonalGrades() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCourseName = location.state?.courseName;

  const selectedCourse = mockCourses.find(course => course.name === selectedCourseName);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  const renderChart = (label, data, color) => (
    <Bar
      data={{
        labels: Array.from({ length: 11 }, (_, i) => i),
        datasets: [
          {
            label,
            data,
            backgroundColor: color || 'rgba(220, 38, 38, 0.7)'
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }}
    />
  );

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
            <tr key={idx} className={`text-center ${course.name === selectedCourseName ? 'bg-yellow-100 font-semibold' : ''}`}>
              <td className="border px-2 py-1">{course.name}</td>
              <td className="border px-2 py-1">{course.examPeriod}</td>
              <td className="border px-2 py-1">{course.gradingStatus}</td>
              <td className="border px-2 py-1 space-x-2">
                <button onClick={() => navigate('/student/personal_grades', { state: { courseName: course.name } })} className="bg-blue-500 text-white px-2 py-1 rounded">
                  View My Grades
                </button>
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded"
                  disabled={course.gradingStatus !== 'open'}
                  onClick={() => handleAck(course.name, navigate)}
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

      {selectedCourse && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded shadow">
            <h3 className="font-semibold mb-2">My Grades — {selectedCourse.name} ({selectedCourse.examPeriod})</h3>
            <ul className="space-y-1">
              {Object.entries(selectedCourse.grades).map(([label, value]) => (
                <li key={label} className="flex justify-between border-b py-1">
                  <span>{label}</span>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          {selectedCourse.stats && (
            <>
              <div>{renderChart(`${selectedCourse.name} - total`, selectedCourse.stats.total)}</div>
              {Object.entries(selectedCourse.stats.questions).map(([key, values], idx) => (
                <div key={idx}>{renderChart(`${selectedCourse.name} - ${key}`, values, 'rgba(30, 64, 175, 0.7)')}</div>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}

function handleAck(courseName, navigate) {
  navigate('/student/grade_review_request', { state: { courseName } });
}