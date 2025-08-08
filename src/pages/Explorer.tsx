// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   FaPercentage,
//   FaCoins,
//   FaServer,
//   FaExchangeAlt,
//   FaChartLine,
//   FaMoneyBill,
//   FaSearch,
//   FaBrain,
//   FaShieldAlt,
//   FaExclamationTriangle
// } from 'react-icons/fa';

// import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { BlockchainService } from '../services/blockchainService';
// import type { SeiBlock, SeiTransaction, SeiWallet } from '../services/blockchainService';
// import { AIService } from '../services/aiService';
// import type { WalletAnalysis } from '../services/aiService';
// import { SuspiciousActivityService } from '../services/suspiciousActivityService';
// import type { SuspiciousActivity } from '../services/suspiciousActivityService';

// // Remove the old INITIAL_TOKEN_DATA and tokenData logic
// // Add a function to fetch daily historical prices from CoinGecko

// const fetchSeiDailyPrices = async (days = 7) => {
//   const response = await fetch(
//     `https://api.coingecko.com/api/v3/coins/sei-network/market_chart?vs_currency=usd&days=${days}&interval=daily`
//   );
//   const data = await response.json();
//   // data.prices is an array of [timestamp, price]
//   return data.prices.map((point: [number, number]) => {
//     const [timestamp, price] = point;
//     const date = new Date(timestamp);
//     return {
//       date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
//       price: Number(price),
//     };
//   });
// };

// const Explorer = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [recentBlocks, setRecentBlocks] = useState<SeiBlock[]>([]);
//   const [recentTransactions, setRecentTransactions] = useState<SeiTransaction[]>([]);
//   const [aiAnalysis, setAiAnalysis] = useState<WalletAnalysis | null>(null);
//   const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [seiPrice, setSeiPrice] = useState<number | null>(null);
//   const [tokenData, setTokenData] = useState([]);

//   useEffect(() => {
//     const initializeData = async () => {
//       setLoading(true);
//       try {
//         await BlockchainService.initialize();
        
//         const blocks = await BlockchainService.getRecentBlocks(5);
//         const transactions = await BlockchainService.getRecentTransactions(5);
        
//         setRecentBlocks(blocks);
//         setRecentTransactions(transactions);
//       } catch (error) {
//         console.error('Failed to initialize blockchain data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeData();
//   }, []);

//   // Auto-refresh functionality
//   useEffect(() => {
//     if (!autoRefresh) return;

//     const interval = setInterval(async () => {
//       try {
//         const blocks = await BlockchainService.getRecentBlocks(5);
//         const transactions = await BlockchainService.getRecentTransactions(5);
        
//         setRecentBlocks(blocks);
//         setRecentTransactions(transactions);
//       } catch (error) {
//         console.error('Auto-refresh failed:', error);
//       }
//     }, 10000); // Refresh every 10 seconds

//     return () => clearInterval(interval);
//   }, [autoRefresh]);

//   // Fetch daily SEI price history for the chart
//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const prices = await fetchSeiDailyPrices(7);
//         setTokenData(prices);
//       } catch (error) {
//         console.error('Failed to fetch SEI daily prices:', error);
//       }
//     };
//     fetchHistory();
//     // Optionally, refresh once per day
//     const interval = setInterval(fetchHistory, 24 * 60 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch SEI price from CoinGecko
//   useEffect(() => {
//     const fetchSeiPrice = async () => {
//       try {
//         const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sei-network&vs_currencies=usd');
//         const data = await response.json();
//         if (data['sei-network'] && data['sei-network'].usd) {
//           const newPrice = data['sei-network'].usd;
//           setSeiPrice(newPrice);
//           // Add new price to chart data
//           // setTokenData(prev => { // This line is removed as per the new_code
//           //   const now = new Date();
//           //   const dateLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
//           //   const updated = [...prev, { date: dateLabel, price: newPrice }];
//           //   // Keep only the last 7 points
//           //   return updated.slice(-7);
//           // });
//         }
//       } catch (error) {
//         console.error('Failed to fetch SEI price:', error);
//       }
//     };
//     fetchSeiPrice();
//     const interval = setInterval(fetchSeiPrice, 30000); // Update every 30 seconds
//     return () => clearInterval(interval);
//   }, []);

