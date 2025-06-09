import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PostInitialGrades() {
  const navigate = useNavigate();
  const location = useLocation();

  const [courseInfo, setCourseInfo] = useState({
    name: location.state?.courseName || '',
    period: location.state?.examPeriod || '',
    count: '',
  });
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [credits, setCredits] = useState(3);
  const [registeredCourses, setRegisteredCourses] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'instructor') navigate('/login');
  }, [navigate]);

  if (credits === 0) {
    return (
      <div className="p-4">
        <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
          <h1 className="text-xl font-bold">ClearSky - Post Initial Grades</h1>
          <div className="space-x-4">
            <button onClick={() => navigate('/instructor/dashboard')} className="px-4 py-1 bg-blue-600 text-white rounded">
              Back to Dashboard
            </button>
          </div>
        </header>
        <p className="text-red-600 font-semibold text-lg">You need credits for this action!</p>
      </div>
    );
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleConfirm = () => {
    if (!courseInfo.name || !courseInfo.period || !courseInfo.count) {
      alert('Please fill in all course info fields.');
      return;
    }
    setConfirmed(true);
  };

  const handleCancel = () => {
    setCourseInfo({ ...courseInfo, name: '', period: '', count: '' });
    setConfirmed(false);
  };

  const handleSubmit = () => {
    if (!confirmed || !file) {
      alert('You must confirm course info and select a file first.');
      return;
    }

    const isNewCourse = !registeredCourses.includes(courseInfo.name);

    if (isNewCourse) {
      if (credits < 1) {
        alert('Not enough credits to add a new course.');
        return;
      }
      setCredits((prev) => prev - 1);
      setRegisteredCourses((prev) => [...prev, courseInfo.name]);
    }

    alert(
      `Initial grades submitted for ${courseInfo.name} (${courseInfo.period}) with ${courseInfo.count} grades.\nMessage: ${message}`
    );
    navigate('/instructor/dashboard');
  };

  return (
    <div className="p-4">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          ClearSky - Post Initial Grades
        </h1>
        <div className="flex flex-col items-end space-y-1">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="px-4 py-1 bg-blue-600 text-white rounded"
          >
            Back to Dashboard
          </button>
          <div className="text-base font-medium text-gray-700">
            Available credits: {credits}
          </div>
        </div>
      </header>

      <section className="bg-gray-100 p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Initial Grades Posting</h2>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-dashed border-2 border-gray-400 p-4 mb-4 text-center rounded"
        >
          <input type="file" accept=".xlsx" onChange={handleFileChange} className="mb-2" />
          <div>{file ? file.name : 'Select file to upload or drag and drop'}</div>
        </div>
      </section>

      <section className="bg-white border p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Course Name</h2>
        <input
          type="text"
          value={courseInfo.name}
          onChange={(e) => setCourseInfo({ ...courseInfo, name: e.target.value })}
          className="w-full border p-2 rounded"
          placeholder="Enter course name"
        />
      </section>

      <section className="bg-white border p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Message</h2>
        <textarea
          placeholder="Optional message for grade upload"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full h-28 p-2 border border-gray-300 rounded"
        />
      </section>

      <div className="mt-6">
        <button onClick={handleSubmit} disabled={!confirmed || !file} className="bg-green-600 text-white px-4 py-2 rounded">
          Submit Initial Grades
        </button>
      </div>
    </div>
  );
}