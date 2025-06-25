import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

import Layout  from '../../components/layout';
import Button  from '../../components/Button';
import { fetchPersonalGrades } from '../../services/gradeService';

export default function PersonalGrades() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const courseId  = state?.courseId;          // 👉 έρχεται από το navigate

  /* -------- local state -------- */
  const [course,  setCourse]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  /* -------- guard + fetch -------- */
  useEffect(() => {
    // 1. guard ρόλου
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
      return;
    }
    // 2. guard ύπαρξης courseId
    if (!courseId) {
      navigate('/student/courses');
      return;
    }
    // 3. fetch
    fetchPersonalGrades(courseId)
      .then(setCourse)
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [courseId, navigate]);

  /* -------- helper για chart -------- */
  const renderChart = (label, data, color = '#1d4ed8') => (
    <Bar
      data={{ labels: Array.from({ length: 11 }, (_, i) => i),
              datasets: [{ label, data, backgroundColor: color }] }}
      options={{ responsive: true,
                 plugins:{ legend:{ display:false } },
                 scales:{ y:{ beginAtZero:true } } }}
    />
  );

  /* -------- UI states -------- */
  if (loading) return <Layout><p className="p-8">Loading…</p></Layout>;
  if (error)   return <Layout><p className="p-8 text-red-600">⚠ {error}</p></Layout>;
  if (!course) return null;    // δεν έπρεπε να γίνει αλλά για σιγουριά

  /* -------- Render -------- */
  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          {/* ---- header ---- */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              My Grades — <span className="font-bold">{course.name}</span> ({course.examPeriod})
            </h1>
            <Button variant="secondary" onClick={() => navigate('/student/courses')}>
              ← Back to My Courses
            </Button>
          </div>

          {/* ---- grades & charts ---- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* --- προσωπικοί βαθμοί --- */}
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold mb-3">Grades</h3>
              <ul className="space-y-1 text-sm">
                {Object.entries(course.grades).map(([lab, val]) => (
                  <li key={lab} className="flex justify-between border-b py-1">
                    <span>{lab}</span><span>{val}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* --- στατιστικά αν υπάρχουν --- */}
            {course.stats && (
              <>
                <div className="bg-white rounded-xl shadow p-4 md:col-span-2 lg:col-span-1">
                  <h3 className="text-center font-semibold mb-2">Total Grade Distribution</h3>
                  {renderChart(`${course.name} - total`, course.stats.total)}
                </div>
                {Object.entries(course.stats.questions).map(([q, vals]) => (
                  <div key={q} className="bg-white rounded-xl shadow p-4">
                    <h3 className="text-center font-semibold mb-2">
                      Question {q.replace('Q','')}
                    </h3>
                    {renderChart(`${course.name} - ${q}`, vals)}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}