//   // Calculate daily percent change for the chart
//   const percentChange = React.useMemo(() => {
//     if (tokenData.length < 2) return null;
//     const prev = tokenData[tokenData.length - 2].price;
//     const latest = tokenData[tokenData.length - 1].price;
//     if (!prev) return null;
//     const change = ((latest - prev) / prev) * 100;
//     return change;
//   }, [tokenData]);

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) return;
    
//     setLoading(true);
//     try {
//       // Validate Sei address format
//       if (searchQuery.startsWith('sei1')) {
//         if (searchQuery.length !== 44) {
//           alert('Invalid Sei address format. Must be 44 characters long.');
//           setLoading(false);
//           return;
//         }
//       }
      
//       const result = await BlockchainService.searchByAddress(searchQuery);
      
//       if (result?.type === 'wallet') {
//         const walletData = result.data as SeiWallet;
//         const analysis = await AIService.analyzeWalletActivity(
//           walletData.address,
//           [],
//           walletData.balance
//         );
//         const suspicious = await SuspiciousActivityService.analyzeWallet(walletData);
        
//         setAiAnalysis(analysis);
//         setSuspiciousActivities(suspicious);
//       }
//     } catch (error) {
//       console.error('Search failed:', error);
//       alert('Search failed. Please check the address format.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="mt-10 px-10 text-white font-sans">
//       {/* Header Section */}
//       <section className="border rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-10 mb-10">
//         <main className="flex justify-between items-center">
//           <div className="flex flex-col gap-3">
//             <h1 className="text-xl font-bold">SeiGuard AI Explorer</h1>
//             <h2>AI-Enhanced Blockchain Analysis</h2>
//           </div>

//           <div className="relative flex items-center w-full max-w-2xl">
//             <FaSearch className="absolute left-4 text-white text-lg peer-focus:rotate-6 peer-focus:scale-105 transition-all" />
//             <input
//               maxLength={700}
//               placeholder="Search an address, transaction, block or token ..."
//               spellCheck="false"
//               className="peer truncate rounded-full w-full h-10 lg:h-[50px] pl-12 pr-8 text-h5 text-white placeholder-white border border-white bg-white/20 hover:bg-white/30 focus:bg-white/40 outline-none transition-all duration-300"
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//             />
//             <button
//               onClick={handleSearch}
//               disabled={loading}
//               className="absolute right-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm transition-colors"
//             >
//               {loading ? 'Searching...' : 'Search'}
//             </button>
//           </div>
//         </main>
//       </section>

//       {/* Dashboard Section */}
//       <section>
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
//           <Card title="APR" value="4.78 %" icon={<FaPercentage className="text-2xl" />} />
//           <Card title="Bonded / Supply" value="4.72B / 9.02B" icon={<FaCoins className="text-2xl" />} />
//           <Card title="Validators" value="40" icon={<FaServer className="text-2xl" />} />
//           <Card title="Transactions" value="712 124 051" icon={<FaExchangeAlt className="text-2xl" />} />
//         </div>

