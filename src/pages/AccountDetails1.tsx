import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BlockchainService } from '../services/blockchainService';
import { FaEthereum, FaCoins, FaExchangeAlt, FaClock } from 'react-icons/fa';

const AccountDetails = () => {
  const { address } = useParams();
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const details = await BlockchainService.getWalletInfo(address);
        setAccountDetails(details);
      } catch (err) {
        setError('Failed to fetch account details.');
        console.error('Error fetching account details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccountDetails();
  }, [address]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!accountDetails) {
    return <div>No account details found.</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gray-800 text-white">
      <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
        <FaEthereum className="text-blue-500" />
        Account: {accountDetails.address}
      </h1>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaCoins className="text-yellow-500" />
          Balance: ${accountDetails.balance}
        </h2>
        <p>Available Tokens: {accountDetails.balance} SEI</p>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaExchangeAlt className="text-purple-500" />
          Recent Transactions
        </h2>
        <ul>
          {/* Mock transactions for demonstration */}
          {[...Array(5)].map((_, index) => (
            <li key={index} className="flex justify-between items-center mb-2">
              <span>Transaction {index + 1}</span>
              <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-gray-900 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <FaClock className="text-green-500" />
          Activity Timeline
        </h2>
        <p>Recent activity and delegations will be displayed here.</p>
      </div>
    </div>
  );
};

export default AccountDetails;