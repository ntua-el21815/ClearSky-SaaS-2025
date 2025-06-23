import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../../components/layout";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function RegisterInstitution() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', location: '', email: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'institution') {
        navigate('/login');
      }
    } catch (err) {
      console.error('Error reading user data:', err);
      setError('Unable to load user data. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async () => {
    try {
      setError('');
      setLoading(true);
      
      if (!form.name || !form.location || !form.email) {
        setError('All fields are required.');
        return;
      }

      if (!form.email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }

      // TODO: Replace with actual API call
      // await institutionAPI.post('/register', form);
      
      // For now, store in localStorage
      localStorage.setItem('institution', JSON.stringify({
        name: form.name,
        location: form.location,
        email: form.email
      }));

      navigate('/institution/dashboard');
    } catch (err) {
      console.error('Error registering institution:', err);
      setError(err.response?.data?.message || 'Failed to register institution. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Register Your Institution</h1>
          <p className="text-gray-600 mb-6">Provide details to register your academic institution.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Institution Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. University of Crete"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Location</label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Heraklion"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-700">Institution Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. admin@university.gr"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Registering...' : 'Register Institution'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/institution/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}