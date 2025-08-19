
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPercentage,
  FaCoins,
  FaServer,
  FaExchangeAlt,
  FaChartLine,
  FaMoneyBill,
  FaSearch
} from 'react-icons/fa';

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BlockchainService } from '../services/blockchainService';
import type { SeiBlock, SeiTransaction } from '../services/blockchainService';
// import { AIService } from '../services/aiService';
// import type { WalletAnalysis } from '../services/aiService';

// ----------------- Helpers for smart search -----------------
type SuggestType = 'tx' | 'address' | 'contract' | 'block';
type SearchSuggestion = {
  type: SuggestType;
  id: string;           // hash, address, or block height string
  label: string;        // primary display line
  sublabel?: string;    // optional secondary line
};

const isHex64 = (s: string) => /^[0-9a-fA-F]{64}$/.test(s);
const isTxHashLike = (s: string) => /^(0x)?[0-9a-fA-F]{64}$/.test(s);
const isBlockNumberLike = (s: string) => /^\d{1,12}$/.test(s);
const isSeiBech32 = (s: string) => /^sei1[0-9a-z]{20,80}$/i.test(s);
const isEvmAddress = (s: string) => /^0x[0-9a-fA-F]{40}$/.test(s);
const short = (s: string) => (s.length <= 24 ? s : `${s.slice(0, 12)}…${s.slice(-12)}`);

const getTransactionSafe = async (hash: string) => {
  const candidates = hash.startsWith('0x') ? [hash, hash.slice(2)] : [hash, `0x${hash}`];
  for (const h of candidates) {
    const tx = await BlockchainService.getTransaction(h);
    if (tx && tx.hash) return tx;
  }
  return null;
};

