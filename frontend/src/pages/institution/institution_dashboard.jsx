import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

import Layout        from '../../components/layout';
import InfoCard      from '../../components/InfoCard';
import ActionCard    from '../../components/ActionCard';
import Button        from '../../components/Button';
import Input         from '../../components/Input';

import {
  fetchInstitutionStats,
  fetchInstitutionCourses,
  fetchCourseStats
} from '../../services/institutionService';

export default function InstitutionDashboard() {
  const navigate = useNavigate();

  /* ----------- state ----------- */
  const [stats,   setStats]         = useState(null);
  const [courses, setCourses]       = useState([]);
  const [selected, setSelected]     = useState(null);
  const [search,  setSearch]        = useState('');
  const [period,  setPeriod]        = useState('');
  const [loading, setLoading]       = useState(true);
  const [error,   setError]         = useState(null);
  const [chartError, setChartError] = useState('');

  /* ----------- mount ----------- */
  useEffect(() => {
    Promise.all([fetchInstitutionStats(), fetchInstitutionCourses()])
      .then(([s, c]) => { 
        setStats(s || {}); 
        setCourses(c || []); 
        setError(null);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load dashboard data';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ----------- helpers ----------- */
  const renderChart = (label, data) => {
    try {
      if (!data || !Array.isArray(data)) {
        return <p className="text-gray-500 text-sm">No chart data available</p>;
      }
      return (
        <Bar data={{
          labels: Array.from({ length: 11 }, (_, i) => i),
          datasets: [{ label, data, backgroundColor: '#0A2472' }]
        }} options={{ responsive:true, plugins:{ legend:{ display:false } },
                     scales:{ y:{ beginAtZero:true } } }} />
      );
    } catch (err) {
      console.error('Error rendering chart:', err);
      return <p className="text-red-500 text-sm">Error displaying chart</p>;
    }
  };

  const handleSelect = async (course) => {
    try {
      setSelected(null);
      setChartError('');
      const full = await fetchCourseStats(course.courseId);
      setSelected({ ...course, stats: full });
    } catch (err) {
      console.error('Error fetching course stats:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load course statistics';
      setChartError(errorMessage);
    }
  };

  /* ----------- UI states ----------- */
  if (loading) return <Layout><p className="p-8">Loading dashboard...</p></Layout>;
  
  if (error) return (
    <Layout>
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h2>
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

  /* ----------- render ----------- */
  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        {/* header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Institution Dashboard</h1>
          <p className="text-gray-600">Manage your institution's grading platform</p>
        </div>

        {/* aggregate stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <InfoCard title="Available Credits" value={stats?.credits || 0} />
          <InfoCard title="Total Users"       value={stats?.users || 0}   />
          <InfoCard title="Active Courses"    value={stats?.activeCourses || 0} />
          <InfoCard title="Institution"       value={stats?.institution?.name || 'Not configured'}
                                           sub={stats?.institution?.city || ''} />
        </div>

        {/* action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <ActionCard title="Institution Setup" text="Configure your institution"
                      button="Register Institution"
                      onClick={() => navigate('/institution/register')} />
          <ActionCard title="Credits Management" text="Purchase additional credits"
                      button="Purchase Credits"
                      onClick={() => navigate('/institution/credits')} />
          <ActionCard title="User Administration" text="Manage users and permissions"
                      button="User Management"
                      onClick={() => navigate('/institution/user_management')} />
        </div>

        {/* course stats */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Statistics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* ---- filters & list ---- */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">Search Course:</label>
              <Input value={search} onChange={(e)=>setSearch(e.target.value)}
                     placeholder="Type to search…" />

              <label className="block mt-4 mb-1 font-medium text-gray-700">Filter by Exam Period:</label>
              <select value={period} onChange={(e)=>setPeriod(e.target.value)}
                      className="w-full border border-gray-300 p-2 rounded-md text-sm">
                <option value="">-- All Periods --</option>
                {[...new Set(courses.map(c=>c.examPeriod))].map((p)=>
                  <option key={p} value={p}>{p}</option>)}
              </select>

              <ul className="border border-gray-200 rounded divide-y mt-4">
                {courses.filter(c =>
                  c.name.toLowerCase().includes(search.toLowerCase()) &&
                  (period==='' || c.examPeriod===period)
                ).map((c)=>(
                  <li key={c.courseId} onClick={()=>handleSelect(c)}
                      className="p-2 hover:bg-gray-50 cursor-pointer transition">
                    {c.name} ({c.examPeriod})
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- chart ---- */}
            <div>
              {chartError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
                  {chartError}
                </div>
              )}
              {selected?.stats && !chartError && (
                <>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    {selected.name} ({selected.examPeriod}) – Statistics
                  </h3>
                  {renderChart('Total Grades Distribution', selected.stats.total)}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}