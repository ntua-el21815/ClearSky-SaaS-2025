import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const mockUser = {
  name: 'Alex Papadakis',
  role: 'institution'
};

const mockCourses = [
  {
    name: 'physics',
    examPeriod: 'spring 2025',
    stats: {
      total: [0, 0, 0, 0, 5, 10, 15, 20, 25, 18, 7]
    }
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    stats: {
      total: [1, 2, 3, 6, 8, 12, 20, 17, 10, 6, 2]
    }
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    stats: {
      total: [0, 1, 1, 3, 10, 20, 30, 10, 5, 2, 1]
    }
  }
];

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'institution') {
      navigate('/login');
    }
  }, [navigate]);

  const renderChart = (label, data) => (
    <Bar
      data={{
        labels: Array.from({ length: 11 }, (_, i) => i),
        datasets: [
          {
            label,
            data,
            backgroundColor: 'rgba(30, 64, 175, 0.7)'
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }}
    />
  );

  return (
    <div className="p-4">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky - Institution</h1>
        <div className="space-x-4">
          <button onClick={() => navigate('/institution/register')} className="px-4 py-1 bg-blue-600 text-white rounded">
            Register Institution
          </button>
          <button onClick={() => navigate('/institution/credits')} className="px-4 py-1 bg-green-600 text-white rounded">
            Purchase Credits
          </button>
          <button onClick={() => navigate('/institution/user_management')} className="px-4 py-1 bg-indigo-600 text-white rounded">
            User Management
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-1 bg-gray-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </header>

      <h2 className="text-lg font-semibold mb-4">Search Course Statistics</h2>

      <div className="mb-6">
        <label className="block mb-1 font-medium">Search Course:</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to search..."
          className="w-full border p-2 rounded mb-2"
        />
        <label className="block mb-1 font-medium mt-4">Filter by Exam Period:</label>
        <select
          className="w-full border p-2 rounded mb-2"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="">-- All Periods --</option>
          {[...new Set(mockCourses.map(c => c.examPeriod))].map((period, idx) => (
            <option key={idx} value={period}>{period}</option>
          ))}
        </select>
        <ul className="border rounded divide-y">
          {mockCourses
            .filter(course =>
              course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (selectedPeriod === '' || course.examPeriod === selectedPeriod)
            )
            .map((course, idx) => (
              <li
                key={idx}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                {course.name} ({course.examPeriod})
              </li>
            ))}
        </ul>
      </div>

      {selectedCourse && (
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-2">{selectedCourse.name} ({selectedCourse.examPeriod}) - Statistics</h3>
          {renderChart('Total Grades Distribution', selectedCourse.stats.total)}
        </div>
      )}
    </div>
  );
}