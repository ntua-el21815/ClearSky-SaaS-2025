// src/pages/institution/purchase_credits.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authcontext';
import { usePurchaseCredits } from '../../hooks/usePurchaseCredits';
import { useInstitutionCredits } from '../../hooks/useInstitutionCredits';
import Layout from '../../components/layout';
import Input  from '../../components/Input';
import Button from '../../components/Button';

export default function PurchaseCreditsPage() {
  const { user } = useAuth();
  const institutionId = user?.institutionId;
  const navigate = useNavigate();

  const purchase = usePurchaseCredits(institutionId);
  const { data, isLoading } = useInstitutionCredits(institutionId);
  const creditBalance = data?.balance ?? 0;

  const [credits, setCredits] = useState('');

  const handlePurchase = () => {
    const amount = Number(credits);
    if (!amount || amount <= 0) {
      return alert('Enter a positive number of credits');
    }
    purchase.mutate(amount, {
      onSuccess: () => setCredits(''),
      onError: (err) =>
        alert(err.response?.data?.error || 'Payment failed'),
    });
  };

  /* ---------- render ---------- */
  if (isLoading) {
    return <Layout><p className="p-10">Loading…</p></Layout>;
  }

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Credits</h1>
          <p className="text-gray-600 mb-6">Add more credits to your institution's account.</p>

          <div className="mb-6">
            <span className="block text-sm text-gray-500">Current Balance</span>
            <span className="text-2xl font-semibold text-blue-900">
              {creditBalance} credits
            </span>
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
            <Button onClick={handlePurchase} disabled={purchase.isLoading}>
              {purchase.isLoading ? 'Processing…' : 'Purchase Credits'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/institution/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}