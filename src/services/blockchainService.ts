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

  // Primary senders/recipients (often used for EVM)
  from?: string;
  to?: string;

  // Cosmos-specific sender/signer
  sender?: string; // For Cosmos transactions
  signer?: string; // Another common field for Cosmos transactions
  
  type?: string; // e.g., "Execute", "Transfer", "Send", etc.
  gasUsed?: string;
  fee?: string;

  // New fields to match the desired display
  blockHash?: string;
  gasPrice?: string;
  gasLimit?: string;
  gasUsedByTransaction?: string;
  nonce?: number;
  value?: string; // Transaction value (often in micro units, needs conversion)
  txType?: number; // EVM transaction type (0, 1, 2) or message type for Cosmos
  method?: string; // Decoded EVM method name or Cosmos msg type
  status?: boolean; // Transaction status (true/false)
  failureReason?: string; // If status is false
  position?: number; // Transaction index within the block

  // Cosmos-specific fields often found in raw transaction data
  messages?: any[]; // Array of message objects (for Cosmos)
  rawLog?: string; // Raw log string
  events?: any[]; // Array of event objects
  code?: number; // Transaction result code (0 for success, non-zero for error)
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

const isSeiAddress = (s?: string) => !!s && /^sei1[0-9a-z]{20,80}$/i.test(s);

export interface AssociatedAddress {
  cosmos?: string;
  eth?: string;
  domain?: string;
  associated?: boolean;
}
// Minimal EVM account view for 0x addresses
export interface EvmAccount {
  address: string;
  balance: string; // 18 decimals typical, as string
  txsCount?: number;
  nonce?: number;
}
export interface ContractTxRow {
  hash: string;
  height?: number | string;
  timestamp?: string;
  from?: string;
  to?: string;
  type?: string;
  method?: string;
}

