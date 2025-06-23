import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authcontext";
import LoginForm from "../components/loginform";
import LoginHeader from "../components/LoginHeader";
import GoogleAuthBlock from "../components/GoogleAuthBlock";

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  /* Redirect μόλις μάθουμε αν υπάρχει logged-in χρήστης */
  useEffect(() => {
    if (loading) return;                // περιμένουμε να φορτώσει
    if (!user)  return;                 // δεν είμαι logged-in => μένω στη login

    // Debug logging
    console.log('User data:', user);
    console.log('User role:', user.role);

    switch (user.role) {
      case "student":
        navigate("/student/grade_statistics");
        break;
      case "instructor":
        navigate("/instructor/dashboard");
        break;
      case "institution":
      case "institution_rep": // Add fallback for different role naming
        navigate("/institution/dashboard");
        break;
      default:
        console.log('Unknown role, staying on login');
        navigate("/login");
    }
  }, [user, loading, navigate]);        // εξαρτήσεις

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-lg">
        <LoginHeader />
        <h2 className="text-xl font-semibold text-center mb-1 text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Sign in to access your account
        </p>

        {/* φόρμα & google login */}
        <LoginForm />
        <GoogleAuthBlock />
      </div>
    </div>
  );
}