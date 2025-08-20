// import React, { useEffect, useState } from 'react';
// import {
//   FaCheckCircle,
//   FaExclamationTriangle,
//   FaSyncAlt,
//   FaPlayCircle,
//   FaDotCircle,
//   FaCopy,
//   FaExchangeAlt,
//   FaSpinner
// } from 'react-icons/fa';
// import { BlockchainService } from '../services/blockchainService';
// import type { SeiContract, ContractType } from '../services/blockchainService';

// type RiskLevel = 'low' | 'medium' | 'high';

// interface ContractView {
//   address: string;
//   name?: string;
//   deployer?: string;
//   timestamp?: string;
//   verified?: boolean;
//   riskLevel?: RiskLevel;
//   aiSummary?: string;
//   source?: ContractType;
//   raw?: any;
//   interactionCount?: number;
// }

// const NewContracts: React.FC = () => {
//   const [contracts, setContracts] = useState<ContractView[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState<string | null>(null);

//   // Filters
//   const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
//   const [networkFilter, setNetworkFilter] = useState<'all' | 'cosmos' | 'evm'>('all');

//   // Selection & analysis states
//   const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
//   const [selectedSource, setSelectedSource] = useState<ContractType | null>(null);
//   const [analyzing, setAnalyzing] = useState<string | null>(null);
//   const [loadingInteractions, setLoadingInteractions] = useState<string | null>(null);

//   const copyToClipboard = async (text: string, contractAddress: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(contractAddress);
//       setTimeout(() => setCopied(null), 2000);
//     } catch (error) {
//       console.error('Failed to copy:', error);
//       // Fallback for older browsers
//       const textArea = document.createElement('textarea');
//       textArea.value = text;
//       document.body.appendChild(textArea);
//       textArea.select();
//       document.execCommand('copy');
//       document.body.removeChild(textArea);
//       setCopied(contractAddress);
//       setTimeout(() => setCopied(null), 2000);
//     }
//   };

//   const normalizeToView = (c: SeiContract): ContractView => ({
//     address: c.address,
//     name: c.name || c.label || undefined,
//     deployer: c.creator || c.deployer || undefined,
//     timestamp: c.timestamp,
//     verified: c.verified,
//     riskLevel: (c.riskLevel as RiskLevel) || (c.verified ? 'low' : 'medium'),
//     aiSummary: c.aiSummary || c.analysis || undefined,
//     source: c.type as ContractType,
//     raw: c,
//     interactionCount: 0 // Initialize with 0, will be loaded separately
//   });

//   const loadInteractionCount = async (contractAddress: string) => {
//     setLoadingInteractions(contractAddress);
//     try {
//       // Try to get transaction count for this contract
//       const transactions = await BlockchainService.getAccountTransactions?.(contractAddress, 1000);
//       const interactionCount = transactions?.length || 0;
      
//       // Update the specific contract's interaction count
//       setContracts(prev =>
//         prev.map(c => 
//           c.address === contractAddress 
//             ? { ...c, interactionCount }
//             : c
//         )
//       );
//     } catch (err) {
//       console.error('Failed to load interaction count:', err);
//       // Set to 0 if failed
//       setContracts(prev =>
//         prev.map(c => 
//           c.address === contractAddress 
//             ? { ...c, interactionCount: 0 }
//             : c
//         )
//       );
//     } finally {
//       setLoadingInteractions(null);
//     }
//   };

//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const [cosmos, evm] = await Promise.all([
//         BlockchainService.getContracts('cosmos', 50),
//         BlockchainService.getContracts('evm', 50)
//       ]);
//       const combined = [...cosmos, ...evm].map(normalizeToView);
//       combined.sort((a, b) => {
//         const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
//         const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
//         return tb - ta;
//       });
//       setContracts(combined);
//     } catch (err: any) {
//       console.error('Load contracts error:', err);
//       setError(err?.message || 'Failed to load contracts');
//       setContracts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   // Derived: filtered list
//   const filteredContracts = contracts.filter((c) => {
//     if (statusFilter === 'verified' && !c.verified) return false;
//     if (statusFilter === 'unverified' && c.verified) return false;
//     if (networkFilter !== 'all' && c.source !== networkFilter) return false;
//     return true;
//   });

