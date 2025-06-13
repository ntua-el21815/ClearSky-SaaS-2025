import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../../components/layout";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function PurchaseCreditsPage() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState("");
  const [creditBalance, setCreditBalance] = useState(150); // demo starting balance

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "institution") {
      navigate("/login");
    }
  }, [navigate]);

  const handlePurchase = () => {
    const amount = parseInt(credits);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a positive number of credits.");
      return;
    }

    setCreditBalance(prev => prev + amount);
    alert(`Successfully added ${amount} credits.`);
    setCredits("");
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Credits</h1>
          <p className="text-gray-600 mb-6">Add more credits to your institution's account.</p>

          <div className="mb-6">
            <span className="block text-sm text-gray-500">Current Balance</span>
            <span className="text-2xl font-semibold text-blue-900">{creditBalance} credits</span>
          </div>

          <label className="block mb-1 font-medium text-gray-700">Credits to purchase:</label>
          <Input
            type="number"
            min="1"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="Enter number of credits"
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={handlePurchase}>Purchase Credits</Button>
            <Button variant="secondary" onClick={() => navigate("/institution/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}