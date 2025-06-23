import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

import Layout from '../../components/layout';
import { fetchStudentStatistics } from '../../services/gradeService';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [courses, setCourses]         = useState([]);
  const [selected, setSelected]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error,   setError]           = useState(null);
  const courseId = 3205;
  
  useEffect(() => {
    fetchStudentStatistics(courseId)
      .then(setCourses)
      .catch((err) => {
        console.error('Error fetching student statistics:', err);
        
        // Handle different types of errors
        if (err.response) {
          // Server responded with error status
          const errorMessage = err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`;
          setError(errorMessage);
        } else if (err.request) {
          // Network error - no response received
          setError('Network error: Unable to connect to server. Please check your connection.');
        } else {
          // Other error (e.g., request setup)
          setError(err.message || 'An unexpected error occurred');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  /* ───── helpers ───── */
  const renderChart = (label, data, color = '#1d4ed8') => (
    <Bar
      data={{
        labels: Array.from({ length: 11 }, (_, i) => i),
        datasets: [{ label, data, backgroundColor: color }]
      }}
      options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }}
    />
  );

  /* ───── UI ───── */
  if (loading) return <Layout><p className="p-8">Loading…</p></Layout>;
  if (error) return (
    <Layout>
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Statistics</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition text-sm">
            Retry
          </button>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Grade Statistics</h1>
            <p className="text-gray-600">Click on a course to view its grading distribution.</p>
          </div>
          <button
            onClick={() => navigate('/student/courses')}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded transition text-sm shadow">
            Go to My Courses
          </button>
        </div>

        {/* --- πίνακας μαθημάτων --- */}
        <table className="w-full table-auto border mb-4 bg-white shadow rounded-xl overflow-hidden">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="border px-4 py-2 text-left">Course</th>
              <th className="border px-4 py-2 text-left">Exam Period</th>
              <th className="border px-4 py-2 text-left">Initial</th>
              <th className="border px-4 py-2 text-left">Final</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.courseId}
                  className="cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setSelected(c)}>
                <td className="border px-4 py-2 text-sm">{c.name}</td>
                <td className="border px-4 py-2 text-sm">{c.examPeriod}</td>
                <td className="border px-4 py-2 text-sm">{c.initialDate || '-'}</td>
                <td className="border px-4 py-2 text-sm">{c.finalDate   || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- charts --- */}
        {selected?.stats && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-blue-200 rounded-xl shadow-md p-4">
              <h3 className="text-center font-semibold text-blue-900 text-lg mb-2">Total Grading Overview</h3>
              {renderChart('Total Grading', selected.stats.total)}
            </div>

            {Object.entries(selected.stats.questions).map(([q, vals]) => (
              <div key={q} className="bg-white rounded-xl p-4 shadow">
                <h3 className="text-center font-semibold text-gray-800 mb-2">
                  Question {q.replace('Q', '')}
                </h3>
                {renderChart(`Q${q} Grading`, vals)}
              </div>
            ))}
          </section>
        )}
      </div>
    </Layout>
  );
}