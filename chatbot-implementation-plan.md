# SeiGuard AI Chatbot Implementation Plan

## Overview
This document outlines the implementation plan for the AI-based chatbot functionality for the Sei blockchain explorer. The chatbot will function similarly to the existing explorer but use AI to answer user questions about the Sei Network blockchain.

## Component Structure

The Chatbot component will be implemented as a React functional component using TypeScript and Tailwind CSS for styling. It will integrate with the existing AIService and BlockchainService to provide blockchain-specific AI responses.

## Dependencies

- React (useState, useRef, useEffect)
- AIService from '../services/aiService'
- BlockchainService from '../services/blockchainService'
- React Icons (FaPaperPlane, FaRobot, FaUser, FaTrash, FaSpinner)

## State Management

The component will manage the following state:
- `messages`: Array of chat messages with role (user/ai), content, and timestamp
- `inputValue`: Current text in the input field
- `isLoading`: Boolean indicating if AI is processing a request
- `error`: Error message if AI request fails

## UI Components

1. **Message History Container**
   - Scrollable div to display conversation
   - Different styling for user vs AI messages
   - Loading indicator when AI is processing
   - Auto-scroll to newest message

2. **Input Area**
   - Textarea for multi-line input
   - Send button
   - Clear chat button
   - Character counter

## Implementation Details

### Message Interface
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}
```

### Main Component Structure
```tsx
import React, { useState, useRef, useEffect } from 'react';
import { AIService } from '../services/aiService';
import { BlockchainService } from '../services/blockchainService';
import { FaPaperPlane, FaRobot, FaUser, FaTrash, FaSpinner } from 'react-icons/fa';

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
    // Wallet address query
    if (/^0x[a-fA-F0-9]{40}$/.test(query)) {
      const result = await BlockchainService.searchByAddress(query);
      if (result?.type === 'wallet') {
        const analysis = await AIService.analyzeWalletActivity(
          result.data.address,
          [],
          result.data.balance
        );
        return analysis.summary;
      }
      return "I found a wallet address but couldn't retrieve detailed information.";
    }
    
    // Transaction hash query
    if (/^[0-9a-f]{64}$/.test(query)) {
      const analysis = await AIService.analyzeTransaction(query);
      return analysis.summary;
    }
    
    // Block number query
    if (/^\d+$/.test(query)) {
      const block = await BlockchainService.getBlock(parseInt(query, 10));
      if (block) {
        return `Block #${block.height} has ${block.transactions} transactions and was proposed by ${block.proposer.substring(0, 12)}...`;
      }
      return "I couldn't find information about that block.";
    }
    
    // General AI query
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyD_nJI8HY7TKW5cMUk0hW8zVCO0tsU9m-0');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `You are an AI assistant for the Sei Network blockchain. Answer the following question about Sei Network, blockchain technology, or cryptocurrency in general:
    
    Question: ${query}
    
    Please provide a concise and accurate response.`;
    
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
                    </ul>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-sm">
                    <p className="font-semibold">Example queries:</p>
                    <ul className