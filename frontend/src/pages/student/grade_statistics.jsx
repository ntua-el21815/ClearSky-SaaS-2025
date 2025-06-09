import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const mockCourses = [
  {
    name: 'physics',
    examPeriod: 'fall 2024',
    initialDate: '2025-02-22',
    finalDate: '2025-02-28',
    stats: {
      total: [0, 0, 0, 0, 10, 8, 0, 35, 61, 42, 12],
      questions: {
        Q1: [0, 0, 2, 5, 12, 20, 15, 8, 3, 1, 0],
        Q2: [0, 1, 4, 10, 18, 22, 9, 6, 4, 1, 0],
        Q3: [0, 0, 1, 2, 8, 30, 40, 10, 3, 1, 0],
        Q4: [0, 0, 0, 0, 5, 10, 50, 20, 8, 2, 0],
      }
    }
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    initialDate: '2025-02-01',
    finalDate: '-',
    stats: null
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    initialDate: '2025-02-02',
    finalDate: '2025-02-14',
    stats: null
  }
];

export default function StudentDashboard() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

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
            label: label,
            data: data,
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
          <button
            onClick={() => navigate('/student/courses')}
            className="px-4 py-1 bg-blue-500 text-white rounded"
          >
            Go to my courses
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-1 bg-gray-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-semibold mb-2">Available course statistics</h2>
        <table className="w-full table-auto border mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Course Name</th>
              <th className="border px-2 py-1">Exam Period</th>
              <th className="border px-2 py-1">Initial Grades Submission</th>
              <th className="border px-2 py-1">Final Grades Submission</th>
            </tr>
          </thead>
          <tbody>
            {mockCourses.map((course, idx) => (
              <tr
                key={idx}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedCourse(course)}
              >
                <td className="border px-2 py-1">{course.name}</td>
                <td className="border px-2 py-1">{course.examPeriod}</td>
                <td className="border px-2 py-1">{course.initialDate}</td>
                <td className="border px-2 py-1">{course.finalDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {selectedCourse && selectedCourse.stats && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="text-center font-semibold mb-2">Total Grading</h3>
            {renderChart('Total Grading', selectedCourse.stats.total)}
          </div>
          {Object.entries(selectedCourse.stats.questions).map(([key, values], idx) => (
            <div key={idx}>
              <h3 className="text-center font-semibold mb-2">{`Question ${key.replace('Q', '')} Grading`}</h3>
              {renderChart(`Question ${key.replace('Q', '')} Grading`, values, 'rgba(30, 64, 175, 0.7)')}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}