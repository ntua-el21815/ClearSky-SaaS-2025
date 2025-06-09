import React, { useEffect } from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../contexts/authcontext';
import { loginWithGoogleToken } from '../services/authservice';
import LoginForm from '../components/loginform';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.role) {
      if (storedUser.role === 'student') navigate('/student/grade_statistics');
      else if (storedUser.role === 'instructor') navigate('/instructor/dashboard');
      else if (storedUser.role === 'institution') {
        const institution = JSON.parse(localStorage.getItem('institution'));
        if (institution?.name) navigate('/institution/dashboard');
        else navigate('/institution/register');
      }
    }
  }, []);

  const redirectByRole = (role) => {
    if (role === 'student') navigate('/student/grade_statistics');
    else if (role === 'instructor') navigate('/instructor/dashboard');
    else if (role === 'institution') navigate('/institution/dashboard');
    else navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <LoginForm />

      <div className="my-4 text-center">— ή —</div>

      <GoogleOAuthProvider clientId="184310661677-5ip42trj1ii3hm8uqkcsoo0auicbe1ut.apps.googleusercontent.com">
        <GoogleLogin
          onSuccess={async credentialResponse => {
            try {
              const decoded = jwtDecode(credentialResponse.credential);
              const { token, user } = await loginWithGoogleToken(credentialResponse.credential);
              login(user, token);
              redirectByRole(user.role);
            } catch (err) {
              alert('Google login failed');
            }
          }}
          onError={() => alert('Google login failed')}
        />
      </GoogleOAuthProvider>
    </div>
  );
}