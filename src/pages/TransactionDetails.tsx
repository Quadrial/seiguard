import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCopy
} from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { SeiTransaction } from '../services/blockchainService';

type Price = { usd: number; usd_24h_change: number } | null;

const short = (s?: string, left = 10, right = 10) => {
  if (!s) return '';
  return s.length <= left + right + 3 ? s : `${s.slice(0, left)}…${s.slice(-right)}`;
};

const normalizeHash = (h: string) => {
  if (!h) return h;
  if (/^0x[0-9a-fA-F]{64}$/.test(h)) return h;
  if (/^[0-9a-fA-F]{64}$/.test(h)) return h;
  const bare = h.startsWith('0x') ? h.slice(2) : h;
  return /^[0-9a-fA-F]{64}$/.test(bare) ? (h.startsWith('0x') ? h : `0x${bare}`) : h;
};

const timeAgo = (ts?: string) => {
  if (!ts) return 'Unknown';
  const d = new Date(ts).getTime();
  if (Number.isNaN(d)) return 'Unknown';
  const sec = Math.floor((Date.now() - d) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};

const isBech32 = (addr?: string) => !!addr && /^sei1[0-9a-z]{20,80}$/i.test(addr);
const isEvm = (addr?: string) => !!addr && /^0x[0-9a-fA-F]{40}$/.test(addr);

const gradientFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * 17) % 360;
  const h2 = (h + 60) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 50%), hsl(${h2} 70% 50%))`;
};

const TinyAvatar = ({ seed }: { seed: string }) => (
  <span
    className="inline-block w-4 h-4 rounded"
    style={{ background: gradientFor(seed) }}
  />
);

const LabeledRow = ({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-700">
    <span className="text-gray-400">{label}</span>
    <div className="flex items-center gap-2">{children}</div>
  </div>
);

const TransactionDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();

  const [tx, setTx] = useState<SeiTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestHeight, setLatestHeight] = useState<number | null>(null);
  const [price, setPrice] = useState<Price>(null);

  // Load tx + latest block + price
  useEffect(() => {
    const load = async () => {
      if (!hash) return;
      setLoading(true);
      try {
        // normalize hash and try both 0x + bare
        const n = normalizeHash(hash);
        const candidates = /^0x/.test(n) ? [n, n.slice(2)] : [n, `0x${n}`];

        let found: SeiTransaction | null = null;
        for (const h of candidates) {
          const t = await BlockchainService.getTransaction(h);
          if (t && t.hash) { found = t; break; }
        }
        setTx(found);

        const latest = await BlockchainService.getLatestBlock();
        if (latest?.height) setLatestHeight(Number(latest.height));

        const p = await BlockchainService.getSeiPrice?.();
        if (p && typeof p.usd === 'number') {
          setPrice({ usd: p.usd, usd_24h_change: p.usd_24h_change });
        }
      } catch (e) {
        console.error('load tx error', e);
        setTx(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [hash]);

  const confirmations = useMemo(() => {
    if (!tx?.height || !latestHeight) return null;
    const c = Number(latestHeight) - Number(tx.height);
    return c >= 0 ? c : 0;
  }, [tx?.height, latestHeight]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // setCopied(tag);
      // setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  const feeUsei = useMemo(() => {
    const n = Number(tx?.fee ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [tx?.fee]);

  const feeSei = feeUsei / 1e6;
  const feeUsd = price?.usd ? feeSei * price.usd : null;

  const typeBadge = useMemo(() => {
    // best-effort classification
    if (tx?.type) {
      if (tx.type.toLowerCase().includes('evm')) return 'EVMTransaction';
      if (tx.type.toLowerCase().includes('wasm') || tx.type.toLowerCase().includes('cosmos')) return 'CosmosTransaction';
      return tx.type;
    }
    // infer from addresses
    if (isEvm(tx?.from) || isEvm(tx?.to)) return 'EVMTransaction';
    if (isBech32(tx?.from) || isBech32(tx?.to)) return 'CosmosTransaction';
    return 'Transaction';
  }, [tx]);

  if (loading) {
    return (
      <div className="mt-10 px-10 text-white font-sans">
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!tx) {
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
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/explorer')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <FaArrowLeft />
            Back to Explorer
          </button>
        </div>

        {/* Card */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md">
          {/* Header line with badge + time */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-blue-900 text-blue-200 border border-blue-700">
                {typeBadge}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {tx.timestamp ? `${new Date(tx.timestamp).toLocaleString()} • ${timeAgo(tx.timestamp)}` : 'Time unknown'}
            </div>
          </div>

          {/* Rows like the explorer */}
          {/* From */}
          {tx.from && (
            <LabeledRow label="From">
              <>
                <TinyAvatar seed={tx.from} />
                <button
                  className="font-mono text-sm text-blue-300 hover:underline"
                  onClick={() => navigate(`/address/${tx.from}`)}
                  title={tx.from}
                >
                  {short(tx.from)}
                </button>
                <button className="text-gray-400 hover:text-white" onClick={() => copy(tx.from!)}>
                  <FaCopy />
                </button>
              </>
            </LabeledRow>
          )}

          {/* To */}
          {tx.to && (
            <LabeledRow label="To">
              <>
                <TinyAvatar seed={tx.to} />
                <button
                  className="font-mono text-sm text-blue-300 hover:underline"
                  onClick={() => navigate(`/address/${tx.to}`)}
                  title={tx.to}
                >
                  {short(tx.to)}
                </button>
                <button className="text-gray-400 hover:text-white" onClick={() => copy(tx.to!)}>
                  <FaCopy />
                </button>
              </>
            </LabeledRow>
          )}

          {/* Hash */}
          <LabeledRow label="Hash">
            <>
              <a
                className="font-mono text-sm text-blue-300 hover:underline"
                href={`/transaction/${tx.hash}`}
                onClick={(e) => { e.preventDefault(); navigate(`/transaction/${tx.hash}`); }}
                title={tx.hash}
              >
                {short(tx.hash)}
              </a>
              <button className="text-gray-400 hover:text-white" onClick={() => copy(tx.hash)}>
                <FaCopy />
              </button>
            </>
          </LabeledRow>

          {/* Block */}
          <LabeledRow label="Block">
            <>
              <button
                className="hover:underline"
                onClick={() => tx.height && navigate(`/block/${tx.height}`)}
              >
                {tx.height ?? 'Unknown'}
              </button>
              <span className="text-gray-400 text-sm">
                {confirmations !== null ? `${confirmations.toLocaleString()} block confirmations ago` : ''}
              </span>
            </>
          </LabeledRow>

          {/* Fee */}
          <LabeledRow label="Fee">
            <>
              <span>{Number.isFinite(feeSei) ? `${feeSei} SEI` : `${tx.fee ?? '—'} usei`}</span>
              <span className="text-gray-400">
                {feeUsd !== null ? `$${feeUsd.toFixed(3)}` : '\$0.000'}
              </span>
            </>
          </LabeledRow>
        </div>

        {/* Optional raw JSON */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">Show raw JSON</summary>
          <pre className="mt-2 p-4 bg-black/40 rounded-lg overflow-auto text-xs">
            {JSON.stringify(tx, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default TransactionDetails;