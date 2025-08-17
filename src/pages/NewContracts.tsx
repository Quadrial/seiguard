
// // NewContracts.tsx
// import React, { useEffect, useState } from 'react';
// import { FaCode, FaBrain, FaCheckCircle, FaExclamationTriangle, FaSyncAlt, FaPlus, FaTrash } from 'react-icons/fa';
// import { BlockchainService } from '../services/blockchainService'; // adjust path
// import type { SeiContract, ContractType  } from '../services/blockchainService';

// interface ContractView {
//   address: string;
//   name?: string;
//   deployer?: string;
//   timestamp?: string;
//   verified?: boolean;
//   riskLevel?: 'low' | 'medium' | 'high';
//   aiSummary?: string;
//   source?: ContractType;
//   raw?: any;
// }

// const NewContracts: React.FC = () => {
//   const [contracts, setContracts] = useState<ContractView[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // Add form state
//   const [showAdd, setShowAdd] = useState(false);
//   const [newAddress, setNewAddress] = useState('');
//   const [newType, setNewType] = useState<ContractType>('evm');
//   const [newName, setNewName] = useState('');
//   const [newCreator, setNewCreator] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const normalizeToView = (c: SeiContract): ContractView => ({
//     address: c.address,
//     name: c.name || c.label || undefined,
//     deployer: c.creator || c.deployer || undefined,
//     timestamp: c.timestamp,
//     verified: c.verified,
//     riskLevel: c.riskLevel || (c.verified ? 'low' : 'medium'),
//     aiSummary: c.aiSummary || c.analysis || undefined,
//     source: c.type as ContractType,
//     raw: c
//   });

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
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleRefresh = () => load();

//   const formatAddress = (address: string) => {
//     if (!address) return '';
//     if (address.length <= 24) return address;
//     return `${address.substring(0, 12)}...${address.substring(address.length - 12)}`;
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

//   // Add contract via service
//   const handleAdd = async () => {
//     if (!newAddress) {
//       setError('Address is required');
//       return;
//     }
//     setSubmitting(true);
//     setError(null);

//     const payload: Partial<SeiContract> = {
//       address: newAddress,
//       creator: newCreator || undefined,
//       name: newName || undefined,
//       timestamp: new Date().toISOString()
//     };

//     const created = await BlockchainService.addContract(newType, payload);
//     if (!created) {
//       setError('Failed to add contract (server may not support POST /contracts/{type})');
//       setSubmitting(false);
//       return;
//     }

//     // Optimistic prepend and refresh
//     setContracts((prev) => [normalizeToView(created), ...prev]);
//     setShowAdd(false);
//     setNewAddress('');
//     setNewName('');
//     setNewCreator('');
//     setSubmitting(false);
//   };

//   // Remove contract via service
//   const handleRemove = async (c: ContractView) => {
//     if (!c.address || !c.source) {
//       setError('Cannot remove: missing address or source');
//       return;
//     }
//     // optimistic UI remove
//     const prev = contracts;
//     setContracts((p) => p.filter((x) => x.address !== c.address || x.source !== c.source));
//     const ok = await BlockchainService.removeContract(c.source, c.address);
//     if (!ok) {
//       // revert
//       setContracts(prev);
//       setError('Failed to remove contract (server may not support DELETE /contracts/{type}/{address})');
//     }
//   };

//   const total = contracts.length;
//   const verifiedCount = contracts.filter((c) => c.verified).length;
//   const aiAnalyzedCount = contracts.filter((c) => !!c.aiSummary).length;
//   const aiAnalyzedPercent = total ? Math.round((aiAnalyzedCount / total) * 100) : 0;

//   return (
//     <div className="mt-10 px-10 text-white font-sans">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-3xl font-bold">Smart Contract Deployments</h1>
//           <div className="flex items-center gap-3">
//             <button onClick={handleRefresh} className="bg-[#111827] px-3 py-2 rounded-md flex items-center gap-2 hover:opacity-90" title="Refresh">
//               <FaSyncAlt /> Refresh
//             </button>
//             <button onClick={() => setShowAdd((s) => !s)} className="bg-[#111827] px-3 py-2 rounded-md flex items-center gap-2 hover:opacity-90" title="Add contract">
//               <FaPlus /> Add
//             </button>
//           </div>
//         </div>

