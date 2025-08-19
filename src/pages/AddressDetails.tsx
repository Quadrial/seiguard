import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCopy, FaCircle, FaExchangeAlt, FaUserCircle } from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { EvmAccount } from '../services/blockchainService';
import type { SeiTransaction, SeiAccount } from '../services/blockchainService';

const short = (s?: string, left = 14, right = 12) => {
  if (!s) return '';
  return s.length <= left + right + 1 ? s : `${s.slice(0, left)}…${s.slice(-right)}`;
};
const timeAgo = (ts?: string) => {
  if (!ts) return 'Unknown';
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return 'Unknown';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};
const useiToSei = (v: string | number | undefined | null) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n / 1e6 : 0; // adjust if API already returns SEI
};
const weiToSei = (v: string | number | undefined | null) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n / 1e18 : 0;
};
const isEvm = (s?: string) => !!s && /^0x[0-9a-fA-F]{40}$/.test(s);
const isSei = (s?: string) => !!s && /^sei1[0-9a-z]{20,80}$/i.test(s);

const AddressDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();

  const [resolvedSei, setResolvedSei] = useState<string | null>(null);
  const [evmAddress, setEvmAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<SeiAccount | null>(null);
  const [evmAccount, setEvmAccount] = useState<EvmAccount | null>(null);
  const [transactions, setTransactions] = useState<SeiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [priceUsd, setPriceUsd] = useState<number | null>(null);

  const copy = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      if (!address) return;
      setLoading(true);
      try {
        let seiAddr: string | null = null;
        let evmAddr: string | null = null;

        if (isSei(address)) {
          seiAddr = address;
          // also get EVM mapping if available
          evmAddr = await BlockchainService.getSeiEVMAddress?.(address) ?? null;
        } else if (isEvm(address)) {
          evmAddr = address;
          seiAddr = await BlockchainService.getSeiFromEvmAddress(address);
        }

        setEvmAddress(evmAddr);
        setResolvedSei(seiAddr);

        // If we have a Sei address, load details and transactions
        if (seiAddr) {
          const [acct, price, txs] = await Promise.all([
            BlockchainService.getAccountDetails(seiAddr),
            BlockchainService.getSeiPrice?.(),
            BlockchainService.getAccountTransactions(seiAddr, 10),
          ]);
          setAccount(acct);
          setPriceUsd(price?.usd ?? null);
          setTransactions(txs || []);
        } else {
          setAccount(null);
          // EVM-only address: fetch minimal info + recent txs if possible
          if (evmAddr) {
            const [evmInfo, txs, price] = await Promise.all([
              BlockchainService.getEvmAddressInfo(evmAddr),
              BlockchainService.getEvmAccountTransactions(evmAddr, 10),
              BlockchainService.getSeiPrice?.()
            ]);
            setEvmAccount(evmInfo);
            setTransactions(txs || []);
            setPriceUsd(price?.usd ?? null);
          } else {
            setEvmAccount(null);
            setTransactions([]);
          }
        }
      } catch (e) {
        console.error('load address error', e);
        setAccount(null);
        setTransactions([]);
        setResolvedSei(null);
        setEvmAddress(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address]);

  const avail = useMemo(() => useiToSei(account?.wallet.available), [account]);
  const delegated = useMemo(() => useiToSei(account?.wallet.delegated), [account]);
  const unbonding = useMemo(() => useiToSei(account?.wallet.unbonding), [account]);
  const rewards = useMemo(() => useiToSei(account?.wallet.reward), [account]);
  const commission = useMemo(() => useiToSei(account?.wallet.commission), [account]);
  const vesting = useMemo(() => useiToSei(account?.wallet.vesting), [account]);
  const totalSei = useMemo(() => avail + delegated + unbonding + rewards + commission + vesting, [avail, delegated, unbonding, rewards, commission, vesting]);
  const totalUsd = useMemo(() => (priceUsd ? totalSei * priceUsd : null), [totalSei, priceUsd]);

  if (loading) {
    return (
      <div className="mt-10 px-10 text-white font-sans">
        <div className="max-w-4xl mx-auto text-center py-20">Loading account details…</div>
      </div>
    );
  }

  // If user gave 0x and we couldn't resolve to Sei
  if (isEvm(address) && !resolvedSei) {
    const evmSei = evmAccount ? weiToSei(evmAccount.balance) : 0;
    const evmTotalUsd = priceUsd ? evmSei * priceUsd : null;
    return (
      <div className="mt-10 px-10 text-white font-sans">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/explorer')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
              <FaArrowLeft /> Back to Explorer
            </button>
          </div>

          {/* Account hero (EVM) */}
          <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FaUserCircle className="text-4xl text-gray-400" />
                  <span className="text-2xl font-semibold">{short(address)}</span>
                  <button onClick={() => copy(address ?? '', 'addr')} className="text-gray-400 hover:text-white">
                    <FaCopy />
                  </button>
                  {copied === 'addr' && <span className="text-green-400 text-xs">Copied!</span>}
                </div>
                <div className="ml-14 mt-1 text-sm text-gray-400">EVM Address</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{evmTotalUsd !== null ? `$${evmTotalUsd.toFixed(3)}` : '\$0.000'}</div>
                <div className="text-sm text-gray-400">{evmSei.toFixed(6)} sei</div>
              </div>
            </div>
          </div>

          {/* Tokenomics + Latest Transactions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tokenomics (EVM) */}
            <div className="bg-[#111827] p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Tokenomics</h2>
                <div className="text-xs text-gray-400">Available / Locked</div>
              </div>
              <div className="flex justify-between items-baseline mb-4">
                <div className="text-2xl font-semibold">{evmSei.toFixed(6)} sei</div>
                <div className="text-gray-400">/ 0.000000 sei</div>
              </div>
              <div className="grid grid-cols-2 gap-y-3">
                <div className="flex items-center gap-2"><FaCircle className="text-blue-500 text-xs" /><span>Available</span></div>
                <div className="text-right">{evmSei.toFixed(6)} sei</div>
                <div className="flex items-center gap-2"><FaCircle className="text-orange-500 text-xs" /><span>Delegated</span></div>
                <div className="text-right">0.000000 sei</div>
                <div className="flex items-center gap-2"><FaCircle className="text-green-500 text-xs" /><span>Unbonding</span></div>
                <div className="text-right">0.000000 sei</div>
                <div className="flex items-center gap-2"><FaCircle className="text-yellow-500 text-xs" /><span>Staking rewards</span></div>
                <div className="text-right">0.000000 sei</div>
                <div className="flex items-center gap-2"><FaCircle className="text-purple-500 text-xs" /><span>Commission</span></div>
                <div className="text-right">0.000000 sei</div>
                <div className="flex items-center gap-2"><FaCircle className="text-pink-500 text-xs" /><span>Vesting</span></div>
                <div className="text-right">0.000000 sei</div>
              </div>
            </div>

            {/* Latest Transactions (EVM) */}
            <div className="bg-[#111827] p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Latest Transactions</h2>
                <span className="text-xs text-gray-400">{transactions.length} total</span>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center text-gray-400 py-10">No transactions</div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex justify-between items-center border-b border-gray-700 py-3 last:border-b-0 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => navigate(`/transaction/${tx.hash}`)}
                  >
                    <div className="font-mono text-sm text-blue-300">{short(tx.hash, 8, 8)}</div>
                    <div className="text-xs text-gray-400">{timeAgo(tx.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-center text-gray-400 mt-6">No matching Sei account found for this EVM address.</div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mt-10 px-10 text-white font-sans">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h2 className="text-2xl font-semibold mb-4">Account Not Found</h2>
          <button onClick={() => navigate('/explorer')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg">
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
          <button onClick={() => navigate('/explorer')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg">
            <FaArrowLeft /> Back to Explorer
          </button>
        </div>

        {/* Account hero */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <FaUserCircle className="text-4xl text-gray-400" />
                <span className="text-2xl font-semibold">{short(account.address)}</span>
                <button onClick={() => copy(account.address, 'addr')} className="text-gray-400 hover:text-white">
                  <FaCopy />
                </button>
                {copied === 'addr' && <span className="text-green-400 text-xs">Copied!</span>}
              </div>

              {/* EVM line like the explorer */}
              {evmAddress && (
                <div className="ml-14 mt-1 text-sm text-gray-400 flex items-center gap-2">
                  <span>Ethereum</span>
                  <span className="font-mono">{short(evmAddress)}</span>
                  <button onClick={() => copy(evmAddress, 'evm')} className="text-gray-400 hover:text-white">
                    <FaCopy />
                  </button>
                  {copied === 'evm' && <span className="text-green-400 text-xs">Copied!</span>}
                </div>
              )}

              <div className="ml-14 mt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700">Delegations: {account.delegationsCount ?? 0}</span>
                <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700">CW20: {account.cw20TokensCount ?? 0}</span>
                <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700">NFTs: {account.cw721TokensCount ?? 0}</span>
                <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700">Tx count: {account.txsCount ?? 0}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">{totalUsd !== null ? `$${totalUsd.toFixed(3)}` : '\$0.000'}</div>
              <div className="text-sm text-gray-400">{totalSei.toFixed(6)} sei</div>
            </div>
          </div>
        </div>

        {/* Tokenomics + Latest Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tokenomics */}
          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Tokenomics</h2>
              <div className="text-xs text-gray-400">Available / Locked</div>
            </div>

            <div className="flex justify-between items-baseline mb-4">
              <div className="text-2xl font-semibold">{avail.toFixed(6)} sei</div>
              <div className="text-gray-400">/ {(totalSei - avail).toFixed(6)} sei</div>
            </div>

            <div className="grid grid-cols-2 gap-y-3">
              <div className="flex items-center gap-2"><FaCircle className="text-blue-500 text-xs" /><span>Available</span></div>
              <div className="text-right">{avail.toFixed(6)} sei</div>

              <div className="flex items-center gap-2"><FaCircle className="text-orange-500 text-xs" /><span>Delegated</span></div>
              <div className="text-right">{delegated.toFixed(6)} sei</div>

              <div className="flex items-center gap-2"><FaCircle className="text-green-500 text-xs" /><span>Unbonding</span></div>
              <div className="text-right">{unbonding.toFixed(6)} sei</div>

              <div className="flex items-center gap-2"><FaCircle className="text-yellow-500 text-xs" /><span>Staking rewards</span></div>
              <div className="text-right">{rewards.toFixed(6)} sei</div>

              <div className="flex items-center gap-2"><FaCircle className="text-purple-500 text-xs" /><span>Commission</span></div>
              <div className="text-right">{commission.toFixed(6)} sei</div>

              <div className="flex items-center gap-2"><FaCircle className="text-pink-500 text-xs" /><span>Vesting</span></div>
              <div className="text-right">{vesting.toFixed(6)} sei</div>
            </div>
          </div>

          {/* Latest Transactions */}
          <div className="bg-[#111827] p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Latest Transactions</h2>
              <span className="text-xs text-gray-400">{account.txsCount ?? 0} total</span>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                <FaExchangeAlt className="text-5xl mb-4 mx-auto" />
                <p>No transactions</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex justify-between items-center border-b border-gray-700 py-3 last:border-b-0 cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => navigate(`/transaction/${tx.hash}`)}
                >
                  <div className="flex items-center gap-3">
                    <FaExchangeAlt className="text-blue-400" />
                    <div>
                      <div className="font-semibold">{short(tx.hash, 8, 8)}</div>
                      <div className="text-sm text-gray-400">{tx.type ?? 'Tx'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">{timeAgo(tx.timestamp)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressDetails;