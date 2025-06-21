import React from "react";

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-[#0A2472] text-white flex items-center justify-center text-lg font-bold">
          C
        </div>
        <h1 className="text-3xl font-bold text-gray-900">ClearSky</h1>
      </div>
      <p className="text-sm text-gray-600 mt-1">
        University-Grade Review &amp; Grading Platform
      </p>
    </div>
  );
}