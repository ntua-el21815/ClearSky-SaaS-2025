// src/contexts/authcontext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  loginWithCredentials,
  loginWithGoogleToken,
  verifyToken,
  signup
} from '../services/authservice';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ───────── LOGIN (email/password) ───────── */
  async function login(email, password) {
    console.log('[context] login called', email);
    try {
      const res = await loginWithCredentials(email, password);
      if (!res.success) throw new Error('Login failed');
      persistSession(res.token, res.user);
      routeByRole(res.user.role);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  /* ───────── LOGIN (Google) ───────── */
  async function signInWithGoogle(idToken) {
    try {
      const res = await loginWithGoogleToken(idToken);
      if (!res.success) throw new Error('Google login failed');
      persistSession(res.token, res.user);
      routeByRole(res.user.role);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  /* ───────── PERSIST session in cookies ───────── */
  function persistSession(token, u) {
    localStorage.setItem('accessToken', token);
    Cookies.set('userId',        u.id);
    Cookies.set('role',          u.role);
    Cookies.set('institutionId', u.institutionId || '');
    setUser(u);
    setLoading(false);
  }

  /* ───────── Silent token verify on refresh ───────── */
  useEffect(() => {
     const token = localStorage.getItem('accessToken');
     if (!token) {
       setLoading(false);
       return;
     }

     verifyToken(token)
       .then(({ user: u }) => persistSession(token, u))
       .catch(() => {
         localStorage.clear();
         ['userId', 'role', 'institutionId'].forEach(Cookies.remove);
       })
       .finally(() => setLoading(false));
   }, []);

  /* ───────── LOGOUT ───────── */
  function logout() {
    localStorage.clear();
    ['userId', 'role', 'institutionId'].forEach(Cookies.remove);
    setUser(null);
    setLoading(false);
    window.location.href = '/login';
  }

  /* ───────── ROUTE ανά ρόλο ───────── */
  const routeByRole = (role) => {
    const map = {
      student: '/student/grade_statistics',
      instructor: '/instructor/instructor_courses',
      institution: '/institution/dashboard',
    };
    window.location.href = map[role] || '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);