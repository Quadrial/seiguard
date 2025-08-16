// export interface SuspiciousActivity {
//   type: 'high_gas' | 'unusual_frequency' | 'contract_interaction' | 'large_transfer' | 'unknown_contract';
//   severity: 'low' | 'medium' | 'high';
//   description: string;
//   confidence: number;
//   recommendations: string[];
// }

// export interface ActivityRule {
//   id: string;
//   name: string;
//   description: string;
//   check: (data: any) => SuspiciousActivity | null;
// }

// export class SuspiciousActivityService {
//   private static rules: ActivityRule[] = [
//     {
//       id: 'high_gas_usage',
//       name: 'High Gas Usage',
//       description: 'Detects transactions with unusually high gas consumption',
//       check: (tx: any) => {
//         const gasUsed = parseInt(tx.gasUsed || '0');
//         const gasWanted = parseInt(tx.gasWanted || '0');
        
//         if (gasUsed > 500000 || gasWanted > 600000) {
//           return {
//             type: 'high_gas',
//             severity: gasUsed > 1000000 ? 'high' : 'medium',
//             description: `Unusually high gas usage: ${gasUsed} used, ${gasWanted} wanted`,
//             confidence: 0.85,
//             recommendations: [
//               'Review transaction for potential contract exploits',
//               'Check if this is a legitimate complex operation',
//               'Monitor for similar patterns'
//             ]
//           };
//         }
//         return null;
//       }
//     },
//     {
//       id: 'unusual_frequency',
//       name: 'Unusual Transaction Frequency',
//       description: 'Detects wallets with unusually high transaction frequency',
//       check: (walletData: any) => {
//         const txCount = walletData.transactionCount || 0;
//         const timeWindow = walletData.timeWindow || 3600; // 1 hour in seconds
//         const txPerHour = txCount / (timeWindow / 3600);
        
//         if (txPerHour > 50) {
//           return {
//             type: 'unusual_frequency',
//             severity: txPerHour > 100 ? 'high' : 'medium',
//             description: `Unusual transaction frequency: ${txPerHour.toFixed(2)} tx/hour`,
//             confidence: 0.75,
//             recommendations: [
//               'Check for automated trading or bot activity',
//               'Verify if this is legitimate high-frequency trading',
//               'Monitor for potential spam or attack patterns'
//             ]
//           };
//         }
//         return null;
//       }
//     },
//     {
//       id: 'contract_interaction',
//       name: 'Suspicious Contract Interaction',
//       description: 'Detects interactions with potentially suspicious contracts',
//       check: (tx: any) => {
//         const messages = tx.messages || [];
//         const contractInteractions = messages.filter((msg: any) => 
//           msg.typeUrl?.includes('wasm') || 
//           msg.typeUrl?.includes('cosmwasm') ||
//           msg.contract
//         );
        
//         if (contractInteractions.length > 0) {
//           return {
//             type: 'contract_interaction',
//             severity: 'medium',
//             description: `Contract interaction detected: ${contractInteractions.length} contract calls`,
//             confidence: 0.70,
//             recommendations: [
//               'Verify contract address legitimacy',
//               'Check contract source code if available',
//               'Review transaction parameters carefully'
//             ]
//           };
//         }
//         return null;
//       }
//     },
//     {
//       id: 'large_transfer',
//       name: 'Large Value Transfer',
//       description: 'Detects unusually large value transfers',
//       check: (tx: any) => {
//         const messages = tx.messages || [];
//         const transfers = messages.filter((msg: any) => 
//           msg.typeUrl?.includes('bank') || 
//           msg.typeUrl?.includes('transfer')
//         );
        
//         for (const transfer of transfers) {
//           const amount = transfer.value?.amount?.[0]?.amount || '0';
//           const denom = transfer.value?.amount?.[0]?.denom || '';
          
//           // Check for large SEI transfers (more than 1000 SEI)
//           if (denom === 'usei' && parseInt(amount) > 1000000000) { // 1000 SEI in usei
//             return {
//               type: 'large_transfer',
//               severity: parseInt(amount) > 10000000000 ? 'high' : 'medium', // 10,000 SEI
//               description: `Large transfer detected: ${(parseInt(amount) / 1000000).toFixed(2)} SEI`,
//               confidence: 0.80,
//               recommendations: [
//                 'Verify recipient address carefully',
//                 'Check if this is expected behavior',
//                 'Monitor for potential theft or fraud'
//               ]
//             };
//           }
//         }
//         return null;
//       }
//     },
//     {
//       id: 'unknown_contract',
//       name: 'Unknown Contract Interaction',
//       description: 'Detects interactions with contracts not in known safe list',
//       check: (tx: any) => {
//         const knownContracts = [
//           // Add known safe contract addresses here
//           'sei1...', // Example safe contract
//         ];
        