//   const handleSelect = async (c: ContractView) => {
//     if (selectedAddress === c.address && selectedSource === c.source) {
//       setSelectedAddress(null);
//       setSelectedSource(null);
//     } else {
//       setSelectedAddress(c.address);
//       setSelectedSource(c.source || null);
      
//       // Load interaction count when contract is selected
//       if (c.interactionCount === undefined || c.interactionCount === 0) {
//         await loadInteractionCount(c.address);
//       }
//     }
//   };

//   const handleAnalyze = async (contract: ContractView) => {
//     if (!contract.address || !contract.source) {
//       setError('Missing address or source');
//       return;
//     }
    
//     setAnalyzing(contract.address);
//     setError(null);
    
//     try {
//       // Enhanced analysis that works for both verified and unverified contracts
//       const analysisPromises = [];
      
//       // Always try to analyze the contract regardless of verification status
//       analysisPromises.push(
//         BlockchainService.analyzeContract(contract.source, contract.address)
//       );
      
//       // Also load interaction count if not already loaded
//       if (contract.interactionCount === undefined) {
//         analysisPromises.push(loadInteractionCount(contract.address));
//       }
      
//       const [analysisResult] = await Promise.all(analysisPromises);
      
//       if (!analysisResult.success) {
//         // For unverified contracts, provide basic analysis
//         const basicAnalysis = generateBasicAnalysis(contract);
//         setContracts(prev =>
//           prev.map(c => 
//             c.address === contract.address 
//               ? { 
//                   ...c, 
//                   aiSummary: basicAnalysis,
//                   riskLevel: contract.verified ? 'low' : 'medium'
//                 }
//               : c
//           )
//         );
//       } else {
//         // Use the full analysis result
//         setContracts(prev =>
//           prev.map(c => 
//             c.address === contract.address 
//               ? { 
//                   ...c, 
//                   aiSummary: analysisResult.aiSummary || c.aiSummary, 
//                   riskLevel: analysisResult.riskLevel || c.riskLevel 
//                 }
//               : c
//           )
//         );
//       }
//     } catch (err) {
//       console.error('analyzeContract call failed:', err);
      
//       // Fallback: provide basic analysis for any contract
//       const basicAnalysis = generateBasicAnalysis(contract);
//       setContracts(prev =>
//         prev.map(c => 
//           c.address === contract.address 
//             ? { 
//                 ...c, 
//                 aiSummary: basicAnalysis,
//                 riskLevel: contract.verified ? 'low' : 'medium'
//               }
//             : c
//         )
//       );
//     } finally {
//       setAnalyzing(null);
//     }
//   };

//   const generateBasicAnalysis = (contract: ContractView): string => {
//     let analysis = `📋 **Contract Analysis Report**\n\n`;
    
//     if (contract.verified) {
//       analysis += `✅ **Verification Status:** Verified contract with source code available\n`;
//       analysis += `🔒 **Risk Level:** Low - Source code has been verified and is publicly auditable\n`;
//     } else {
//       analysis += `⚠️ **Verification Status:** Unverified contract - source code not available\n`;
//       analysis += `🔶 **Risk Level:** Medium - Exercise caution when interacting\n`;
//     }
    
//     analysis += `🌐 **Network:** ${contract.source?.toUpperCase()} on Sei Network\n`;
//     analysis += `📍 **Address:** ${contract.address}\n`;
    
//     if (contract.deployer) {
//       analysis += `👤 **Deployed by:** ${contract.deployer}\n`;
//     }
    
//     if (contract.timestamp) {
//       analysis += `⏰ **Deployed:** ${new Date(contract.timestamp).toLocaleString()}\n`;
//     }
    
//     if (contract.interactionCount !== undefined) {
//       analysis += `📊 **Total Interactions:** ${contract.interactionCount.toLocaleString()}\n`;
      
//       if (contract.interactionCount > 1000) {
//         analysis += `🔥 **Activity Level:** High - This contract has significant usage\n`;
//       } else if (contract.interactionCount > 100) {
//         analysis += `📈 **Activity Level:** Moderate - Regular usage detected\n`;
//       } else {
//         analysis += `📉 **Activity Level:** Low - Limited usage detected\n`;
//       }
//     }
    
