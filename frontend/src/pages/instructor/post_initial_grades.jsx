import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { uploadGradeSubmission } from '../../services/gradeService';
import { useAuth }    from '../../contexts/authcontext';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from "../../components/layout/index";

export default function PostInitialGrades() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user }  = useAuth(); 

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

  const uploadInitial = useMutation(uploadGradeSubmission);

  useEffect(() => {
    const userId = Cookies.get('userId'); 
    if (!userId || user.role !== 'instructor') navigate('/login');
  }, [navigate]);

  if (credits === 0) {
    return (
      <Layout>
        <div className="p-8 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Post Initial Grades</h1>
            <p className="text-red-600 font-semibold text-lg">
              You need credits for this action!
            </p>
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="bg-[#0A2A72] text-white px-4 py-2 rounded-md text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
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

      uploadInitial.mutate(
        {
          file,
          institutionId: user.institutionId,
          userId:        user.id,
          final:         false          // initial submission
        },
        {
          onSuccess: () => {
          alert('Initial grades uploaded successfully');
          navigate('/instructor/dashboard');
        },
        onError: (e) =>
          alert(e.response?.data?.error || 'Upload failed')
        }
      );

  return (
    <Layout>
      <div className="p-8 min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
        <div className="max-w-4xl mx-auto space-y-8">

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Post Initial Grades</h1>
              <p className="text-sm text-gray-600">Upload student grade files for your course</p>
            </div>
            <div className="text-right">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="bg-[#0A2A72] text-white px-4 py-2 rounded-md text-sm"
              >
                Back to Dashboard
              </button>
              <div className="text-sm mt-1 text-gray-700">
                Available credits: <strong>{credits}</strong>
              </div>
            </div>
          </div>

          {/* File upload section */}
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

          {/* Course Info */}
          <section className="bg-white p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Course Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
              <input
                type="text"
                value={courseInfo.name}
                onChange={(e) => setCourseInfo({ ...courseInfo, name: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded text-sm"
                placeholder="Enter course name"
              />
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

          {/* Message field */}
          <section className="bg-white p-6 rounded-xl shadow space-y-3">
            <h2 className="text-xl font-semibold text-gray-800">Instructor Message (Optional)</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded text-sm"
              placeholder="Any additional message..."
            />
          </section>

          {/* Submit */}
          <div className="text-right">
            <button
              onClick={handleSubmit}
              disabled={!confirmed || !file}
              className={`px-6 py-2 rounded-md text-sm font-medium ${
                !confirmed || !file ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#0A2A72] text-white'
              }`}
            >
              Submit Initial Grades
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}
}