import React from 'react';
import {
  FaBrain,
  FaShieldAlt,
  FaChartLine,
  FaCode,
  FaSearch,
  FaExclamationTriangle,
  FaRocket,
  FaEye
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const features = [
    {
      icon: <FaBrain className="text-4xl text-cyan-400" />,
      title: 'AI-Powered Analysis',
      description: 'Advanced AI algorithms analyze wallet behavior and transaction patterns to provide intelligent insights.',
      color: 'border-cyan-500'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-green-400" />,
      title: 'Suspicious Activity Detection',
      description: 'Rule-based heuristics and AI models detect potential security threats and suspicious patterns.',
      color: 'border-green-500'
    },
    {
      icon: <FaChartLine className="text-4xl text-blue-400" />,
      title: 'Real-time Monitoring',
      description: 'Live transaction monitoring from Sei Network with instant alerts and notifications.',
      color: 'border-blue-500'
    },
    {
      icon: <FaCode className="text-4xl text-purple-400" />,
      title: 'Smart Contract Tracking',
      description: 'Monitor new contract deployments with AI analysis and risk assessment.',
      color: 'border-purple-500'
    }
  ];

  const stats = [
    { label: 'Transactions Analyzed', value: '1.2M+', icon: <FaSearch /> },
    { label: 'AI Accuracy', value: '98.5%', icon: <FaBrain /> },
    { label: 'Threats Detected', value: '2.3K+', icon: <FaExclamationTriangle /> },
    { label: 'Contracts Monitored', value: '15K+', icon: <FaCode /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <FaRocket className="text-6xl text-cyan-400 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SeiGuard AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              AI-Enhanced Blockchain Explorer for Sei Network
            </p>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Advanced security monitoring, intelligent analysis, and real-time threat detection 
              powered by artificial intelligence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explorer"
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FaEye className="inline mr-2" />
              Explore Blockchain
            </Link>
            <Link
              to="/wallet"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FaBrain className="inline mr-2" />
              AI Wallet Analysis
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-10 bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl text-cyan-400 mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400">
              Comprehensive blockchain intelligence powered by cutting-edge AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-8 rounded-xl border-2 ${feature.color} bg-gray-800/50 hover:bg-gray-800 transition-all duration-300 transform hover:scale-105`}
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 px-10 bg-gray-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/explorer"
              className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <FaChartLine className="text-3xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Blockchain Explorer</h3>
              <p className="text-gray-400">Browse blocks, transactions, and network statistics</p>
            </Link>
            
            <Link
              to="/wallet"
              className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <FaBrain className="text-3xl text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Wallet Analysis</h3>
              <p className="text-gray-400">AI-powered wallet behavior analysis and risk assessment</p>
            </Link>
            
            <Link
              to="/suspicious"
              className="p-6 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <FaShieldAlt className="text-3xl text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Threat Detection</h3>
              <p className="text-gray-400">Advanced suspicious activity detection and alerts</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-10 border-t border-gray-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FaRocket className="text-2xl text-cyan-400" />
            <span className="text-2xl font-bold">SeiGuard AI</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-Enhanced Blockchain Explorer for Sei Network
          </p>
          <p className="text-sm text-gray-500">
            Built for the Sei AI/Accelathon Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home; 