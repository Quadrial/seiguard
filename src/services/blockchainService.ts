// const SEISTREAM_API_ENDPOINT =
//   import.meta.env.MODE === 'production'
//     ? 'https://api.seistream.app'
//     : '/seistream';


// // CoinGecko API endpoint for SEI price
// const COINGECKO_API_ENDPOINT = 'https://api.coingecko.com/api/v3';

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
//   gasUsed: string;
//   gasWanted: string;
//   fee: string;
//   memo: string;
//   messages: unknown[];
// }

// export interface SeiWallet {
//   address: string;
//   balance: string;
//   sequence: string;
//   accountNumber: string;
// }

// // SEI price data interface
// export interface SeiPriceData {
//   usd: number;
//   usd_24h_change: number;
// }

// export class BlockchainService {
//   // Helper function to generate mock blocks
//   private static getMockBlocks(limit: number): SeiBlock[] {
//     const blocks: SeiBlock[] = [];
//     const baseHeight = 1600000000;
    
//     for (let i = 0; i < limit; i++) {
//       blocks.push({
//         height: (baseHeight - i).toString(),
//         hash: `0x${Math.random().toString(16).substring(2, 66)}`,
//         timestamp: new Date(Date.now() - i * 60000).toISOString(),
//         transactions: Math.floor(Math.random() * 100) + 10,
//         proposer: `sei1${Math.random().toString(16).substring(2, 42)}`
//       });
//     }
    
//     return blocks;
//   }

//   // Helper function to generate mock transactions
//   private static getMockTransactions(limit: number): SeiTransaction[] {
//     const transactions: SeiTransaction[] = [];
    
//     for (let i = 0; i < limit; i++) {
//       transactions.push({
//         hash: `0x${Math.random().toString(16).substring(2, 66)}`,
//         height: (1600000000 - i).toString(),
//         timestamp: new Date().toISOString(),
//         gasUsed: '100000',
//         gasWanted: '120000',
//         fee: '1000',
//         memo: 'Transaction',
//         messages: []
//       });
//     }
    
//     return transactions;
//   }

//   static async getLatestBlock(): Promise<SeiBlock | null> {
//     try {
//       // Fetch real block data from SeiStream API
//       const response = await fetch(`${SEISTREAM_API_ENDPOINT}/blocks?limit=1`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data && data.blocks && data.blocks.length > 0) {
//         const block = data.blocks[0];
//         return {
//           height: block.height,
//           hash: block.block_hash,
//           timestamp: block.timestamp,
//           transactions: block.tx_count,
//           proposer: block.proposer || ''
//         };
//       }
      
//       // Fallback to mock data if real data is not available
//       return {
//         height: (1600000000 + Math.random() * 1000).toString(),
//         hash: `0x${Math.random().toString(16).substring(2, 66)}`,
//         timestamp: new Date(Date.now() - Math.random() * 60000).toISOString(),
//         transactions: Math.floor(Math.random() * 100) + 10,
//         proposer: `sei1${Math.random().toString(16).substring(2, 42)}`
//       };
//     } catch (error) {
//       console.error('Failed to get latest block:', error);
//       // Fallback to mock data if there's an error
//       return {
//         height: (1600000000 + Math.random() * 1000).toString(),
//         hash: `0x${Math.random().toString(16).substring(2, 66)}`,
//         timestamp: new Date(Date.now() - Math.random() * 60000).toISOString(),
//         transactions: Math.floor(Math.random() * 100) + 10,
//         proposer: `sei1${Math.random().toString(16).substring(2, 42)}`
//       };
//     }
//   }

//   static async getBlock(height: number): Promise<SeiBlock | null> {
//     try {
//       // Fetch real block data from SeiStream API
//       const response = await fetch(`${SEISTREAM_API_ENDPOINT}/blocks/${height}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data && data.block) {
//         return {
//           height: data.block.height,
//           hash: data.block.block_hash,
//           timestamp: data.block.timestamp,
//           transactions: data.block.tx_count,
//           proposer: data.block.proposer || ''
//         };
//       }
      
//       // Fallback to mock data if real data is not available
//       return {
//         height: height.toString(),
//         hash: `0x${Math.random().toString(16).substring(2, 66)}`,
//         timestamp: new Date().toISOString(),
//         transactions: Math.floor(Math.random() * 50) + 5,
//         proposer: `sei1${Math.random().toString(16).substring(2, 42)}`
//       };
//     } catch (error) {
//       console.error('Failed to get block:', error);
//       // Fallback to mock data if there's an error
//       return {
//         height: height.toString(),
//         hash: `0x${Math.random().toString(16).substring(2, 66)}`,
//         timestamp: new Date().toISOString(),
//         transactions: Math.floor(Math.random() * 50) + 5,
//         proposer: `sei1${Math.random().toString(16).substring(2, 42)}`
//       };
//     }
//   }

