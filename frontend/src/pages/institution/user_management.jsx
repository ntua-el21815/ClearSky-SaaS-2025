import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../../components/layout";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function UserManagement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: 'Institution representative',
    username: '',
    password: '',
    id: ''
  });
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'institution') {
        navigate('/login');
      }
      // TODO: Fetch users from API
      fetchUsers();
    } catch (err) {
      console.error('Error reading user data:', err);
      setError('Unable to load user data. Please log in again.');
      navigate('/login');
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await userAPI.get('/institution/users');
      // setUsers(response.data);
      setUsers([]);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setError('');
      setMessage('');
      if (!form.username || !form.password || !form.id) {
        setError('All fields are required.');
        return;
      }
      
      setLoading(true);
      // TODO: Replace with actual API call
      // await userAPI.post('/institution/users', form);
      
      setMessage(`User '${form.username}' added successfully.`);
      setForm({ ...form, username: '', password: '', id: '' });
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setError('');
      setMessage('');
      if (!form.username || !form.password) {
        setError('Username and password are required.');
        return;
      }
      
      setLoading(true);
      // TODO: Replace with actual API call
      // await userAPI.put(`/institution/users/${form.username}/password`, { password: form.password });
      
      setMessage(`Password updated for '${form.username}'.`);
      setForm({ ...form, password: '' });
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600 mb-6">Manage institution users and credentials.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
              {message}
            </div>
          )}

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Type</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
            >
              <option>Institution representative</option>
              <option>Instructor</option>
              <option>Student</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. jdoe"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 font-medium text-gray-700">User ID</label>
            <Input
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              placeholder="e.g. 12345"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAddUser} disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
            <Button variant="secondary" onClick={handleChangePassword} disabled={loading}>
              {loading ? 'Updating...' : 'Change Password'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/institution/dashboard')}>
              Back to Dashboard
            </Button>
          </div>

          {/* Users List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Users</h3>
            {loading ? (
              <p className="text-gray-500">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No users found. Add your first user above.</p>
            ) : (
              <div className="space-y-2">
                {users.map((user, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{user.username}</span>
                        <span className="text-sm text-gray-500 ml-2">({user.role})</span>
                      </div>
                      <span className="text-xs text-gray-400">ID: {user.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}