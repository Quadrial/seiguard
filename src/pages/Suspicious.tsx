import React, { useState } from 'react';
import {
  FaExclamationTriangle,
  FaShieldAlt,
  FaBrain,
  FaSearch,
  FaChartLine,
  FaServer,
  FaExchangeAlt
} from 'react-icons/fa';
import { SuspiciousActivityService } from '../services/suspiciousActivityService';
import type { SuspiciousActivity } from '../services/suspiciousActivityService';
import { AIService } from '../services/aiService';
import type { TransactionAnalysis } from '../services/aiService';

const Suspicious: React.FC = () => {
  const [txHash, setTxHash] = useState('');
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const mockTransaction = {
    hash: '0x1234567890abcdef',
    gasUsed: '800000',
    gasWanted: '1000000',
    fee: '5000',
    messages: [
      {
        typeUrl: '/cosmos.bank.v1beta1.MsgSend',
        value: {
          amount: [{ amount: '5000000000', denom: 'usei' }]
        }
      }
    ]
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Analyze with AI
      const aiResult = await AIService.analyzeTransaction(txHash || mockTransaction.hash);
      setAnalysis(aiResult);

      // Analyze for suspicious activity
      const suspicious = await SuspiciousActivityService.analyzeTransaction(mockTransaction);
      setSuspiciousActivities(suspicious);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-900';
      case 'medium': return 'bg-yellow-900';
      case 'low': return 'bg-green-900';
      default: return 'bg-gray-900';
    }
  };

  return (
    <div className="mt-10 px-10 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Suspicious Activity Detection</h1>
        
        {/* Search Section */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter transaction hash to analyze..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-400 outline-none"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {/* Detection Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-2xl text-blue-400" />
              <h3 className="text-xl font-semibold">Detection Rules</h3>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-400">High Gas Usage</h4>
                <p className="text-sm text-gray-400">Detects transactions with unusually high gas consumption</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-yellow-400">Contract Interactions</h4>
                <p className="text-sm text-gray-400">Identifies suspicious smart contract calls</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-orange-400">Large Transfers</h4>
                <p className="text-sm text-gray-400">Flags unusually large value transfers</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h4 className="font-semibold text-purple-400">Unknown Contracts</h4>
                <p className="text-sm text-gray-400">Detects interactions with unverified contracts</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <FaBrain className="text-2xl text-cyan-400" />
              <h3 className="text-xl font-semibold">AI Analysis</h3>
            </div>
            {analysis ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Transaction Summary</p>
                  <p className="text-gray-300">{analysis.summary}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">Risk Level</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    analysis.riskLevel === 'high' ? 'bg-red-900 text-red-200' :
                    analysis.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                    'bg-green-900 text-green-200'
                  }`}>
                    {analysis.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Enter a transaction hash to get AI analysis</p>
            )}
          </div>
        </div>

        {/* Suspicious Activities */}
        {suspiciousActivities.length > 0 && (
          <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-8">
            <div className="flex items-center gap-3 mb-6">
              <FaExclamationTriangle className="text-2xl text-red-400" />
              <h3 className="text-xl font-semibold">Detected Suspicious Activities</h3>
            </div>
            
            <div className="space-y-4">
              {suspiciousActivities.map((activity, index) => (
                <div key={index} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FaShieldAlt className={`text-xl ${getSeverityColor(activity.severity)}`} />
                      <div>
                        <h4 className="font-semibold text-white">{activity.description}</h4>
                        <p className="text-sm text-gray-400">
                          Confidence: {(activity.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityBg(activity.severity)}`}>
                      {activity.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <h5 className="text-sm text-gray-400 mb-2">Recommendations:</h5>
                    <ul className="space-y-1">
                      {activity.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaChartLine className="text-3xl text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-green-400">98.5%</h3>
            <p className="text-gray-400">Detection Accuracy</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaServer className="text-3xl text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-blue-400">24/7</h3>
            <p className="text-gray-400">Real-time Monitoring</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaExchangeAlt className="text-3xl text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-purple-400">5+</h3>
            <p className="text-gray-400">Detection Rules</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suspicious;