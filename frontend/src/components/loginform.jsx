import React, { useState } from "react";
import { useAuth } from "../contexts/authcontext";
import { FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[loginform] submit', { email, password });
    login(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <FaEnvelope />
        </span>
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        />
      </div>

      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <FaLock />
        </span>
        <input
          type="password"
          required
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 bg-[#0A2472] hover:bg-[#091e5a] text-white py-2 rounded-md font-semibold transition"
      >
        <FaArrowRight />
        Sign In
      </button>
    </form>
  );
}