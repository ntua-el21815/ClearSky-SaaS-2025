// src/pages/institution/purchase_credits.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout';
import Input  from '../../components/Input';
import Button from '../../components/Button';

export default function PurchaseCreditsPage() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState('');
  const [creditBalance, setCreditBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCreditBalance();
  }, []);

  const fetchCreditBalance = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await creditAPI.get('/institution/balance');
      // setCreditBalance(response.data.balance);
      setCreditBalance(0); // Default value
    } catch (err) {
      console.error('Error fetching credit balance:', err);
      setError('Failed to load credit balance.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    try {
      setError('');
      setMessage('');
      const amount = Number(credits);
      
      if (!amount || amount <= 0) {
        setError('Enter a positive number of credits');
        return;
      }
      
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await creditAPI.post('/institution/purchase', { credits: amount });
      // setCreditBalance(response.data.newBalance);
      
      setMessage(`Successfully purchased ${amount} credits!`);
      setCredits('');
      await fetchCreditBalance(); // Refresh balance
    } catch (err) {
      console.error('Error purchasing credits:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen font-sans">
        <div className="max-w-xl mx-auto bg-white shadow rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Credits</h1>
          <p className="text-gray-600 mb-6">Add more credits to your institution's account.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
              {message}
            </div>
          )}

          <div className="mb-6">
            <span className="block text-sm text-gray-500">Current Balance</span>
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : (
              <span className="text-2xl font-semibold text-blue-900">
                {creditBalance} credits
              </span>
            )}
          </div>

          <label className="block mb-1 font-medium text-gray-700">Credits to purchase:</label>
          <Input
            type="number"
            min="1"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="Enter number of credits"
            disabled={loading}
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={handlePurchase} disabled={loading}>
              {loading ? 'Processing…' : 'Purchase Credits'}
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