//         {/* Add form */}
//         {showAdd && (
//           <div className="bg-[#0b1220] p-4 rounded mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//               <input placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="p-2 bg-[#111827] rounded col-span-2" />
//               <select value={newType} onChange={(e) => setNewType(e.target.value as ContractType)} className="p-2 bg-[#111827] rounded">
//                 <option value="evm">EVM</option>
//                 <option value="cosmos">Cosmos</option>
//               </select>
//               <input placeholder="Name (optional)" value={newName} onChange={(e) => setNewName(e.target.value)} className="p-2 bg-[#111827] rounded" />
//               <input placeholder="Creator (optional)" value={newCreator} onChange={(e) => setNewCreator(e.target.value)} className="p-2 bg-[#111827] rounded col-span-2" />
//               <div className="col-span-2 flex gap-2">
//                 <button onClick={handleAdd} disabled={submitting} className="px-3 py-2 bg-blue-600 rounded flex items-center gap-2">
//                   {submitting ? 'Adding...' : 'Add Contract'}
//                 </button>
//                 <button onClick={() => setShowAdd(false)} className="px-3 py-2 bg-gray-700 rounded">Cancel</button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
//             <FaCode className="text-3xl text-blue-400 mx-auto mb-3" />
//             <h3 className="text-2xl font-bold text-blue-400">{total}</h3>
//             <p className="text-gray-400">New Contracts</p>
//           </div>
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
//             <FaCheckCircle className="text-3xl text-green-400 mx-auto mb-3" />
//             <h3 className="text-2xl font-bold text-green-400">{verifiedCount}</h3>
//             <p className="text-gray-400">Verified</p>
//           </div>
//           <div className="bg-[#111827] p-6 rounded-xl shadow-md text-center">
//             <FaBrain className="text-3xl text-cyan-400 mx-auto mb-3" />
//             <h3 className="text-2xl font-bold text-cyan-400">{aiAnalyzedPercent}%</h3>
//             <p className="text-gray-400">AI Analyzed</p>
//           </div>
//         </div>

//         {loading ? (
//           <div className="text-center py-20">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
//             <p className="text-gray-400">Scanning for new contracts...</p>
//           </div>
//         ) : error ? (
//           <div className="bg-[#111827] rounded-xl shadow-md p-6 text-red-300">
//             <div className="flex items-center gap-3">
//               <FaExclamationTriangle />
//               <div>
//                 <div className="font-semibold">Error</div>
//                 <div className="text-sm text-gray-400">{error}</div>
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="bg-[#111827] rounded-xl shadow-md overflow-hidden">
//             <div className="p-6 border-b border-gray-700">
//               <h2 className="text-xl font-semibold">Recent Deployments</h2>
//             </div>

//             <div className="divide-y divide-gray-700">
//               {contracts.length === 0 ? (
//                 <div className="p-6 text-gray-400">No recent contracts found.</div>
//               ) : (
//                 contracts.map((contract, index) => (
//                   <div key={contract.address || index} className="p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
//                           <FaCode className="text-blue-400" />
//                         </div>
//                         <div>
//                           <h3 className="font-semibold text-white">{contract.name || 'Unnamed Contract'}</h3>
//                           <p className="text-sm text-gray-400 font-mono">{formatAddress(contract.address)}</p>
//                           <p className="text-xs text-gray-500">{contract.source?.toUpperCase()} • {timeAgoOrDate(contract.timestamp)}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3">
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                           contract.riskLevel === 'high' ? 'bg-red-900 text-red-200' :
//                           contract.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-200' :
//                           'bg-green-900 text-green-200'}`}>
//                           {(contract.riskLevel || 'medium').toUpperCase()}
//                         </span>
//                         {contract.verified ? (
//                           <FaCheckCircle className="text-green-400" />
//                         ) : (
//                           <FaExclamationTriangle className="text-red-400" />
//                         )}
//                         <button onClick={() => handleRemove(contract)} title="Remove" className="ml-2 text-red-400 hover:opacity-90">
//                           <FaTrash />
//                         </button>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
//                       <div>
//                         <span className="text-gray-400">Deployer:</span>
//                         <p className="font-mono">{formatAddress(contract.deployer || '')}</p>
//                       </div>
//                       <div>
//                         <span className="text-gray-400">Status:</span>
//                         <p className={contract.verified ? 'text-green-400' : 'text-red-400'}>
//                           {contract.verified ? 'Verified' : 'Unverified'}
//                         </p>
//                       </div>
//                     </div>

