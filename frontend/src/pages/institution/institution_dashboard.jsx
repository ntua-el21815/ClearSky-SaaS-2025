import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

import Layout from '../../components/layout';
import InfoCard from '../../components/InfoCard';
import ActionCard from '../../components/ActionCard';
import Button from '../../components/Button';
import Input from '../../components/Input';

const mockCourses = [
  {
    name: 'physics',
    examPeriod: 'spring 2025',
    stats: { total: [0, 0, 0, 0, 5, 10, 15, 20, 25, 18, 7] }
  },
  {
    name: 'software',
    examPeriod: 'fall 2024',
    stats: { total: [1, 2, 3, 6, 8, 12, 20, 17, 10, 6, 2] }
  },
  {
    name: 'mathematics',
    examPeriod: 'fall 2024',
    stats: { total: [0, 1, 1, 3, 10, 20, 30, 10, 5, 2, 1] }
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
        datasets: [{
          label,
          data,
          backgroundColor: '#0A2472'
        }]
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Institution Dashboard</h1>
          <p className="text-gray-600">Manage your institution's grading platform</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <InfoCard title="Available Credits" value="150" />
          <InfoCard title="Total Users" value="245" />
          <InfoCard title="Active Courses" value="3" />
          <InfoCard title="Institution" value="University of Excellence" sub="Academic City" />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <ActionCard
            title="Institution Setup"
            text="Configure your institution"
            button="Register Institution"
            onClick={() => navigate('/institution/register')}
          />
          <ActionCard
            title="Credits Management"
            text="Purchase additional credits"
            button="Purchase Credits"
            onClick={() => navigate('/institution/credits')}
          />
          <ActionCard
            title="User Administration"
            text="Manage users and permissions"
            button="User Management"
            onClick={() => navigate('/institution/user_management')}
          />
        </div>

        {/* Course Stats */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Course Statistics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Search Course:</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search..."
              />

              <label className="block mt-4 mb-1 font-medium text-gray-700">Filter by Exam Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
              >
                <option value="">-- All Periods --</option>
                {[...new Set(mockCourses.map(c => c.examPeriod))].map((period, idx) => (
                  <option key={idx} value={period}>{period}</option>
                ))}
              </select>

              <ul className="border border-gray-200 rounded divide-y mt-4">
                {mockCourses
                  .filter(course =>
                    course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (selectedPeriod === '' || course.examPeriod === selectedPeriod)
                  )
                  .map((course, idx) => (
                    <li
                      key={idx}
                      onClick={() => setSelectedCourse(course)}
                      className="p-2 hover:bg-gray-50 cursor-pointer transition"
                    >
                      {course.name} ({course.examPeriod})
                    </li>
                  ))}
              </ul>
            </div>

            <div>
              {selectedCourse && (
                <div>
                  <h3 className="text-md font-semibold text-gray-800 mb-2">
                    {selectedCourse.name} ({selectedCourse.examPeriod}) - Statistics
                  </h3>
                  {renderChart('Total Grades Distribution', selectedCourse.stats.total)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}