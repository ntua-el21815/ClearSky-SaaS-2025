import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../../components/layout/index";

export default function PostFinalGrades() {
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'instructor') navigate('/login');
  }, [navigate]);

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
    alert(`Final grades submitted for ${courseInfo.name} (${courseInfo.period}) with ${courseInfo.count} grades.\nMessage: ${message}`);
    navigate('/instructor/dashboard');
  };

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Final Grades</h1>
              <p className="text-sm text-gray-600">Upload final grades for an existing course</p>
            </div>
            <div className="text-right">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="bg-[#0A2A72] text-white px-4 py-2 rounded-md text-sm"
              >
                Back to Dashboard
              </button>
              <div className="text-sm mt-1 text-gray-700">
                Available credits: <strong>5</strong>
              </div>
            </div>
          </div>

          <section className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Upload Grades File</h2>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-dashed border-2 border-gray-400 p-6 text-center rounded mb-4"
            >
              <input type="file" accept=".xlsx" onChange={handleFileChange} className="mb-2" />
              <p className="text-sm text-gray-600">
                {file ? file.name : 'Select file to upload or drag and drop here'}
              </p>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Course Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <select
                value={courseInfo.name}
                onChange={(e) => setCourseInfo({ ...courseInfo, name: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              >
                <option value="">-- Select a course --</option>
                <option value="Mathematics 101">Mathematics 101</option>
                <option value="Physics 201">Physics 201</option>
                <option value="Algorithms">Algorithms</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Period</label>
              <input
                type="text"
                value={courseInfo.period}
                onChange={(e) => setCourseInfo({ ...courseInfo, period: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded text-sm"
                placeholder="Enter exam period"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Students</label>
              <input
                type="number"
                value={courseInfo.count}
                onChange={(e) => setCourseInfo({ ...courseInfo, count: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded text-sm"
                placeholder="Enter count"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="border border-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">Instructor Message (Optional)</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded text-sm"
              placeholder="Any additional message..."
            />
          </section>

          <div className="text-right">
            <button
              onClick={handleSubmit}
              disabled={!confirmed || !file}
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                !confirmed || !file ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0A2A72] text-white'
              }`}
            >
              Submit Final Grades
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