//                     <div>
//                       <span className="text-gray-400 text-sm">AI Analysis:</span>
//                       <p className="text-sm mt-1">{contract.aiSummary || 'Pending analysis'}</p>
//                     </div>
//                   </div>
//                 ))
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
  FaDotCircle
} from 'react-icons/fa';
import { BlockchainService } from '../services/blockchainService'; // adjust path
import type { SeiContract, ContractType  } from '../services/blockchainService';


type RiskLevel = 'low' | 'medium' | 'high';

interface ContractView {
  address: string;
  name?: string;
  deployer?: string;
  timestamp?: string;
  verified?: boolean;
  riskLevel?: RiskLevel;
  aiSummary?: string;
  source?: ContractType;
  raw?: any;
}

const NewContracts: React.FC = () => {
  const [contracts, setContracts] = useState<ContractView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [networkFilter, setNetworkFilter] = useState<'all' | 'cosmos' | 'evm'>('all');

  // Selection & analysis states
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<ContractType | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null); // address being analyzed

  const normalizeToView = (c: SeiContract): ContractView => ({
    address: c.address,
    name: c.name || c.label || undefined,
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
    } catch (err: any) {
      console.error('Load contracts error:', err);
      setError(err?.message || 'Failed to load contracts');
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

  const handleAnalyze = async (contract: { address: string; source?: 'evm' | 'cosmos' }) => {
    if (!contract.address || !contract.source) {
      setError('Missing address or source');
      return;
    }
    setAnalyzing(contract.address);
    try {
      const res = await BlockchainService.analyzeContract(contract.source, contract.address);
      if (!res.success) {
        setError(res.message || 'Analysis failed');
      } else {
        // Merge results into state: update aiSummary and riskLevel
        setContracts(prev =>
          prev.map(c => c.address === contract.address ? { ...c, aiSummary: res.aiSummary || c.aiSummary, riskLevel: res.riskLevel || c.riskLevel } : c)
        );
      }
    } catch (err) {
      console.error('analyzeContract call failed:', err);
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
    return `${address.substring(0, 12)}...${address.substring(address.length - 12)}`;
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
  const verifiedCount = contracts.filter((c) => c.verified).length;
  const aiAnalyzedCount = contracts.filter((c) => !!c.aiSummary).length;
  const aiAnalyzedPercent = total ? Math.round((aiAnalyzedCount / total) * 100) : 0;

  return (
    <div className="mt-10 px-10 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6 gap-4">
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
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="bg-transparent">
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          <div className="bg-[#111827] p-3 rounded flex items-center gap-3">
            <label className="text-gray-400">Network:</label>
            <select value={networkFilter} onChange={(e) => setNetworkFilter(e.target.value as any)} className="bg-transparent">
              <option value="all">All</option>
              <option value="cosmos">Cosmos</option>
              <option value="evm">EVM</option>
            </select>
          </div>

          <div className="ml-auto flex gap-3">
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
                  return (
                    <div
                      key={contract.address || index}
                      className={`p-6 cursor-pointer ${isSelected ? 'bg-gray-800' : ''}`}
                      onClick={() => handleSelect(contract)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center">
                            <FaDotCircle className="text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{contract.name || 'Unnamed Contract'}</h3>
                            <p className="text-sm text-gray-400 font-mono">{formatAddress(contract.address)}</p>
                            <p className="text-xs text-gray-500">{contract.source?.toUpperCase()} • {timeAgoOrDate(contract.timestamp)}</p>
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

                          {contract.verified ? (
                            <FaCheckCircle className="text-green-400" />
                          ) : (
                            <FaExclamationTriangle className="text-red-400" />
                          )}

                          <button
                            onClick={(e) => { e.stopPropagation(); handleAnalyze(contract); }}
                            disabled={!!analyzing}
                            className="ml-2 px-3 py-1 rounded bg-blue-600 text-sm flex items-center gap-2"
                            title="Analyze this contract"
                          >
                            {analyzing === contract.address ? 'Analyzing...' : <><FaPlayCircle /> Analyze</>}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-400">Deployer:</span>
                          <p className="font-mono">{formatAddress(contract.deployer || '')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <p className={contract.verified ? 'text-green-400' : 'text-red-400'}>
                            {contract.verified ? 'Verified' : 'Unverified'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-400 text-sm">AI Analysis:</span>
                        <p className="text-sm mt-1">{contract.aiSummary || 'Pending analysis'}</p>
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