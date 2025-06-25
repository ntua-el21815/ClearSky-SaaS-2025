import React from "react";

export default function ActionCard({ title, text, button, onClick }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{text}</p>
      <button
        onClick={onClick}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded text-sm font-medium transition"
      >
        {button}
      </button>
    </div>
  );
}