//     analysis += `\n💡 **Recommendation:** `;
//     if (contract.verified && (contract.interactionCount || 0) > 100) {
//       analysis += `This appears to be a well-established, verified contract with good activity.`;
//     } else if (contract.verified) {
//       analysis += `Verified contract but with limited activity. Review carefully before interacting.`;
//     } else {
//       analysis += `Unverified contract. Consider waiting for verification or use with extreme caution.`;
//     }
    
//     return analysis;
//   };

//   const handleAnalyzeSelected = async () => {
//     if (!selectedAddress || !selectedSource) {
//       setError('No contract selected.');
//       return;
//     }
//     const c = contracts.find((x) => x.address === selectedAddress && x.source === selectedSource);
//     if (!c) {
//       setError('Selected contract not found.');
//       return;
//     }
//     await handleAnalyze(c);
//   };

//   const formatAddress = (address: string) => {
//     if (!address) return '';
//     if (address.length <= 24) return address;
//     return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
//   };

//   const timeAgoOrDate = (ts?: string) => {
//     if (!ts) return 'Unknown';
//     const d = new Date(ts);
//     if (Number.isNaN(d.getTime())) return ts;
//     const sec = Math.floor((Date.now() - d.getTime()) / 1000);
//     if (sec < 60) return `${sec}s ago`;
//     if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
//     if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
//     return d.toLocaleString();
//   };

//   const total = contracts.length;
//   const verifiedCount = contracts.filter((c) => c.verified).length;
//   const aiAnalyzedCount = contracts.filter((c) => !!c.aiSummary).length;
//   const aiAnalyzedPercent = total ? Math.round((aiAnalyzedCount / total) * 100) : 0;

//   return (
//     <div className="py-30 px-10 text-white font-sans">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-start justify-between mb-6 gap-4">
//           <div>
//             <h1 className="text-3xl font-bold">Smart Contract Deployments</h1>
//             <p className="text-sm text-gray-400 mt-1">
//               Analyze any contract - verified or unverified. Click to see interaction counts.
//             </p>
//           </div>

//           <div className="flex items-center gap-3">
//             <button 
//               onClick={load} 
//               className="bg-[#111827] px-3 py-2 rounded-md flex items-center gap-2 hover:opacity-90" 
//               title="Refresh"
//             >
//               <FaSyncAlt /> Refresh
//             </button>
//             <button
//               onClick={handleAnalyzeSelected}
//               disabled={!selectedAddress || !selectedSource || !!analyzing}
//               className={`px-3 py-2 rounded-md flex items-center gap-2 ${
//                 !selectedAddress ? 'bg-gray-700' : 'bg-blue-600'
//               }`}
//               title="Analyze selected contract"
//             >
//               <FaPlayCircle /> Analyze Selected
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
//           <div className="bg-[#111827] p-3 rounded flex items-center gap-3">
//             <label className="text-gray-400">Status:</label>
//             <select 
//               value={statusFilter} 
//               onChange={(e) => setStatusFilter(e.target.value as any)} 
//               className="bg-transparent"
//             >
//               <option value="all">All</option>
//               <option value="verified">Verified</option>
//               <option value="unverified">Unverified</option>
//             </select>
//           </div>

//           <div className="bg-[#111827] p-3 rounded flex items-center gap-3">
//             <label className="text-gray-400">Network:</label>
//             <select 
//               value={networkFilter} 
//               onChange={(e) => setNetworkFilter(e.target.value as any)} 
//               className="bg-transparent"
//             >
//               <option value="all">All</option>
//               <option value="cosmos">Cosmos</option>
//               <option value="evm">EVM</option>
//             </select>
//           </div>