//         {/* AI Analysis Section */}
//         {aiAnalysis && (
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
//             <div className="flex items-center gap-2 mb-4">
//               <FaBrain className="text-cyan-400 text-xl" />
//               <h3 className="text-lg font-semibold">AI Analysis</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <h4 className="text-sm text-gray-400 mb-2">Wallet Summary</h4>
//                 <p className="text-sm">{aiAnalysis.summary}</p>
//               </div>
//               <div>
//                 <h4 className="text-sm text-gray-400 mb-2">Risk Score</h4>
//                 <div className="flex items-center gap-2">
//                   <div className="w-full bg-gray-700 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${
//                         aiAnalysis.riskScore < 30 ? 'bg-green-500' : 
//                         aiAnalysis.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
//                       }`}
//                       style={{ width: `${aiAnalysis.riskScore}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-sm font-semibold">{aiAnalysis.riskScore}%</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Suspicious Activity Section */}
//         {suspiciousActivities.length > 0 && (
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
//             <div className="flex items-center gap-2 mb-4">
//               <FaExclamationTriangle className="text-red-400 text-xl" />
//               <h3 className="text-lg font-semibold">Suspicious Activity Detected</h3>
//             </div>
//             <div className="space-y-3">
//               {suspiciousActivities.map((activity, index) => (
//                 <div key={index} className="border-l-4 border-red-500 pl-4">
//                   <div className="flex items-center gap-2 mb-1">
//                     <FaShieldAlt className={`text-sm ${
//                       activity.severity === 'high' ? 'text-red-400' : 
//                       activity.severity === 'medium' ? 'text-yellow-400' : 'text-green-400'
//                     }`} />
//                     <span className="text-sm font-semibold">{activity.description}</span>
//                   </div>
//                   <p className="text-xs text-gray-400">Confidence: {(activity.confidence * 100).toFixed(0)}%</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="bg-[#111827] p-6 rounded-xl shadow-md">
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//             <div className="text-lg font-semibold flex items-center gap-2">
//               <FaChartLine className="text-cyan-400" />
//               Token Price
//             </div>
//             <div className="text-3xl font-bold">{seiPrice !== null ? `$${seiPrice}` : 'Loading...'}</div>
//             <div className={`mt-1 md:mt-0 font-semibold ${percentChange !== null ? (percentChange >= 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'}`}>
//               {percentChange !== null ? `${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(2)}%` : '...'}
//             </div>
//           </div>

//           <ResponsiveContainer width="100%" height={200}>
//             <LineChart data={tokenData}>
//               <XAxis dataKey="date" stroke="#ccc" />
//               <Tooltip />
//               <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={false} />
//             </LineChart>
//           </ResponsiveContainer>

//           <div className="flex justify-end gap-6 mt-4 text-sm text-gray-400">
//             <div className="flex items-center gap-1">
//               <FaMoneyBill className="text-sm" />
//               SEI: <span className="text-white ml-1">{seiPrice !== null ? `$${seiPrice}` : 'Loading...'}</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <FaExchangeAlt className="text-sm" />
//               Week txs: <span className="text-white ml-1">1.94M</span>
//             </div>
//           </div>
//         </div>
//       </section>
//       {/* Recent Transactions Section */}
//       <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
//   {/* Latest Blocks Section */}
//   <div>
//     <div className="flex justify-between items-center mb-4">
//       <h3 className="text-lg font-semibold">Latest Blocks</h3>
//       <span className="text-sm text-gray-400">
//         {recentBlocks.length > 0 ? `${recentBlocks.length} blocks` : 'Loading...'}
//       </span>
//     </div>
//     {recentBlocks.length > 0 ? (
//       recentBlocks.map((block, index) => (
//         <div key={index} className="bg-[#111827] rounded-xl p-4 mb-4 shadow-sm">
//           <div className="flex justify-between text-sm text-gray-400 mb-2">
//             <span className="flex items-center gap-2 font-medium text-white">
//               <FaServer className="text-blue-500" /> {block.height}
//             </span>
//             <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
//           </div>
//           <div className="text-blue-400 text-sm mb-1 cursor-pointer hover:underline">
//             {block.hash.substring(0, 8)}...{block.hash.substring(block.hash.length - 8)}
//           </div>
//           <div className="flex items-center gap-2 text-sm">
//             <span className="text-white">Proposer: {block.proposer.substring(0, 12)}...</span>
//           </div>
//           <div className="text-sm text-gray-400 mt-1">Txn {block.transactions}</div>
//         </div>
//       ))
//     ) : (
//       <div className="bg-[#111827] rounded-xl p-4 mb-4 shadow-sm">
//         <div className="animate-pulse">
//           <div className="h-4 bg-gray-700 rounded mb-2"></div>
//           <div className="h-3 bg-gray-700 rounded mb-2"></div>
//           <div className="h-3 bg-gray-700 rounded"></div>
//         </div>
//       </div>
//     )}
//   </div>

