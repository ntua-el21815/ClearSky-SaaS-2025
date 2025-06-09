import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockUniversities = [
  'National Technical University of Athens',
  'University of Thessaloniki',
  'University of Patras'
];

export default function RegisterInstitution() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState(mockUniversities);
  const [form, setForm] = useState({ name: '', location: '', email: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'institution') {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = () => {
    const exists = universities.some(u => u.toLowerCase() === form.name.toLowerCase());
    if (!exists) {
      setUniversities([...universities, form.name]);
    }
    localStorage.setItem('institution', JSON.stringify({
      name: form.name,
      location: form.location,
      email: form.email
    }));
    alert(`Institution '${form.name}' registered successfully.`);
    navigate('/institution/dashboard');
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky - Institution Registration</h1>
      </header>

      <div className="bg-white p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Register Your Institution</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Institution Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium">Institution Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Register Institution
        </button>
      </div>
    </div>
  );
}