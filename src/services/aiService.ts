import { GoogleGenerativeAI } from '@google/generative-ai';
// services/aiService.ts
import { SuspiciousActivityService } from './suspiciousActivityService';
import type { SuspiciousActivity } from './suspiciousActivityService';
import type { SeiTransaction } from './blockchainService';
import { BlockchainService } from './blockchainService';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD_nJI8HY7TKW5cMUk0hW8zVCO0tsU9m-0');

export interface WalletAnalysis {
  address: string;
  summary: string;
  riskScore: number;
  aiInsights: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface TransactionAnalysis {
  summary: string;
  riskLevel: RiskLevel;
  details?: {
    suspiciousFindings?: SuspiciousActivity[];
    gasUsed?: number;
    fee?: number;
    txHash?: string;
  };
}

export class AIService {
  static async analyzeWalletActivity(
    address: string,
    transactions: unknown[],
    balance: string
  ): Promise<WalletAnalysis> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Analyze this Sei Network wallet and provide insights:
Address: ${address}
Balance: ${balance}
Transaction Count: ${transactions.length}

Please provide a concise analysis of the wallet activity, potential risks, and any notable patterns. Focus on security implications and unusual behavior. Format your response as follows:

## Wallet Analysis
**Address**: ${address}
**Balance**: ${balance}

### Summary
[Provide a 2-3 sentence summary of the wallet's activity]

### Risk Assessment
[Risk score from 0-100, where 0 is no risk and 100 is extremely high risk]

### Key Insights
- [List 3-5 key insights about the wallet's activity]
- [Include any suspicious patterns or notable behavior]`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract risk score from response or generate a more meaningful one
      let riskScore = 50;
      const riskScoreMatch = response.match(/Risk score[:\s]*(\d+)/i);
      if (riskScoreMatch && riskScoreMatch[1]) {
        riskScore = Math.min(100, Math.max(0, parseInt(riskScoreMatch[1])));
      } else {
        // Generate a more meaningful risk score based on wallet activity
        const balanceNum = parseFloat(balance) || 0;
        riskScore = Math.min(100, Math.floor(balanceNum / 1000000)); // Simple heuristic
      }
      
      // Extract insights from response
      const insights: string[] = [];
      const insightsMatch = response.match(/### Key Insights\s*([\s\S]*?)(?:\n##|\n$)/i);
      if (insightsMatch && insightsMatch[1]) {
        const insightsText = insightsMatch[1].trim();
        insights.push(...insightsText.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim()));
      }
      
      if (insights.length === 0) {
        insights.push("Analysis completed successfully");
      }
      
      return {
        address,
        summary: response,
        riskScore,
        aiInsights: insights
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        address,
        summary: 'Analysis unavailable due to an error. Please try again later.',
        riskScore: 50,
        aiInsights: ['AI service temporarily unavailable: ' + (error instanceof Error ? error.message : 'Unknown error')]
      };
    }
  }

  static async analyzeTransaction(hashOrTx: string | SeiTransaction): Promise<TransactionAnalysis> {
    try {
      let tx: SeiTransaction | null = null;
      if (typeof hashOrTx === 'string') {
        tx = await BlockchainService.getTransaction(hashOrTx);
        // If backend didn't return tx, we still proceed with a minimal object
      } else {
        tx = hashOrTx;
      }

      if (!tx) {
        // fallback minimal analysis
        return {
          summary: 'Transaction details unavailable for full analysis.',
          riskLevel: 'medium',
          details: { txHash: typeof hashOrTx === 'string' ? hashOrTx : '' }
        };
      }

      // Run the rule-based suspicious detection to get findings
      const findings = await SuspiciousActivityService.analyzeTransaction(tx);

      // Heuristic scoring: each high = 3, medium = 2, low = 1
      let score = 0;
      for (const f of findings) {
        score += f.severity === 'high' ? 3 : f.severity === 'medium' ? 2 : 1;
      }

      // incorporate gas usage into score
      const gasUsed = Number(tx.gasUsed ?? 0);
      if (!Number.isNaN(gasUsed) && gasUsed > 1_000_000) score += 2;

      let riskLevel: RiskLevel = 'low';
      if (score >= 6) riskLevel = 'high';
      else if (score >= 3) riskLevel = 'medium';

      // Build a human-friendly summary
      const summaryParts: string[] = [];
      if (findings.length === 0) summaryParts.push('No immediate suspicious rule matches were found.');
      else {
        summaryParts.push(`${findings.length} suspicious pattern(s) detected:`);
        for (const f of findings.slice(0, 5)) {
          summaryParts.push(`• ${f.description} (confidence ${(f.confidence * 100).toFixed(0)}%)`);
        }
      }

      const summary = summaryParts.join('\n');

      return {
        summary,
        riskLevel,
        details: {
          suspiciousFindings: findings,
          gasUsed,
          fee: Number(tx.fee ?? 0),
          txHash: tx.hash
        }
      };
    } catch (err) {
      console.error('AIService.analyzeTransaction error:', err);
      return {
        summary: 'AI analysis failed or encountered an error.',
        riskLevel: 'medium'
      };
    }
  }
  
} 