// ---- Helpers ----
const toStr = (n: any) => (n === null || n === undefined ? '0' : String(n));
// Helpers
const isEvmAddress = (s?: any): s is string =>
  typeof s === 'string' && /^0x[0-9a-fA-F]{40}$/.test(s);

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
        height: tx.height || tx.blockHeight || '', // Use blockHeight for EVM
        timestamp: tx.time || tx.timestamp || '',

        from: tx.from || tx.sender || tx.signer || '', // Try 'from', then 'sender', then 'signer'
        to: tx.to || tx.recipient || '', // Try 'to', then 'recipient'

        type: tx.type || '', // General transaction type

        gasUsed: tx.gas_used || tx.gasUsed || '', // Map gasUsed
        fee: tx.fee || '', // Map fee

        // --- Crucial addition for block hash ---
        blockHash: tx.blockHash || tx.block_hash || '', // Populate blockHash from API response
                                                        // (your API might use block_hash or blockHash)

        // Other fields if available and needed for recent transactions display
        gasPrice: tx.gasPrice || '',
        status: typeof tx.status === 'boolean' ? tx.status : (tx.code === 0 ? true : false),
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

      const isEvmTx = !!tx.gasPrice || !!tx.nonce || isEvmAddress(tx.from) || isEvmAddress(tx.to);

      const mappedTx: SeiTransaction = {
        hash: tx.hash || '',
        height: tx.height || tx.blockHeight || '',
        timestamp: tx.timestamp || tx.time || '',
        fee: tx.fee || '',

        from: tx.from || tx.sender || tx.signer || '',
        to: tx.to || '',
        sender: tx.sender || '',
        signer: tx.signer || '',

        ...(isEvmTx ? {} : {
          to: tx.to || tx.messages?.[0]?.to_address || tx.messages?.[0]?.contract_address || ''
        }),

        type: tx.type || tx.messages?.[0]?.type || '',

        // --- Crucial: blockHash mapping here too ---
        blockHash: tx.blockHash || tx.block_hash || '', // Populate blockHash here

        gasUsed: tx.gasUsed || tx.gas_used || '',
        gasUsedByTransaction: tx.gasUsedByTransaction || tx.gasUsed || tx.gas_used || '',
        gasPrice: tx.gasPrice || '',
        gasLimit: tx.gasLimit || '',
        nonce: tx.nonce,
        value: tx.value || '',
        txType: tx.txType || tx.type,
        method: tx.method || tx.decodedInput?.methodCall || '',

        status: typeof tx.status === 'boolean' ? tx.status : (tx.code === 0 ? true : false),
        failureReason: tx.failureReason || (tx.code !== 0 ? tx.rawLog : ''),
        position: tx.transactionIndex,

        messages: tx.messages || [],
        rawLog: tx.rawLog || '',
        events: tx.events || [],
        code: tx.code,
      };

      if (!isEvmTx && mappedTx.value === '') {
          mappedTx.value = tx.messages?.[0]?.value?.amount?.[0]?.amount || tx.messages?.[0]?.amount || '';
      }

      return mappedTx;
    } catch (e) {
      console.error(`Error fetching transaction ${hash}:`, e);
      return null;
    }
  }

  // Normalize array-returning responses (defensive)
  // private static extractArray(body: unknown): any[] {
  //   if (!body) return [];
  //   const anyBody: any = body as any;
  //   if (Array.isArray(anyBody)) return anyBody;
  //   if (Array.isArray(anyBody.data)) return anyBody.data;
  //   if (Array.isArray(anyBody.contracts)) return anyBody.contracts;
  //   if (Array.isArray(anyBody.items)) return anyBody.items;
  //   return [];
  // }

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
      // Prefer associated-address mapping first
      const assoc = await this.getAssociatedAddress(evmAddress);
      if (assoc?.cosmos && isSeiAddress(assoc.cosmos)) return assoc.cosmos;

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

  static async getAssociatedAddress(address: string): Promise<AssociatedAddress | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/accounts/associated-address/${address}`);
      if (!res.ok) return null;
      const body: any = await res.json().catch(() => null);
      if (!body || typeof body !== 'object') return null;
      return {
        cosmos: typeof body.cosmos === 'string' ? body.cosmos : undefined,
        eth: typeof body.eth === 'string' ? body.eth : undefined,
        domain: typeof body.domain === 'string' ? body.domain : undefined,
        associated: Boolean(body.associated)
      };
    } catch (err) {
      console.error(`getAssociatedAddress(${address}) error:`, err);
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

  private static mapCosmosTxItem(it: any): ContractTxRow {
  return {
    hash: it.hash || it.txhash || '',
    height: it.height ?? it.block_height ?? it.tx ?? '',
    timestamp: it.time || it.timestamp || it.block_time || '',
    from: it.sender || it.signer || '',
    to: it.to || it.recipient || it.contract || it.contract_address || '',
    type: it.type || (Array.isArray(it.messages) && it.messages[0]?.['@type']
      ? String(it.messages[0]['@type']).split('.').pop()
      : 'ExecuteContract'),
    method: undefined,
  };
}

private static mapEvmTxItem(it: any): ContractTxRow {
  return {
    hash: it.hash || '',
    height: it.blockHeight ?? it.block_height ?? '',
    timestamp: it.timestamp || '',
    from: it.from || '',
    to: it.to || it.createdContract?.address || '',
    type: it.actionType || (typeof it.type === 'number' ? `Type${it.type}` : 'Tx'),
    method: it.method || it.decodedInput?.methodCall || undefined,
  };
}

// New: fetch contract transactions with pagination
static async getContractTxs(
  type: ContractType,
  address: string,
  page = 1,
  limit = 25
): Promise<{ items: ContractTxRow[]; pagination: { rows?: number; pages?: number; currPage?: number; nextPage?: number } }> {
  const base =
    type === 'cosmos'
      ? `${SEISTREAM_API}/contracts/cosmos/${address}/transactions`
      : `${SEISTREAM_API}/contracts/evm/${address}/transactions`;
  const url = `${base}?page=${page}&limit=${limit}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { items: [], pagination: {} };
    }
    const body = await res.json().catch(() => ({}));
    const pg = parsePaginated(body);
    const items = Array.isArray(pg.items)
      ? pg.items.map((it) => (type === 'cosmos' ? this.mapCosmosTxItem(it) : this.mapEvmTxItem(it)))
      : [];
    return {
      items,
      pagination: {
        rows: pg.rows,
        pages: pg.pages,
        currPage: pg.curr,
        nextPage: pg.next,
      },
    };
  } catch (e) {
    console.error('getContractTxs error', e);
    return { items: [], pagination: {} };
  }
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