//   static async getTransaction(hash: string): Promise<SeiTransaction | null> {
//     try {
//       // Fetch real transaction data from SeiStream API
//       const response = await fetch(`${SEISTREAM_API_ENDPOINT}/transactions/${hash}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data && data.transaction) {
//         return {
//           hash: data.transaction.tx_hash,
//           height: data.transaction.height,
//           timestamp: data.transaction.timestamp,
//           gasUsed: data.transaction.gas_used?.toString() || '0',
//           gasWanted: data.transaction.gas_wanted?.toString() || '0',
//           fee: data.transaction.fee?.amount?.toString() || '0',
//           memo: data.transaction.memo || '',
//           messages: data.transaction.messages || []
//         };
//       }
      
//       // Fallback to mock data if transaction not found
//       return {
//         hash,
//         height: Math.floor(Math.random() * 1000000 + 1000000).toString(),
//         timestamp: new Date().toISOString(),
//         gasUsed: (Math.floor(Math.random() * 100000) + 50000).toString(),
//         gasWanted: (Math.floor(Math.random() * 120000) + 60000).toString(),
//         fee: (Math.floor(Math.random() * 1000) + 100).toString(),
//         memo: 'Transaction',
//         messages: []
//       };
//     } catch (error) {
//       console.error('Failed to get transaction:', error);
//       // Fallback to mock data if there's an error
//       return {
//         hash,
//         height: Math.floor(Math.random() * 1000000 + 1000000).toString(),
//         timestamp: new Date().toISOString(),
//         gasUsed: (Math.floor(Math.random() * 100000) + 50000).toString(),
//         gasWanted: (Math.floor(Math.random() * 120000) + 60000).toString(),
//         fee: (Math.floor(Math.random() * 1000) + 100).toString(),
//         memo: 'Transaction',
//         messages: []
//       };
//     }
//   }

//   static async getWalletInfo(address: string): Promise<SeiWallet | null> {
//     try {
//       // Support Ethereum-style addresses
//       if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
//         // Fetch real wallet info from SeiStream API
//         const response = await fetch(`${SEISTREAM_API_ENDPOINT}/accounts/${address}`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
//         if (data && data.account) {
//           return {
//             address: data.account.address,
//             balance: data.account.balance?.amount?.toString() || '0',
//             sequence: data.account.sequence?.toString() || '0',
//             accountNumber: data.account.account_number?.toString() || '0'
//           };
//         } else {
//           // Fallback to mock data if account not found
//           return {
//             address,
//             balance: (Math.random() * 1000000000).toString(),
//             sequence: Math.floor(Math.random() * 1000).toString(),
//             accountNumber: Math.floor(Math.random() * 10000).toString()
//           };
//         }
//       }
 
//       throw new Error('Invalid address format or account not found.');
//     } catch (error) {
//       console.error('Failed to get wallet info:', error);
//       // Fallback to mock data if there's an error
//       return {
//         address,
//         balance: (Math.random() * 1000000000).toString(),
//         sequence: Math.floor(Math.random() * 1000).toString(),
//         accountNumber: Math.floor(Math.random() * 10000).toString()
//       };
//     }
//   }

//   static async getRecentBlocks(limit: number = 5): Promise<SeiBlock[]> {
//     try {
//       // Fetch recent blocks from SeiStream API
//       const response = await fetch(`${SEISTREAM_API_ENDPOINT}/blocks?limit=${limit}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data && data.blocks) {
//         return data.blocks.map((block: {
//           height: string;
//           block_hash: string;
//           timestamp: string;
//           tx_count: number;
//           proposer: string;
//         }) => ({
//           height: block.height,
//           hash: block.block_hash,
//           timestamp: block.timestamp,
//           transactions: block.tx_count,
//           proposer: block.proposer || ''
//         }));
//       }
      
//       // Fallback to mock data if real data is not available
//       return this.getMockBlocks(limit);
//     } catch (error) {
//       console.error('Failed to get recent blocks:', error);
//       // Fallback to mock data if there's an error
//       return this.getMockBlocks(limit);
//     }
//   }

//   static async getRecentTransactions(limit: number = 10): Promise<SeiTransaction[]> {
//     try {
//       // Fetch recent transactions from SeiStream API
//       const response = await fetch(`${SEISTREAM_API_ENDPOINT}/transactions?limit=${limit}`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data && data.transactions) {
//         return data.transactions.map((tx: {
//           tx_hash: string;
//           height: string;
//           timestamp: string;
//           gas_used: number;
//           gas_wanted: number;
//           fee: {
//             amount: string;
//           };
//           memo: string;
//           messages: unknown[];
//         }) => ({
//           hash: tx.tx_hash,
//           height: tx.height,
//           timestamp: tx.timestamp,
//           gasUsed: tx.gas_used?.toString() || '0',
//           gasWanted: tx.gas_wanted?.toString() || '0',
//           fee: tx.fee?.amount?.toString() || '0',
//           memo: tx.memo || '',
//           messages: tx.messages || []
//         }));
//       }
      
