import React, { useState, useRef, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { BlockchainService } from '../services/blockchainService';
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaSpinner } from 'react-icons/fa';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Handle sending messages
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Process the query based on its type
      const response = await processQuery(inputValue.trim());
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get response from AI. Please try again.');
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process different types of queries
  const processQuery = async (query: string): Promise<string> => {
    // Sei native address query
    if (/^sei1[0-9a-zA-Z]{38}$/.test(query)) {
      // For now, we'll treat this as a wallet address
      // In a real implementation, you might want to check if it's a validator or other type
      const walletData = await BlockchainService.getWalletInfo(query);
      if (walletData) {
        const analysis = await AIService.analyzeWalletActivity(
          walletData.address,
          [],
          walletData.balance
        );
        return analysis.summary;
      }
      return "I couldn't find information about that Sei address.";
    }
    
    // Wallet or contract address query (Ethereum-style)
    if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
      const walletData = await BlockchainService.getWalletInfo(query);
      if (walletData) {
        const analysis = await AIService.analyzeWalletActivity(
          walletData.address,
          [],
          walletData.balance
        );
        return analysis.summary;
      }
      return "I couldn't find information about that wallet or contract address.";
    }
    
    // Transaction hash query
    if (/^[0-9a-f]{64}$/.test(query)) {
      const txData = await BlockchainService.getTransaction(query);
      if (txData) {
        const analysis = await AIService.analyzeTransaction(query);
        return analysis.summary;
      }
      return "I couldn't find information about that transaction.";
    }
    
    // Block number query
    if (/^\d+$/.test(query)) {
      const block = await BlockchainService.getBlock(parseInt(query, 10));
      if (block) {
        return `Block #${block.height} has ${block.transactions} transactions and was proposed by ${block.proposer || 'unknown proposer'}.`;
      }
      return "I couldn't find information about that block.";
    }
    
    // SEI price query
    if (query.toLowerCase().includes('price') || query.toLowerCase().includes('sei')) {
      const priceData = await BlockchainService.getSeiPrice();
      if (priceData) {
        return `The current price of SEI is $${priceData.usd.toFixed(4)} with a 24h change of ${priceData.usd_24h_change.toFixed(2)}%.`;
      }
    }
    
    // General AI query
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD_nJI8HY7TKW5cMUk0hW8zVCO0tsU9m-0');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an AI assistant for the Sei Network blockchain. Answer the following question about Sei Network, blockchain technology, or cryptocurrency in general:
    
    Question: ${query}
    
    Please provide a concise and accurate response. Structure your answer with clear headings if appropriate, and limit your response to 3-4 key points when possible.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  };
  
  // Clear chat history
  const handleClearChat = () => {
    setMessages([]);
    setError(null);
  };
  
  // Handle Enter key press (without Shift)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <main className="mt-10 px-4 sm:px-6 lg:px-8 text-white font-sans">
      {/* Header Section */}
      <section className="border rounded-full bg-gradient-to-r from-pink-600 to-purple-600 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">SeiGuard AI Chatbot</h1>
            <h2 className="text-sm">Ask me anything about Sei Network</h2>
          </div>
        </div>
      </section>
      
      {/* Chat Container */}
      <section className="max-w-4xl mx-auto">
        <div className="bg-[#111827] rounded-xl shadow-md p-4 h-[600px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaRobot className="text-4xl mb-4" />
                <p className="text-center">Hello! I'm your Sei Network AI assistant. Ask me about wallets, transactions, blocks, or general blockchain questions.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                  <div className="bg-gray-700 rounded-lg p-3 text-sm">
                    <p className="font-semibold">Try asking:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>What is Sei Network?</li>
                      <li>How do I check a wallet balance?</li>
                      <li>Analyze this wallet: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-sm">
                    <p className="font-semibold">Example queries:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>What is a blockchain?</li>
                      <li>Check transaction: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef</li>
                      <li>Block 1234567</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 rounded-br-none'
                      : 'bg-gray-700 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <FaUser className="text-sm" />
                    ) : (
                      <FaRobot className="text-sm" />
                    )}
                    <span className="text-xs font-semibold">
                      {message.role === 'user' ? 'You' : 'SeiGuard AI'}
                    </span>
                    <span className="text-xs text-gray-300">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-lg rounded-bl-none p-4 max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <FaRobot className="text-sm" />
                    <span className="text-xs font-semibold">SeiGuard AI</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className="text-gray-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* Input Area */}
          <div className="flex flex-col">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about wallets, transactions, blocks, or general blockchain questions..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`h-12 w-12 flex items-center justify-center rounded-lg ${
                  inputValue.trim() && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 cursor-not-allowed'
                } transition-colors`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={handleClearChat}
                disabled={messages.length === 0 || isLoading}
                className={`text-sm flex items-center gap-1 ${
                  messages.length === 0 || isLoading
                    ? 'text-gray-500 cursor-not-allowed'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <FaTrash /> Clear Chat
              </button>
              <div className="text-xs text-gray-400">
                {inputValue.length}/1000
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Chatbot;