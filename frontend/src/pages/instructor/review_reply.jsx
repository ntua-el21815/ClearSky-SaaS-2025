import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout';
import { useReviewRequest, useReplyReview } from '../../hooks/review';
import { useAuth } from '../../contexts/authcontext';

export default function InstructorReviewReply() {
  const { reviewId } = useParams();          // έρχεται από το URL
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ───── Fetch review details ───── */
  const { data: review, isLoading, error } = useReviewRequest(reviewId);

  /* ───── Mutation για reply ───── */
  const replyMutation = useReplyReview();

  /* τοπική φόρμα */
  const [action, setAction] = useState('TOTAL_ACCEPT');
  const [message, setMessage] = useState('');
  const [grade,   setGrade]   = useState('');

  const handleSubmit = () => {
    if (!message.trim()) return alert('Write a message');
    replyMutation.mutate(
      {
        id: reviewId,
        payload: {
          instructorResponse: `${action}: ${message}`,
          reviewedGrade: grade || undefined,
        },
      },
      {
        onSuccess: () => {
          alert('Reply sent!');
          navigate('/instructor/instructor_review_requests');
        },
        onError: (e) => alert(e.response?.data?.error || 'Error'),
      }
    );
  };

  /* ───── UI States ───── */
  if (isLoading) return <Layout><p className="p-10">Loading…</p></Layout>;
  if (error)     return <Layout><p className="p-10">❌ {error.message}</p></Layout>;

  return (
    <Layout>
      <div className="p-8 bg-gray-50 min-h-screen max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Reply to Review</h1>
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="bg-[#0A2A72] text-white px-4 py-2 rounded text-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Review details */}
        <div className="bg-white rounded shadow p-4 text-sm">
          <p><strong>Course:</strong> {review.courseId}</p>
          <p><strong>Student RegNo:</strong> {review.studentRegistrationNumber}</p>
          <p><strong>Requested:</strong> {new Date(review.requestedAt).toLocaleDateString()}</p>
          <p className="mt-3"><strong>Reason:</strong><br />{review.reason}</p>
        </div>

        {/* Reply form */}
        <div className="bg-white rounded shadow p-4 space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            >
              <option value="TOTAL_ACCEPT">Total accept</option>
              <option value="PARTIAL_ACCEPT">Partial accept</option>
              <option value="DECLINE">Decline</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Instructor Message</label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border p-2 rounded text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Reviewed grade (optional)</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border p-2 rounded text-sm"
              placeholder="e.g. 7.5"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={replyMutation.isLoading}
            className="bg-[#0A2A72] text-white px-6 py-2 rounded text-sm"
          >
            {replyMutation.isLoading ? 'Sending…' : 'Send Reply'}
          </button>
        </div>
      </div>
    </Layout>
  );
}