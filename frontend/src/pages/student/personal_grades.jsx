import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Layout from '../../components/layout/index';
import Button from '../../components/Button';

const mockCourses = [
  {
    name: 'physics',
    examPeriod: 'spring 2025',
    gradingStatus: 'open',
    grades: { total: 7.5, Q1: 8, Q2: 7, Q3: 7 },
    stats: {
      total: [0, 0, 0, 0, 10, 8, 0, 35, 61, 42, 12],
      questions: {
        Q1: [0, 0, 2, 5, 12, 20, 15, 8, 3, 1, 0],
        Q2: [0, 1, 4, 10, 18, 22, 9, 6, 4, 1, 0],
        Q3: [0, 0, 1, 2, 8, 30, 40, 10, 3, 1, 0]
      }
    }
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    gradingStatus: 'closed',
    grades: { total: 9.0 },
    stats: null
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    gradingStatus: 'closed',
    grades: { total: 8.5 },
    stats: null
  }
];

export default function PersonalGrades() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedCourseName = location.state?.courseName;
  const course = mockCourses.find(c => c.name === selectedCourseName);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'student') {
      navigate('/login');
    }
  }, [navigate]);

  const renderChart = (label, data, color) => (
    <Bar
      data={{
        labels: Array.from({ length: 11 }, (_, i) => i),
        datasets: [{ label, data, backgroundColor: color || '#1d4ed8' }]
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }}
    />
  );

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-gray-900">
             My Grades — <span className="font-bold">{course?.name}</span> ({course?.examPeriod})
           </h1>
            <Button variant="secondary" onClick={() => navigate('/student/courses')}>
              ← Back to My Courses
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-4">
              <h3 className="font-semibold mb-3">Grades</h3>
              <ul className="space-y-1 text-sm">
                {course?.grades &&
                  Object.entries(course.grades).map(([label, value]) => (
                    <li key={label} className="flex justify-between border-b py-1">
                      <span>{label}</span>
                      <span>{value}</span>
                    </li>
                  ))}
              </ul>
            </div>

            {course?.stats && (
              <>
                <div className="bg-white rounded-xl shadow p-4 md:col-span-2 lg:col-span-1">
                  <h3 className="text-center font-semibold mb-2">Total Grade Distribution</h3>
                  {renderChart(`${course.name} - total`, course.stats.total)}
                </div>
                {Object.entries(course.stats.questions).map(([key, values], idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow p-4">
                    <h3 className="text-center font-semibold mb-2">{`Question ${key.replace('Q', '')} Distribution`}</h3>
                    {renderChart(`${course.name} - ${key}`, values)}
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