//   {/* Latest Transactions Section */}
//   <div>
//               <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-semibold">Latest Transactions</h3>
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setAutoRefresh(!autoRefresh)}
//                 className={`text-sm px-3 py-1 rounded-full transition-colors ${
//                   autoRefresh 
//                     ? 'bg-green-600 text-white' 
//                     : 'bg-gray-600 text-gray-300'
//                 }`}
//               >
//                 {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
//               </button>
//               <span className="text-sm text-blue-400 cursor-pointer hover:underline">
//                 {recentTransactions.length > 0 ? `${recentTransactions.length} transactions` : 'Loading...'}
//               </span>
//             </div>
//           </div>
//     {recentTransactions.length > 0 ? (
//       recentTransactions.slice(0, 10).map((tx, i) => (
//         <div
//           key={i}
//           className={`flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors ${
//             i === 2 ? 'bg-gray-800' : ''
//           }`}
//           onClick={() => navigate(`/transaction/${tx.hash}`)}
//         >
//           {/* Left: Type + Hash */}
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-sm text-green-400">
//               <FaExchangeAlt />
//             </div>
//             <div>
//               <div className="text-sm font-semibold">
//                 Transaction {tx.gasUsed} gas
//               </div>
//               <div className="text-sm text-blue-400 cursor-pointer hover:underline">
//                 {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
//               </div>
//             </div>
//           </div>

//           {/* Right: Gas Info */}
//           <div className="flex flex-col gap-1 text-sm">
//             <div className="flex items-center gap-2 text-gray-300">
//               <span>Gas Used: {tx.gasUsed}</span>
//             </div>
//             <div className="flex items-center gap-2 text-gray-300">
//               <span>Fee: {tx.fee} usei</span>
//             </div>
//           </div>

//           {/* Timestamp */}
//           <div className="text-xs text-gray-400 md:ml-auto md:mt-0 mt-1">
//             {new Date(tx.timestamp).toLocaleTimeString()}
//           </div>
//         </div>
//       ))
//     ) : (
//       <div className="bg-[#111827] rounded-xl p-4 mb-4 shadow-sm">
//         <div className="animate-pulse">
//           <div className="h-4 bg-gray-700 rounded mb-2"></div>
//           <div className="h-3 bg-gray-700 rounded mb-2"></div>
//           <div className="h-3 bg-gray-700 rounded"></div>
//         </div>
//       </div>
//     )}


//   </div>
// </section>

//     </main>
//   );
// };

// const Card = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
//   <div className="bg-[#111827] p-4 rounded-xl flex items-center gap-4 shadow-sm">
//     <div className="text-white">{icon}</div>
//     <div>
//       <div className="text-sm text-gray-400">{title}</div>
//       <div className="text-xl font-semibold">{value}</div>
//     </div>
//   </div>
// );

// export default Explorer;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPercentage,
  FaCoins,
  FaServer,
  FaExchangeAlt,
  FaChartLine,
  FaMoneyBill,
  FaSearch,
  FaBrain
} from 'react-icons/fa';

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BlockchainService } from '../services/blockchainService';
import type { SeiBlock, SeiTransaction } from '../services/blockchainService';
import { AIService } from '../services/aiService';
import type { WalletAnalysis } from '../services/aiService';