//         const messages = tx.messages || [];
//         const contractAddresses = messages
//           .filter((msg: any) => msg.contract || msg.contractAddress)
//           .map((msg: any) => msg.contract || msg.contractAddress);
        
//         const unknownContracts = contractAddresses.filter(
//           (addr: string) => !knownContracts.includes(addr)
//         );
        
//         if (unknownContracts.length > 0) {
//           return {
//             type: 'unknown_contract',
//             severity: 'medium',
//             description: `Unknown contract interaction: ${unknownContracts.join(', ')}`,
//             confidence: 0.65,
//             recommendations: [
//               'Research contract address thoroughly',
//               'Check contract verification status',
//               'Review contract source code if available',
//               'Be cautious with unknown contracts'
//             ]
//           };
//         }
//         return null;
//       }
//     }
//   ];

//   static async analyzeTransaction(transaction: any): Promise<SuspiciousActivity[]> {
//     const suspiciousActivities: SuspiciousActivity[] = [];
    
//     for (const rule of this.rules) {
//       try {
//         const result = rule.check(transaction);
//         if (result) {
//           suspiciousActivities.push(result);
//         }
//       } catch (error) {
//         console.error(`Error applying rule ${rule.id}:`, error);
//       }
//     }
    
//     return suspiciousActivities;
//   }

//   static async analyzeWallet(walletData: any): Promise<SuspiciousActivity[]> {
//     const suspiciousActivities: SuspiciousActivity[] = [];
    
//     // Apply wallet-specific rules
//     for (const rule of this.rules) {
//       if (rule.id === 'unusual_frequency') {
//         try {
//           const result = rule.check(walletData);
//           if (result) {
//             suspiciousActivities.push(result);
//           }
//         } catch (error) {
//           console.error(`Error applying rule ${rule.id}:`, error);
//         }
//       }
//     }
    
//     return suspiciousActivities;
//   }

//   static getRiskScore(activities: SuspiciousActivity[]): number {
//     if (activities.length === 0) return 0;
    
//     const severityWeights = {
//       low: 1,
//       medium: 2,
//       high: 3
//     };
    
//     const totalWeight = activities.reduce((sum, activity) => {
//       return sum + (severityWeights[activity.severity] * activity.confidence);
//     }, 0);
    
//     return Math.min(100, Math.round((totalWeight / activities.length) * 33.33));
//   }

//   static getOverallRiskLevel(activities: SuspiciousActivity[]): 'low' | 'medium' | 'high' {
//     const score = this.getRiskScore(activities);
    
//     if (score < 30) return 'low';
//     if (score < 70) return 'medium';
//     return 'high';
//   }
// } 

// services/suspiciousActivityService.ts

import { BlockchainService } from './blockchainService';
import type { SeiTransaction } from './blockchainService';

export type Severity = 'low' | 'medium' | 'high';

export interface SuspiciousActivity {
  description: string;
  severity: Severity;
  confidence: number; // 0..1
  recommendations: string[];
  metadata?: Record<string, any>;
}

/**
 * Heuristic rule-based suspicious activity detector.
 * Uses transaction object shape similar to BlockchainService.getRecentTransactions / getTransaction.
 */
export class SuspiciousActivityService {
  // thresholds (tweak to fit on-chain units)
  private static HIGH_GAS_THRESHOLD = 800000; // raw gas units
  private static LARGE_TRANSFER_THRESHOLD_MICROSEI = 1_000_000_000; // 1e9 usei = 1000 SEI (example)

