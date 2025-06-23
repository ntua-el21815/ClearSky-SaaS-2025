import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout  from '../../components/layout';
import Button  from '../../components/Button';
import {
  fetchStudentCourses,
  getReviewStatus,
  submitReview
} from '../../services/courseService';      // + reviewService μέσα

export default function MyCourses() {
  const navigate = useNavigate();

  /* -------------- local state -------------- */
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error,   setError]       = useState(null);

  const [expanded, setExpanded]   = useState(null);           // row με ανοικτό textarea
  const [msg,       setMsg]       = useState({});             // draft messages
  const [statuses,  setStatuses]  = useState({});             // review status cache

  /* -------------- mount -------------- */
  useEffect(() => {
    fetchStudentCourses()
      .then(setCourses)
      .catch((err) => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  /* -------------- helpers -------------- */
  const handleSubmit = async (c) => {
    const text = (msg[c.courseId] || '').trim();
    if (!text) return alert('Write your message first!');
    try {
      await submitReview(c.courseId, text);
      alert('Review sent!');

      // προαιρετικά, ανανεώνουμε status
      setStatuses((s) => ({ ...s, [c.courseId]: { status:'pending' } }));
      setMsg((m)   => ({ ...m, [c.courseId]: '' }));
      setExpanded(null);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const toggleStatus = async (c) => {
    // αν το έχω ήδη, απλά κάνω collapse/expand
    if (statuses[c.courseId]) {
      setExpanded((e) => (e === c.courseId ? null : c.courseId));
      return;
    }
    try {
      const st = await getReviewStatus(c.courseId);
      setStatuses((s) => ({ ...s, [c.courseId]: st }));
      setExpanded(c.courseId);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  /* -------------- ui states -------------- */
  if (loading) return <Layout><p className="p-8">Loading…</p></Layout>;
  if (error)   return <Layout><p className="p-8 text-red-600">⚠ {error}</p></Layout>;

  /* -------------- render -------------- */
  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          {/* header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button onClick={() => navigate('/student/grade_statistics')}>Statistics</Button>
              <Button variant="secondary" onClick={() => { localStorage.clear(); navigate('/login'); }}>
                Logout
              </Button>
            </div>
          </div>

          {/* table */}
          <div className="overflow-auto bg-white shadow rounded-xl mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Course</th>
                  <th className="px-4 py-2 text-left">Exam Period</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => {
                  const disabled   = c.gradingStatus !== 'open';
                  const isOpenRow  = expanded === c.courseId;
                  const st         = statuses[c.courseId];

                  return (
                    <React.Fragment key={c.courseId}>
                      {/* ---- main row ---- */}
                      <tr className="border-t">
                        <td className="px-4 py-2 font-semibold">{c.name}</td>
                        <td className="px-4 py-2">{c.examPeriod}</td>
                        <td className="px-4 py-2 capitalize">{c.gradingStatus}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-row gap-2">
                            <Button size="sm"
                                    onClick={() => navigate('/student/personal_grades',
                                                            { state: { courseId: c.courseId } })}>
                              View Grades
                            </Button>

                            <Button size="sm" variant="secondary"
                                    disabled={disabled}
                                    onClick={() => setExpanded(disabled ? null : c.courseId)}>
                              Request Review
                            </Button>

                            <Button size="sm" variant="secondary" onClick={() => toggleStatus(c)}>
                              Review Status
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* ---- expandable row ---- */}
                      {isOpenRow && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">
                            {/* ----- textarea για νέο review ----- */}
                            {c.gradingStatus === 'open' && (
                              <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                  Message to instructor:
                                </label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded mb-2"
                                  rows={4}
                                  value={msg[c.courseId] || ''}
                                  onChange={(e) =>
                                    setMsg((m) => ({ ...m, [c.courseId]: e.target.value }))
                                  }
                                />
                                <Button onClick={() => handleSubmit(c)}>Submit Review</Button>
                              </div>
                            )}

                            {/* ----- προβολή status ----- */}
                            {st && (
                              <div className="text-gray-700">
                                <strong>Status:</strong> {st.status}<br />
                                <strong>Instructor Response:</strong>{' '}
                                {st.instructorResponse || '—'}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}