const fetchSeiDailyPrices = async (days = 7) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/sei-network/market_chart?vs_currency=usd&days=${days}&interval=daily`
  );
  const data = await response.json();
  return data.prices.map((point: [number, number]) => {
    const [timestamp, price] = point;
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: Number(price),
    };
  });
};

const Explorer = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentBlocks, setRecentBlocks] = useState<SeiBlock[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<SeiTransaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [seiPriceData, setSeiPriceData] = useState<{ price: number | null; change: number | null }>({ price: null, change: null });
  const [tokenData, setTokenData] = useState<{ date: string; price: number }[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const blocks = await BlockchainService.getRecentBlocks(5);
        const transactions = await BlockchainService.getRecentTransactions(5);
        
        setRecentBlocks(blocks);
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Failed to initialize blockchain data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const blocks = await BlockchainService.getRecentBlocks(5);
        const transactions = await BlockchainService.getRecentTransactions(5);
        
        setRecentBlocks(blocks);
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const prices = await fetchSeiDailyPrices(7);
        setTokenData(prices);
      } catch (error) {
        console.error('Failed to fetch SEI daily prices:', error);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSeiPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=sei-network');
        const data = await response.json();
        if (data[0]) {
          setSeiPriceData({
            price: data[0].current_price,
            change: data[0].price_change_percentage_24h,
          });
        }
      } catch (error) {
        console.error('Failed to fetch SEI price:', error);
      }
    };
    fetchSeiPrice();
    const interval = setInterval(fetchSeiPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setAiAnalysis(null);
  
    try {
      const query = searchQuery.trim();
  
      if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
        // It's an Ethereum-style wallet address
        const walletData = await BlockchainService.getWalletInfo(query);
        if (walletData) {
          const analysis = await AIService.analyzeWalletActivity(
            walletData.address,
            [],
            walletData.balance
          );
          // const suspicious = await SuspiciousActivityService.analyzeWallet(walletData);
          
          setAiAnalysis(analysis);
          // setSuspiciousActivities(suspicious);
        } else {
          alert('No wallet data found.');
        }
      } else if (/^[0-9a-f]{64}$/.test(query)) {
        // It's a transaction hash
        const transaction = await BlockchainService.getTransaction(query);
        if (transaction) {
          navigate(`/transaction/${query}`);
        } else {
          alert('Transaction not found.');
        }
      } else if (/^\d+$/.test(query)) {
        // It's a block number
        const block = await BlockchainService.getBlock(parseInt(query, 10));
        if (block) {
          console.log(block);
        } else {
          alert('Block not found.');
        }
      } else {
        alert('Invalid input. Please enter a valid wallet address, transaction hash, or block number.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mt-10 px-10 text-white font-sans">
      {/* Header Section */}
      <section className="border rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-10 mb-10">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-3">
            <h1 className="text-xl font-bold">SeiGuard AI Explorer</h1>
            <h2>AI-Enhanced Blockchain Analysis</h2>
          </div>

          <div className="relative flex items-center w-full max-w-2xl">
            <FaSearch className="absolute left-4 text-white text-lg peer-focus:rotate-6 peer-focus:scale-105 transition-all" />
            <input
              maxLength={700}
              placeholder="Search an address, transaction, block or token ..."
              spellCheck="false"
              className="peer truncate rounded-full w-full h-10 lg:h-[50px] pl-12 pr-8 text-h5 text-white placeholder-white border border-white bg-white/20 hover:bg-white/30 focus:bg-white/40 outline-none transition-all duration-300"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-sm transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
          <Card title="APR" value="4.78 %" icon={<FaPercentage className="text-2xl" />} />
          <Card title="Bonded / Supply" value="4.72B / 9.02B" icon={<FaCoins className="text-2xl" />} />
          <Card title="Validators" value="40" icon={<FaServer className="text-2xl" />} />
          <Card title="Transactions" value="712 124 051" icon={<FaExchangeAlt className="text-2xl" />} />
        </div>

        {/* AI Analysis Section */}
        {aiAnalysis && (
          <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBrain className="text-cyan-400 text-xl" />
              <h3 className="text-lg font-semibold">AI Analysis</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Wallet Summary</h4>
                <p className="text-sm">{aiAnalysis.summary}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Risk Score</h4>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        aiAnalysis.riskScore < 30 ? 'bg-green-500' : 
                        aiAnalysis.riskScore < 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${aiAnalysis.riskScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{aiAnalysis.riskScore}%</span>
                </div>
              </div>
            </div>
          </div>
        )}


        <div className="bg-[#111827] p-6 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div className="text-lg font-semibold flex items-center gap-2">
              <FaChartLine className="text-cyan-400" />
              Token Price
            </div>
            <div className="text-3xl font-bold">SEI: ${seiPriceData.price !== null ? seiPriceData.price.toFixed(2) : 'Loading...'}</div>
            <div
              className={`mt-1 md:mt-0 font-semibold ${
                seiPriceData.change !== null ? (seiPriceData.change >= 0 ? 'text-green-500' : 'text-red-500') : 'text-gray-400'
              }`}
            >
              {seiPriceData.change !== null ? `${seiPriceData.change.toFixed(2)}%` : '...'}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={tokenData}>
              <XAxis dataKey="date" stroke="#ccc" />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex justify-end gap-6 mt-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <FaMoneyBill className="text-sm" />
              SEI: <span className="text-white ml-1">${seiPriceData.price !== null ? seiPriceData.price.toFixed(2) : 'Loading...'}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaExchangeAlt className="text-sm" />
              Week txs: <span className="text-white ml-1">1.94M</span>
            </div>
          </div>
        </div>
      </section>
      {/* Recent Transactions Section */}
      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Latest Blocks Section */}
  <div>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">Latest Blocks</h3>
      <span className="text-sm text-gray-400">
        {recentBlocks.length > 0 ? `${recentBlocks.length} blocks` : 'Loading...'}
      </span>
    </div>
    {recentBlocks.length > 0 ? (
      recentBlocks.map((block, index) => (
        <div key={index} className="bg-[#111827] rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span className="flex items-center gap-2 font-medium text-white">
              <FaServer className="text-blue-500" /> {block.height}
            </span>
            <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="text-blue-400 text-sm mb-1 cursor-pointer hover:underline">
            {block.hash.substring(0, 8)}...{block.hash.substring(block.hash.length - 8)}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white">Proposer: {block.proposer.substring(0, 12)}...</span>
          </div>
          <div className="text-sm text-gray-400 mt-1">Txn {block.transactions}</div>
        </div>
      ))
    ) : (
      <div className="bg-[#111827] rounded-xl p-4 mb-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded"></div>
        </div>
      </div>
    )}
  </div>

  {/* Latest Transactions Section */}
  <div>
              <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Latest Transactions</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
              <span className="text-sm text-blue-400 cursor-pointer hover:underline">
                {recentTransactions.length > 0 ? `${recentTransactions.length} transactions` : 'Loading...'}
              </span>
            </div>
          </div>
    {recentTransactions.length > 0 ? (
      recentTransactions.slice(0, 10).map((tx, i) => (
        <div
          key={i}
          className={`flex flex-col md:flex-row md:justify-between items-start md:items-center gap-2 p-4 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors ${
            i === 2 ? 'bg-gray-800' : ''
          }`}
          onClick={() => navigate(`/transaction/${tx.hash}`)}
        >
          {/* Left: Type + Hash */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-sm text-green-400">
              <FaExchangeAlt />
            </div>
            <div>
              <div className="text-sm font-semibold">
                Transaction {tx.gasUsed} gas
              </div>
              <div className="text-sm text-blue-400 cursor-pointer hover:underline">
                {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
              </div>
            </div>
          </div>

          {/* Right: Gas Info */}
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <span>Gas Used: {tx.gasUsed}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span>Fee: {tx.fee} usei</span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-gray-400 md:ml-auto md:mt-0 mt-1">
            {new Date(tx.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))
    ) : (
      <div className="bg-[#111827] rounded-xl p-4 mb-4 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded"></div>
        </div>
      </div>
    )}
  </div>
</section>
    </main>
  );
};

const Card = ({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-[#111827] p-4 rounded-xl flex items-center gap-4 shadow-sm">
    <div className="text-white">{icon}</div>
    <div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  </div>
);

export default Explorer;