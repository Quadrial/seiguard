import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// ------------ Helpers (smart detection + formatting) ------------
const isSei = (s: string) => /^sei1[0-9a-z]{20,80}$/i.test(s);
const isEvm = (s: string) => /^0x[0-9a-fA-F]{40}$/.test(s);
const isTxHash = (s: string) => /^(0x)?[0-9a-fA-F]{64}$/.test(s);
const isBlockNumber = (s: string) => /^\d{1,12}$/.test(s);

const short = (s: string, left = 10, right = 8) =>
  s.length <= left + right + 3 ? s : `${s.slice(0, left)}…${s.slice(-right)}`;

const timeAgo = (ts?: string) => {
  if (!ts) return 'Unknown';
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return 'Unknown';
  const sec = Math.floor((Date.now() - t) / 1000);
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
};

const useiToSei = (v: string | number | undefined | null) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n / 1e6 : 0; // adjust if your API already returns SEI
};
const weiToSei = (v: string | number | undefined | null) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n / 1e18 : 0;
};

type Entity =
  | { kind: 'tx'; id: string }
  | { kind: 'address'; id: string }
  | { kind: 'block'; id: string }
  | null;

const extractEntity = (query: string): Entity => {
  // Prefer tx hash if present (longest token)
  const txMatch = query.match(/(0x)?[0-9a-fA-F]{64}/);
  if (txMatch) return { kind: 'tx', id: txMatch[0] };

  // Then Sei or EVM address
  const seiMatch = query.match(/sei1[0-9a-z]{20,80}/i);
  if (seiMatch) return { kind: 'address', id: seiMatch[0] };

  const evmMatch = query.match(/0x[0-9a-fA-F]{40}/);
  if (evmMatch) return { kind: 'address', id: evmMatch[0] };

  // Then block number (only if the entire query is a number or “block 123…”)
  const blockNumWord = query.match(/\bblock\s+(\d{1,12})\b/i);
  if (blockNumWord) return { kind: 'block', id: blockNumWord[1] };
  if (isBlockNumber(query.trim())) return { kind: 'block', id: query.trim() };

  return null;
};

const ensure0x64 = (h: string) => {
  if (!isTxHash(h)) return h;
  return h.startsWith('0x') ? h : `0x${h}`;
};