// Coingecko helper
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
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searching, setSearching] = useState(false);

  const [recentBlocks, setRecentBlocks] = useState<SeiBlock[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<SeiTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [seiPriceData, setSeiPriceData] = useState<{ price: number | null; change: number | null }>({ price: null, change: null });
  const [tokenData, setTokenData] = useState<{ date: string; price: number }[]>([]);

  // Initial data
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

  // Auto refresh recent blocks/txs
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

  // Token chart
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

  // Spot price
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

  // ----------------- Debounced live suggestions -----------------
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setActiveIndex(0);
      return;
    }

    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const sugg: SearchSuggestion[] = [];

        // 1) Block?
        if (isBlockNumberLike(q)) {
          const block = await BlockchainService.getBlock(parseInt(q, 10));
          if (block) {
            sugg.push({ type: 'block', id: String(q), label: `Block ${q}`, sublabel: short(block.hash) });
          }
        }

        // 2) Tx?
        if (isTxHashLike(q) || isHex64(q)) {
          const tx = await getTransactionSafe(q);
          if (tx) {
            sugg.push({ type: 'tx', id: tx.hash, label: 'Transaction', sublabel: short(tx.hash) });
          }
        }

        // 3) Address/Contract (bech32)?
        if (isSeiBech32(q)) {
          const cosmosContract = await BlockchainService.getContract('cosmos', q);
          if (cosmosContract) {
            sugg.push({
              type: cosmosContract.verified ? 'contract' : 'address',
              id: q,
              label: cosmosContract.verified ? 'Contract' : 'Address',
              sublabel: short(q)
            });
          } else {
            const wallet = await BlockchainService.getWalletInfo(q);
            sugg.push({
              type: 'address',
              id: q,
              label: 'Address',
              sublabel: wallet ? `Balance ~ ${wallet.balance}` : short(q)
            });
          }
        }

        // 3b) EVM address or contract (0x...)?
        if (isEvmAddress(q)) {
          const evmContract = await BlockchainService.getContract('evm', q);
          if (evmContract) {
            sugg.push({
              type: 'contract',
              id: q,
              label: 'Contract (EVM)',
              sublabel: short(q)
            });
          } else {
            // Try to map to a Sei bech32 address; if found, suggest the Sei address
            const mappedSei = await BlockchainService.getSeiFromEvmAddress(q);
            if (mappedSei && isSeiBech32(mappedSei)) {
              sugg.push({ type: 'address', id: mappedSei, label: 'Address', sublabel: short(mappedSei) });
            } else {
              // As a fallback, still allow navigating to the 0x address page
              sugg.push({ type: 'address', id: q, label: 'EVM Address', sublabel: short(q) });
            }
          }
        }

        // 4) Backend /search fallback (if implemented)
        if (sugg.length === 0) {
          const res = await BlockchainService.search(q);
          if (res) {
            if (res.tx?.hash || res.transaction?.hash) {
              const h = res.tx?.hash ?? res.transaction?.hash;
              sugg.push({ type: 'tx', id: h, label: 'Transaction', sublabel: short(h) });
            } else if (res.block?.height || res.height) {
              const h = String(res.block?.height ?? res.height);
              sugg.push({ type: 'block', id: h, label: `Block ${h}` });
            } else if (res.contract?.address || res.contract_address) {
              const a = res.contract?.address ?? res.contract_address;
              sugg.push({ type: 'contract', id: a, label: 'Contract', sublabel: short(a) });
            } else if (res.account?.address || res.address || res.result?.address) {
              const a = res.account?.address ?? res.address ?? res.result?.address;
              sugg.push({ type: 'address', id: a, label: 'Address', sublabel: short(a) });
            }
          }
        }

        // 5) Soft suggestions if nothing confirmed yet
        if (sugg.length === 0 && (isTxHashLike(q) || isHex64(q))) {
          sugg.push({ type: 'tx', id: q, label: 'Transaction (maybe)', sublabel: short(q) });
        }
        if (sugg.length === 0 && isSeiBech32(q)) {
          sugg.push({ type: 'address', id: q, label: 'Address', sublabel: short(q) });
        }
        if (sugg.length === 0 && isEvmAddress(q)) {
          sugg.push({ type: 'address', id: q, label: 'EVM Address', sublabel: short(q) });
        }

        setSuggestions(sugg);
        setActiveIndex(0);
      } catch (e) {
        console.error('suggest error', e);
        setSuggestions([]);
        setActiveIndex(0);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [searchQuery]);

  // ----------------- Search trigger (Enter/click) -----------------
  const handleSearch = async () => {
    const q = searchQuery.trim();
    if (!q) return;

    // Prefer currently highlighted suggestion
    const chosen = suggestions[activeIndex] || suggestions[0];
    if (chosen) {
      if (chosen.type === 'tx') return navigate(`/transaction/${chosen.id}`);
      if (chosen.type === 'block') return navigate(`/block/${chosen.id}`);
      if (chosen.type === 'contract') return navigate(`/contract/${chosen.id}`);
      if (chosen.type === 'address') return navigate(`/address/${chosen.id}`);
    }

    // Fallback routing if no suggestions are present
    if (isBlockNumberLike(q)) return navigate(`/block/${q}`);
    if (isTxHashLike(q) || isHex64(q)) return navigate(`/transaction/${q.startsWith('0x') ? q : `0x${q}`}`);
    if (isSeiBech32(q)) return navigate(`/address/${q}`);
    if (isEvmAddress(q)) return navigate(`/address/${q}`);

    // Last attempt: backend search
    try {
      const res = await BlockchainService.search(q);
      if (res?.tx?.hash || res?.transaction?.hash) return navigate(`/transaction/${res.tx?.hash ?? res.transaction?.hash}`);
      if (res?.block?.height || res?.height) return navigate(`/block/${res.block?.height ?? res.height}`);
      if (res?.contract?.address || res?.contract_address) return navigate(`/contract/${res.contract?.address ?? res.contract_address}`);
      if (res?.account?.address || res?.address || res?.result?.address) return navigate(`/address/${res.account?.address ?? res.address ?? res.result?.address}`);
    } catch {
      // ignore
    }
    // No intrusive alert; mirror explorer UX by keeping the dropdown
    console.warn('No matching entity for query:', q);
  };

  return (
    <main className="py-30 px-10 text-white font-sans">
      {/* Header Section */}
      <section className="border rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-6 sm:p-8 lg:p-10 mb-10">
  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
    
    {/* Left Text */}
    <div className="flex flex-col gap-2 sm:gap-3 text-center lg:text-left">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
        SeiGuard AI Explorer
      </h1>
      <h2 className="text-sm sm:text-base lg:text-lg text-gray-100">
        AI-Enhanced Blockchain Analysis
      </h2>
    </div>

    {/* Search Bar */}
    <div className="relative flex items-center w-full max-w-full sm:max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
      <FaSearch className="absolute left-4 text-white text-lg peer-focus:rotate-6 peer-focus:scale-105 transition-all" />
      
      <input
        maxLength={700}
        placeholder="Search an address, transaction, block or token ..."
        spellCheck="false"
        className="peer truncate rounded-full w-full h-10 sm:h-11 lg:h-[50px] pl-12 pr-20 text-sm sm:text-base text-white placeholder-white border border-white bg-white/20 hover:bg-white/30 focus:bg-white/40 outline-none transition-all duration-300"
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((i) => Math.min(suggestions.length - 1, i + 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((i) => Math.max(0, i - 1));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        }}
      />

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={loading}
        className="absolute right-2 bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm transition-colors"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Suggestions Dropdown */}
      {searchQuery.trim().length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-[#0b1220] rounded-xl shadow-xl overflow-hidden z-50">
          {searching ? (
            <div className="p-4 space-y-3">
              <div className="h-4 w-28 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-full bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-sm text-gray-400">No results</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {suggestions.map((s, idx) => (
                <div
                  key={`${s.type}-${s.id}-${idx}`}
                  className={`p-4 cursor-pointer hover:bg-gray-800 ${idx === activeIndex ? 'bg-gray-800' : ''}`}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    // Always normalize tx hash to 0x-prefixed for navigation
                    const txId = s.type === 'tx' && !s.id.startsWith('0x') ? `0x${s.id}` : s.id;
                    if (s.type === 'tx') navigate(`/transaction/${txId}`);
                    else if (s.type === 'block') navigate(`/block/${s.id}`);
                    else if (s.type === 'contract') navigate(`/contract/${s.id}`);
                    else navigate(`/address/${s.id}`);
                  }}
                >
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    {s.type === 'tx'
                      ? 'Transaction'
                      : s.type === 'block'
                      ? 'Block'
                      : s.type === 'contract'
                      ? 'Contract'
                      : 'Address'}
                  </div>
                  <div className="text-white">{s.type === 'tx' && !s.label.startsWith('0x') ? `0x${s.label}` : s.label}</div>
                  {s.sublabel && (
                    <div className="text-xs text-blue-300 font-mono">
                      {s.sublabel}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
                className={`text-sm px-3 py-1 rounded-full transition-colors hidden ${
                  autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-sm text-green-400">
                    <FaExchangeAlt />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Transaction {tx.gasUsed} gas</div>
                    <div className="text-sm text-blue-400 cursor-pointer hover:underline">
                      {tx.hash.substring(0, 8)}...{tx.hash.substring(tx.hash.length - 8)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>Gas Used: {tx.gasUsed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <span>Fee: {tx.fee} usei</span>
                  </div>
                </div>

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