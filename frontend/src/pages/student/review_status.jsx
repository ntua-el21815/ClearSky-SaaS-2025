import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reviewAPI } from '../../api';
import { useAuth } from '../../contexts/authcontext';
import Layout from '../../components/layout';
import Button from '../../components/Button';

export default function ReviewStatus() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();                           // 👉 student info
  const selectedCourseName = location.state?.courseName;

  /* ─────────────── Fetch my reviews ─────────────── */
  const { data, isLoading, error } = useQuery({
    queryKey: ['myReviews'],
    queryFn: () =>
      reviewAPI
        .get('/review-requests', { params: { studentId: user.id } })
        .then((r) => r.data.data),                       // ← schema από OpenAPI
  });

  if (isLoading) return <Layout><p className="p-10">Loading…</p></Layout>;
  if (error)     return <Layout><p className="p-10">❌ {error.message}</p></Layout>;

  /* helper για human-friendly status */
  const mapStatus = (s) =>
    s === 'OPEN'   ? 'Pending'
    : s === 'DONE' ? 'Reviewed'
    : s;

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Review Requests</h1>
              <p className="text-gray-600">{user.fullName}, {user.email}</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button onClick={() => navigate('/student/grade_statistics')}>
                Statistics
              </Button>
              <Button
                variant="secondary"
                onClick={() => { localStorage.clear(); navigate('/login'); }}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Table */}
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
                {data.length === 0 && (
                  <tr><td colSpan="3" className="px-4 py-6 text-center text-gray-500">
                    No review requests yet
                  </td></tr>
                )}

                {data.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-t ${r.courseId === selectedCourseName ? 'bg-yellow-50 font-semibold' : ''}`}
                  >
                    <td className="px-4 py-2 font-medium">{r.courseId}</td>
                    <td className="px-4 py-2">{mapStatus(r.status)}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {r.instructorResponse || '—'}
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