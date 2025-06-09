import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="p-4 max-w-xl mx-auto">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky - User Management</h1>
        <button onClick={() => navigate('/institution/dashboard')} className="px-4 py-1 bg-blue-600 text-white rounded">
          Back to Dashboard
        </button>
      </header>

      <div className="bg-white p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Users</h2>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Type</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full border p-2 rounded"
          >
            <option>Institution representative</option>
            <option>Instructor</option>
            <option>Student</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">User Name</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">ID</label>
          <input
            type="text"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            className="w-full border p-2 rounded"
          />
        </div>
        <div className="flex space-x-4">
          <button onClick={handleAddUser} className="bg-green-600 text-white px-4 py-2 rounded">
            Add User
          </button>
          <button onClick={handleChangePassword} className="bg-yellow-600 text-white px-4 py-2 rounded">
            Change Password
          </button>
        </div>
      </div>

    </div>
  );
}