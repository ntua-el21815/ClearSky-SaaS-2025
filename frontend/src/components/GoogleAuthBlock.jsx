import { GoogleLogin } from '@react-oauth/google';   // υπάρχει ήδη στο project
import { useAuth } from '../contexts/authcontext';

export default function GoogleAuthBlock() {
  const { signInWithGoogle } = useAuth();

  return (
    <GoogleLogin
      onSuccess={(res) => signInWithGoogle(res.credential)}
      onError={() => alert('Google Sign-In failed')}
      useOneTap
    />
  );
}