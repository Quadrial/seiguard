// import React, { useEffect, useState } from 'react';
// import {
//   FaExclamationTriangle,
//   FaShieldAlt,
//   FaBrain,
//   FaSearch,
//   FaChartLine,
//   FaServer,
//   FaExchangeAlt,
//   FaPlayCircle
// } from 'react-icons/fa';
// import { SuspiciousActivityService } from '../services/suspiciousActivityService';
// import type { SuspiciousActivity, Severity } from '../services/suspiciousActivityService';
// import { AIService } from '../services/aiService';
// import type { TransactionAnalysis } from '../services/aiService';
// import { BlockchainService } from '../services/blockchainService';

// const Suspicious: React.FC = () => {
//   const [txHash, setTxHash] = useState('');
//   const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
//   const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [scanning, setScanning] = useState(false);
//   const [filterSeverity, setFilterSeverity] = useState<'all' | Severity | 'any'>('all');
//   const [recentSuspicious, setRecentSuspicious] = useState<{ txHash: string; findings: SuspiciousActivity[]; tx: any }[]>([]);
//   const [aiLoadingFor, setAiLoadingFor] = useState<string | null>(null);

//   // initial: scan recent transactions for suspicious activity
//   useEffect(() => {
//     (async () => {
//       await scanRecentTransactions();
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const mockTransaction = {
//     hash: '0x1234567890abcdef',
//     gasUsed: '800000',
//     gasWanted: '1000000',
//     fee: '5000',
//     messages: [
//       {
//         typeUrl: '/cosmos.bank.v1beta1.MsgSend',
//         value: {
//           amount: [{ amount: '5000000000', denom: 'usei' }]
//         }
//       }
//     ]
//   };

//   const handleAnalyze = async () => {
//     setLoading(true);
//     try {
//       const targetHash = txHash?.trim() || mockTransaction.hash;
//       const aiResult = await AIService.analyzeTransaction(targetHash);
//       setAnalysis(aiResult);

//       // fetch transaction object for suspicious engine if possible
//       const txObj = (await BlockchainService.getTransaction(targetHash)) ?? mockTransaction;
//       const suspicious = await SuspiciousActivityService.analyzeTransaction(txObj);
//       setSuspiciousActivities(suspicious);
//     } catch (error) {
//       console.error('Analysis failed:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Scan recent transactions from explorer and collect suspicious ones
//   const scanRecentTransactions = async () => {
//     setScanning(true);
//     try {
//       // fetch a batch of recent txs (adjust limit if needed)
//       const txs = await BlockchainService.getRecentTransactions(50);
//       const suspiciousList: { txHash: string; findings: SuspiciousActivity[]; tx: any }[] = [];

//       // analyze transactions in sequence (could be parallelized if desired)
//       for (const tx of txs) {
//         try {
//           const findings = await SuspiciousActivityService.analyzeTransaction(tx);
//           if (findings && findings.length > 0) {
//             suspiciousList.push({ txHash: tx.hash || tx.tx_hash || 'unknown', findings, tx });
//           }
//         } catch (err) {
//           // keep scanning even if one tx analysis fails
//           console.error('Error analyzing tx:', tx.hash, err);
//         }
//       }

//       setRecentSuspicious(suspiciousList);
//     } catch (err) {
//       console.error('scanRecentTransactions error:', err);
//     } finally {
//       setScanning(false);
//     }
//   };

//   const getSeverityColor = (severity: string) => {
//     switch (severity) {
//       case 'high': return 'text-red-400';
//       case 'medium': return 'text-yellow-400';
//       case 'low': return 'text-green-400';
//       default: return 'text-gray-400';
//     }
//   };

//   const getSeverityBg = (severity: string) => {
//     switch (severity) {
//       case 'high': return 'bg-red-900';
//       case 'medium': return 'bg-yellow-900';
//       case 'low': return 'bg-green-900';
//       default: return 'bg-gray-900';
//     }
//   };

//   const filteredRecent = recentSuspicious.filter(item => {
//     if (filterSeverity === 'all' || filterSeverity === 'any') return true;
//     // include if any finding matches the severity
//     return item.findings.some(f => f.severity === filterSeverity);
//   });

//   const analyzeTxWithAI = async (txHashToAnalyze: string) => {
//     setAiLoadingFor(txHashToAnalyze);
//     try {
//       const aiResult = await AIService.analyzeTransaction(txHashToAnalyze);
//       setAnalysis(aiResult);
//     } catch (err) {
//       console.error('AI analyze tx error:', err);
//     } finally {
//       setAiLoadingFor(null);
//     }
//   };

//   return (
//     <div className="mt-10 px-10 text-white font-sans">
//       <div className="max-w-6xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Suspicious Activity Detection</h1>

//         {/* Search / analyze */}
//         <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
//           <div className="flex gap-4 items-center">
//             <input
//               type="text"
//               placeholder="Enter transaction hash to analyze..."
//               value={txHash}
//               onChange={(e) => setTxHash(e.target.value)}
//               className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:border-red-400 outline-none"
//             />
//             <button
//               onClick={handleAnalyze}
//               disabled={loading}
//               className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
//             >
//               {loading ? 'Analyzing...' : (<><FaSearch /> Analyze</>)}
//             </button>

//             <button
//               onClick={scanRecentTransactions}
//               disabled={scanning}
//               className="px-4 py-2 bg-blue-600 rounded-lg"
//             >
//               {scanning ? 'Scanning...' : 'Scan Recent Tx'}
//             </button>
//           </div>
//         </div>

//         {/* Detection rules & AI summary */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md">
//             <div className="flex items-center gap-3 mb-4">
//               <FaShieldAlt className="text-2xl text-blue-400" />
//               <h3 className="text-xl font-semibold">Detection Rules</h3>
//             </div>
//             <div className="space-y-4">
//               <div className="border-l-4 border-red-500 pl-4">
//                 <h4 className="font-semibold text-red-400">High Gas Usage</h4>
//                 <p className="text-sm text-gray-400">Detects transactions with unusually high gas consumption</p>
//               </div>
//               <div className="border-l-4 border-yellow-500 pl-4">
//                 <h4 className="font-semibold text-yellow-400">Contract Interactions</h4>
//                 <p className="text-sm text-gray-400">Identifies suspicious smart contract calls</p>
//               </div>
//               <div className="border-l-4 border-orange-500 pl-4">
//                 <h4 className="font-semibold text-orange-400">Large Transfers</h4>
//                 <p className="text-sm text-gray-400">Flags unusually large value transfers</p>
//               </div>
//               <div className="border-l-4 border-purple-500 pl-4">
//                 <h4 className="font-semibold text-purple-400">Unknown Contracts</h4>
//                 <p className="text-sm text-gray-400">Detects interactions with unverified contracts</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-[#111827] p-6 rounded-xl shadow-md">
//             <div className="flex items-center gap-3 mb-4">
//               <FaBrain className="text-2xl text-cyan-400" />
//               <h3 className="text-xl font-semibold">AI Analysis</h3>
//             </div>
//             {analysis ? (
//               <div className="space-y-4">
//                 <div>
//                   <p className="text-sm text-gray-400 mb-2">Transaction Summary</p>
//                   <pre className="text-gray-300 whitespace-pre-wrap">{analysis.summary}</pre>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-400 mb-2">Risk Level</p>
//                   <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
//                     analysis.riskLevel === 'high' ? 'bg-red-900 text-red-200' :
//                     analysis.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-200' :
//                     'bg-green-900 text-green-200'
//                   }`}>
//                     {analysis.riskLevel.toUpperCase()}
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <p className="text-gray-400">Enter a transaction hash to get AI analysis</p>
//             )}
//           </div>
//         </div>

//         {/* Filter for scanned suspicious items */}
//         <div className="flex items-center gap-3 mb-4">
//           <label className="text-gray-400">Filter severity:</label>
//           <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as any)} className="bg-[#111827] p-2 rounded">
//             <option value="all">All</option>
//             <option value="any">Any severity (default)</option>
//             <option value="high">High</option>
//             <option value="medium">Medium</option>
//             <option value="low">Low</option>
//           </select>
//         </div>

//         {/* Suspicious Transactions List */}
//         <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-8">
//           <div className="flex items-center gap-3 mb-4">
//             <FaExclamationTriangle className="text-2xl text-red-400" />
//             <h3 className="text-xl font-semibold">Detected Suspicious Transactions</h3>
//             <div className="ml-auto text-sm text-gray-400">{filteredRecent.length} flagged</div>
//           </div>

//           <div className="space-y-4">
//             {filteredRecent.length === 0 ? (
//               <div className="p-6 text-gray-400">No suspicious transactions found. Click "Scan Recent Tx" to check latest transactions.</div>
//             ) : (
//               filteredRecent.map((item) => (
//                 <div key={item.txHash} className="border border-gray-700 rounded-lg p-4">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-start gap-3">
//                       <FaShieldAlt className={`text-xl ${getSeverityColor(item.findings[0].severity)}`} />
//                       <div>
//                         <h4 className="font-semibold text-white">Tx {item.txHash}</h4>
//                         <p className="text-sm text-gray-400">First finding: {item.findings[0].description}</p>
//                         <p className="text-xs text-gray-500 mt-1">Findings: {item.findings.length}</p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => analyzeTxWithAI(item.txHash)}
//                         className="px-3 py-1 rounded bg-blue-600 text-sm flex items-center gap-2"
//                       >
//                         {aiLoadingFor === item.txHash ? 'Analyzing...' : (<><FaPlayCircle /> AI Analyze</>)}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                     <div>
//                       <h5 className="text-sm text-gray-400 mb-2">Findings</h5>
//                       <ul className="space-y-1">
//                         {item.findings.map((f, i) => (
//                           <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
//                             <span className={`px-2 py-1 rounded text-xs ${getSeverityBg(f.severity)}`}>{f.severity.toUpperCase()}</span>
//                             <div>
//                               <div className="font-medium">{f.description}</div>
//                               <div className="text-xs text-gray-400">Confidence: {(f.confidence * 100).toFixed(0)}%</div>
//                             </div>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>

//                     <div>
//                       <h5 className="text-sm text-gray-400 mb-2">Recommendations</h5>
//                       <ul className="space-y-1">
//                         {item.findings.flatMap((f) => f.recommendations).map((rec, idx) => (
//                           <li key={idx} className="text-sm text-gray-300">• {rec}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>

//                   <details className="text-sm text-gray-500">
//                     <summary className="cursor-pointer">Raw transaction</summary>
//                     <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(item.tx, null, 2)}</pre>
//                   </details>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         {/* Statistics */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
//             <FaChartLine className="text-3xl text-green-400 mx-auto mb-3" />
//             <h3 className="text-2xl font-bold text-green-400">Heuristic</h3>
//             <p className="text-gray-400">Rule-based detection</p>
//           </div>
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
//             <FaServer className="text-3xl text-blue-400 mx-auto mb-3" />
//             <h3 className="text-2xl font-bold text-blue-400">Real-time</h3>
//             <p className="text-gray-400">Scan latest transactions</p>
//           </div>
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
//             <FaExchangeAlt className="text-3xl text-purple-400 mx-auto mb-3" />
//             <h3 className="text-2xl font-bold text-purple-400">Rules</h3>
//             <p className="text-gray-400">Multiple detection rules</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Suspicious;


// components/Suspicious.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  FaExclamationTriangle,
  FaShieldAlt,
  FaBrain,
  FaSearch,
  FaChartLine,
  FaServer,
  FaExchangeAlt,
  FaPlayCircle,
  FaPause,
  FaPlay
} from 'react-icons/fa';
import { SuspiciousActivityService } from '../services/suspiciousActivityService';
 import type { SuspiciousActivity, Severity } from '../services/suspiciousActivityService';
 import { AIService } from '../services/aiService';
 import type { TransactionAnalysis } from '../services/aiService';
 import { BlockchainService } from '../services/blockchainService';

