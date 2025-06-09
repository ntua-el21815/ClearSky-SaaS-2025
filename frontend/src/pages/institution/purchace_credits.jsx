import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PurchaseCredits() {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(5); // αρχικά διαθέσιμα
  const [quantity, setQuantity] = useState(0);
  const pricePerCredit = 1;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'institution') {
      navigate('/login');
    }
  }, [navigate]);

  const handleBuy = () => {
    if (quantity <= 0) {
      alert('Please select a valid quantity.');
      return;
    }
    const total = credits + quantity;
    setCredits(total);
    alert(`${quantity} credits purchased. You now have ${total} credits.`);
    setQuantity(0);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <header className="bg-gray-200 p-4 mb-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">ClearSky - Purchase Credits</h1>
        <button onClick={() => navigate('/institution/dashboard')} className="px-4 py-1 bg-blue-600 text-white rounded">
          Back to Dashboard
        </button>
      </header>

      <div className="bg-white p-4 border rounded shadow">
        <p className="mb-4 font-medium">Available Credits: <span className="font-bold">{credits}</span></p>

        <div className="mb-4">
          <label className="block mb-1 font-medium">How many credits do you want to buy?</label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full border p-2 rounded"
          />
        </div>

        <p className="mb-4">Total price: <span className="font-semibold">{quantity * pricePerCredit} €</span></p>

        <button onClick={handleBuy} className="bg-green-600 text-white px-4 py-2 rounded">
          Buy
        </button>
      </div>
    </div>
  );
}