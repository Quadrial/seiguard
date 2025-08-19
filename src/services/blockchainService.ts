

// // const SEISTREAM_API = 'http://localhost:3001';
// const SEISTREAM_API = 'https://seibackend.onrender.com';

// const COINGECKO_API = 'https://api.coingecko.com/api/v3';



// // --- Interfaces ---

// export interface SeiWallet {
//   address: string;
//   balance: string; // This is the total balance as a string

//   // Add the new detailed balance fields, make them optional in case not all APIs provide them
//   available?: string;
//   vesting?: string;
//   delegated?: string;
//   unbonding?: string;
//   reward?: string; // Corresponds to staking rewards
//   commission?: string;
//   txsCount?: number; // Total transaction count
  
// }
// export interface SeiAccount {
//   address: string;
//   balance: string; // microunits as string
//   wallet: {
//     available: string;
//     vesting: string;
//     delegated: string;
//     unbonding: string;
//     reward: string;
//     commission: string;
//   };
//   assets?: any[];
//   delegationsCount?: number;
//   cw20TokensCount?: number;
//   cw721TokensCount?: number;
//   txsCount?: number;
// }
// export interface SeiBlock {
//   height: string;
//   hash: string;
//   timestamp: string;
//   transactions: number;
//   proposer: string;
// }

// export interface SeiTransaction {
//   hash: string;
//   height: string;
//   timestamp: string;
//   from?: string;
//   to?: string;
//   type?: string;
//   gasUsed?: string;
//   fee?: string;
// }

// export type ContractType = 'cosmos' | 'evm';
// export interface SeiContract {
//   address: string;
//   creator?: string;
//   type?: ContractType;
//   name?: string;
//   timestamp?: string;
//   verified?: boolean;
//   // Optional cross-layer mapping field some backends may expose
//   sei_address?: string;
//   aiSummary?: string;
//   riskLevel?: 'low' | 'medium' | 'high';
//   [key: string]: any;
// }

// export interface SeiWallet {
//   address: string;
//   balance: string;
// }

// export interface SeiPriceData {
//   usd: number;
//   usd_24h_change: number;
// }

// // Minimal EVM account view for 0x addresses
// export interface EvmAccount {
//   address: string;
//   balance: string; // 18 decimals typical
//   txsCount?: number;
//   nonce?: number;
// }

// //helpers for seibackend
// const toStr = (n: any) => (n === null || n === undefined ? '0' : String(n));

// export class BlockchainService {
//   /** Get recent blocks */
//   static async getRecentBlocks(limit = 5): Promise<SeiBlock[]> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/blocks?limit=${limit}`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();

//       return data.map((b: any) => ({
//         height: b.height || '',
//         hash: b.hash || '',
//         timestamp: b.time || '',
//         transactions: b.tx_count || 0,
//         // ✅ handle case where proposer is object
//         proposer:
//           typeof b.proposer === 'object'
//             ? b.proposer.address || b.proposer.moniker || ''
//             : b.proposer || ''
//       }));
//     } catch (err) {
//       console.error('getRecentBlocks error:', err);
//       return [];
//     }
//   }

//   /** Get recent transactions */
//   static async getRecentTransactions(limit = 10): Promise<SeiTransaction[]> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/transactions?limit=${limit}`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();

//       return data.map((tx: any) => ({
//         hash: tx.hash || '',
//         height: tx.height || '',
//         timestamp: tx.time || '',
//         from: tx.from,
//         to: tx.to,
//         type: tx.type,
//         gasUsed: tx.gas_used,
//         fee: tx.fee
//       }));
//     } catch (err) {
//       console.error('getRecentTransactions error:', err);
//       return [];
//     }
//   }

//   /** Search by query (hash, block, or address) */
//   static async search(query: string): Promise<any> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/search/${query}`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       return await res.json();
//     } catch (err) {
//       console.error(`search(${query}) error:`, err);
//       return null;
//     }
//   }

//   /** Get wallet info */
//   // static async getWalletInfo(address: string): Promise<SeiWallet | null> {
//   //   try {
//   //     const res = await fetch(`${SEISTREAM_API}/search/${address}`);
//   //     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   //     const data = await res.json();

//   //     return {
//   //       address,
//   //       balance: data.balance || '0'
//   //     };
//   //   } catch (err) {
//   //     console.error(`getWalletInfo(${address}) error:`, err);
//   //     return null;
//   //   }
//   // }

//   /** Get SEI price */
//   static async getSeiPrice(): Promise<SeiPriceData | null> {
//     try {
//       const res = await fetch(
//         `${COINGECKO_API}/simple/price?ids=sei-network&vs_currencies=usd&include_24hr_change=true`
//       );
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();

//       return data['sei-network']
//         ? {
//             usd: data['sei-network'].usd,
//             usd_24h_change: data['sei-network'].usd_24h_change
//           }
//         : null;
//     } catch (err) {
//       console.error('getSeiPrice error:', err);
//       return null;
//     }
//   }

//   /** Shortcut: latest block */
//   static async getLatestBlock(): Promise<SeiBlock | null> {
//     const blocks = await this.getRecentBlocks(1);
//     return blocks[0] || null;
//   }

//   /** Fetch a block by height */
//   static async getBlock(height: number): Promise<SeiBlock | null> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/blocks/${height}`);
//       if (!res.ok) return null;
//       const b = await res.json();

//       return {
//         height: b.height || '',
//         hash: b.hash || '',
//         timestamp: b.time || '',
//         transactions: b.tx_count || 0,
//         proposer:
//           typeof b.proposer === 'object'
//             ? b.proposer.address || b.proposer.moniker || ''
//             : b.proposer || ''
//       };
//     } catch {
//       return null;
//     }
//   }

//   /** Get a transaction by hash */
//   static async getTransaction(hash: string): Promise<SeiTransaction | null> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/transactions/${hash}`);
//       if (!res.ok) return null;
//       const tx = await res.json();

//       return {
//         hash: tx.hash || '',
//         height: tx.height || '',
//         timestamp: tx.time || '',
//         from: tx.from,
//         to: tx.to,
//         type: tx.type,
//         gasUsed: tx.gas_used,
//         fee: tx.fee
//       };
//     } catch {
//       return null;
//     }
//   }
//   // Normalize array-returning responses (defensive)
//   private static extractArray(body: unknown): any[] {
//     if (!body) return [];
//     const anyBody: any = body as any;
//     if (Array.isArray(anyBody)) return anyBody;
//     if (Array.isArray(anyBody.data)) return anyBody.data;
//     if (Array.isArray(anyBody.contracts)) return anyBody.contracts;
//     if (Array.isArray(anyBody.items)) return anyBody.items;
//     return [];
//   }

//   // Get contracts by type
//   static async getContracts(type: ContractType, limit = 50): Promise<SeiContract[]> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/contracts/${type}?limit=${limit}`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const body = await res.json();
//       const arr = this.extractArray(body);
//       return arr.map((c: any) => ({
//         address: c.address || c.contract_address || c.addr || '',
//         creator: c.creator || c.creator_address || c.deployer || c.creator || '',
//         type,
//         name: c.name || c.label || undefined,
//         timestamp: c.timestamp || c.time || c.deployed_at || undefined,
//         verified:
//           c.verified === true ||
//           c.is_verified === true ||
//           c.verification_status === 'verified' ||
//           Boolean(c.verified_at) ||
//           false,
//         ...c
//       }));
//     } catch (err) {
//       console.error(`getContracts(${type}) error:`, err);
//       return [];
//     }
//   }

//   // Add a contract (attempts POST /contracts/{type})
//   // payload should include address and optionally creator/name/timestamp etc.
//   static async addContract(type: ContractType, payload: Partial<SeiContract>): Promise<SeiContract | null> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/contracts/${type}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       if (!res.ok) {
//         // Some backends may not implement this endpoint; log full body for debugging
//         const text = await res.text().catch(() => '');
//         throw new Error(`HTTP ${res.status} - ${text}`);
//       }

//       const body = await res.json();
//       const created = Array.isArray(body) ? body[0] : body;
//       return {
//         address: created.address || payload.address || '',
//         creator: created.creator || payload.creator || '',
//         type,
//         name: created.name || payload.name,
//         timestamp: created.timestamp || payload.timestamp,
//         verified:
//           created.verified === true ||
//           created.is_verified === true ||
//           created.verification_status === 'verified' ||
//           Boolean(created.verified_at) ||
//           Boolean(payload.verified) ||
//           false,
//         ...created
//       };
//     } catch (err) {
//       console.error(`addContract(${type}) error:`, err);
//       return null;
//     }
//   }

