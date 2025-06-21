import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authcontext";
import LoginForm from "../components/loginform";
import LoginHeader from "../components/LoginHeader";
import GoogleAuthBlock from "../components/GoogleAuthBlock";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.role) {
      if (storedUser.role === "student") navigate("/student/grade_statistics");
      else if (storedUser.role === "instructor") navigate("/instructor/dashboard");
      else if (storedUser.role === "institution") {
        const institution = JSON.parse(localStorage.getItem("institution"));
        if (institution?.name) navigate("/institution/dashboard");
        else navigate("/institution/register");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-lg">
        <LoginHeader />
        <h2 className="text-xl font-semibold text-center mb-1 text-gray-800">Welcome Back</h2>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in to access your account</p>
        <LoginForm />
        <GoogleAuthBlock />
      </div>
    </div>
  );
}