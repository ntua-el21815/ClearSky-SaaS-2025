import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from '../../components/layout';

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

export default function InstructorStatistics() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'instructor') {
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
            backgroundColor: color || '#1d4ed8'
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
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Statistics</h1>
              <p className="text-gray-600">Click on a course to view its grading statistics.</p>
            </div>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="bg-[#0A2A72] hover:bg-blue-800 text-white px-4 py-2 rounded-md text-sm shadow"
            >
              Back to Dashboard
            </button>
          </div>

          <section className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-sm table-auto">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Course Name</th>
                  <th className="px-4 py-2 text-left">Exam Period</th>
                  <th className="px-4 py-2 text-left">Initial Submission</th>
                  <th className="px-4 py-2 text-left">Final Submission</th>
                </tr>
              </thead>
              <tbody>
                {mockCourses.map((course, idx) => (
                  <tr
                    key={idx}
                    className="cursor-pointer hover:bg-gray-50 border-t"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <td className="px-4 py-2 font-medium text-gray-900">{course.name}</td>
                    <td className="px-4 py-2 text-gray-700">{course.examPeriod}</td>
                    <td className="px-4 py-2 text-gray-700">{course.initialDate}</td>
                    <td className="px-4 py-2 text-gray-700">{course.finalDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {selectedCourse && selectedCourse.stats && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-blue-200 rounded-xl shadow-md p-4">
                <h3 className="text-center font-semibold text-blue-900 text-lg mb-2">Total Grading Overview</h3>
                {renderChart('Total Grading', selectedCourse.stats.total)}
              </div>
              {Object.entries(selectedCourse.stats.questions).map(([key, values], idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow">
                  <h3 className="text-center font-semibold text-gray-800 mb-2">{`Question ${key.replace('Q', '')}`}</h3>
                  {renderChart(`Question ${key.replace('Q', '')} Grading`, values)}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}