//       // Fallback to mock data if real data is not available
//       return this.getMockTransactions(limit);
//     } catch (error) {
//       console.error('Failed to get recent transactions:', error);
//       // Fallback to mock data if there's an error
//       return this.getMockTransactions(limit);
//     }
//   }

//   static async searchByAddress(query: string): Promise<{ type: string; data: SeiWallet | SeiTransaction } | null> {
//     try {
//       if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
//         const wallet = await this.getWalletInfo(query);
//         if (wallet) return { type: 'wallet', data: wallet };
//       }

//       const tx = await this.getTransaction(query);
//       if (tx) return { type: 'transaction', data: tx };

//       return null;
//     } catch (error) {
//       console.error('Search failed:', error);
//       return null;
//     }
//   }

//   // Fetch SEI price data from CoinGecko
//   static async getSeiPrice(): Promise<SeiPriceData | null> {
//     try {
//       const response = await fetch(`${COINGECKO_API_ENDPOINT}/simple/price?ids=sei-network&vs_currencies=usd&include_24hr_change=true`);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       if (data && data['sei-network']) {
//         return {
//           usd: data['sei-network'].usd,
//           usd_24h_change: data['sei-network'].usd_24h_change
//         };
//       }
      
//       return null;
//     } catch (error) {
//       console.error('Failed to get SEI price:', error);
//       return null;
//     }
//   }
// }


// --- API Endpoints ---

const SEISTREAM_API = 'http://localhost:3001'; 
const COINGECKO_API = 'https://api.coingecko.com/api/v3';



// --- Interfaces ---
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
  type: ContractType;
  name?: string;
  timestamp?: string;
  verified?: boolean;
  [key: string]: any;
}

export interface SeiWallet {
  address: string;
  balance: string;
}

export interface SeiPriceData {
  usd: number;
  usd_24h_change: number;
}

export class BlockchainService {
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
        // ✅ handle case where proposer is object
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

  /** Get wallet info */
  static async getWalletInfo(address: string): Promise<SeiWallet | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/search/${address}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      return {
        address,
        balance: data.balance || '0'
      };
    } catch (err) {
      console.error(`getWalletInfo(${address}) error:`, err);
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
  private static extractArray(body: any): any[] {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.contracts)) return body.contracts;
    if (Array.isArray(body.items)) return body.items;
    return [];
  }

  // Get contracts by type
  static async getContracts(type: ContractType, limit = 50): Promise<SeiContract[]> {
    try {
      const res = await fetch(`${SEISTREAM_API}/contracts/${type}?limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const arr = this.extractArray(body);
      return arr.map((c: any) => ({
        address: c.address || c.contract_address || c.addr || '',
        creator: c.creator || c.creator_address || c.deployer || c.creator || '',
        type,
        name: c.name || c.label || undefined,
        timestamp: c.timestamp || c.time || c.deployed_at || undefined,
        verified:
          c.verified === true ||
          c.is_verified === true ||
          c.verification_status === 'verified' ||
          Boolean(c.verified_at) ||
          false,
        ...c
      }));
    } catch (err) {
      console.error(`getContracts(${type}) error:`, err);
      return [];
    }
  }

  // Add a contract (attempts POST /contracts/{type})
  // payload should include address and optionally creator/name/timestamp etc.
  static async addContract(type: ContractType, payload: Partial<SeiContract>): Promise<SeiContract | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/contracts/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Some backends may not implement this endpoint; log full body for debugging
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status} - ${text}`);
      }

      const body = await res.json();
      const created = Array.isArray(body) ? body[0] : body;
      return {
        address: created.address || payload.address || '',
        creator: created.creator || payload.creator || '',
        type,
        name: created.name || payload.name,
        timestamp: created.timestamp || payload.timestamp,
        verified:
          created.verified === true ||
          created.is_verified === true ||
          created.verification_status === 'verified' ||
          Boolean(created.verified_at) ||
          Boolean(payload.verified) ||
          false,
        ...created
      };
    } catch (err) {
      console.error(`addContract(${type}) error:`, err);
      return null;
    }
  }

  // Remove a contract (attempts DELETE /contracts/{type}/{address})
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

  // Optional: fetch a single contract by address (if backend route exists)
  static async getContract(type: ContractType, address: string): Promise<SeiContract | null> {
    try {
      const res = await fetch(`${SEISTREAM_API}/contracts/${type}/${address}`);
      if (!res.ok) return null;
      const body = await res.json();
      const raw = Array.isArray(body) ? body[0] : body;
      return {
        address: raw.address || raw.contract_address || '',
        creator: raw.creator || raw.creator_address || '',
        type,
        name: raw.name || raw.label || undefined,
        timestamp: raw.timestamp || raw.time || raw.deployed_at || undefined,
        verified:
          raw.verified === true ||
          raw.is_verified === true ||
          raw.verification_status === 'verified' ||
          Boolean(raw.verified_at) ||
          false,
        ...raw
      };
    } catch (err) {
      console.error(`getContract(${type}, ${address}) error:`, err);
      return null;
    }
  }
}