//   // Remove a contract (attempts DELETE /contracts/{type}/{address})
//   static async removeContract(type: ContractType, address: string): Promise<boolean> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/contracts/${type}/${address}`, {
//         method: 'DELETE'
//       });

//       if (!res.ok) {
//         const text = await res.text().catch(() => '');
//         throw new Error(`HTTP ${res.status} - ${text}`);
//       }

//       return true;
//     } catch (err) {
//       console.error(`removeContract(${type}, ${address}) error:`, err);
//       return false;
//     }
//   }

//   // Optional: fetch a single contract by address (if backend route exists)
//   static async getContract(type: ContractType, address: string): Promise<SeiContract | null> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/contracts/${type}/${address}`);
//       if (!res.ok) return null;
//       const body = await res.json();
//       const raw = Array.isArray(body) ? body[0] : body;
//       return {
//         address: raw.address || raw.contract_address || '',
//         creator: raw.creator || raw.creator_address || '',
//         type,
//         name: raw.name || raw.label || undefined,
//         timestamp: raw.timestamp || raw.time || raw.deployed_at || undefined,
//         verified:
//           raw.verified === true ||
//           raw.is_verified === true ||
//           raw.verification_status === 'verified' ||
//           Boolean(raw.verified_at) ||
//           false,
//         ...raw
//       };
//     } catch (err) {
//       console.error(`getContract(${type}, ${address}) error:`, err);
//       return null;
//     }
//   }
//   private static async tryFetchJson(url: string, opts: RequestInit = {}) {
//     try {
//       const res = await fetch(url, opts);
//       if (!res.ok) return { ok: false, status: res.status, body: null };
//       const body = await res.json().catch(() => null);
//       return { ok: true, status: res.status, body };
//     } catch (err) {
//       return { ok: false, status: 0, body: null };
//     }
//   }

//   /**
//    * analyzeContract: tries server-side analysis endpoints, and falls back to a local heuristic
//    * analysis when none are supported.
//    */
//   static async analyzeContract(type: ContractType, address: string): Promise<{
//     success: boolean;
//     aiSummary?: string;
//     riskLevel?: 'low' | 'medium' | 'high';
//     message?: string;
//   }> {
//     // 1) Try server-side analysis endpoints (common names)
//     const endpoints = [
//       { url: `${SEISTREAM_API}/contracts/${type}/${address}/analyze`, method: 'POST' },
//       { url: `${SEISTREAM_API}/contracts/${type}/${address}/ai-analyze`, method: 'POST' },
//       { url: `${SEISTREAM_API}/contracts/${type}/${address}/analysis`, method: 'POST' },
//       { url: `${SEISTREAM_API}/contracts/${type}/${address}/analysis`, method: 'GET' }
//     ];

//     for (const ep of endpoints) {
//       try {
//         const res = await this.tryFetchJson(ep.url, { method: ep.method, headers: { 'Content-Type': 'application/json' } });
//         if (!res.ok) continue;
//         const body = res.body;
//         if (!body) {
//           // server returned OK but no JSON; consider it success without summary
//           return { success: true, message: 'Server-side analysis completed (no JSON body).' };
//         }

//         const aiSummary =
//           body.aiSummary ||
//           body.summary ||
//           body.analysis ||
//           body.data?.aiSummary ||
//           body.result?.summary ||
//           undefined;

//         const riskRaw = body.riskLevel || body.risk || body.risk_score;
//         let riskLevel: 'low' | 'medium' | 'high' | undefined;
//         if (typeof riskRaw === 'string') {
//           const r = riskRaw.toLowerCase();
//           if (r.includes('low')) riskLevel = 'low';
//           else if (r.includes('high')) riskLevel = 'high';
//           else riskLevel = 'medium';
//         } else if (typeof riskRaw === 'number') {
//           if (riskRaw >= 8) riskLevel = 'high';
//           else if (riskRaw >= 4) riskLevel = 'medium';
//           else riskLevel = 'low';
//         }

//         return { success: true, aiSummary, riskLevel, message: body.message || undefined };
//       } catch (err) {
//         // continue to next endpoint
//         continue;
//       }
//     }

//     // 2) No server analysis endpoint responded — run local fallback analysis
//     return await this.fallbackAnalyzeContract(type, address);
//   }

//   /**
//    * fallbackAnalyzeContract: best-effort client-side analysis using available explorer data.
//    * Returns same shape as analyzeContract: success + aiSummary + riskLevel.
//    */
//   private static async fallbackAnalyzeContract(type: ContractType, address: string): Promise<{
//     success: boolean;
//     aiSummary?: string;
//     riskLevel?: 'low' | 'medium' | 'high';
//     message?: string;
//   }> {
//     try {
//       // Gather data
//       const contract = await this.getContract(type, address).catch(() => null);
//       // Try to fetch contract transactions endpoint if available
//       const txsRes = await this.tryFetchJson(`${SEISTREAM_API}/contracts/${type}/${address}/transactions`);
//       const txs = txsRes.ok && Array.isArray(txsRes.body) ? txsRes.body : [];
//       // Try to fetch code for EVM (if backend exposes it)
//       let code: string | null = null;
//       if (type === 'evm') {
//         const codeRes = await this.tryFetchJson(`${SEISTREAM_API}/contracts/evm/${address}/code`);
//         if (codeRes.ok && codeRes.body) {
//           // attempt to extract code string from common shapes
//           code = (codeRes.body.code || codeRes.body.bytecode || codeRes.body.data || codeRes.body).toString?.() ?? null;
//         }
//       }

//       // Heuristics & scoring
//       let score = 0;
//       const reasons: string[] = [];

//       // If contract is unverified that's a risk
//       if (!contract || !contract.verified) {
//         score += 3;
//         reasons.push('Contract is unverified or verification info missing.');
//       } else {
//         reasons.push('Contract source is verified.');
//       }

//       // If contract creator is missing or looks odd => add risk
//       const creator = (contract && (contract.creator || contract.deployer || contract.creator_address)) || null;
//       if (!creator) {
//         score += 1;
//         reasons.push('Creator/deployer metadata is missing.');
//       }

//       // Transactions-based heuristics
//       const recentTxCount = Array.isArray(txs) ? txs.length : 0;
//       if (recentTxCount >= 50) {
//         score += 2;
//         reasons.push(`High recent activity (${recentTxCount} transactions).`);
//       } else if (recentTxCount >= 10) {
//         score += 1;
//         reasons.push(`Moderate recent activity (${recentTxCount} transactions).`);
//       } else {
//         reasons.push(`Low recent activity (${recentTxCount} transactions).`);
//       }

//       // Code heuristics for EVM
//       if (code) {
//         const codeLen = code.length;
//         // Small contracts with no verified source are suspicious (could be proxies or minimal)
//         if (codeLen < 100 && (!contract || !contract.verified)) {
//           score += 1;
//           reasons.push(`EVM bytecode is tiny (length ${codeLen}); may be proxy or minimal unsafe contract.`);
//         }
//         // Very large code may indicate complex logic (not necessarily bad)
//         if (codeLen > 20000) {
//           score += 1;
//           reasons.push(`EVM bytecode is large (length ${codeLen}); complex behavior should be reviewed.`);
//         }
//       }

//       // Look for high-value transfers in txs (best-effort)
//       try {
//         if (Array.isArray(txs)) {
//           let largeTransferFound = false;
//           for (const t of txs) {
//             // many backends return value/amount differently — try common fields
//             const valueRaw = t.value ?? t.amount ?? t.value_transferred ?? t.transferAmount ?? null;
//             const numeric = Number(valueRaw ?? (t.msgs?.[0]?.value?.amount?.[0]?.amount ?? 0));
//             if (!Number.isNaN(numeric) && numeric > 1e9) { // threshold: 1e9 microunits (example)
//               largeTransferFound = true;
//               break;
//             }
//           }
//           if (largeTransferFound) {
//             score += 2;
//             reasons.push('Large transfers detected in recent txs.');
//           }
//         }
//       } catch {
//         // ignore parse errors
//       }

//       // Compose result
//       let riskLevel: 'low' | 'medium' | 'high' = 'low';
//       if (score >= 6) riskLevel = 'high';
//       else if (score >= 3) riskLevel = 'medium';

