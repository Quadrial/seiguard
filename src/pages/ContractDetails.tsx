import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCopy, FaChartBar } from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { ContractTxRow, ContractType, SeiAccount, SeiContract, SeiPriceData } from '../services/blockchainService';

const isSei = (s?: string) => !!s && /^sei1[0-9a-z]{20,80}$/i.test(s);
const isEvm = (s?: string) => !!s && /^0x[0-9a-fA-F]{40}$/i.test(s);
const useiToSei = (val?: string) => {
  const n = Number(val ?? '0');
  return Number.isFinite(n) ? n / 1e6 : 0;
};
const timeAgo = (ts?: string) => {
  if (!ts) return '';
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return ts;
  const d = Math.floor((Date.now() - t) / 1000);
  if (d < 60) return `${d}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
};
const short = (s: string, left = 10, right = 8) =>
  !s || s.length <= left + right + 3 ? s : `${s.slice(0, left)}…${s.slice(-right)}`;

const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="border border-gray-700 rounded-lg p-4">
    <div className="text-gray-400 text-sm mb-1">{label}</div>
    <div className="text-white">{value}</div>
  </div>
);

const ContractDetails: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();

  const chain: ContractType | null = useMemo(() => {
    if (!address) return null;
    if (isSei(address)) return 'cosmos';
    if (isEvm(address)) return 'evm';
    return null;
  }, [address]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [info, setInfo] = useState<SeiContract | null>(null);
  const [acct, setAcct] = useState<SeiAccount | null>(null);
  const [price, setPrice] = useState<SeiPriceData | null>(null);
  const [interactions, setInteractions] = useState<number>(0);

  const [txs, setTxs] = useState<ContractTxRow[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<number | undefined>(undefined);
  const [totalRows, setTotalRows] = useState<number | undefined>(undefined);
  const pageSize = 25;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!address || !chain) {
        setError('Invalid contract address');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const [cinfo, p, count] = await Promise.all([
          BlockchainService.getContract(chain, address),
          BlockchainService.getSeiPrice(),
          BlockchainService.getInteractionCount(address, chain)
        ]);
        setInfo(cinfo);
        setPrice(p);
        setInteractions(count);

        // For Cosmos contracts, also pull balance via accounts/{address}
        if (chain === 'cosmos') {
          const a = await BlockchainService.getAccountDetails(address);
          setAcct(a);
        } else {
          setAcct(null);
        }

        // First page of txs
        const txResp = await BlockchainService.getContractTxs(chain, address, 1, pageSize);
        setTxs(txResp.items);
        setPage(1);
        setPages(txResp.pagination.pages);
        setTotalRows(txResp.pagination.rows);
      } catch (e: any) {
        console.error('ContractDetails load error', e);
        setError(e?.message || 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [address, chain]);

  const loadPage = async (p: number) => {
    if (!address || !chain) return;
    setLoading(true);
    try {
      const txResp = await BlockchainService.getContractTxs(chain, address, p, pageSize);
      setTxs(txResp.items);
      setPage(p);
      setPages(txResp.pagination.pages);
      setTotalRows(txResp.pagination.rows);
    } catch (e) {
      console.error('loadPage error', e);
    } finally {
      setLoading(false);
    }
  };

  const copyAddr = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const lastBlock = txs?.[0]?.height ? String(txs[0].height) : undefined;
  const balanceSei = acct ? useiToSei(acct.wallet?.available || acct.balance) : 0;
  const balanceUsd = price?.usd ? (balanceSei * price.usd).toFixed(2) : undefined;

  if (!address) {
    return (
      <div className="mt-10 px-8 text-white">
        <div className="max-w-5xl mx-auto">No address provided.</div>
      </div>
    );
  }

  if (loading && !info && txs.length === 0) {
    return (
      <div className="mt-10 px-8 text-white">
        <div className="max-w-5xl mx-auto text-center py-20">Loading contract…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 px-8 text-white">
        <div className="max-w-5xl mx-auto">
          <button onClick={() => navigate(-1)} className="mb-4 px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 inline-flex items-center gap-2">
            <FaArrowLeft /> Back
          </button>
          <div className="bg-[#111827] p-6 rounded-xl border border-red-700/40 text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 px-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 inline-flex items-center gap-2">
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="bg-[#111827] p-6 rounded-xl shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Contract Details</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold">{info?.name || 'Unnamed Contract'}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${chain === 'cosmos' ? 'bg-purple-900/40 text-purple-200' : 'bg-yellow-900/40 text-yellow-200'}`}>
                  {chain === 'cosmos' ? 'Cosmos' : 'EVM'}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-sm">{address}</span>
                <button onClick={copyAddr} className="text-gray-400 hover:text-white"><FaCopy /></button>
                {copied && <span className="text-green-400 text-xs">Copied!</span>}
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-300">Interactions</div>
              <div className="text-3xl font-bold flex items-center justify-end gap-2">
                <FaChartBar className="text-cyan-400" />
                {typeof interactions === 'number' ? interactions.toLocaleString() : '—'}
              </div>
            </div>
          </div>

          {/* Stats grid similar to your screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Stat label="Balance" value={`${balanceSei.toFixed(6)} SEI ${balanceUsd ? ` • $${balanceUsd}` : ''}`} />
            <Stat label="Name" value={info?.name || info?.label || '—'} />
            <Stat label="Updated at block" value={lastBlock ? `#${lastBlock}` : '—'} />
            <Stat label="Creator" value={info?.creator ? <span className="font-mono text-sm break-all">{short(info.creator, 12, 12)}</span> : '—'} />
            <Stat label="Verified" value={info?.verified === true ? 'Verified' : info?.verified === false ? 'Unverified' : 'Unknown'} />
            <Stat label="Contract Type" value={chain === 'cosmos' ? 'CosmWasm' : 'EVM'} />
          </div>

          {/* Interactions table */}
          <div className="mt-8">
            <div className="mb-3 text-gray-300">Interactions</div>
            <div className="overflow-x-auto border border-gray-700 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-800 text-gray-300">
                  <tr>
                    <th className="text-left px-4 py-2">Type</th>
                    <th className="text-left px-4 py-2">Sender</th>
                    <th className="text-left px-4 py-2">To</th>
                    <th className="text-left px-4 py-2">Block</th>
                    <th className="text-left px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No interactions found.</td>
                    </tr>
                  ) : (
                    txs.map((t) => (
                      <tr key={t.hash} className="border-t border-gray-800">
                        <td className="px-4 py-2">{t.method || t.type || 'Tx'}</td>
                        <td className="px-4 py-2 font-mono">{short(t.from || '', 10, 8)}</td>
                        <td className="px-4 py-2 font-mono">{short(t.to || '', 10, 8)}</td>
                        <td className="px-4 py-2">{t.height ? `#${t.height}` : '—'}</td>
                        <td className="px-4 py-2">{t.timestamp ? `${timeAgo(t.timestamp)}` : '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
              <div>Total: {totalRows ?? (txs.length || 0)}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => loadPage(page - 1)}
                  className={`px-3 py-1 rounded ${page <= 1 ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  Prev
                </button>
                <span>Page {page}{pages ? ` / ${pages}` : ''}</span>
                <button
                  disabled={pages ? page >= pages : txs.length < pageSize}
                  onClick={() => loadPage(page + 1)}
                  className={`px-3 py-1 rounded ${
                    pages ? (page >= (pages || 1) ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700')
                    : (txs.length < pageSize ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700')
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-4 text-xs text-gray-400">Loading…</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractDetails;