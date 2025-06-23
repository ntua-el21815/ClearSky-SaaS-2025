// src/services/authservice.js
import Cookies from 'js-cookie';
import { userAPI } from '../api/index';

/* ----------------- helpers ----------------- */
function saveSession({ token, refreshToken, user }) {
  localStorage.setItem('accessToken',  token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
  Cookies.set('userId',        user.id);
  Cookies.set('role',          user.role);
  Cookies.set('institutionId', user.institutionId || '');
}

/* 1. Login με email/password */
export async function loginWithCredentials(email, password) {
  console.log('UserAPI:', userAPI);
  const { data } = await userAPI.post('/api/auth', { email : email, password: password });
  if (data.success) saveSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
  return data;
}

/* 2. Login με Google token */
export async function loginWithGoogleToken(idToken) {
  const { data } = await userAPI.post('/api/auth', { token: idToken });
  if (data.success) saveSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
  return data;
}

/* 3. Silent-verify JWT */
export async function verifyToken(token) {
  const { data } = await userAPI.post('/api/auth', { token });
  if (data.success) saveSession({ token, user: data.user });
  return data;
}

/* 4. Signup */
export async function signup({ email, password, fullName, role }) {
  const { data } = await userAPI.post('/signup', { email, password, fullName, role });
  if (data.success) saveSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
  return data;
}