//       const aiSummary = [
//         `Local heuristic analysis for contract ${address}:`,
//         ...reasons,
//         `Computed risk score: ${score} — risk level: ${riskLevel.toUpperCase()}.`,
//         'This is a heuristic fallback; for a full analysis enable server-side analysis endpoints.'
//       ].join(' ');

//       return { success: true, aiSummary, riskLevel, message: 'Fallback client-side analysis used (server endpoints not available).' };
//     } catch (err) {
//       console.error('fallbackAnalyzeContract error:', err);
//       return { success: false, message: 'Fallback analysis failed.' };
//     }
//   }
//   // --- robust contract tx discovery & summarization ---

// // private static async fetchContractTxs(type: ContractType, address: string, limit = 1000) {
// //   // Try a variety of common explorer endpoints and query param shapes
// //   const candidateUrls = [
// //     // explicit contract tx endpoints
// //     `${SEISTREAM_API}/contracts/${type}/${address}/transactions`,
// //     `${SEISTREAM_API}/contracts/${type}/${address}/txs`,
// //     `${SEISTREAM_API}/contracts/${type}/${address}/logs`,
// //     `${SEISTREAM_API}/contracts/${type}/${address}/events`,

// //     // transaction search endpoints with query params (different backends use different param names)
// //     `${SEISTREAM_API}/transactions?address=${encodeURIComponent(address)}&limit=${limit}`,
// //     `${SEISTREAM_API}/transactions?to=${encodeURIComponent(address)}&limit=${limit}`,
// //     `${SEISTREAM_API}/transactions?from=${encodeURIComponent(address)}&limit=${limit}`,
// //     `${SEISTREAM_API}/transactions?contract=${encodeURIComponent(address)}&limit=${limit}`,

// //     // generic search endpoint (some backends implement search/{query})
// //     `${SEISTREAM_API}/search/${encodeURIComponent(address)}`
// //   ];

// //   for (const url of candidateUrls) {
// //     try {
// //       const res = await this.tryFetchJson(url);
// //       if (!res.ok) {
// //         // console.debug to help debug which endpoints fail
// //         console.debug(`[fetchContractTxs] endpoint failed: ${url} status=${res.status}`);
// //         continue;
// //       }
// //       const body = res.body;
// //       // body might be array OR { data: [...] } OR { txs: [...] } OR object with nested fields
// //       if (Array.isArray(body)) {
// //         console.debug(`[fetchContractTxs] found array at ${url} length=${body.length}`);
// //         return body;
// //       }
// //       if (body && Array.isArray(body.data)) {
// //         console.debug(`[fetchContractTxs] found body.data at ${url} length=${body.data.length}`);
// //         return body.data;
// //       }
// //       if (body && Array.isArray(body.txs)) {
// //         console.debug(`[fetchContractTxs] found body.txs at ${url} length=${body.txs.length}`);
// //         return body.txs;
// //       }
// //       // Some search endpoints return an object with transactions inside results
// //       if (body && body.results && Array.isArray(body.results.txs)) {
// //         console.debug(`[fetchContractTxs] found body.results.txs at ${url} length=${body.results.txs.length}`);
// //         return body.results.txs;
// //       }
// //       // If search endpoint returns a contract object with a txs field
// //       if (body && body.txs && Array.isArray(body.txs)) {
// //         console.debug(`[fetchContractTxs] found contract.txs at ${url} length=${body.txs.length}`);
// //         return body.txs;
// //       }

// //       // If search returned an object that contains possible transactions keyed by anything, try to extract arrays
// //       const arr = Object.values(body).find((v: any) => Array.isArray(v));
// //       if (Array.isArray(arr)) {
// //         console.debug(`[fetchContractTxs] extracted array from body values at ${url} length=${arr.length}`);
// //         return arr as any[];
// //       }

// //       // If nothing matched, continue trying other endpoints
// //       console.debug(`[fetchContractTxs] endpoint OK but no tx array found at ${url}`);
// //     } catch (err) {
// //       console.debug(`[fetchContractTxs] error fetching ${url}:`, err);
// //       continue;
// //     }
// //   }

// //   // Fallback: if dedicated endpoints failed, fetch a recent batch and filter client-side.
// //   // This is expensive but often works if the server supports /transactions?limit=N.
// //   try {
// //     console.debug('[fetchContractTxs] falling back to scanning recent transactions endpoint');
// //     // try a larger limit but be careful with performance / timeouts
// //     const recent = await this.getRecentTransactions(Math.max(200, limit));
// //     if (Array.isArray(recent) && recent.length > 0) {
// //       // convert to raw tx-like shapes for summarization
// //       const mapped = recent.map((tx: any) => ({ ...tx }));
// //       const filtered = mapped.filter((tx) => {
// //         // reuse the same matching logic as summarizeTxsForContract uses internally
// //         const target = address.toLowerCase();
// //         const containsAddress = JSON.stringify(tx).toLowerCase().includes(target);
// //         return containsAddress;
// //       });
// //       console.debug(`[fetchContractTxs] fallback scanned recent ${recent.length} txs found ${filtered.length}`);
// //       return filtered;
// //     }
// //   } catch (err) {
// //     console.debug('[fetchContractTxs] fallback scan error:', err);
// //   }

// //   // Nothing found
// //   console.debug('[fetchContractTxs] no txs discovered for', address);
// //   return null;
// // }

// // private static summarizeTxsForContract(txs: any[], address: string) {
// //   const targetLow = address.toLowerCase();
// //   let interactionCount = 0;
// //   const callers = new Set<string>();
// //   let lastInteraction: string | null = null;
// //   let totalValueTransferred = 0;

// //   for (const tx of txs) {
// //     // Try to find whether tx touches the contract - multiple shapes
// //     const txStr = JSON.stringify(tx).toLowerCase();
// //     const touched = (() => {
// //       if (!tx) return false;
// //       // EVM-style: to field
// //       if (tx.to && String(tx.to).toLowerCase() === targetLow) return true;
// //       // explicit recipient
// //       if (tx.to_address && String(tx.to_address).toLowerCase() === targetLow) return true;
// //       // tx object may include an addresses array
// //       if (Array.isArray(tx.addresses) && tx.addresses.map((a: string) => String(a).toLowerCase()).includes(targetLow)) return true;
// //       // logs/events might contain the address
// //       if (tx.logs && tx.logs.length && txStr.includes(targetLow)) return true;
// //       // cosmos messages: msgs / messages array
// //       if (Array.isArray(tx.msgs) || Array.isArray(tx.messages)) {
// //         const msgs = tx.msgs ?? tx.messages;
// //         for (const m of msgs) {
// //           if (!m) continue;
// //           // common fields: contract / contract_address / recipient / to
// //           if (m.contract === address || m.contract_address === address || (m.value && (m.value.contract === address || m.value.contract_address === address))) return true;
// //           // typeUrl may indicate execution on this contract
// //           if (m.typeUrl && (String(m.typeUrl).toLowerCase().includes('wasm') || String(m.typeUrl).toLowerCase().includes('execute'))) {
// //             if (txStr.includes(targetLow)) return true;
// //           }
// //         }
// //       }
// //       // fallback: if any stringified tx includes the address
// //       if (txStr.includes(targetLow)) return true;
// //       return false;
// //     })();

// //     if (!touched) continue;

// //     interactionCount += 1;

// //     // caller detection: try many names
// //     const caller = tx.from || tx.sender || tx.signer || tx.signers?.[0] || tx.tx?.signer || null;
// //     if (caller) callers.add(String(caller));

// //     // value detection: many shapes — try numeric fields and nested message amounts
// //     const candidates = [
// //       tx.value,
// //       tx.value_transferred,
// //       tx.amount,
// //       tx.fee,
// //       tx.msgs?.[0]?.value?.amount?.[0]?.amount,
// //       tx.msgs?.[0]?.value?.amount,
// //       tx.tx?.value
// //     ];
// //     for (const v of candidates) {
// //       const n = Number(v ?? 0);
// //       if (!Number.isNaN(n) && n > 0) {
// //         totalValueTransferred += n;
// //         break;
// //       }
// //     }

// //     // timestamp extraction
// //     const timestamp = tx.timestamp || tx.time || tx.block_time || tx.block?.time || tx.tx?.time;
// //     if (timestamp) {
// //       const t = new Date(timestamp).getTime();
// //       if (!Number.isNaN(t) && (!lastInteraction || t > new Date(lastInteraction).getTime())) {
// //         lastInteraction = new Date(t).toISOString();
// //       }
// //     }
// //   }

