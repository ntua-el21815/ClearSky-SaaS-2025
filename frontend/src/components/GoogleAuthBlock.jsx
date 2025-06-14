import React from "react";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../contexts/authcontext";

export default function GoogleAuthBlock() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="mt-6">
      {/* ...divider όπως έχεις ήδη */}
      <button
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
      >
        <FcGoogle className="text-xl" />
        <span className="text-sm font-medium text-gray-700">Continue with Google</span>
      </button>
    </div>
  );
}