//           <div className="ml-auto flex gap-3">
//             <div className="bg-[#111827] p-3 rounded text-center">
//               <div className="text-sm text-gray-400">Total</div>
//               <div className="font-bold text-blue-400">{total}</div>
//             </div>
//             <div className="bg-[#111827] p-3 rounded text-center">
//               <div className="text-sm text-gray-400">Verified</div>
//               <div className="font-bold text-green-400">{verifiedCount}</div>
//             </div>
//             <div className="bg-[#111827] p-3 rounded text-center">
//               <div className="text-sm text-gray-400">AI Analyzed</div>
//               <div className="font-bold text-cyan-400">{aiAnalyzedPercent}%</div>
//             </div>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 flex items-center gap-3">
//             <FaExclamationTriangle className="text-red-400" />
//             <div>
//               <div className="font-semibold">Error</div>
//               <div className="text-sm text-gray-400">{error}</div>
//             </div>
//             <button
//               onClick={() => setError(null)}
//               className="ml-auto text-gray-400 hover:text-white"
//             >
//               ✕
//             </button>
//           </div>
//         )}

//         {loading ? (
//           <div className="text-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
//             <p className="text-gray-400">Scanning for new contracts...</p>
//           </div>
//         ) : (
//           <div className="bg-[#111827] rounded-xl shadow-md overflow-hidden">
//             <div className="p-6 border-b border-gray-700">
//               <h2 className="text-xl font-semibold">Recent Deployments</h2>
//               <p className="text-sm text-gray-400 mt-1">
//                 Both EVM and Cosmos contracts • Analysis available for all
//               </p>
//             </div>

//             <div className="divide-y divide-gray-700">
//               {filteredContracts.length === 0 ? (
//                 <div className="p-6 text-gray-400">No contracts match the selected filters.</div>
//               ) : (
//                 filteredContracts.map((contract, index) => {
//                   const isSelected = selectedAddress === contract.address && selectedSource === contract.source;
//                   return (
//                     <div
//                       key={contract.address || index}
//                       className={`p-6 cursor-pointer hover:bg-gray-800/50 transition-colors ${
//                         isSelected ? 'bg-gray-800' : ''
//                       }`}
//                       onClick={() => handleSelect(contract)}
//                     >
//                       <div className="flex items-center justify-between mb-4">
//                         <div className="flex items-center gap-4">
//                           <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
//                             <FaDotCircle className="text-blue-400" />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-white">
//                               {contract.name || 'Unnamed Contract'}
//                             </h3>
//                             <div className="flex items-center gap-2">
//                               <p className="text-sm text-gray-400 font-mono">
//                                 {formatAddress(contract.address)}
//                               </p>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   copyToClipboard(contract.address, contract.address);
//                                 }}
//                                 className={`text-gray-400 hover:text-white transition-colors ${
//                                   copied === contract.address ? 'text-green-400' : ''
//                                 }`}
//                                 title="Copy contract address"
//                               >
//                                 <FaCopy className="text-xs" />
//                               </button>
//                               {copied === contract.address && (
//                                 <span className="text-green-400 text-xs">Copied!</span>
//                               )}
//                             </div>
//                             <p className="text-xs text-gray-500">
//                               {contract.source?.toUpperCase()} • {timeAgoOrDate(contract.timestamp)}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-3">
//                           {/* Interaction Count */}
//                           <div className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded text-xs">
//                             {loadingInteractions === contract.address ? (
//                               <FaSpinner className="animate-spin text-gray-400" />
//                             ) : (
//                               <FaExchangeAlt className="text-gray-400" />
//                             )}
//                             <span className="text-gray-300">
//                               {contract.interactionCount !== undefined 
//                                 ? contract.interactionCount.toLocaleString()
//                                 : '?'
//                               }
//                             </span>
//                           </div>

//                           <span
//                             className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                               contract.riskLevel === 'high' ? 'bg-red-900 text-red-200' :
//                               contract.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-200' :
//                               'bg-green-900 text-green-200'
//                             }`}
//                           >
//                             {(contract.riskLevel || 'medium').toUpperCase()}
//                           </span>

//                           {contract.verified ? (
//                             <FaCheckCircle className="text-green-400" title="Verified contract" />
//                           ) : (
//                             <FaExclamationTriangle className="text-yellow-400" title="Unverified contract" />
//                           )}

