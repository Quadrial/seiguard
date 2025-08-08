import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD_nJI8HY7TKW5cMUk0hW8zVCO0tsU9m-0');

export interface WalletAnalysis {
  address: string;
  summary: string;
  riskScore: number;
  aiInsights: string[];
}

export interface TransactionAnalysis {
  txHash: string;
  summary: string;
  riskLevel: 'low' | 'medium' | 'high';
  suspiciousIndicators: string[];
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

  static async analyzeTransaction(txHash: string): Promise<TransactionAnalysis> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Analyze this Sei Network transaction for suspicious activity:
Transaction Hash: ${txHash}

Please provide a detailed analysis of the transaction, focusing on:
1. Transaction type and purpose
2. Potential security risks
3. Any suspicious patterns or indicators
4. Risk level assessment (low/medium/high)

Format your response as follows:

## Transaction Analysis
**Hash**: ${txHash}

### Summary
[Provide a 2-3 sentence summary of the transaction]

### Risk Level
[low/medium/high with explanation]

### Key Indicators
- [List 3-5 key indicators about the transaction]
- [Include any suspicious patterns or notable behavior]`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract risk level from response
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (response.toLowerCase().includes('high')) {
        riskLevel = 'high';
      } else if (response.toLowerCase().includes('medium')) {
        riskLevel = 'medium';
      }
      
      // Extract indicators from response
      const indicators: string[] = [];
      const indicatorsMatch = response.match(/### Key Indicators\s*([\s\S]*?)(?:\n##|\n$)/i);
      if (indicatorsMatch && indicatorsMatch[1]) {
        const indicatorsText = indicatorsMatch[1].trim();
        indicators.push(...indicatorsText.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.trim().substring(1).trim()));
      }
      
      if (indicators.length === 0) {
        indicators.push("Analysis completed successfully");
      }
      
      return {
        txHash,
        summary: response,
        riskLevel,
        suspiciousIndicators: indicators
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        txHash,
        summary: 'Analysis unavailable due to an error. Please try again later.',
        riskLevel: 'low',
        suspiciousIndicators: ['AI service unavailable: ' + (error instanceof Error ? error.message : 'Unknown error')]
      };
    }
  }
} 