const DEFAULT_INTERVAL_MS = 15_000; // 15s default
const MAX_PER_CYCLE = 10; // max new txs to analyze per cycle

const Suspicious: React.FC = () => {
  const [txHash, setTxHash] = useState('');
  const [analysis, setAnalysis] = useState<TransactionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const [scanningEnabled, setScanningEnabled] = useState(true);
  const [scanIntervalMs, setScanIntervalMs] = useState(DEFAULT_INTERVAL_MS);
  const [scanning, setScanning] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | Severity | 'any'>('all');
  const [recentSuspicious, setRecentSuspicious] = useState<{ txHash: string; findings: SuspiciousActivity[]; tx: any; firstSeenAt: string }[]>([]);
  const [aiLoadingFor, setAiLoadingFor] = useState<string | null>(null);
  const [lastScanAt, setLastScanAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // persist seen txs in a ref so mutations don't re-render constantly
  const seenTxsRef = useRef<Set<string>>(new Set());
  // guard to prevent overlapping scans
  const scanningRef = useRef(false);
  // timer id
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Start polling loop
    startLoop();

    return () => {
      // cleanup on unmount
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanIntervalMs, scanningEnabled]); // restart loop if interval or enabled toggles

  // Start the interval loop
  const startLoop = () => {
    stopLoop(); // ensure no duplicate
    if (!scanningEnabled) return;

    // do an immediate scan, then schedule
    void runScanOnce();

    timerRef.current = window.setInterval(() => {
      void runScanOnce();
    }, scanIntervalMs);
  };

  const stopLoop = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Perform one scan cycle: fetch recent txs, analyze only unseen ones (bounded)
  const runScanOnce = async () => {
    if (!scanningEnabled) return;
    if (scanningRef.current) return; // skip if a scan is already running
    scanningRef.current = true;
    setScanning(true);
    setError(null);

    try {
      // Fetch a batch of recent transactions; adjust limit as necessary
      const txs = await BlockchainService.getRecentTransactions(50);
      if (!Array.isArray(txs) || txs.length === 0) {
        setLastScanAt(new Date().toLocaleString());
        return;
      }

      // Filter only unseen txs in chronological order (newest first from API -> reverse)
      const unseen = txs
        .filter((tx) => {
          const h = tx.hash ?? '';
          return h && !seenTxsRef.current.has(h);
        })
        .slice(0, MAX_PER_CYCLE);

      for (const tx of unseen) {
        const txHashLocal = tx.hash ?? '';
        // mark as seen immediately to avoid duplicate analysis across cycles
        if (txHashLocal) seenTxsRef.current.add(txHashLocal);

        try {
          const findings = await SuspiciousActivityService.analyzeTransaction(tx);
          if (findings && findings.length > 0) {
            // Add to recentSuspicious (prepend newest)
            setRecentSuspicious((prev) => [
              { txHash: txHashLocal, findings, tx, firstSeenAt: new Date().toLocaleString() },
              ...prev
            ]);
          }
        } catch (analysisErr) {
          console.error('Error analyzing tx in loop:', txHashLocal, analysisErr);
          // Do not throw — continue with next tx
        }
      }

      setLastScanAt(new Date().toLocaleString());
    } catch (err: any) {
      console.error('runScanOnce error:', err);
      setError(err?.message || 'Scan failed');
    } finally {
      scanningRef.current = false;
      setScanning(false);
    }
  };

  // Manual analyze button (one-off)
  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetHash = txHash?.trim();
      if (!targetHash) {
        setError('Enter a tx hash to analyze.');
        return;
      }

      const aiResult = await AIService.analyzeTransaction(targetHash);
      setAnalysis(aiResult);

      // const txObj = (await BlockchainService.getTransaction(targetHash)) ?? null;
      // const suspicious = txObj ? await SuspiciousActivityService.analyzeTransaction(txObj) : [];
      // setSuspiciousActivities(suspicious);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Analysis failed. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  // AI analyze a scanned tx
  const analyzeTxWithAI = async (txHashToAnalyze: string) => {
    setAiLoadingFor(txHashToAnalyze);
    setError(null);
    try {
      const aiResult = await AIService.analyzeTransaction(txHashToAnalyze);
      setAnalysis(aiResult);
    } catch (err) {
      console.error('AI analyze tx error:', err);
      setError('AI analysis failed.');
    } finally {
      setAiLoadingFor(null);
    }
  };

  // UI helpers
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-900';
      case 'medium':
        return 'bg-yellow-900';
      case 'low':
        return 'bg-green-900';
      default:
        return 'bg-gray-900';
    }
  };

  const filteredRecent = recentSuspicious.filter((item) => {
    if (filterSeverity === 'all' || filterSeverity === 'any') return true;
    return item.findings.some((f) => f.severity === filterSeverity);
  });

  // Controls
  const handleToggleScanning = () => {
    setScanningEnabled((s) => {
      const next = !s;
      if (!next) {
        stopLoop();
      } else {
        startLoop();
      }
      return next;
    });
  };

  const handleClearSeen = () => {
    seenTxsRef.current.clear();
    setRecentSuspicious([]);
  };

  return (
    <div className="py-10 px-10 text-white font-sans ">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Suspicious Activity Detection</h1>

        {/* Controls bar */}
        <div className=" items-center gap-3 mb-4 hidden">
          <button
            onClick={handleToggleScanning}
            className={`px-3 py-2 rounded-md flex items-center gap-2 ${scanningEnabled ? 'bg-red-700' : 'bg-green-600'}`}
            title={scanningEnabled ? 'Pause continuous scanning' : 'Resume continuous scanning'}
          >
            {scanningEnabled ? <FaPause /> : <FaPlay />} {scanningEnabled ? 'Pause' : 'Resume'}
          </button>

          <div className="bg-[#111827] p-2 rounded flex items-center gap-2">
            <label className="text-gray-400 text-sm">Interval (s):</label>
            <input
              type="number"
              min={5}
              step={5}
              value={Math.round(scanIntervalMs / 1000)}
              onChange={(e) => {
                const v = Number(e.target.value) || 15;
                setScanIntervalMs(Math.max(5, v) * 1000);
              }}
              className="w-16 bg-transparent text-white text-sm outline-none border-none"
            />
          </div>

          <div className="bg-[#111827] p-2 rounded text-sm">
            <div className="text-xs text-gray-400">Last scan</div>
            <div className="font-mono text-xs">{lastScanAt ?? 'never'}</div>
          </div>

          <div className="ml-auto flex gap-2">
            <button onClick={() => void runScanOnce()} className="px-3 py-2 bg-blue-600 rounded">Scan now</button>
            <button onClick={handleClearSeen} className="px-3 py-2 bg-gray-700 rounded">Clear</button>
          </div>
        </div>

        {/* Search / analyze */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-6">
          <div className="flex gap-4 items-center">
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
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? 'Analyzing...' : (<><FaSearch /> Analyze</>)}
            </button>
            <button
              onClick={() => void runScanOnce()}
              disabled={scanning}
              className="px-4 py-2 bg-blue-600 rounded-lg"
              title="Scan most recent transactions immediately"
            >
              Scan Recent Tx
            </button>
          </div>
          {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
        </div>

        {/* Detection rules & AI summary */}
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
                  <pre className="text-gray-300 whitespace-pre-wrap">{analysis.summary}</pre>
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

        {/* Filter for scanned suspicious items */}
        <div className="flex items-center gap-3 mb-4">
          <label className="text-gray-400">Filter severity:</label>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as any)} className="bg-[#111827] p-2 rounded">
            <option value="all">All</option>
            <option value="any">Any severity</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Suspicious Transactions List */}
        <div className="bg-[#111827] p-6 rounded-xl shadow-md mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FaExclamationTriangle className="text-2xl text-red-400" />
            <h3 className="text-xl font-semibold">Detected Suspicious Transactions</h3>
            <div className="ml-auto text-sm text-gray-400">{filteredRecent.length} flagged</div>
          </div>

          <div className="space-y-4">
            {filteredRecent.length === 0 ? (
              <div className="p-6 text-gray-400">No suspicious transactions found. Click "Scan Recent Tx" to check latest transactions.</div>
            ) : (
              filteredRecent.map((item) => (
                <div key={item.txHash} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className={`text-xl ${getSeverityColor(item.findings[0].severity)}`} />
                      <div>
                        <h4 className="font-semibold text-white">Tx {item.txHash}</h4>
                        <p className="text-sm text-gray-400">First finding: {item.findings[0].description}</p>
                        <p className="text-xs text-gray-500 mt-1">Findings: {item.findings.length} • First seen: {item.firstSeenAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => analyzeTxWithAI(item.txHash)}
                        className="px-3 py-1 rounded bg-blue-600 text-sm flex items-center gap-2"
                        disabled={aiLoadingFor === item.txHash}
                      >
                        {aiLoadingFor === item.txHash ? 'Analyzing...' : (<><FaPlayCircle /> AI Analyze</>)}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <h5 className="text-sm text-gray-400 mb-2">Findings</h5>
                      <ul className="space-y-1">
                        {item.findings.map((f, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${getSeverityBg(f.severity)}`}>{f.severity.toUpperCase()}</span>
                            <div>
                              <div className="font-medium">{f.description}</div>
                              <div className="text-xs text-gray-400">Confidence: {(f.confidence * 100).toFixed(0)}%</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm text-gray-400 mb-2">Recommendations</h5>
                      <ul className="space-y-1">
                        {item.findings.flatMap((f) => f.recommendations).map((rec, idx) => (
                          <li key={idx} className="text-sm text-gray-300">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <details className="text-sm text-gray-500">
                    <summary className="cursor-pointer">Raw transaction</summary>
                    <pre className="text-xs mt-2 whitespace-pre-wrap">{JSON.stringify(item.tx, null, 2)}</pre>
                  </details>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaChartLine className="text-3xl text-green-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-green-400">Heuristic</h3>
            <p className="text-gray-400">Rule-based detection</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaServer className="text-3xl text-blue-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-blue-400">Real-time</h3>
            <p className="text-gray-400">Continuous scanning</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
            <FaExchangeAlt className="text-3xl text-purple-400 mx-auto mb-3" />
            <h3 className="text-2xl font-bold text-purple-400">Rules</h3>
            <p className="text-gray-400">Multiple detection rules</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suspicious;