//                           <button
//                             onClick={(e) => { 
//                               e.stopPropagation(); 
//                               handleAnalyze(contract); 
//                             }}
//                             disabled={analyzing === contract.address}
//                             className="ml-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-sm flex items-center gap-2 transition-colors"
//                             title="Analyze this contract (works for both verified and unverified)"
//                           >
//                             {analyzing === contract.address ? (
//                               <>
//                                 <FaSpinner className="animate-spin" />
//                                 Analyzing...
//                               </>
//                             ) : (
//                               <>
//                                 <FaPlayCircle /> 
//                                 Analyze
//                               </>
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
//                         <div>
//                           <span className="text-gray-400">Deployer:</span>
//                           <p className="font-mono text-xs">
//                             {formatAddress(contract.deployer || 'Unknown')}
//                           </p>
//                         </div>
//                         <div>
//                           <span className="text-gray-400">Status:</span>
//                           <p className={contract.verified ? 'text-green-400' : 'text-yellow-400'}>
//                             {contract.verified ? 'Verified' : 'Unverified'}
//                           </p>
//                         </div>
//                         <div>
//                           <span className="text-gray-400">Interactions:</span>
//                           <p className="text-blue-400">
//                             {contract.interactionCount !== undefined 
//                               ? `${contract.interactionCount.toLocaleString()} total`
//                               : 'Click to load'
//                             }
//                           </p>
//                         </div>
//                       </div>

//                       <div>
//                         <span className="text-gray-400 text-sm">AI Analysis:</span>
//                         <div className="text-sm mt-1 bg-gray-800/50 p-3 rounded">
//                           {contract.aiSummary ? (
//                             <pre className="whitespace-pre-wrap font-sans">
//                               {contract.aiSummary}
//                             </pre>
//                           ) : (
//                             <span className="text-gray-500 italic">
//                               Click "Analyze" to get AI insights (works for all contracts)
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NewContracts;

// NewContracts.tsx
import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaPlayCircle,
  FaDotCircle,
  FaCopy,
  FaChartBar
} from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService';
import type { SeiContract, ContractType } from '../services/blockchainService';

type RiskLevel = 'low' | 'medium' | 'high';

interface ContractView {
  address: string;
  name?: string;
  deployer?: string;
  timestamp?: string;
  verified?: boolean; // undefined => unknown
  riskLevel?: RiskLevel;
  aiSummary?: string;
  source?: ContractType;
  raw?: unknown;
}

// Removed unused isSei and isEvm helpers

