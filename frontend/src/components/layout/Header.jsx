import React from "react";
import { useAuth } from "../../contexts/authcontext";

export default function Header() {
  const { logout } = useAuth();

  return (
    <header className="bg-blue-900 text-white px-6 py-3 flex items-center justify-between shadow">
      <div className="flex items-center gap-2 font-bold text-xl">
        🎓 <span>ClearSky University Portal</span>
      </div>

      <button
        onClick={logout}
        className="bg-white text-blue-900 px-4 py-1.5 text-sm rounded shadow hover:bg-gray-100 transition"
      >
        Logout
      </button>
    </header>
  );
}