// //   return {
// //     interactionCount,
// //     uniqueCallers: callers.size,
// //     lastInteraction,
// //     totalValueTransferred
// //   };
// // }

// // private static async enhanceWithOnchainData(type: ContractType, address: string) {
// //   // 1) Contract metadata (verification, creator)
// //   const contract = await this.getContract(type, address).catch((e) => {
// //     console.debug('[enhanceWithOnchainData] getContract failed:', e);
// //     return null;
// //   });

// //   // 2) Try to find contract transactions (robust)
// //   const txs = await this.fetchContractTxs(type, address, 500).catch((e) => {
// //     console.debug('[enhanceWithOnchainData] fetchContractTxs error:', e);
// //     return null;
// //   });

// //   // 3) EVM code if available
// //   let code: any = null;
// //   if (type === 'evm') {
// //     const codeRes = await this.tryFetchJson(`${SEISTREAM_API}/contracts/evm/${address}/code`);
// //     if (codeRes.ok && codeRes.body) {
// //       code = codeRes.body.code || codeRes.body.bytecode || codeRes.body.data || codeRes.body;
// //       console.debug('[enhanceWithOnchainData] got code length=', code ? (String(code).length) : 0);
// //     } else {
// //       console.debug('[enhanceWithOnchainData] no code endpoint or empty for', address);
// //     }
// //   }

// //   const txSummary = txs ? this.summarizeTxsForContract(txs, address) : { interactionCount: 0, uniqueCallers: 0, lastInteraction: null, totalValueTransferred: 0 };

// //   // Compute risk using real evidence
// //   const verified = Boolean(contract?.verified);
// //   let score = 0;
// //   const reasons: string[] = [];

// //   if (!verified) {
// //     score += 3;
// //     reasons.push('Contract not verified or verification info missing.');
// //   } else {
// //     reasons.push('Contract is verified on explorer.');
// //   }

// //   if (txSummary.interactionCount >= 500) { score += 3; reasons.push(`Very high interactions: ${txSummary.interactionCount}`); }
// //   else if (txSummary.interactionCount >= 50) { score += 2; reasons.push(`Moderate interactions: ${txSummary.interactionCount}`); }
// //   else if (txSummary.interactionCount > 0) { score += 1; reasons.push(`Low interactions: ${txSummary.interactionCount}`); }
// //   else { reasons.push('No on-chain interactions found.'); }

// //   if (txSummary.uniqueCallers > 0) reasons.push(`Unique callers: ${txSummary.uniqueCallers}.`);

// //   if ((txSummary.totalValueTransferred || 0) > 0) {
// //     reasons.push(`Total transferred (approx): ${txSummary.totalValueTransferred.toLocaleString()}.`);
// //     if (txSummary.totalValueTransferred > 1e9) score += 2;
// //   }

// //   if (code && typeof code === 'string') {
// //     const codeLen = code.length;
// //     if (codeLen < 120 && !verified) { score += 1; reasons.push('Small bytecode and unverified.'); }
// //     if (codeLen > 30000) { reasons.push('Large bytecode length; complex logic present.'); }
// //   }

// //   let riskLevel: 'low'|'medium'|'high' = 'low';
// //   if (score >= 6) riskLevel = 'high';
// //   else if (score >= 3) riskLevel = 'medium';

// //   const details = {
// //     source: txs ? 'onchain' : 'none',
// //     verified,
// //     creator: contract?.creator || contract?.deployer || null,
// //     creationTx: contract?.creationTx ?? contract?.created_tx ?? null,
// //     interactionCount: txSummary.interactionCount,
// //     uniqueCallers: txSummary.uniqueCallers,
// //     lastInteraction: txSummary.lastInteraction,
// //     totalValueTransferred: txSummary.totalValueTransferred,
// //     codeSampleLength: code ? String(code).length : null,
// //     rawContract: contract ?? null,
// //     rawTxsSample: Array.isArray(txs) ? txs.slice(0, 5) : []
// //   };

// //   const aiSummary = [
// //     `On-chain analysis for ${address}:`,
// //     ...reasons,
// //     `Computed risk score: ${score} — risk level: ${riskLevel.toUpperCase()}.`,
// //     details.lastInteraction ? `Last interaction: ${details.lastInteraction}.` : 'No recent interactions found.'
// //   ].join(' ');

// //   return { success: true, aiSummary, riskLevel, message: 'On-chain data analysis used.', details };
// // }
// // Inside src/services/blockchainService.ts

// // ... existing imports and interfaces ...

//   /** Get transactions for a specific address */
//   static async getTransactionsByAddress(address: string, limit = 50): Promise<SeiTransaction[]> {
//     try {
//       // Prioritize common explorer API patterns for address transactions
//       const endpoints = [
//         `${SEISTREAM_API}/address/${address}/transactions?limit=${limit}`,
//         `${SEISTREAM_API}/account/${address}/txs?limit=${limit}`,
//         `${SEISTREAM_API}/wallet/${address}/transactions?limit=${limit}`,
//         `${SEISTREAM_API}/transactions?address=${address}&limit=${limit}`, // Generic filter
//       ];

//       for (const url of endpoints) {
//         const res = await fetch(url);
//         if (res.ok) {
//           const data = await res.json();
//           // Handle various common data structures (e.g., direct array, { data: [...] }, { txs: [...] })
//           let transactions = [];
//           if (Array.isArray(data)) {
//             transactions = data;
//           } else if (data.data && Array.isArray(data.data)) {
//             transactions = data.data;
//           } else if (data.txs && Array.isArray(data.txs)) {
//             transactions = data.txs;
//           }

//           // Map to SeiTransaction interface; adapt to your backend's actual tx shape
//           return transactions.map((tx: any) => ({
//             hash: tx.hash || tx.txhash || '',
//             height: tx.height || tx.block_height || '',
//             timestamp: tx.timestamp || tx.block_time || '',
//             from: tx.from || tx.sender || tx.signer || '',
//             to: tx.to || tx.recipient || '',
//             type: tx.type || tx.msg_type || '',
//             gasUsed: tx.gas_used || tx.gasUsed || '',
//             fee: tx.fee || (tx.tx?.auth_info?.fee?.amount?.[0]?.amount) || '', // Example for Cosmos SDK fee
//             // Add other fields as needed from your backend's transaction response
//             status: tx.status || (tx.code === 0 ? 'success' : 'fail'), // assuming code 0 is success
//           }));
//         }
//       }
//       return []; // If no endpoint worked
//     } catch (err) {
//       console.error(`getTransactionsByAddress(${address}) error:`, err);
//       return [];
//     }
//   }

//   /** (Optional) Get EVM address for a Sei bech32 address */
//   static async getSeiEVMAddress(seiAddress: string): Promise<string | null> {
//     try {
//       // This is a common endpoint on explorers for address mapping
//       const res = await fetch(`${SEISTREAM_API}/address/${seiAddress}/evm`);
//       if (!res.ok) return null;
//       const data = await res.json();
//       // Adjust property name based on your backend's response (e.g., data.evm_address, data.eth_address)
//       return data.evm_address || data.eth_address || data.address || null;
//     } catch (err) {
//       console.error(`getSeiEVMAddress(${seiAddress}) error:`, err);
//       return null;
//     }
//   }

//   /** (Optional) Get Sei address for an EVM address */
//   static async getSeiFromEvmAddress(evmAddress: string): Promise<string | null> {
//     try {
//       // 1) Try a dedicated backend mapping endpoint if available
//       const mapRes = await fetch(`${SEISTREAM_API}/address/${evmAddress}/sei`);
//       if (mapRes.ok) {
//         const mapBody = await mapRes.json().catch(() => null);
//         const mapped = mapBody?.sei_address || mapBody?.address || null;
//         if (mapped) return mapped;
//       }

//       // 2) Fallback to generic search; some backends return an object with .address or nested fields
//       const searchResult = await this.search(evmAddress);
//       const discovered =
//         searchResult?.account?.address ||
//         searchResult?.address ||
//         searchResult?.result?.address ||
//         null;
//       if (discovered && /^sei1[0-9a-z]{20,80}$/i.test(discovered)) return discovered;

//       // 3) As a last resort try looking up as a contract; some explorers mirror contracts across layers
//       const contract = await this.getContract('evm', evmAddress).catch(() => null);
//       if (contract && contract.sei_address && /^sei1[0-9a-z]{20,80}$/i.test(contract.sei_address)) {
//         return contract.sei_address;
//       }

