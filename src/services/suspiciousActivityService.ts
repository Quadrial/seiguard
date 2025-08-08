export interface SuspiciousActivity {
  type: 'high_gas' | 'unusual_frequency' | 'contract_interaction' | 'large_transfer' | 'unknown_contract';
  severity: 'low' | 'medium' | 'high';
  description: string;
  confidence: number;
  recommendations: string[];
}

export interface ActivityRule {
  id: string;
  name: string;
  description: string;
  check: (data: any) => SuspiciousActivity | null;
}

export class SuspiciousActivityService {
  private static rules: ActivityRule[] = [
    {
      id: 'high_gas_usage',
      name: 'High Gas Usage',
      description: 'Detects transactions with unusually high gas consumption',
      check: (tx: any) => {
        const gasUsed = parseInt(tx.gasUsed || '0');
        const gasWanted = parseInt(tx.gasWanted || '0');
        
        if (gasUsed > 500000 || gasWanted > 600000) {
          return {
            type: 'high_gas',
            severity: gasUsed > 1000000 ? 'high' : 'medium',
            description: `Unusually high gas usage: ${gasUsed} used, ${gasWanted} wanted`,
            confidence: 0.85,
            recommendations: [
              'Review transaction for potential contract exploits',
              'Check if this is a legitimate complex operation',
              'Monitor for similar patterns'
            ]
          };
        }
        return null;
      }
    },
    {
      id: 'unusual_frequency',
      name: 'Unusual Transaction Frequency',
      description: 'Detects wallets with unusually high transaction frequency',
      check: (walletData: any) => {
        const txCount = walletData.transactionCount || 0;
        const timeWindow = walletData.timeWindow || 3600; // 1 hour in seconds
        const txPerHour = txCount / (timeWindow / 3600);
        
        if (txPerHour > 50) {
          return {
            type: 'unusual_frequency',
            severity: txPerHour > 100 ? 'high' : 'medium',
            description: `Unusual transaction frequency: ${txPerHour.toFixed(2)} tx/hour`,
            confidence: 0.75,
            recommendations: [
              'Check for automated trading or bot activity',
              'Verify if this is legitimate high-frequency trading',
              'Monitor for potential spam or attack patterns'
            ]
          };
        }
        return null;
      }
    },
    {
      id: 'contract_interaction',
      name: 'Suspicious Contract Interaction',
      description: 'Detects interactions with potentially suspicious contracts',
      check: (tx: any) => {
        const messages = tx.messages || [];
        const contractInteractions = messages.filter((msg: any) => 
          msg.typeUrl?.includes('wasm') || 
          msg.typeUrl?.includes('cosmwasm') ||
          msg.contract
        );
        
        if (contractInteractions.length > 0) {
          return {
            type: 'contract_interaction',
            severity: 'medium',
            description: `Contract interaction detected: ${contractInteractions.length} contract calls`,
            confidence: 0.70,
            recommendations: [
              'Verify contract address legitimacy',
              'Check contract source code if available',
              'Review transaction parameters carefully'
            ]
          };
        }
        return null;
      }
    },
    {
      id: 'large_transfer',
      name: 'Large Value Transfer',
      description: 'Detects unusually large value transfers',
      check: (tx: any) => {
        const messages = tx.messages || [];
        const transfers = messages.filter((msg: any) => 
          msg.typeUrl?.includes('bank') || 
          msg.typeUrl?.includes('transfer')
        );
        
        for (const transfer of transfers) {
          const amount = transfer.value?.amount?.[0]?.amount || '0';
          const denom = transfer.value?.amount?.[0]?.denom || '';
          
          // Check for large SEI transfers (more than 1000 SEI)
          if (denom === 'usei' && parseInt(amount) > 1000000000) { // 1000 SEI in usei
            return {
              type: 'large_transfer',
              severity: parseInt(amount) > 10000000000 ? 'high' : 'medium', // 10,000 SEI
              description: `Large transfer detected: ${(parseInt(amount) / 1000000).toFixed(2)} SEI`,
              confidence: 0.80,
              recommendations: [
                'Verify recipient address carefully',
                'Check if this is expected behavior',
                'Monitor for potential theft or fraud'
              ]
            };
          }
        }
        return null;
      }
    },
    {
      id: 'unknown_contract',
      name: 'Unknown Contract Interaction',
      description: 'Detects interactions with contracts not in known safe list',
      check: (tx: any) => {
        const knownContracts = [
          // Add known safe contract addresses here
          'sei1...', // Example safe contract
        ];
        
        const messages = tx.messages || [];
        const contractAddresses = messages
          .filter((msg: any) => msg.contract || msg.contractAddress)
          .map((msg: any) => msg.contract || msg.contractAddress);
        
        const unknownContracts = contractAddresses.filter(
          (addr: string) => !knownContracts.includes(addr)
        );
        
        if (unknownContracts.length > 0) {
          return {
            type: 'unknown_contract',
            severity: 'medium',
            description: `Unknown contract interaction: ${unknownContracts.join(', ')}`,
            confidence: 0.65,
            recommendations: [
              'Research contract address thoroughly',
              'Check contract verification status',
              'Review contract source code if available',
              'Be cautious with unknown contracts'
            ]
          };
        }
        return null;
      }
    }
  ];

  static async analyzeTransaction(transaction: any): Promise<SuspiciousActivity[]> {
    const suspiciousActivities: SuspiciousActivity[] = [];
    
    for (const rule of this.rules) {
      try {
        const result = rule.check(transaction);
        if (result) {
          suspiciousActivities.push(result);
        }
      } catch (error) {
        console.error(`Error applying rule ${rule.id}:`, error);
      }
    }
    
    return suspiciousActivities;
  }

  static async analyzeWallet(walletData: any): Promise<SuspiciousActivity[]> {
    const suspiciousActivities: SuspiciousActivity[] = [];
    
    // Apply wallet-specific rules
    for (const rule of this.rules) {
      if (rule.id === 'unusual_frequency') {
        try {
          const result = rule.check(walletData);
          if (result) {
            suspiciousActivities.push(result);
          }
        } catch (error) {
          console.error(`Error applying rule ${rule.id}:`, error);
        }
      }
    }
    
    return suspiciousActivities;
  }

  static getRiskScore(activities: SuspiciousActivity[]): number {
    if (activities.length === 0) return 0;
    
    const severityWeights = {
      low: 1,
      medium: 2,
      high: 3
    };
    
    const totalWeight = activities.reduce((sum, activity) => {
      return sum + (severityWeights[activity.severity] * activity.confidence);
    }, 0);
    
    return Math.min(100, Math.round((totalWeight / activities.length) * 33.33));
  }

  static getOverallRiskLevel(activities: SuspiciousActivity[]): 'low' | 'medium' | 'high' {
    const score = this.getRiskScore(activities);
    
    if (score < 30) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  }
} 