  /**
   * Analyze a transaction and return array of detected suspicious activities (may be empty).
   * Accepts either a transaction object or minimal shape expected.
   */
  static async analyzeTransaction(tx: SeiTransaction | any): Promise<SuspiciousActivity[]> {
    const findings: SuspiciousActivity[] = [];

    try {
      // Normalize common fields
      const gasUsed = Number(tx.gasUsed ?? tx.gas_used ?? tx.gas ?? 0);
      const gasWanted = Number(tx.gasWanted ?? tx.gas_wanted ?? 0);
      const fee = Number(tx.fee ?? tx.fee_amount ?? 0);
      const messages = tx.messages ?? tx.msgs ?? [];
      const txHash = tx.hash ?? tx.tx_hash ?? tx.txHash ?? '';

      // Rule: High Gas Usage
      if (!Number.isNaN(gasUsed) && gasUsed > this.HIGH_GAS_THRESHOLD) {
        const confidence = Math.min(0.9, Math.log10(gasUsed) / 6); // heuristic confidence
        findings.push({
          description: `High gas usage (${gasUsed.toLocaleString()} units)`,
          severity: 'medium',
          confidence,
          recommendations: [
            'Inspect contract logic called by this transaction',
            'Check whether gas spike correlates with complex contract calls or DoS attempts',
            'If repeated, consider rate-limiting or alerting'
          ],
          metadata: { txHash, gasUsed, gasWanted, fee }
        });
      }

      // Rule: Large Transfers (Cosmos-style messages)
      for (const msg of messages) {
        // Cosmos MsgSend or bank.v1beta1.MsgSend
        if (msg?.value?.amount && Array.isArray(msg.value.amount)) {
          for (const amount of msg.value.amount) {
            const amt = Number(amount.amount ?? amount);
            const denom = amount.denom ?? 'unknown';
            if (!Number.isNaN(amt) && denom === 'usei' && amt >= this.LARGE_TRANSFER_THRESHOLD_MICROSEI) {
              findings.push({
                description: `Large transfer detected: ${amt.toLocaleString()} ${denom}`,
                severity: 'high',
                confidence: 0.95,
                recommendations: [
                  'Verify recipient address and intent of transfer',
                  'Check on-chain history of recipient for mixers or known bad actors',
                  'Consider temporary freezing of funds (if custodial) and manual review'
                ],
                metadata: { txHash, amount: amt, denom }
              });
            }
          }
        }

        // EVM-style transfers might be present in logs/value fields
        if (msg?.value && (msg.value.amount || msg.value.value)) {
          const rawAmt = msg.value.amount ?? msg.value.value;
          const amt = Number(rawAmt);
          if (!Number.isNaN(amt) && amt > 0 && amt >= this.LARGE_TRANSFER_THRESHOLD_MICROSEI) {
            findings.push({
              description: `Large value transfer in message (${amt.toLocaleString()})`,
              severity: 'high',
              confidence: 0.9,
              recommendations: [
                'Confirm purpose of transfer',
                'Check whether transfer goes to an EOA or contract (contract may be siphoning funds)'
              ],
              metadata: { txHash, amount: amt }
            });
          }
        }

        // Contract interaction patterns
        const typeUrl = msg?.typeUrl ?? msg?.type ?? '';
        if (typeof typeUrl === 'string' && (typeUrl.toLowerCase().includes('execute') || typeUrl.toLowerCase().includes('executecontract') || typeUrl.toLowerCase().includes('wasm'))) {
          findings.push({
            description: `Contract interaction detected (${typeUrl})`,
            severity: 'medium',
            confidence: 0.75,
            recommendations: [
              'Inspect contract address and verify it is known/verified',
              'Review function signature and parameters for suspicious behavior (e.g., approvals, transfers)'
            ],
            metadata: { txHash, typeUrl }
          });
        }

        // Unknown contract detection: if message references a contract address, check verification
        const contractAddr = msg?.value?.contract || msg?.value?.contract_address || msg?.contract;
        if (contractAddr) {
          // Try to query contract details (best-effort, may be slow)
          try {
            // We don't know whether it's evm or cosmos. Try both.
            // First evm:
            const evm = await BlockchainService.getContract('evm', contractAddr).catch(() => null);
            const cosmos = await BlockchainService.getContract('cosmos', contractAddr).catch(() => null);
            const found = evm ?? cosmos;
            if (!found || !found.verified) {
              findings.push({
                description: `Interaction with unverified contract ${contractAddr}`,
                severity: 'high',
                confidence: 0.9,
                recommendations: [
                  'Treat funds interaction with unverified contract as risky',
                  'Avoid interacting further until contract source is verified',
                  'Check community reports (discord/telegram/twitter) for this contract'
                ],
                metadata: { txHash, contractAddr, found }
              });
            }
          } catch {
            // ignore external lookup failures
          }
        }
      }

      // Rule: suspicious patterns in raw memo or fee
      if (tx?.memo && typeof tx.memo === 'string') {
        const memo = tx.memo.toLowerCase();
        if (memo.includes('swap') || memo.includes('phish') || memo.includes('drain')) {
          findings.push({
            description: `Suspicious memo content: ${tx.memo}`,
            severity: 'low',
            confidence: 0.6,
            recommendations: ['Inspect memo for phishing hints or automated scripts', 'Cross-check inbound/outbound addresses']
          });
        }
      }

      // If no findings, optionally return an empty array
      return findings;
    } catch (err) {
      console.error('SuspiciousActivityService.analyzeTransaction error:', err);
      return [];
    }
  }
}