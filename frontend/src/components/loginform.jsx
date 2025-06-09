import React, { useState } from 'react';
import { useAuth } from '../contexts/authcontext';
import { loginWithCredentials } from '../services/authservice';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await loginWithCredentials(email, password);
      login(user, token);
      redirectByRole(user.role, navigate);
    } catch (error) {
      alert('Login failed');
    }
  };

  const redirectByRole = (role, navigate) => {
    if (role === 'student') navigate('/student/grade_statistics');
    else if (role === 'instructor') navigate('/instructor/dashboard');
    else if (role === 'institution') navigate('/institution/dashboard');
    else navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
    </form>
  );
}