//       return null;
//     } catch (err) {
//       console.error(`getSeiFromEvmAddress(${evmAddress}) error:`, err);
//       return null;
//     }
//   }

//   /** Fetch basic info for an EVM (0x) address */
//   static async getEvmAddressInfo(address: string): Promise<EvmAccount | null> {
//     try {
//       // Use the specified endpoint first
//       const primary = await fetch(`${SEISTREAM_API}/accounts/evm/${address}`);
//       if (primary.ok) {
//         const body: unknown = await primary.json().catch(() => null);
//         if (body && typeof body === 'object') {
//           const o = body as Record<string, unknown>;
//           const balance = typeof o.balance === 'string'
//             ? o.balance
//             : typeof o.balance === 'string'
//               ? o.balance
//               : typeof (o.data as Record<string, unknown> | undefined)?.balance === 'string'
//                 ? (o.data as Record<string, unknown>).balance as string
//                 : '0';
//           const txsCount = typeof o.txsCount === 'number'
//             ? o.txsCount
//             : typeof (o.stats as Record<string, unknown> | undefined)?.txsCount === 'number'
//               ? ((o.stats as Record<string, unknown>).txsCount as number)
//               : undefined;
//           const nonce = typeof o.nonce === 'number' ? (o.nonce as number) : undefined;
//           return { address, balance: String(balance), txsCount, nonce };
//         }
//       }

//       // Fallbacks for older deployments
//       const alternatives = [
//         `${SEISTREAM_API}/accounts/evm/${address}`,
//         `${SEISTREAM_API}/evm/accounts/${address}`,
//         `${SEISTREAM_API}/accounts/${address}`
//       ];
//       for (const url of alternatives) {
//         const res = await fetch(url);
//         if (!res.ok) continue;
//         const body: unknown = await res.json().catch(() => null);
//         if (body && typeof body === 'object') {
//           const o = body as Record<string, unknown>;
//           const balanceWei = typeof o.balanceWei === 'string'
//             ? o.balanceWei
//             : typeof o.balance === 'string'
//               ? o.balance
//               : typeof (o.data as Record<string, unknown> | undefined)?.balance === 'string'
//                 ? (o.data as Record<string, unknown>).balance as string
//                 : '0';
//           const txsCount = typeof o.txsCount === 'number'
//             ? o.txsCount
//             : typeof (o.stats as Record<string, unknown> | undefined)?.txsCount === 'number'
//               ? ((o.stats as Record<string, unknown>).txsCount as number)
//               : undefined;
//           const nonce = typeof o.nonce === 'number' ? (o.nonce as number) : undefined;
//           return { address, balanceWei: String(balanceWei), txsCount, nonce };
//         }
//       }
//       return null;
//     } catch {
//       return null;
//     }
//   }

//   /** Fetch transactions for an EVM address using the specified endpoint */
//   static async getEvmAccountTransactions(address: string, limit = 10): Promise<SeiTransaction[]> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/accounts/evm/${address}/transactions?limit=${limit}`);
//       if (!res.ok) return [];
//       const data: unknown = await res.json().catch(() => []);
//       const d: any = data as any;
//       const list: any[] = Array.isArray(d)
//         ? d
//         : Array.isArray(d?.data)
//           ? d.data
//           : Array.isArray(d?.txs)
//             ? d.txs
//             : [];
//       return list.map((tx: any) => ({
//         hash: typeof tx.hash === 'string' ? tx.hash : typeof tx.txhash === 'string' ? (tx.txhash as string) : '',
//         height: typeof tx.height === 'string' ? tx.height : typeof tx.block_height === 'string' ? (tx.block_height as string) : '',
//         timestamp: typeof tx.timestamp === 'string' ? tx.timestamp : typeof tx.block_time === 'string' ? (tx.block_time as string) : '',
//         from: typeof tx.from === 'string' ? tx.from : typeof tx.sender === 'string' ? (tx.sender as string) : typeof tx.signer === 'string' ? (tx.signer as string) : '',
//         to: typeof tx.to === 'string' ? tx.to : typeof tx.recipient === 'string' ? (tx.recipient as string) : '',
//         type: typeof tx.type === 'string' ? tx.type : typeof tx.msg_type === 'string' ? (tx.msg_type as string) : '',
//         gasUsed: typeof tx.gas_used === 'string' ? tx.gas_used : typeof tx.gasUsed === 'string' ? (tx.gasUsed as string) : '',
//         fee:
//           typeof tx.fee === 'string'
//             ? tx.fee
//             : typeof tx.tx?.auth_info?.fee?.amount?.[0]?.amount === 'string'
//               ? tx.tx.auth_info.fee.amount[0].amount
//               : typeof tx.fee_amount === 'string'
//                 ? tx.fee_amount
//                 : ''
//       }));
//     } catch {
//       return [];
//     }
//   }

//   /** Fetch recent transactions for any address (Sei or EVM). */
//   static async getAddressTransactions(address: string, limit = 10): Promise<SeiTransaction[]> {
//     // Prefer the richer Cosmos account txs endpoint when it's a Sei address
//     const isSei = /^sei1[0-9a-z]{20,80}$/i.test(address);
//     if (isSei) {
//       return this.getAccountTransactions(address, limit);
//     }
//     // Otherwise use the EVM-specific endpoint if available
//     const evm = await this.getEvmAccountTransactions(address, limit);
//     if (evm.length > 0) return evm;
//     // Fallback to generic address transactions helper
//     return this.getTransactionsByAddress(address, limit);
//   }

//   static async getAccountDetails(address: string): Promise<SeiAccount | null> {
//     try {
//       const res = await fetch(`${SEISTREAM_API}/accounts/${address}`);
//       if (!res.ok) return null;
//       const d = await res.json();
//       return {
//         address: d.address || address,
//         balance: toStr(d.balance),
//         wallet: {
//           available: toStr(d.wallet?.available),
//           vesting: toStr(d.wallet?.vesting),
//           delegated: toStr(d.wallet?.delegated),
//           unbonding: toStr(d.wallet?.unbonding),
//           reward: toStr(d.wallet?.reward),
//           commission: toStr(d.wallet?.commission),
//         },
//         assets: Array.isArray(d.assets) ? d.assets : [],
       
//         delegationsCount: d.delegationsCount ?? 0,
//         cw20TokensCount: d.cw20TokensCount ?? 0,
//         cw721TokensCount: d.cw721TokensCount ?? 0,
//         txsCount: d.txsCount ?? 0,
//       };
//     } catch (err) {
//       console.error(`getAccountDetails(${address}) error:`, err);
//       return null;
//     }
//   }

//   static async getAccountTransactions(address: string, limit = 10): Promise<SeiTransaction[]> {
//     try {
//       const url = `${SEISTREAM_API}/accounts/${address}/transactions?limit=${limit}`;
//       const res = await fetch(url);
//       if (!res.ok) return [];
  
//       const data = await res.json();
//       const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (Array.isArray(data.txs) ? data.txs : []));
//       return list.map((tx: any) => ({
//         hash: tx.hash ?? tx.txhash ?? '',
//         height: tx.height ?? tx.block_height ?? '',
//         timestamp: tx.timestamp ?? tx.block_time ?? '',
//         from: tx.from ?? tx.sender ?? tx.signer ?? '',
//         to: tx.to ?? tx.recipient ?? '',
//         type: tx.type ?? tx.msg_type ?? '',
//         gasUsed: tx.gas_used ?? tx.gasUsed ?? '',
//         fee:
//           tx.fee ??
//           tx.tx?.auth_info?.fee?.amount?.[0]?.amount ??
//           tx.fee_amount ??
//           '',
//       }));
//     } catch (err) {
//       console.error(`getAccountTransactions(${address}) error:`, err);
//       return [];
//     }
//   }

// // Optionally make getWalletInfo use the richer /accounts response
// static async getWalletInfo(address: string): Promise<SeiWallet | null> {
//   try {
//     // Prefer the accounts endpoint
//     const acct = await this.getAccountDetails(address);
//     if (acct) {
//       return { address: acct.address, balance: acct.balance };
//     }
//     // Fallback to legacy search route if /accounts is unavailable
//     const res = await fetch(`${SEISTREAM_API}/search/${address}`);
//     if (!res.ok) throw new Error(`HTTP ${res.status}`);
//     const data = await res.json();
//     return {
//       address,
//       balance: data.balance || '0'
//     };
//   } catch (err) {
//     console.error(`getWalletInfo(${address}) error:`, err);
//     return null;
//   }
// }



