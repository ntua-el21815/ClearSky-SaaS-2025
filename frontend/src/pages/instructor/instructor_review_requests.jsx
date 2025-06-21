// src/pages/instructor/instructor_review_requests.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { reviewAPI } from '../../api';
import { useAuth } from '../../contexts/authcontext';
import Layout from '../../components/layout';

export default function InstructorReviewRequests() {
  const { user } = useAuth();            // instructor info
  const navigate = useNavigate();

  /* ──────────────── Fetch pending reviews ──────────────── */
  const { data, isLoading, error } = useQuery({
    queryKey: ['instructorReviews'],
    queryFn: () =>
      reviewAPI
        .get('/review-requests', { params: { status: 'OPEN' } })
        .then((r) => r.data.data),       // ← schema απ’ το OpenAPI
  });

  if (isLoading) return <Layout><p className="p-10">Loading…</p></Layout>;
  if (error)     return <Layout><p className="p-10">❌ {error.message}</p></Layout>;

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Review Requests</h1>
              <p className="text-gray-600">{user.fullName}</p>
            </div>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="bg-[#0A2A72] text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto bg-white shadow rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Course</th>
                  <th className="px-4 py-2 text-left">Student RegNo</th>
                  <th className="px-4 py-2 text-left">Requested</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                      No pending review requests 
                    </td>
                  </tr>
                )}

                {data.map((req) => (
                  <tr key={req.id} className="border-t">
                    <td className="px-4 py-2 font-medium">{req.courseId}</td>
                    <td className="px-4 py-2">{req.studentRegistrationNumber}</td>
                    <td className="px-4 py-2">
                      {new Date(req.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => navigate(`/instructor/review_reply/${req.id}`)}
                        className="bg-[#0A2A72] text-white px-4 py-1.5 rounded-md text-sm"
                      >
                        Reply
                      </button>
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