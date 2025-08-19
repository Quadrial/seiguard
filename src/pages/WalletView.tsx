import React, { useState } from 'react';
import {
  FaBrain,
  FaCoins
} from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { SeiWallet } from '../services/blockchainService';
import { AIService } from '../services/aiService';
import type { WalletAnalysis } from '../services/aiService';
// import { SuspiciousActivityService } from '../services/suspiciousActivityService';

const WalletView: React.FC = () => {
  const [address, setAddress] = useState('');
  const [wallet, setWallet] = useState<SeiWallet | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const loadWalletData = async (walletAddress: string) => {
    setLoading(true);
    try {
      const walletInfo = await BlockchainService.getWalletInfo(walletAddress);
      setWallet(walletInfo);

      if (walletInfo) {
        const analysis = await AIService.analyzeWalletActivity(
          walletAddress,
          [],
          walletInfo.balance
        );
        setAiAnalysis(analysis);
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (address.trim()) {
      loadWalletData(address.trim());
    }
  };

  return (
    <div className="py-30 px-10 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">SeiGuard AI Wallet Analysis</h1>
        
        {/* Search Section */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter Sei wallet address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-cyan-400 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">AI is analyzing the wallet...</p>
          </div>
        )}

        {wallet && (
          <>
            {/* Wallet Info */}
            <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FaCoins className="text-2xl text-yellow-400" />
                <h3 className="text-xl font-semibold">Wallet Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-mono text-sm break-all">{wallet.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Balance</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {(parseInt(wallet.balance) / 1000000).toFixed(6)} SEI
                  </p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {aiAnalysis && (
              <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaBrain className="text-2xl text-cyan-400" />
                  <h3 className="text-xl font-semibold">AI Analysis</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Summary</p>
                    <p className="text-gray-300">{aiAnalysis.summary}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Risk Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            aiAnalysis.riskScore < 30 ? 'bg-green-500' : 
                            aiAnalysis.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${aiAnalysis.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold">{aiAnalysis.riskScore}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WalletView;