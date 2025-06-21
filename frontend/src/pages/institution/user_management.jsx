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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'institution') {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddUser = () => {
    if (!form.username || !form.password || !form.id) {
      setMessage('All fields are required.');
      return;
    }
    const exists = users.some(u => u.username === form.username);
    if (exists) {
      setMessage('User already exists. Use Change Password to modify password.');
      return;
    }
    setUsers([...users, { ...form }]);
    setMessage(`User '${form.username}' added successfully.`);
  };

  const handleChangePassword = () => {
    const index = users.findIndex(u => u.username === form.username);
    if (index === -1) {
      setMessage('User not found.');
      return;
    }
    const updated = [...users];
    updated[index].password = form.password;
    setUsers(updated);
    setMessage(`Password updated for '${form.username}'.`);
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600 mb-6">Manage institution users and credentials.</p>

          {message && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded">
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
            <Button onClick={handleAddUser}>Add User</Button>
            <Button variant="secondary" onClick={handleChangePassword}>Change Password</Button>
            <Button variant="secondary" onClick={() => navigate('/institution/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}