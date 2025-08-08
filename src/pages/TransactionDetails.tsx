import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaCopy, 
  FaExternalLinkAlt,
  FaServer,
  FaCoins,
  FaGasPump
} from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { SeiTransaction } from '../services/blockchainService';

const TransactionDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<SeiTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'logs' | 'state'>('details');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  useEffect(() => {
    const loadTransaction = async () => {
      if (!hash) return;
      
      setLoading(true);
      try {
        const txData = await BlockchainService.getTransaction(hash);
        setTransaction(txData);
      } catch (error) {
        console.error('Failed to load transaction:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [hash]);

  if (loading) {
    return (
      <div className="mt-10 px-10 text-white font-sans">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="mt-10 px-10 text-white font-sans">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Transaction Not Found</h2>
          <button
            onClick={() => navigate('/explorer')}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
          >
            Back to Explorer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 px-10 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <FaArrowLeft />
            Back to Explorer
          </button>
        </div>

        {/* Transaction Header */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Transaction details</h1>
            <div className="text-sm text-gray-400">
              {transaction && new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
          
          {/* Transaction Hash and Status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{transaction?.hash}</span>
                <button
                  onClick={() => copyToClipboard(transaction?.hash || '', 'hash')}
                  className="text-gray-400 hover:text-white"
                >
                  <FaCopy />
                </button>
                {copied === 'hash' && <span className="text-green-400 text-xs">Copied!</span>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-600 text-white rounded text-sm font-semibold flex items-center gap-2">
                <FaCheckCircle />
                Success
              </span>
              <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Execute</span>
              <span className="px-3 py-1 bg-gray-600 text-white rounded text-sm font-mono">0x25e51ecf</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'details' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'logs' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Logs 2
            </button>
            <button
              onClick={() => setActiveTab('state')}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'state' 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              State
            </button>
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'details' && transaction && (
          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">EVM details</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
                <FaExternalLinkAlt />
                JSON
              </button>
            </div>

            <div className="space-y-4">
              {/* Block Information */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <FaServer className="text-blue-400" />
                  <span className="text-gray-400">Block:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{transaction.height}</span>
                  <span className="text-gray-400 text-sm">308 block confirmations ago</span>
                </div>
              </div>

              {/* Block Hash */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Block Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{transaction.hash}</span>
                  <button
                    onClick={() => copyToClipboard(transaction.hash, 'blockHash')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              {/* Contract Interaction */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Interacted with contract:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded"></div>
                  <span className="font-mono text-sm">0x29FfD44130fCF917950CCA2b29084095dAl0dB95</span>
                  <button
                    onClick={() => copyToClipboard('0x29FfD44130fCF917950CCA2b29084095dAl0dB95', 'contract')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              {/* From Address */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">From:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-red-400 rounded"></div>
                  <span className="font-mono text-sm">0x5B8d2E55e12788108b6e4e2607043737c88c02c9</span>
                  <button
                    onClick={() => copyToClipboard('0x5B8d2E55e12788108b6e4e2607043737c88c02c9', 'from')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              {/* To Address */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">To:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded"></div>
                  <span className="font-mono text-sm">0x29FfD44130fCF917950CCA2b29084095dAl0dB95</span>
                  <button
                    onClick={() => copyToClipboard('0x29FfD44130fCF917950CCA2b29084095dAl0dB95', 'to')}
                    className="text-gray-400 hover:text-white"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>

              {/* Value */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Value:</span>
                <div className="flex items-center gap-2">
                  <FaCoins className="text-yellow-400" />
                  <span>0 sei</span>
                  <span className="text-gray-400">$0.000</span>
                </div>
              </div>

              {/* Position */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Position:</span>
                <span className="font-semibold">2</span>
              </div>

              {/* Nonce */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Nonce:</span>
                <span className="font-semibold">1</span>
              </div>

              {/* Transaction Fee */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Transaction fee:</span>
                <div className="flex items-center gap-2">
                  <FaCoins className="text-yellow-400" />
                  <span>0.0005669 sei</span>
                  <span className="text-gray-400">$0.000</span>
                </div>
              </div>

              {/* Gas Price */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Gas price:</span>
                <div className="flex items-center gap-2">
                  <FaGasPump className="text-orange-400" />
                  <span>0.00000001 sei</span>
                  <span className="text-gray-400">$0.000</span>
                </div>
              </div>

              {/* Transaction Type */}
              <div className="flex items-center justify-between py-3 border-b border-gray-700">
                <span className="text-gray-400">Transaction Type:</span>
                <span className="font-semibold">0</span>
              </div>

              {/* Gas Usage */}
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-400">Gas limit | Used by transaction:</span>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">57000 | 56690</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-500"
                        style={{ width: '99.46%' }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-green-400">99.46%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Transaction Logs</h2>
            <p className="text-gray-400">Logs will be displayed here...</p>
          </div>
        )}

        {activeTab === 'state' && (
          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">State Changes</h2>
            <p className="text-gray-400">State changes will be displayed here...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetails; 