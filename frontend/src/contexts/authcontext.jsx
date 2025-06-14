import React, { createContext, useState, useContext } from 'react';
import Layout from "../components/layout/index";
const AuthContext = createContext();


export function AuthProvider({ children }) {
  const login = (email, password) => {
    // Προσωρινό παράδειγμα — αντικατάστησέ το με API call
    if (email === "test@user.com" && password === "123456") {
      localStorage.setItem("user", JSON.stringify({ role: "student" }));
      window.location.href = "/student/grade_statistics";
    } 
    else if (email === "test@instr.com" && password === "123456") {
      localStorage.setItem("user", JSON.stringify({ role: "instructor" }));
      window.location.href = "/student/grade_statistics";
    }
    else if (email === "test@instit.com" && password === "123456") {
      localStorage.setItem("user", JSON.stringify({ role: "institution" }));
      window.location.href = "/student/grade_statistics";
    } else {
      alert("Invalid credentials");
    }
  };

  const signInWithGoogle = () => {
    // Προσωρινό παράδειγμα Google login simulation
    localStorage.setItem("user", JSON.stringify({ role: "student" }));
    window.location.href = "/student/grade_statistics";
  };

  return (
    <AuthContext.Provider value={{ login, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);