const NewContracts: React.FC = () => {
  const [contracts, setContracts] = useState<ContractView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'cosmos' | 'evm'>('all');

  // Selection & analysis
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<ContractType | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  // UI helpers
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [interactionsMap, setInteractionsMap] = useState<Record<string, number>>({});

  const normalizeToView = (c: SeiContract): ContractView => ({
    address: c.address,
    name: c.name || c.label || c.contract_name || undefined,
    deployer: c.creator || c.deployer || undefined,
    timestamp: c.timestamp,
    verified: c.verified,
    riskLevel: (c.riskLevel as RiskLevel) || (c.verified ? 'low' : 'medium'),
    aiSummary: c.aiSummary || c.analysis || undefined,
    source: c.type as ContractType,
    raw: c
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cosmos, evm] = await Promise.all([
        BlockchainService.getContracts('cosmos', 50),
        BlockchainService.getContracts('evm', 50)
      ]);
      const combined = [...cosmos, ...evm].map(normalizeToView);
      combined.sort((a, b) => {
        const ta = a.timestamp ? Date.parse(a.timestamp) : 0;
        const tb = b.timestamp ? Date.parse(b.timestamp) : 0;
        return tb - ta;
      });
      setContracts(combined);
    } catch (err) {
      console.error('Load contracts error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contracts');
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived: filtered list
  const filteredContracts = contracts.filter((c) => {
    if (statusFilter === 'verified' && !c.verified) return false;
    if (statusFilter === 'unverified' && c.verified) return false;
    if (networkFilter !== 'all' && c.source !== networkFilter) return false;
    return true;
  });

  const handleSelect = (c: ContractView) => {
    if (selectedAddress === c.address && selectedSource === c.source) {
      setSelectedAddress(null);
      setSelectedSource(null);
    } else {
      setSelectedAddress(c.address);
      setSelectedSource(c.source || null);
    }
  };

  const copyAddress = async (addr: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddr(addr);
      setTimeout(() => setCopiedAddr(null), 1200);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  // Removed unused fetchInteractionCount helper

  const handleAnalyze = async (contract: { address: string; source?: 'evm' | 'cosmos' }) => {
  if (!contract.address || !contract.source) {
    setError('Missing address or source');
    return;
  }
  setAnalyzing(contract.address);
  try {
    // 1) Get interaction count from the contract transactions endpoints
    const count = await BlockchainService.getInteractionCount(contract.address, contract.source);
    setInteractionsMap(prev => ({ ...prev, [contract.address]: count }));

    // 2) Local analysis (works for verified and unverified)
    let res: unknown = null;
    try {

      res = await BlockchainService.analyzeContract(contract.source, contract.address, { preferServer: false });
    } catch {
      // Optionally log error
    }

    const aiSummary =
      (res as { aiSummary?: string })?.aiSummary ||
      `Interactions observed: ${count.toLocaleString()}.${count === 0 ? ' No on-chain activity yet.' : ''}`;

    const nextRisk: 'low' | 'medium' | 'high' =
      (res as { riskLevel?: 'low' | 'medium' | 'high' })?.riskLevel || (count > 5000 ? 'high' : count > 500 ? 'medium' : 'low');

    setContracts(prev =>
      prev.map(c =>
        c.address === contract.address
          ? { ...c, aiSummary, riskLevel: nextRisk }
          : c
      )
    );
  } catch (err) {
    console.error('Analysis failed', err);
    setError('Analysis request failed');
  } finally {
    setAnalyzing(null);
  }
};

  const handleAnalyzeSelected = async () => {
    if (!selectedAddress || !selectedSource) {
      setError('No contract selected.');
      return;
    }
    const c = contracts.find((x) => x.address === selectedAddress && x.source === selectedSource);
    if (!c) {
      setError('Selected contract not found.');
      return;
    }
    await handleAnalyze(c);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    if (address.length <= 24) return address;
    return `${address.substring(0, 10)}...${address.substring(address.length - 10)}`;
  };

  const timeAgoOrDate = (ts?: string) => {
    if (!ts) return 'Unknown';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return d.toLocaleString();
  };

  const total = contracts.length;
  const verifiedCount = contracts.filter((c) => c.verified === true).length;
  const aiAnalyzedCount = contracts.filter((c) => !!c.aiSummary).length;
  const aiAnalyzedPercent = total ? Math.round((aiAnalyzedCount / total) * 100) : 0;

  return (
    <div className="py-24 px-2 sm:px-4 md:px-8 lg:px-10 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center text-center md:text-start md:items-start md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Smart Contract Deployments</h1>
            <p className="text-sm text-gray-400 mt-1">Filter, select and analyze contracts.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={load} className="bg-[#111827] px-3 py-2 rounded-md flex items-center gap-2 hover:opacity-90" title="Refresh">
              <FaSyncAlt /> Refresh
            </button>
            <button
              onClick={handleAnalyzeSelected}
              disabled={!selectedAddress || !selectedSource || !!analyzing}
              className={`px-3 py-2 rounded-md flex items-center gap-2 ${!selectedAddress ? 'bg-gray-700' : 'bg-blue-600'}`}
              title="Analyze selected contract"
            >
              <FaPlayCircle /> Analyze Selected
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-center">
          <div className="bg-[#111827] p-3 rounded flex items-center gap-3">
            <label className="text-gray-400">Status:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'unverified')} className="bg-transparent">
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <div className="bg-[#111827] p-3 rounded flex items-center gap-3">
            <label className="text-gray-400">Network:</label>
            <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value as 'all' | 'cosmos' | 'evm')} className="bg-transparent">
              <option value="all">All</option>
              <option value="cosmos">Cosmos</option>
              <option value="evm">EVM</option>
            </select>
          </div>

          <div className="md:ml-auto flex gap-3">
            <div className="bg-[#111827] p-3 rounded text-center">
              <div className="text-sm text-gray-400">Total</div>
              <div className="font-bold text-blue-400">{total}</div>
            </div>
            <div className="bg-[#111827] p-3 rounded text-center">
              <div className="text-sm text-gray-400">Verified</div>
              <div className="font-bold text-green-400">{verifiedCount}</div>
            </div>
            <div className="bg-[#111827] p-3 rounded text-center">
              <div className="text-sm text-gray-400">AI Analyzed</div>
              <div className="font-bold text-cyan-400">{aiAnalyzedPercent}%</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Scanning for new contracts...</p>
          </div>
        ) : error ? (
          <div className="bg-[#111827] rounded-xl shadow-md p-6 text-red-300 mb-6">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle />
              <div>
                <div className="font-semibold">Error</div>
                <div className="text-sm text-gray-400">{error}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#111827] rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Recent Deployments</h2>
            </div>

            <div className="divide-y divide-gray-700">
              {filteredContracts.length === 0 ? (
                <div className="p-6 text-gray-400">No contracts match the selected filters.</div>
              ) : (
                filteredContracts.map((contract, index) => {
                  const isSelected = selectedAddress === contract.address && selectedSource === contract.source;
                  const interactions = interactionsMap[contract.address];
                  return (
                    <div
                      key={contract.address || index}
                      className={`p-6 cursor-pointer ${isSelected ? 'bg-gray-800' : ''}`}
                      onClick={() => handleSelect(contract)}
                    >
          <div className="flex flex-col md:flex-row items-start justify-between mb-2 sm:mb-4 gap-2">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
                            <FaDotCircle className="text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{contract.name || 'Unnamed Contract'}</h3>

                            {/* Address + Copy */}
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-400 font-mono">{formatAddress(contract.address)}</p>
                              <button
                                onClick={(e) => { e.stopPropagation(); copyAddress(contract.address); }}
                                className="px-2 py-1 text-xs bg-gray-800 rounded hover:bg-gray-700"
                                title="Copy address"
                              >
                                <FaCopy />
                              </button>
                              {copiedAddr === contract.address && (
                                <span className="text-green-400 text-xs">Copied!</span>
                              )}
                            </div>

                            <p className="text-xs text-gray-500">
                              {contract.source?.toUpperCase()} • {timeAgoOrDate(contract.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              contract.riskLevel === 'high' ? 'bg-red-900 text-red-200' :
                              contract.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-green-900 text-green-200'
                            }`}
                          >
                            {(contract.riskLevel || 'medium').toUpperCase()}
                          </span>

                          {/* Verification badge: true/false/unknown */}
                          {contract.verified === true ? (
                            <span className="flex items-center gap-1 text-green-400" title="Verified">
                              <FaCheckCircle /> Verified
                            </span>
                          ) : contract.verified === false ? (
                            <span className="flex items-center gap-1 text-red-400" title="Unverified">
                              <FaExclamationTriangle /> Unverified
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-300" title="Verification unknown">
                              Unknown
                            </span>
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); handleAnalyze(contract); }}
                            disabled={!!analyzing}
                            className="ml-2 px-3 py-1 rounded bg-blue-600 text-sm flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-700"
                            title="Analyze this contract"
                          >
                            {analyzing === contract.address ? 'Analyzing...' : <><FaPlayCircle /> Analyze</>}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 text-sm mb-2 sm:mb-4">
                        <div>
                          <span className="text-gray-400">Deployer:</span>
                          <p className="font-mono">{formatAddress(contract.deployer || '')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <p className={
                            contract.verified === true ? 'text-green-400'
                            : contract.verified === false ? 'text-red-400'
                            : 'text-gray-300'
                          }>
                            {contract.verified === true ? 'Verified' : contract.verified === false ? 'Unverified' : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Interactions:</span>
                          <p className="font-semibold flex items-center gap-2">
                            <FaChartBar className="text-cyan-400" />
                            {typeof interactions === 'number' ? interactions.toLocaleString() : '—'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 text-sm">AI Analysis:</span>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{contract.aiSummary || 'Pending analysis'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewContracts;