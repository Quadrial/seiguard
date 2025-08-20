import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCopy,
  FaExternalLinkAlt,
  FaCircle, // For the status dot
  FaCheckCircle, // For success status
  FaTimesCircle, // For failure status
  FaSpinner // For loading
} from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { SeiTransaction } from '../services/blockchainService';

// Define the expected structure for EVM transaction details if not already in SeiTransaction
// You might need to adjust SeiTransaction in blockchainService.ts to include these.
interface DetailedSeiTransaction extends SeiTransaction {
  blockHash?: string;
  gasPrice?: string;
  gasLimit?: string;
  gasUsedByTransaction?: string; // This might be `gasUsed` in some APIs
  nonce?: number;
  value?: string; // Transaction value
  txType?: number; // EVM transaction type (0, 1, 2)
  method?: string; // Decoded method name
  status?: boolean; // Transaction status (true for success)
  failureReason?: string; // If status is false
  position?: number; // Transaction index within the block
  // ... any other fields from your backend's EVM transaction response
}

type Price = { usd: number; usd_24h_change: number } | null;

const short = (s?: string, left = 10, right = 10) => {
  if (!s) return '';
  return s.length <= left + right + 3 ? s : `${s.substring(0, left)}...${s.substring(s.length - right)}`;
};

const normalizeHash = (h: string) => {
  if (!h) return h;
  if (/^0x[0-9a-fA-F]{64}$/.test(h)) return h;
  if (/^[0-9a-fA-F]{64}$/.test(h)) return h;
  const bare = h.startsWith('0x') ? h.slice(2) : h;
  return /^[0-9a-fA-F]{64}$/.test(bare) ? (h.startsWith('0x') ? h : `0x${bare}`) : h;
};

// Removed unused timeAgo helper

const formatTimestamp = (ts?: string) => {
  if (!ts) return 'Unknown';
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'shortOffset'
  };
  return date.toLocaleString('en-US', options);
};

// Removed unused helpers isBech32 and isEvm

const gradientFor = (seed: string) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * 17) % 360;
  const h2 = (h + 60) % 360;
  return `linear-gradient(135deg, hsl(${h} 70% 50%), hsl(${h2} 70% 50%))`;
};

const TinyAvatar = ({ seed }: { seed: string }) => (
  <span
    className="inline-block w-4 h-4 rounded-full" // Changed to rounded-full for circular avatar
    style={{ background: gradientFor(seed) }}
  />
);

const LabeledRow = ({
  label,
  children,
  className = ''
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`grid grid-cols-3 md:grid-cols-4 gap-4 py-3 border-b border-gray-700 items-center ${className}`}>
    <span className="col-span-1 text-gray-400 text-sm font-medium">{label}</span>
    <div className="col-span-2 md:col-span-3 text-white text-sm break-words flex items-center gap-2">
      {children}
    </div>
  </div>
);

const TransactionDetails: React.FC = () => {
  const { hash } = useParams<{ hash: string }>();
  const navigate = useNavigate();

  const [tx, setTx] = useState<DetailedSeiTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [latestHeight, setLatestHeight] = useState<number | null>(null);
  const [price, setPrice] = useState<Price>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Load tx + latest block + price
  useEffect(() => {
    const load = async () => {
      if (!hash) return;
      setLoading(true);
      try {
        const n = normalizeHash(hash);
        const candidates = /^0x/.test(n) ? [n, n.slice(2)] : [n, `0x${n}`];

        let found: DetailedSeiTransaction | null = null;
        for (const h of candidates) {
          const t = await BlockchainService.getTransaction(h) as DetailedSeiTransaction;
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
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 1200);
    } catch {}
  };

  const feeUsei = useMemo(() => {
    const n = Number(tx?.fee ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [tx?.fee]);

  const feeSei = feeUsei / 1e6; // Assuming SEI has 6 decimal places (microSEI)
  const feeUsd = price?.usd ? feeSei * price.usd : null;

  const valueSei = useMemo(() => {
    const n = Number(tx?.value ?? 0); // Assuming value is in microSEI
    return Number.isFinite(n) ? n / 1e6 : 0;
  }, [tx?.value]);
  const valueUsd = price?.usd ? valueSei * price.usd : null;

  // Removed unused typeBadge computation

  if (loading) {
    return (
      <div className="mt-10 px-4 sm:px-6 lg:px-8 text-white font-sans">
        <div className="max-w-4xl mx-auto text-center py-20">
          <FaSpinner className="animate-spin text-4xl text-blue-400 mx-auto mb-4" />
          <p className="text-lg">Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="py-20 md:py-10 px-4 sm:px-6 lg:px-8 text-white font-sans">
        <div className="max-w-4xl mx-auto py-10 px-6 bg-[#111827] rounded-lg shadow-md">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors">
              <FaArrowLeft /> Back
            </button>
            <h1 className="text-2xl font-bold text-red-400">Transaction Not Found</h1>
          </div>
          <p className="text-lg text-red-300 mb-6">The transaction with hash "{hash}" could not be found.</p>
          <p className="text-gray-400">Please check the hash or try again later.</p>
        </div>
      </div>
    );
  }

  const isCopied = (text: string) => copiedText === text;

  return (
    <div className="py-24 md:py-24 px-2 sm:px-4 md:px-8 lg:px-10 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Back button and Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
          >
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <FaCircle className="text-green-500 text-xs" /> {/* Status dot */}
            {formatTimestamp(tx.timestamp)}
          </div>
        </div>

        <div className="bg-[#111827] p-4 sm:p-6 rounded-lg shadow-md">
          {/* Transaction Hash Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-700 pb-4 mb-4 gap-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <FaCircle className={`text-${tx.status === true ? 'green' : 'red'}-500 text-sm`} />
              <h1 className="text-lg sm:text-xl font-bold break-all">{short(tx.hash, 15, 15)}</h1>
              <button onClick={() => copy(tx.hash)} className="text-gray-400 hover:text-white" title="Copy Transaction Hash">
                <FaCopy />
              </button>
              {isCopied(tx.hash) && <span className="text-green-400 text-xs">Copied!</span>}
            </div>
            {/* You could add a JSON export button here if needed */}
            {/* <button className="px-3 py-1 bg-gray-700 rounded-md text-sm hover:bg-gray-600">JSON <FaExternalLinkAlt className="inline-block ml-1 text-xs" /></button> */}
          </div>

          {/* Details Tabs */}
          <div className="flex flex-col sm:flex-row border-b border-gray-700 mb-4">
            <button className="py-2 px-4 text-sm font-medium text-blue-400 border-b-2 border-blue-400">Details</button>
            {/* Add other tabs like "Token Transfers", "Logs", "State" if you implement them */}
            {/* <button className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">Token Transfers ({tx.tokenTransfersCount || 0})</button> */}
            {/* <button className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">Logs ({tx.logsCount || 0})</button> */}
            {/* <button className="py-2 px-4 text-sm font-medium text-gray-400 hover:text-white">State</button> */}
          </div>

          {/* EVM Details Section */}
          <h2 className="text-lg font-semibold mb-3">EVM details</h2>
          <div className="space-y-2">
            <LabeledRow label="Type">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900 text-blue-200 border border-blue-700">
                {tx.type || (tx.method && tx.method !== 'N/A' ? tx.method : 'Execute')}
              </span>
            </LabeledRow>

            <LabeledRow label="Block">
              <Link to={`/block/${tx.height}`} className="text-blue-400 hover:underline">
                {tx.height}
              </Link>
              {confirmations !== null && (
                <span className="text-gray-400 text-xs">
                  ({confirmations.toLocaleString()} block confirmations ago)
                </span>
              )}
            </LabeledRow>

            <LabeledRow label="Hash">
              <Link to={`/transaction/${tx.hash}`} className="text-blue-400 hover:underline">
                {short(tx.hash, 8, 8)}
              </Link>
              <button onClick={() => copy(tx.hash)} className="text-gray-400 hover:text-white">
                <FaCopy />
              </button>
              {isCopied(tx.hash) && <span className="text-green-400 text-xs">Copied!</span>}
            </LabeledRow>

            {tx.from && (
              <LabeledRow label="From">
                <TinyAvatar seed={tx.from} />
                <Link to={`/address/${tx.from}`} className="text-blue-400 hover:underline">
                  {short(tx.from!, 8, 8)}
                </Link>
                <button onClick={() => copy(tx.from!)} className="text-gray-400 hover:text-white">
                  <FaCopy />
                </button>
                {isCopied(tx.from!)}
              </LabeledRow>
            )}

            {tx.to && (
              <LabeledRow label="To">
                <TinyAvatar seed={tx.to} />
                <Link to={`/address/${tx.to}`} className="text-blue-400 hover:underline">
                  {short(tx.to!, 15, 15)}
                </Link>
                <button onClick={() => copy(tx.to!)} className="text-gray-400 hover:text-white">
                  <FaCopy />
                </button>
                {isCopied(tx.to!)}
              </LabeledRow>
            )}

            <LabeledRow label="Value">
              <span>{valueSei.toFixed(4)} SEI</span>
              <span className="text-gray-400">~{valueUsd !== null ? `$${valueUsd.toFixed(3)}` : '$0.000'}</span>
            </LabeledRow>

            {tx.position !== undefined && (
              <LabeledRow label="Position">
                <span>{tx.position}</span>
              </LabeledRow>
            )}

            {tx.nonce !== undefined && (
              <LabeledRow label="Nonce">
                <span>{tx.nonce}</span>
              </LabeledRow>
            )}

            <LabeledRow label="Transaction fee">
              <span>{feeSei.toFixed(6)} SEI</span>
              <span className="text-gray-400">~{feeUsd !== null ? `$${feeUsd.toFixed(3)}` : '$0.000'}</span>
            </LabeledRow>

            {tx.gasUsedByTransaction !== undefined && ( // Assuming this field from your backend
              <LabeledRow label="Gas Used">
                <span>{tx.gasUsedByTransaction}</span>
                {tx.gasLimit !== undefined && <span className="text-gray-400">of {tx.gasLimit}</span>}
              </LabeledRow>
            )}

            {tx.gasPrice !== undefined && (
              <LabeledRow label="Gas Price">
                <span>{tx.gasPrice}</span>
              </LabeledRow>
            )}

            {tx.status !== undefined && (
              <LabeledRow label="Status">
                {tx.status === true ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <FaCheckCircle /> Success
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400">
                    <FaTimesCircle /> Failed
                    {tx.failureReason && <span className="text-gray-400">({tx.failureReason})</span>}
                  </span>
                )}
              </LabeledRow>
            )}
          </div>
        </div>

        {/* Optional raw JSON */}
        <details className="mt-4 bg-[#111827] rounded-lg p-4">
          <summary className="cursor-pointer text-sm text-gray-400 hover:text-white flex items-center gap-2">
            Show raw JSON
            <FaExternalLinkAlt className="inline-block text-xs" />
          </summary>
          <pre className="mt-2 p-4 bg-black/40 rounded-lg overflow-auto text-xs">
            {JSON.stringify(tx, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default TransactionDetails;