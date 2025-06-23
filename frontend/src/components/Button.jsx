import React from "react";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  full = true,
  disabled = false,
  className = ""
}) {
  const base = "py-2 text-sm font-medium rounded transition disabled:cursor-not-allowed disabled:opacity-50";
  const fullWidth = full ? "w-full" : "";
  const variants = {
    primary: "bg-blue-900 hover:bg-blue-800 text-white",
    secondary: "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${fullWidth} ${className}`.trim()}
    >
      {children}
    </button>
  );
}