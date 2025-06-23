// src/pages/student/my_courses.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Layout  from '../../components/layout';
import Button  from '../../components/Button';
<<<<<<< HEAD
<<<<<<< HEAD
import {
  fetchStudentCourses,
  getReviewStatus,
  submitReview
} from '../../services/courseService';      // + reviewService μέσα
=======
=======
>>>>>>> origin/Harris
import { fetchStudentCourses }     from '../../services/courseService';

import {
  createReviewRequest,         //  POST /review-requests
  getReviewRequests            //  GET  /review-requests?courseId=…
} from '../../services/reviewService';
<<<<<<< HEAD
>>>>>>> origin/Harris
=======
>>>>>>> origin/Harris

export default function MyCourses() {
  const navigate = useNavigate();

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
  /* ---------------- state ---------------- */
  const [courses,  setCourses]   = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [error,    setError]     = useState(null);

  const [expanded, setExpanded]  = useState(null);      // row with textarea | status
  const [draft,    setDraft]     = useState({});        // reason textarea per course
  const [status,   setStatus]    = useState({});        // cache courseId → {status,instructorResponse}

  /* ---------------- 1st load ---------------- */
  useEffect(() => {
    fetchStudentCourses()
      .then(setCourses)
      .catch(err => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- helpers ---------------- */
  async function handleCreateReview(c) {
    const reason = (draft[c.courseId] || '').trim();
    if (!reason) return alert('Write your reason first!');

    try {
      // gradeId → αν δεν έχετε στο object, βάλτε null ή προσαρμόστε
      const { review } = await createReviewRequest({
        courseId: c.courseId,
        gradeId : c.gradeId ?? null,
        reason
      });

      alert('Review sent!');
      setStatus(s => ({ ...s, [c.courseId]: review }));   // {status:'pending', …}
      setDraft (d => ({ ...d, [c.courseId]: '' }));
      setExpanded(null);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  async function toggleStatus(c) {
    // έχω ήδη cache → collapse / expand
    if (status[c.courseId]) {
      setExpanded(e => (e === c.courseId ? null : c.courseId));
      return;
    }
    try {
=======
  /* ---------------- state ---------------- */
  const [courses,  setCourses]   = useState([]);
  const [loading,  setLoading]   = useState(true);
  const [error,    setError]     = useState(null);

  const [expanded, setExpanded]  = useState(null);      // row with textarea | status
  const [draft,    setDraft]     = useState({});        // reason textarea per course
  const [status,   setStatus]    = useState({});        // cache courseId → {status,instructorResponse}

  /* ---------------- 1st load ---------------- */
  useEffect(() => {
    fetchStudentCourses()
      .then(setCourses)
      .catch(err => setError(err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- helpers ---------------- */
  async function handleCreateReview(c) {
    const reason = (draft[c.courseId] || '').trim();
    if (!reason) return alert('Write your reason first!');

    try {
      // gradeId → αν δεν έχετε στο object, βάλτε null ή προσαρμόστε
      const { review } = await createReviewRequest({
        courseId: c.courseId,
        gradeId : c.gradeId ?? null,
        reason
      });

      alert('Review sent!');
      setStatus(s => ({ ...s, [c.courseId]: review }));   // {status:'pending', …}
      setDraft (d => ({ ...d, [c.courseId]: '' }));
      setExpanded(null);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  async function toggleStatus(c) {
    // έχω ήδη cache → collapse / expand
    if (status[c.courseId]) {
      setExpanded(e => (e === c.courseId ? null : c.courseId));
      return;
    }
    try {
>>>>>>> origin/Harris
      const { reviews } = await getReviewRequests({ courseId: c.courseId });
      if (!reviews.length) return alert('No review request yet.');
      // παίρνουμε το πρώτο (υποθέτουμε 1 ανά φοιτητή/μάθημα)
      setStatus(s => ({ ...s, [c.courseId]: reviews[0] }));
<<<<<<< HEAD
>>>>>>> origin/Harris
=======
>>>>>>> origin/Harris
      setExpanded(c.courseId);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
<<<<<<< HEAD
<<<<<<< HEAD
  };

  /* -------------- ui states -------------- */
  if (loading) return <Layout><p className="p-8">Loading…</p></Layout>;
  if (error)   return <Layout><p className="p-8 text-red-600">⚠ {error}</p></Layout>;

  /* -------------- render -------------- */
=======
  }

=======
  }

>>>>>>> origin/Harris
  /* ---------------- UI states ---------------- */
  if (loading)  return <Layout><p className="p-8">Loading…</p></Layout>;
  if (error)    return <Layout><p className="p-8 text-red-600">⚠ {error}</p></Layout>;

  /* ---------------- render ---------------- */
<<<<<<< HEAD
>>>>>>> origin/Harris
=======
>>>>>>> origin/Harris
  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> origin/Harris
=======

>>>>>>> origin/Harris
          {/* header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
            <div className="flex gap-3 mt-4 md:mt-0">
              <Button onClick={() => navigate('/student/grade_statistics')}>Statistics</Button>
<<<<<<< HEAD
<<<<<<< HEAD
              <Button variant="secondary" onClick={() => { localStorage.clear(); navigate('/login'); }}>
=======
              <Button variant="secondary"
                      onClick={() => { localStorage.clear(); navigate('/login'); }}>
>>>>>>> origin/Harris
=======
              <Button variant="secondary"
                      onClick={() => { localStorage.clear(); navigate('/login'); }}>
>>>>>>> origin/Harris
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
<<<<<<< HEAD
<<<<<<< HEAD
                {courses.map((c) => {
                  const disabled   = c.gradingStatus !== 'open';
                  const isOpenRow  = expanded === c.courseId;
                  const st         = statuses[c.courseId];

                  return (
                    <React.Fragment key={c.courseId}>
                      {/* ---- main row ---- */}
=======
                {courses.map(c => {
                  const disabled   = c.gradingStatus !== 'open';
                  const openRow    = expanded === c.courseId;
                  const st         = status[c.courseId];  // cached reply

                  return (
                    <React.Fragment key={c.courseId}>
                      {/* main row */}
>>>>>>> origin/Harris
=======
                {courses.map(c => {
                  const disabled   = c.gradingStatus !== 'open';
                  const openRow    = expanded === c.courseId;
                  const st         = status[c.courseId];  // cached reply

                  return (
                    <React.Fragment key={c.courseId}>
                      {/* main row */}
>>>>>>> origin/Harris
                      <tr className="border-t">
                        <td className="px-4 py-2 font-semibold">{c.name}</td>
                        <td className="px-4 py-2">{c.examPeriod}</td>
                        <td className="px-4 py-2 capitalize">{c.gradingStatus}</td>
                        <td className="px-4 py-2">
<<<<<<< HEAD
<<<<<<< HEAD
                          <div className="flex flex-row gap-2">
                            <Button size="sm"
                                    onClick={() => navigate('/student/personal_grades',
                                                            { state: { courseId: c.courseId } })}>
=======
=======
>>>>>>> origin/Harris
                          <div className="flex gap-2">
                            <Button size="sm"
                                    onClick={() => navigate('/student/personal_grades',
                                             { state:{ courseId:c.courseId } })}>
<<<<<<< HEAD
>>>>>>> origin/Harris
=======
>>>>>>> origin/Harris
                              View Grades
                            </Button>

                            <Button size="sm" variant="secondary"
                                    disabled={disabled}
                                    onClick={() => setExpanded(disabled ? null : c.courseId)}>
                              Request Review
                            </Button>

<<<<<<< HEAD
<<<<<<< HEAD
                            <Button size="sm" variant="secondary" onClick={() => toggleStatus(c)}>
=======
                            <Button size="sm" variant="secondary"
                                    onClick={() => toggleStatus(c)}>
>>>>>>> origin/Harris
=======
                            <Button size="sm" variant="secondary"
                                    onClick={() => toggleStatus(c)}>
>>>>>>> origin/Harris
                              Review Status
                            </Button>
                          </div>
                        </td>
                      </tr>

<<<<<<< HEAD
<<<<<<< HEAD
                      {/* ---- expandable row ---- */}
                      {isOpenRow && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">
                            {/* ----- textarea για νέο review ----- */}
                            {c.gradingStatus === 'open' && (
                              <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                  Message to instructor:
=======
                      {/* expandable row */}
                      {openRow && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">

                            {/* --- textarea για νέο review --- */}
                            {c.gradingStatus === 'open' && (
                              <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                  Reason for re-evaluation:
>>>>>>> origin/Harris
=======
                      {/* expandable row */}
                      {openRow && (
                        <tr className="bg-gray-50">
                          <td colSpan={4} className="px-6 py-4">

                            {/* --- textarea για νέο review --- */}
                            {c.gradingStatus === 'open' && (
                              <div className="mb-4">
                                <label className="block font-semibold text-gray-700 mb-2">
                                  Reason for re-evaluation:
>>>>>>> origin/Harris
                                </label>
                                <textarea
                                  className="w-full p-2 border border-gray-300 rounded mb-2"
                                  rows={4}
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
                                  value={draft[c.courseId] || ''}
                                  onChange={e =>
                                    setDraft(d => ({ ...d, [c.courseId]: e.target.value }))
                                  }
                                />
=======
                                  value={draft[c.courseId] || ''}
                                  onChange={e =>
                                    setDraft(d => ({ ...d, [c.courseId]: e.target.value }))
                                  }
                                />
>>>>>>> origin/Harris
                                <Button onClick={() => handleCreateReview(c)}>
                                  Submit Review Request
                                </Button>
                              </div>
                            )}

                            {/* --- προβολή status --- */}
                            {st && (
                              <div className="text-gray-700">
                                <strong>Status:</strong> {st.status}<br />
                                <strong>Instructor Response:</strong>{' '}
                                {st.instructorResponse || '—'}
                              </div>
                            )}
<<<<<<< HEAD
>>>>>>> origin/Harris
=======
>>>>>>> origin/Harris
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