// ------------ Chatbot component ------------
const Chatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

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
      const response = await processQuery(inputValue.trim());
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Chatbot error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Core logic: behave like the explorer
  const processQuery = async (query: string): Promise<string> => {
    const entity = extractEntity(query);

    // If user pasted a Sei/EVM address or tx or block, produce a full summary.
    if (entity) {
      if (entity.kind === 'address') return addressSummary(entity.id, query);
      if (entity.kind === 'tx') return transactionSummary(entity.id);
      if (entity.kind === 'block') return blockSummary(entity.id);
    }

    // Otherwise: lightweight NL intent fallback (price, etc.)
    const lower = query.toLowerCase();
    if (lower.includes('price') || /\bsei\b/.test(lower)) {
      const price = await BlockchainService.getSeiPrice();
      if (price) return `SEI price: $${price.usd.toFixed(4)} (24h: ${price.usd_24h_change.toFixed(2)}%)`;
    }

    // General AI fallback
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an assistant for the Sei blockchain. Answer clearly and concisely (3-5 bullet points max).
Question: ${query}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  };

  // ----- Entity handlers -----
  const addressSummary = async (raw: string, originalQuery: string): Promise<string> => {
    let seiAddr: string | null = null;
    let evmAddr: string | null = null;

    if (isSei(raw)) {
      seiAddr = raw;
      // Best-effort to fetch corresponding 0x
      try { evmAddr = await BlockchainService.getSeiEVMAddress?.(seiAddr) ?? null; } catch (e) { console.warn('evm map error', e); }
    } else if (isEvm(raw)) {
      evmAddr = raw;
      try { seiAddr = await BlockchainService.getSeiFromEvmAddress(evmAddr); } catch (e) { console.warn('sei map error', e); }
    }

    // If we still don’t have a Sei address, try a generic search
    if (!seiAddr) {
      try {
        const s = await BlockchainService.search?.(raw);
        const found = s?.account?.address ?? s?.address ?? s?.result?.address ?? null;
        if (found && isSei(found)) seiAddr = found;
      } catch (e) { console.warn('generic search error', e); }
    }

    if (!seiAddr) {
      // EVM-only path: summarize via EVM endpoints
      if (isEvm(raw)) {
        const [assoc, evmInfo, txs, price] = await Promise.all([
          BlockchainService.getAssociatedAddress(raw),
          BlockchainService.getEvmAddressInfo(raw),
          BlockchainService.getEvmAccountTransactions(raw, 10),
          BlockchainService.getSeiPrice?.()
        ]);
        if (!seiAddr && assoc?.cosmos) seiAddr = assoc.cosmos;
        if (evmInfo) {
          type EvmInfo = { balance?: string; txsCount?: number };
          type TxLike = { hash?: string; type?: string; timestamp?: string };
          const info = evmInfo as unknown as EvmInfo;
          const balSei = weiToSei(info.balance ?? 0);
          const usdVal = price?.usd ? ` (~$${(balSei * price.usd).toFixed(2)})` : '';
          const lines: string[] = [];
          lines.push('EVM Address summary');
          lines.push(`- Address: ${raw}`);
          lines.push(`- Balance: ${balSei.toFixed(6)} SEI${usdVal}`);
          if (typeof info.txsCount === 'number') lines.push(`- Tx count: ${info.txsCount}`);
          if (txs && txs.length) {
            lines.push('- Recent transactions:');
            (txs as unknown as TxLike[]).slice(0, 5).forEach((t, i) => {
              const hash = t.hash;
              const type = t.type;
              const ts = t.timestamp;
              lines.push(`  ${i + 1}. ${short(hash ?? '', 10, 10)} • ${type ?? 'Tx'} • ${timeAgo(ts)}`);
            });
          }
          lines.push(`\nView in explorer: /address/${raw}`);
          return lines.join('\n');
        }
        // Try contract lookup as a last resort
        try {
          const c = await BlockchainService.getContract?.('evm', raw);
          if (c) return formatContractResponse(c);
        } catch (e) { console.warn('contract lookup error', e); }
      }
      return `No Sei account found for ${raw}. If this is an EVM-only address, the explorer may not have a Sei mapping.`;
    }

    // Get account details, price, and recent txs
    const [acct, price, txs, evmMaybe] = await Promise.all([
      BlockchainService.getAccountDetails(seiAddr),
      BlockchainService.getSeiPrice?.(),
      BlockchainService.getAccountTransactions?.(seiAddr, 10) ?? Promise.resolve([]),
      evmAddr ? Promise.resolve(evmAddr) : BlockchainService.getSeiEVMAddress?.(seiAddr)
    ]);

    if (!acct) return `I couldn't load details for ${seiAddr}.`;

    const available = useiToSei(acct.wallet.available);
    const delegated = useiToSei(acct.wallet.delegated);
    const unbonding = useiToSei(acct.wallet.unbonding);
    const rewards = useiToSei(acct.wallet.reward);
    const commission = useiToSei(acct.wallet.commission);
    const vesting = useiToSei(acct.wallet.vesting);
    const totalSei = available + delegated + unbonding + rewards + commission + vesting;
    const usdVal = price?.usd ? ` (~$${(totalSei * price.usd).toFixed(2)})` : '';

    const lines: string[] = [];
    lines.push('Account summary');
    lines.push(`- Address: ${seiAddr}`);
    if (evmMaybe) lines.push(`- EVM: ${evmMaybe}`);
    lines.push(`- Balance: ${totalSei.toFixed(6)} SEI${usdVal}`);
    lines.push('- Breakdown:');
    lines.push(`  • Available: ${available.toFixed(6)} SEI`);
    lines.push(`  • Delegated: ${delegated.toFixed(6)} SEI`);
    lines.push(`  • Unbonding: ${unbonding.toFixed(6)} SEI`);
    lines.push(`  • Rewards: ${rewards.toFixed(6)} SEI`);
    lines.push(`  • Commission: ${commission.toFixed(6)} SEI`);
    lines.push(`  • Vesting: ${vesting.toFixed(6)} SEI`);
    lines.push(`- Activity: ${acct.txsCount ?? 0} total txs`);

    if (txs && txs.length) {
      lines.push('- Recent transactions:');
      type TxLike = { hash?: string; type?: string; timestamp?: string; from?: string; to?: string };
      txs.slice(0, 5).forEach((t: TxLike, i: number) => {
        const dir = t.from === seiAddr ? 'OUT' : t.to === seiAddr ? 'IN' : '';
        lines.push(
          `  ${i + 1}. ${short(t.hash ?? '', 10, 10)} • ${t.type ?? 'Tx'} • ${timeAgo(t.timestamp)}${dir ? ` • ${dir}` : ''}`
        );
      });
    } else {
      lines.push('- Recent transactions: None found');
    }

    // If the user asked about “contract” and the address looks like a contract, try to add a note
    if (/contract|token/i.test(originalQuery)) {
      try {
        const contract = await BlockchainService.getContract?.('cosmos', seiAddr);
        if (contract) {
          lines.push('- Contract:');
          if (contract.name) lines.push(`  • Name: ${contract.name}`);
          if (contract.symbol) lines.push(`  • Symbol: ${contract.symbol}`);
          if (contract.verified !== undefined) lines.push(`  • Verified: ${contract.verified ? 'yes' : 'no'}`);
        }
      } catch (e) {
        console.warn('cosmos contract lookup error', e);
      }
    }

    lines.push(`\nView in explorer: /address/${seiAddr}`);
    return lines.join('\n');
  };

  const transactionSummary = async (raw: string): Promise<string> => {
    const hash = ensure0x64(raw);
    // Try both 0x and bare for compatibility
    const candidates = hash.startsWith('0x') ? [hash, hash.slice(2)] : [hash, `0x${hash}`];

    type TxObj = { hash?: string; height?: string; timestamp?: string; type?: string; from?: string; to?: string; gasUsed?: string; fee?: string };
    let tx: TxObj | null = null;
    for (const h of candidates) {
      const t = await BlockchainService.getTransaction(h);
      if (t && t.hash) { tx = t; break; }
    }
    if (!tx) return `I couldn't find that transaction (${raw}).`;

    const price = await BlockchainService.getSeiPrice?.();
    const feeUsei = Number(tx.fee ?? 0);
    const feeSei = Number.isFinite(feeUsei) ? feeUsei / 1e6 : 0;
    const feeUsd = price?.usd ? ` (~$${(feeSei * price.usd).toFixed(3)})` : '';

    const lines: string[] = [];
    lines.push('Transaction');
    lines.push(`- Hash: ${tx.hash}`);
    if (tx.height) lines.push(`- Block: ${tx.height}`);
    if (tx.timestamp) lines.push(`- Time: ${new Date(tx.timestamp).toLocaleString()} (${timeAgo(tx.timestamp)})`);
    if (tx.type) lines.push(`- Type: ${tx.type}`);
    if (tx.from) lines.push(`- From: ${tx.from}`);
    if (tx.to) lines.push(`- To: ${tx.to}`);
    if (tx.gasUsed !== undefined) lines.push(`- Gas used: ${tx.gasUsed}`);
    if (tx.fee !== undefined) lines.push(`- Fee: ${feeSei} SEI${feeUsd}`);
    // Optional AI explanation if you want a natural-language summary:
    try {
      const analysis = tx.hash ? await AIService.analyzeTransaction?.(tx.hash) : null;
      if (analysis?.summary) lines.push(`- Notes: ${analysis.summary}`);
    } catch (e) { console.warn('ai analyze error', e); }
    if (tx.hash) lines.push(`\nView in explorer: /transaction/${tx.hash}`);
    return lines.join('\n');
  };

  const blockSummary = async (heightStr: string): Promise<string> => {
    if (!isBlockNumber(heightStr)) return 'Please provide a valid block height.';
    const block = await BlockchainService.getBlock(parseInt(heightStr, 10));
    if (!block) return `Block ${heightStr} not found.`;
    const lines: string[] = [];
    lines.push(`Block #${block.height}`);
    lines.push(`- Time: ${new Date(block.timestamp).toLocaleString()} (${timeAgo(block.timestamp)})`);
    if (block.hash) lines.push(`- Hash: ${block.hash}`);
    if (block.proposer) lines.push(`- Proposer: ${block.proposer}`);
    if (block.transactions !== undefined) lines.push(`- Transactions: ${block.transactions}`);
    lines.push(`\nView in explorer: /block/${block.height}`);
    return lines.join('\n');
  };

  // Optional contract summary helper (used when user pastes an 0x that’s actually a contract)
  const formatContractResponse = (c: { [key: string]: unknown; address?: string; name?: string; symbol?: string; standard?: string; verified?: boolean; creator?: string; creationTxHash?: string; totalSupply?: string; txCount?: number }): string => {
    const lines: string[] = [];
    lines.push('Contract');
    if (c.address) lines.push(`- Address: ${c.address}`);
    if (c.name) lines.push(`- Name: ${c.name}`);
    if (c.symbol) lines.push(`- Symbol: ${c.symbol}`);
    if (c.standard) lines.push(`- Standard: ${c.standard}`);
    if (c.verified !== undefined) lines.push(`- Verified: ${c.verified ? 'yes' : 'no'}`);
    if (c.creator) lines.push(`- Creator: ${c.creator}`);
    if (c.creationTxHash) lines.push(`- Creation tx: ${c.creationTxHash}`);
    if (c.totalSupply) lines.push(`- Total supply: ${c.totalSupply}`);
    if (c.txCount) lines.push(`- Tx count: ${c.txCount}`);
    return lines.join('\n');
  };

  // Basic renderer to convert explorer paths in text to clickable links
  const renderMessageContent = (text: string) => {
    // Split by newlines and auto-link known explorer paths
    const lines = text.split('\n');
    return (
      <div>
        {lines.map((line, idx) => {
          const match = line.match(/\/(address|transaction|block)\/[0-9a-zA-Z]+/);
          if (match) {
            const before = line.slice(0, match.index);
            const url = match[0];
            const after = line.slice((match.index ?? 0) + url.length);
            return (
              <div key={idx}>
                {before}
                <Link to={url} className="text-blue-300 hover:underline">{url}</Link>
                {after}
              </div>
            );
          }
          return <div key={idx}>{line}</div>;
        })}
      </div>
    );
  };

  // Clear chat
  // helpers removed (unused)

  return (
    <main className="pt-24 px-4 sm:px-6 lg:px-8 text-white font-sans min-h-screen bg-[#0b1220]">
      <section className="border rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 p-6 mb-6 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold">SeiGuard AI</h1>
            <h2 className="text-sm opacity-90">Your AI copilot for Sei Network — addresses, txs, blocks, contracts, and more</h2>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto overflow-y-hidden">
        <div className="bg-[#111827] rounded-xl shadow-xl p-4 sm:p-6 h-[70vh] min-h-[540px] flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FaRobot className="text-5xl mb-4" />
                <p className="text-center">Paste a Sei address, an EVM address, a transaction hash, or a block height. I’ll fetch details like the explorer.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-md">
                  <div className="bg-gray-700 rounded-lg p-3 text-sm">
                    <p className="font-semibold">Try:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Balance for sei1...</li>
                      <li>Show last 5 txs for 0xabc...</li>
                      <li>Tx 0x1234...abcd</li>
                    </ul>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3 text-sm">
                    <p className="font-semibold">Examples:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Block 163179131</li>
                      <li>What’s the SEI price?</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-4 ${m.role === 'user' ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {m.role === 'user' ? <FaUser className="text-sm" /> : <FaRobot className="text-sm" />}
                    <span className="text-xs font-semibold">{m.role === 'user' ? 'You' : 'SeiGuard AI'}</span>
                    <span className="text-xs text-gray-300">{m.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{renderMessageContent(m.content)}</div>
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

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-gray-300 hover:text-white">✕</button>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask about wallets, transactions, blocks, contracts, or price…"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                disabled={isLoading}
                maxLength={1000}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`h-12 w-12 flex items-center justify-center rounded-lg ${inputValue.trim() && !isLoading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 cursor-not-allowed'} transition-colors`}
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => { setMessages([]); setError(null); }}
                disabled={messages.length === 0 || isLoading}
                className={`text-sm flex items-center gap-1 ${messages.length === 0 || isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 hover:text-white'}`}
              >
                <FaTrash /> Clear Chat
              </button>
              <div className="text-xs text-gray-400">{inputValue.length}/1000</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Chatbot;