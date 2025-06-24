import React from "react";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main className="px-4 md:px-8 py-6">{children}</main>
    </>
  );
}