// }


// const SEISTREAM_API = 'http://localhost:3001';
const SEISTREAM_API = 'https://seibackend.onrender.com';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// --- Interfaces ---

export interface SeiWallet {
  address: string;
  balance: string; // This is the total balance as a string

  // Optional detailed balance fields (when available)
  available?: string;
  vesting?: string;
  delegated?: string;
  unbonding?: string;
  reward?: string; // Staking rewards
  commission?: string;
  txsCount?: number; // Total transaction count
}

export interface SeiAccount {
  address: string;
  balance: string; // microunits as string
  wallet: {
    available: string;
    vesting: string;
    delegated: string;
    unbonding: string;
    reward: string;
    commission: string;
  };
  assets?: any[];
  delegationsCount?: number;
  cw20TokensCount?: number;
  cw721TokensCount?: number;
  txsCount?: number;
}

export interface SeiBlock {
  height: string;
  hash: string;
  timestamp: string;
  transactions: number;
  proposer: string;
}

export interface SeiTransaction {
  hash: string;
  height: string;
  timestamp: string;
  from?: string;
  to?: string;
  type?: string;
  gasUsed?: string;
  fee?: string;
}

export type ContractType = 'cosmos' | 'evm';

export interface SeiContract {
  address: string;
  creator?: string;
  type?: ContractType;
  name?: string;
  timestamp?: string;
  verified?: boolean;
  sei_address?: string; // Optional cross-layer mapping
  aiSummary?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  [key: string]: any;
}

export interface SeiPriceData {
  usd: number;
  usd_24h_change: number;
}

// Minimal EVM account view for 0x addresses
export interface EvmAccount {
  address: string;
  balance: string; // 18 decimals typical, as string
  txsCount?: number;
  nonce?: number;
}

// ---- Helpers ----
const toStr = (n: any) => (n === null || n === undefined ? '0' : String(n));
// Helpers
const isEvmAddress = (s?: any): s is string =>
  typeof s === 'string' && /^0x[0-9a-fA-F]{40}$/.test(s);
const isSeiAddress = (s?: any): s is string =>
  typeof s === 'string' && /^sei1[0-9a-z]{20,80}$/i.test(s);

// Some feeds put the EVM address in "hash". This picks the actual contract address reliably.
const pickAddress = (raw: any): string => {
  const candidates = [
    raw?.address,
    raw?.contract_address,
    raw?.contractAddress,
    raw?.addr,
    raw?.contract,
    isEvmAddress(raw?.hash) ? raw.hash : undefined, // treat hash as address only if it's 0x…40
  ];
  const found = candidates.find((v) => isEvmAddress(v) || isSeiAddress(v));
  return found || '';
};

// “Verified” for Cosmos = presence of code_id/source metadata; EVM = usual flags
const computeVerified = (raw: any, source?: 'evm' | 'cosmos'): boolean | undefined => {
  if (typeof raw?.verified === 'boolean') return raw.verified;
  if (source === 'evm') {
    return !!(raw?.is_verified || raw?.source_verified || raw?.verified_at || raw?.verification_status === 'verified');
  }
  // CosmWasm signals
  if (raw?.code_id || raw?.codeId || raw?.code?.code_id || raw?.source_verified || raw?.contract_verification?.verified) {
    return true;
  }
  return undefined; // unknown
};

// Parse your paginated shape
const parsePaginated = (body: any) => {
  const items = Array.isArray(body?.items)
    ? body.items
    : Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
    ? body.data
    : [];
  const rows = Number(body?.pagination?.rows);
  const pages = Number(body?.pagination?.pages);
  const curr = Number(body?.pagination?.currPage);
  const next = Number(body?.pagination?.nextPage);
  return {
    items,
    rows: Number.isFinite(rows) ? rows : undefined,
    pages: Number.isFinite(pages) ? pages : undefined,
    curr: Number.isFinite(curr) ? curr : undefined,
    next: Number.isFinite(next) ? next : undefined,
  };
};

export class BlockchainService {
  static baseUrl = SEISTREAM_API;

  /** Get recent blocks */
  static async getRecentBlocks(limit = 5): Promise<SeiBlock[]> {
    try {
      const res = await fetch(`${SEISTREAM_API}/blocks?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return data.map((b: any) => ({
        height: b.height || '',
        hash: b.hash || '',
        timestamp: b.time || '',
        transactions: b.tx_count || 0,
        proposer:
          typeof b.proposer === 'object'
            ? b.proposer.address || b.proposer.moniker || ''
            : b.proposer || ''
      }));
    } catch (err) {
      console.error('getRecentBlocks error:', err);
      return [];
    }
  }

  /** Get recent transactions */
  static async getRecentTransactions(limit = 10): Promise<SeiTransaction[]> {
    try {
      const res = await fetch(`${SEISTREAM_API}/transactions?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return data.map((tx: any) => ({
        hash: tx.hash || '',
        height: tx.height || '',
        timestamp: tx.time || '',
        from: tx.from,
        to: tx.to,
        type: tx.type,
        gasUsed: tx.gas_used,
        fee: tx.fee
      }));
    } catch (err) {
      console.error('getRecentTransactions error:', err);
      return [];
    }
  }

  /** Search by query (hash, block, or address) */
  static async search(query: string): Promise<any> {
    try {
      const res = await fetch(`${SEISTREAM_API}/search/${query}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`search(${query}) error:`, err);
      return null;
    }
  }

  /** Get SEI price */
  static async getSeiPrice(): Promise<SeiPriceData | null> {
    try {
      const res = await fetch(
        `${COINGECKO_API}/simple/price?ids=sei-network&vs_currencies=usd&include_24hr_change=true`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return data['sei-network']
        ? {
            usd: data['sei-network'].usd,
            usd_24h_change: data['sei-network'].usd_24h_change
          }
        : null;
    } catch (err) {
      console.error('getSeiPrice error:', err);
      return null;
    }
  }

  /** Shortcut: latest block */
  static async getLatestBlock(): Promise<SeiBlock | null> {
    const blocks = await this.getRecentBlocks(1);
    return blocks[0] || null;
  }

  /** Fetch a block by height */
  static async getBlock(height: number): Promise<SeiBlock | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/blocks/${height}`);
      if (!res.ok) return null;
      const b = await res.json();

      return {
        height: b.height || '',
        hash: b.hash || '',
        timestamp: b.time || '',
        transactions: b.tx_count || 0,
        proposer:
          typeof b.proposer === 'object'
            ? b.proposer.address || b.proposer.moniker || ''
            : b.proposer || ''
      };
    } catch {
      return null;
    }
  }

  /** Get a transaction by hash */
  static async getTransaction(hash: string): Promise<SeiTransaction | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/transactions/${hash}`);
      if (!res.ok) return null;
      const tx = await res.json();

      return {
        hash: tx.hash || '',
        height: tx.height || '',
        timestamp: tx.time || '',
        from: tx.from,
        to: tx.to,
        type: tx.type,
        gasUsed: tx.gas_used,
        fee: tx.fee
      };
    } catch {
      return null;
    }
  }

  // Normalize array-returning responses (defensive)
  private static extractArray(body: unknown): any[] {
    if (!body) return [];
    const anyBody: any = body as any;
    if (Array.isArray(anyBody)) return anyBody;
    if (Array.isArray(anyBody.data)) return anyBody.data;
    if (Array.isArray(anyBody.contracts)) return anyBody.contracts;
    if (Array.isArray(anyBody.items)) return anyBody.items;
    return [];
  }

  // Get contracts by type
  static async getContracts(type: ContractType, limit = 50): Promise<SeiContract[]> {
  try {
    const res = await fetch(`${SEISTREAM_API}/contracts/${type}?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    const arr = Array.isArray(body) ? body
      : Array.isArray(body?.data) ? body.data
      : Array.isArray(body?.contracts) ? body.contracts
      : Array.isArray(body?.items) ? body.items
      : Array.isArray(body?.items?.items) ? body.items.items
      : [];

    return arr
      .map((c: any) => {
        const address = pickAddress(c);
        return {
          address,
          creator: c.creator || c.creator_address || c.deployer || '',
          type,
          name: c.name || c.label || c.contract_name || undefined,
          timestamp: c.timestamp || c.time || c.deployed_at || undefined,
          verified: computeVerified(c, type),
          ...c
        } as SeiContract;
      })
      .filter((c: SeiContract) => !!c.address);
  } catch (err) {
    console.error(`getContracts(${type}) error:`, err);
    return [];
  }
}

  // Add a contract
  static async addContract(type: ContractType, payload: Partial<SeiContract>): Promise<SeiContract | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/contracts/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} - ${text}`);
      }

      const body = await res.json();
      const created = Array.isArray(body) ? body[0] : body;
      const address = pickAddress(created) || payload.address || '';
      return {
        address,
        creator: created.creator || payload.creator || '',
        type,
        name: created.name || payload.name,
        timestamp: created.timestamp || payload.timestamp,
        verified: computeVerified(created, type),
        ...created
      };
    } catch (err) {
      console.error(`addContract(${type}) error:`, err);
      return null;
    }
  }

  // Remove a contract
  static async removeContract(type: ContractType, address: string): Promise<boolean> {
    try {
      const res = await fetch(`${SEISTREAM_API}/contracts/${type}/${address}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} - ${text}`);
      }

      return true;
    } catch (err) {
      console.error(`removeContract(${type}, ${address}) error:`, err);
      return false;
    }
  }

  // Fetch a single contract by address
  static async getContract(type: ContractType, address: string): Promise<SeiContract | null> {
  try {
    const res = await fetch(`${SEISTREAM_API}/contracts/${type}/${address}`);
    if (!res.ok) return null;
    const body = await res.json();
    const raw = Array.isArray(body) ? body[0] : body;
    const addr = pickAddress(raw) || address;
    return {
      address: addr,
      creator: raw.creator || raw.creator_address || '',
      type,
      name: raw.name || raw.label || raw.contract_name || undefined,
      timestamp: raw.timestamp || raw.time || raw.deployed_at || undefined,
      verified: computeVerified(raw, type),
      ...raw
    };
  } catch (err) {
    console.error(`getContract(${type}, ${address}) error:`, err);
    return null;
  }
}

  private static async tryFetchJson(url: string, opts: RequestInit = {}) {
    try {
      const res = await fetch(url, opts);
      if (!res.ok) return { ok: false, status: res.status, body: null };
      const body = await res.json().catch(() => null);
      return { ok: true, status: res.status, body };
    } catch (err) {
      return { ok: false, status: 0, body: null };
    }
  }

  /**
   * analyzeContract: tries server-side analysis endpoints, and falls back to a local heuristic analysis.
   */
  static async analyzeContract(
  type: ContractType,
  address: string,
  opts?: { preferServer?: boolean }
): Promise<{
  success: boolean;
  aiSummary?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  message?: string;
}> {
  const preferServer = opts?.preferServer === true;

  // Default: skip server calls to avoid 404 noise
  if (!preferServer) {
    return await this.fallbackAnalyzeContract(type, address);
  }

  // If you explicitly opt in, try server endpoints first
  const endpoints = [
    { url: `${SEISTREAM_API}/contracts/${type}/${address}/analyze`, method: 'POST' },
    { url: `${SEISTREAM_API}/contracts/${type}/${address}/ai-analyze`, method: 'POST' },
    { url: `${SEISTREAM_API}/contracts/${type}/${address}/analysis`, method: 'POST' },
    { url: `${SEISTREAM_API}/contracts/${type}/${address}/analysis`, method: 'GET' }
  ];

  for (const ep of endpoints) {
    try {
      const res = await this.tryFetchJson(ep.url, { method: ep.method, headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) continue;
      const body = res.body;
      if (!body) return { success: true, message: 'Server-side analysis completed (no JSON body).' };

      const aiSummary =
        body.aiSummary ||
        body.summary ||
        body.analysis ||
        body.data?.aiSummary ||
        body.result?.summary ||
        undefined;

      const riskRaw = body.riskLevel || body.risk || body.risk_score;
      let riskLevel: 'low' | 'medium' | 'high' | undefined;
      if (typeof riskRaw === 'string') {
        const r = riskRaw.toLowerCase();
        riskLevel = r.includes('low') ? 'low' : r.includes('high') ? 'high' : 'medium';
      } else if (typeof riskRaw === 'number') {
        riskLevel = riskRaw >= 8 ? 'high' : riskRaw >= 4 ? 'medium' : 'low';
      }

      return { success: true, aiSummary, riskLevel, message: body.message || undefined };
    } catch {
      // try next
      continue;
    }
  }

  // If server attempts failed, use local fallback
  return await this.fallbackAnalyzeContract(type, address);
}

  private static async fallbackAnalyzeContract(type: ContractType, address: string): Promise<{
  success: boolean;
  aiSummary?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  message?: string;
}> {
  try {
    const contract = await this.getContract(type, address).catch(() => null);

    const txUrl = `${SEISTREAM_API}/contracts/${type}/${address}/transactions?page=1&limit=50`;
    const txsRes = await this.tryFetchJson(txUrl);
    const arr = txsRes.ok
      ? (Array.isArray(txsRes.body?.items) ? txsRes.body.items
        : Array.isArray(txsRes.body) ? txsRes.body
        : Array.isArray(txsRes.body?.data) ? txsRes.body.data
        : [])
      : [];

    // Basic activity heuristics
    let score = 0;
    const reasons: string[] = [];

    if (!contract || !contract.verified) {
      score += 3;
      reasons.push('Contract is unverified or verification info missing.');
    } else {
      reasons.push('Contract source is verified.');
    }

    const recentTxCount = arr.length;
    if (recentTxCount >= 50) {
      score += 2; reasons.push(`High recent activity (${recentTxCount} txs on first page).`);
    } else if (recentTxCount >= 10) {
      score += 1; reasons.push(`Moderate recent activity (${recentTxCount} txs on first page).`);
    } else {
      reasons.push(`Low recent activity (${recentTxCount} txs on first page).`);
    }

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (score >= 6) riskLevel = 'high';
    else if (score >= 3) riskLevel = 'medium';

    const aiSummary = [
      `Local heuristic analysis for contract ${address}:`,
      ...reasons,
      `Computed risk score: ${score} — risk level: ${riskLevel.toUpperCase()}.`
    ].join(' ');

    return { success: true, aiSummary, riskLevel, message: 'Fallback client-side analysis used.' };
  } catch (err) {
    console.error('fallbackAnalyzeContract error:', err);
    return { success: false, message: 'Fallback analysis failed.' };
  }
}

  /** Get transactions for a specific address (generic fallbacks) */
  static async getTransactionsByAddress(address: string, limit = 50): Promise<SeiTransaction[]> {
    try {
      const endpoints = [
        `${SEISTREAM_API}/address/${address}/transactions?limit=${limit}`,
        `${SEISTREAM_API}/account/${address}/txs?limit=${limit}`,
        `${SEISTREAM_API}/wallet/${address}/transactions?limit=${limit}`,
        `${SEISTREAM_API}/transactions?address=${address}&limit=${limit}`
      ];

      for (const url of endpoints) {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          let transactions: any[] = [];
          if (Array.isArray(data)) transactions = data;
          else if (data.data && Array.isArray(data.data)) transactions = data.data;
          else if (data.txs && Array.isArray(data.txs)) transactions = data.txs;

          return transactions.map((tx: any) => ({
            hash: tx.hash || tx.txhash || '',
            height: tx.height || tx.block_height || '',
            timestamp: tx.timestamp || tx.block_time || '',
            from: tx.from || tx.sender || tx.signer || '',
            to: tx.to || tx.recipient || '',
            type: tx.type || tx.msg_type || '',
            gasUsed: tx.gas_used || tx.gasUsed || '',
            fee: tx.fee || (tx.tx?.auth_info?.fee?.amount?.[0]?.amount) || ''
          }));
        }
      }
      return [];
    } catch (err) {
      console.error(`getTransactionsByAddress(${address}) error:`, err);
      return [];
    }
  }

  /** EVM mapping helpers */
  static async getSeiEVMAddress(seiAddress: string): Promise<string | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/address/${seiAddress}/evm`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.evm_address || data.eth_address || data.address || null;
    } catch (err) {
      console.error(`getSeiEVMAddress(${seiAddress}) error:`, err);
      return null;
    }
  }

  static async getSeiFromEvmAddress(evmAddress: string): Promise<string | null> {
    try {
      const mapRes = await fetch(`${SEISTREAM_API}/address/${evmAddress}/sei`);
      if (mapRes.ok) {
        const mapBody = await mapRes.json().catch(() => null);
        const mapped = mapBody?.sei_address || mapBody?.address || null;
        if (mapped) return mapped;
      }
      const searchResult = await this.search(evmAddress);
      const discovered =
        searchResult?.account?.address ||
        searchResult?.address ||
        searchResult?.result?.address ||
        null;
      if (discovered && isSeiAddress(discovered)) return discovered;

      const contract = await this.getContract('evm', evmAddress).catch(() => null);
      if (contract && isSeiAddress(contract.sei_address)) return contract.sei_address as string;

      return null;
    } catch (err) {
      console.error(`getSeiFromEvmAddress(${evmAddress}) error:`, err);
      return null;
    }
  }

  /** EVM account info */
  static async getEvmAddressInfo(address: string): Promise<EvmAccount | null> {
    try {
      const primary = await fetch(`${SEISTREAM_API}/accounts/evm/${address}`);
      if (primary.ok) {
        const o: any = await primary.json().catch(() => null);
        if (o && typeof o === 'object') {
          const balance =
            typeof o.balance === 'string'
              ? o.balance
              : typeof o.data?.balance === 'string'
              ? o.data.balance
              : '0';
          const txsCount =
            typeof o.txsCount === 'number'
              ? o.txsCount
              : typeof o.stats?.txsCount === 'number'
              ? o.stats.txsCount
              : undefined;
          const nonce = typeof o.nonce === 'number' ? o.nonce : undefined;
          return { address, balance: String(balance), txsCount, nonce };
        }
      }
      const alternatives = [
        `${SEISTREAM_API}/evm/accounts/${address}`,
        `${SEISTREAM_API}/accounts/${address}`
      ];
      for (const url of alternatives) {
        const res = await fetch(url);
        if (!res.ok) continue;
        const o: any = await res.json().catch(() => null);
        if (o && typeof o === 'object') {
          const balance =
            typeof o.balanceWei === 'string'
              ? o.balanceWei
              : typeof o.balance === 'string'
              ? o.balance
              : typeof o.data?.balance === 'string'
              ? o.data.balance
              : '0';
          const txsCount =
            typeof o.txsCount === 'number'
              ? o.txsCount
              : typeof o.stats?.txsCount === 'number'
              ? o.stats.txsCount
              : undefined;
          const nonce = typeof o.nonce === 'number' ? o.nonce : undefined;
          return { address, balance: String(balance), txsCount, nonce };
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /** EVM address txs */
  static async getEvmAccountTransactions(address: string, limit = 10): Promise<SeiTransaction[]> {
    try {
      const res = await fetch(`${SEISTREAM_API}/accounts/evm/${address}/transactions?limit=${limit}`);
      if (!res.ok) return [];
      const d: any = await res.json().catch(() => []);
      const list: any[] = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : Array.isArray(d?.txs) ? d.txs : [];
      return list.map((tx: any) => ({
        hash: tx.hash ?? tx.txhash ?? '',
        height: tx.height ?? tx.block_height ?? '',
        timestamp: tx.timestamp ?? tx.block_time ?? '',
        from: tx.from ?? tx.sender ?? tx.signer ?? '',
        to: tx.to ?? tx.recipient ?? '',
        type: tx.type ?? tx.msg_type ?? '',
        gasUsed: tx.gas_used ?? tx.gasUsed ?? '',
        fee:
          tx.fee ??
          tx.tx?.auth_info?.fee?.amount?.[0]?.amount ??
          tx.fee_amount ??
          ''
      }));
    } catch {
      return [];
    }
  }

  /** Address txs (Sei or EVM) */
  static async getAddressTransactions(address: string, limit = 10): Promise<SeiTransaction[]> {
    if (isSeiAddress(address)) return this.getAccountTransactions(address, limit);
    const evm = await this.getEvmAccountTransactions(address, limit);
    if (evm.length > 0) return evm;
    return this.getTransactionsByAddress(address, limit);
  }

  /** Account details and txs (Sei) */
  static async getAccountDetails(address: string): Promise<SeiAccount | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/accounts/${address}`);
      if (!res.ok) return null;
      const d = await res.json();
      return {
        address: d.address || address,
        balance: toStr(d.balance),
        wallet: {
          available: toStr(d.wallet?.available),
          vesting: toStr(d.wallet?.vesting),
          delegated: toStr(d.wallet?.delegated),
          unbonding: toStr(d.wallet?.unbonding),
          reward: toStr(d.wallet?.reward),
          commission: toStr(d.wallet?.commission),
        },
        assets: Array.isArray(d.assets) ? d.assets : [],
        delegationsCount: d.delegationsCount ?? 0,
        cw20TokensCount: d.cw20TokensCount ?? 0,
        cw721TokensCount: d.cw721TokensCount ?? 0,
        txsCount: d.txsCount ?? 0,
      };
    } catch (err) {
      console.error(`getAccountDetails(${address}) error:`, err);
      return null;
    }
  }

  static async getAccountTransactions(address: string, limit = 10): Promise<SeiTransaction[]> {
    try {
      const url = `${SEISTREAM_API}/accounts/${address}/transactions?limit=${limit}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : (Array.isArray(data.txs) ? data.txs : []));
      return list.map((tx: any) => ({
        hash: tx.hash ?? tx.txhash ?? '',
        height: tx.height ?? tx.block_height ?? '',
        timestamp: tx.timestamp ?? tx.block_time ?? '',
        from: tx.from ?? tx.sender ?? tx.signer ?? '',
        to: tx.to ?? tx.recipient ?? '',
        type: tx.type ?? tx.msg_type ?? '',
        gasUsed: tx.gas_used ?? tx.gasUsed ?? '',
        fee:
          tx.fee ??
          tx.tx?.auth_info?.fee?.amount?.[0]?.amount ??
          tx.fee_amount ??
          '',
      }));
    } catch (err) {
      console.error(`getAccountTransactions(${address}) error:`, err);
      return [];
    }
  }

  // Wallet info from accounts (preferred)
  static async getWalletInfo(address: string): Promise<SeiWallet | null> {
    try {
      const acct = await this.getAccountDetails(address);
      if (acct) return { address: acct.address, balance: acct.balance };
      const res = await fetch(`${SEISTREAM_API}/search/${address}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { address, balance: data.balance || '0' };
    } catch (err) {
      console.error(`getWalletInfo(${address}) error:`, err);
      return null;
    }
  }

  /** Detect chain by address */
  static detectContractChain(address: string): 'evm' | 'cosmos' | null {
    if (isEvmAddress(address)) return 'evm';
    if (isSeiAddress(address)) return 'cosmos';
    return null;
  }

  /** Interaction count using your endpoints:
 * Cosmos: GET /contracts/cosmos/{address}/transactions
 * EVM:    GET /contracts/evm/{address}/transactions
 */
static async getInteractionCount(address: string, source?: ContractType): Promise<number> {
  const chain = source || (isSeiAddress(address) ? 'cosmos' : 'evm');
  const base =
    chain === 'cosmos'
      ? `${SEISTREAM_API}/contracts/cosmos/${address}/transactions`
      : `${SEISTREAM_API}/contracts/evm/${address}/transactions`;
  try {
    // First attempt: get total from pagination.rows (fast path)
    const res = await fetch(`${base}?page=1&limit=1`);
    if (res.ok) {
      const body = await res.json().catch(() => ({}));
      const { items, rows, pages } = parsePaginated(body);
      if (typeof rows === 'number' && rows >= 0) {
        return rows; // trust backend total if provided
      }
      if (Array.isArray(items) && items.length > 0) {
        // If no rows total was given but we know there are multiple pages, sample a few pages to sum.
        if (pages && pages > 1) {
          let total = items.length;
          const maxPages = Math.min(pages, 10); // safety cap
          for (let page = 2; page <= maxPages; page++) {
            const r2 = await fetch(`${base}?page=${page}&limit=200`);
            if (!r2.ok) break;
            const b2 = await r2.json().catch(() => ({}));
            const { items: i2 } = parsePaginated(b2);
            total += Array.isArray(i2) ? i2.length : 0;
          }
          return total;
        }
        // Single-page response: just return the first-page count
        return items.length;
      }
    }

    // Second attempt: fetch a page without limit params and count items
    const res2 = await fetch(base);
    if (res2.ok) {
      const b = await res2.json().catch(() => ({}));
      const { items } = parsePaginated(b);
      if (Array.isArray(items)) return items.length;
    }

    return 0;
  } catch (e) {
    console.error('getInteractionCount error', e);
    return 0;
  }
}
}