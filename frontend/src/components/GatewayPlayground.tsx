import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Terminal, Sparkles, RefreshCw, StopCircle, CornerDownLeft } from 'lucide-react';
import { generateCompletion, ChatMessage } from '../services/chatService';
import { analyticsApi } from '../services/apiService';
import { LogEntry, Gateway } from '../types';
import { generateId } from '../utils';

interface GatewayPlaygroundProps {
  gateway: Gateway;
  onNewLog: (log: LogEntry) => void;
}

const CHAT_STORAGE_PREFIX = 'chat_playground_';

function getStorageKey(gatewayId: string): string {
  return `${CHAT_STORAGE_PREFIX}${gatewayId}`;
}

function loadMessages(gatewayId: string): ChatMessage[] {
  try {
    const stored = localStorage.getItem(getStorageKey(gatewayId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
  }
  return [];
}

function saveMessages(gatewayId: string, messages: ChatMessage[]): void {
  localStorage.setItem(getStorageKey(gatewayId), JSON.stringify(messages));
}

const GatewayPlayground: React.FC<GatewayPlaygroundProps> = ({ gateway, onNewLog }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages(gateway.id));
  const [input, setInput] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{gatewayId: string, name: string, secret: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const creds = await analyticsApi.getGatewayCredentials(gateway.id);
        setCredentials(creds);
        console.log('Gateway credentials loaded:', creds);
      } catch (error) {
        console.error('Failed to fetch gateway credentials:', error);
        setMessages(prev => [...prev, {
          role: 'system',
          content: 'Failed to load gateway credentials. Please check the Settings tab.'
        }]);
      }
    };

    fetchCredentials();
  }, [gateway.id]);

  useEffect(() => {
    saveMessages(gateway.id, messages);
  }, [messages, gateway.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    if (!credentials) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Gateway credentials not loaded. Please refresh the page or check Settings.'
      }]);
      return;
    }

    const userMsg = input;
    setInput('');

    const userMessage: ChatMessage = { role: 'user', content: userMsg };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    const result = await generateCompletion(updatedMessages, 'free', gateway.id, credentials.secret, systemPrompt);

    setLoading(false);

    if (result.success) {
      setMessages(prev => [...prev, { role: 'assistant', content: result.data }]);

      const newLog: LogEntry = {
        id: generateId(),
        gatewayId: gateway.id,
        timestamp: new Date().toISOString(),
        status: 200,
        statusText: 'OK',
        model: 'free',
        duration: result.meta.duration,
        tokensIn: result.meta.tokensIn,
        tokensOut: result.meta.tokensOut,
        cost: result.meta.cost,
        provider: 'Google Vertex AI',
        requestBody: { prompt: userMsg, model: 'free' },
        responseBody: { result: result.data }
      };

      onNewLog(newLog);

    } else {
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${result.error}` }]);

      const errorLog: LogEntry = {
        id: generateId(),
        gatewayId: gateway.id,
        timestamp: new Date().toISOString(),
        status: 500,
        statusText: 'Internal Server Error',
        model: 'free',
        duration: result.meta.duration,
        tokensIn: 0,
        tokensOut: 0,
        cost: 0,
        provider: 'Google Vertex AI',
        requestBody: { prompt: userMsg },
        responseBody: { error: result.error }
      };
      onNewLog(errorLog);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-6">

      <div className="flex-1 flex flex-col key-card overflow-hidden relative">

        <div className="px-5 py-3 border-b border-[#1b1c1e] flex items-center justify-between bg-white/[0.02] backdrop-blur-sm z-10">
           <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase text-[#9c9c9d] tracking-wide">Output Console</span>
              <div className="h-4 w-px bg-[#1b1c1e]"></div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/20 font-mono">free</span>
           </div>
           <button
             onClick={() => {
               setMessages([]);
               localStorage.removeItem(getStorageKey(gateway.id));
             }}
             className="text-[#6a6b6c] hover:text-white transition-colors" title="Clear Chat"
            >
              <RefreshCw size={14} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}>

              {msg.role !== 'user' && (
                 <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border mt-0.5 ${msg.role === 'system' ? 'bg-[#0d0e0f] border-[#363739] text-[#6a6b6c]' : 'bg-[#1b1c1e] border-[#363739] text-white'}`}>
                    {msg.role === 'system' ? <Terminal size={12} /> : <Sparkles size={12} />}
                 </div>
              )}

              <div className={`max-w-[85%] text-sm leading-6 ${
                msg.role === 'user'
                  ? 'btn-fill rounded-tr-none px-4 py-2.5 shadow-sm'
                  : msg.role === 'system'
                  ? 'text-[#6a6b6c] font-mono text-xs'
                  : 'text-white'
              }`}>
                 {msg.content}
              </div>
            </div>
          ))}

          {loading && (
             <div className="flex gap-4">
                 <div className="w-7 h-7 rounded-sm bg-[#0d0e0f] border border-[#363739] text-[#9c9c9d] flex items-center justify-center shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                 </div>
                 <div className="text-[#6a6b6c] text-sm py-1">
                    Generating response...
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-[#1b1c1e]">
           <div className="relative inset-input focus-within:border-[#4a4b4d] transition-colors flex items-end overflow-hidden">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="w-full bg-transparent border-none focus:ring-0 pl-4 pr-12 py-3 text-sm text-white resize-none min-h-[48px] max-h-32 placeholder:text-[#6a6b6c] font-sans"
                    rows={1}
                />
                <div className="absolute right-2 bottom-2">
                   <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="btn-fill p-1.5 disabled:opacity-0 disabled:scale-90 transition-all duration-200"
                    >
                        <CornerDownLeft size={14} strokeWidth={2.5} />
                   </button>
                </div>
             </div>
        </div>
      </div>

      <div className="w-64 key-card p-5 hidden lg:block h-fit">
         <h3 className="text-xs font-semibold text-white mb-4">Model Configuration</h3>

         <div className="space-y-5">
             <div className="space-y-2">
                <label className="text-xs font-medium text-[#9c9c9d]">System Prompt</label>
                <textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="inset-input px-3 py-2 text-xs text-white resize-none h-24 focus:ring-1 focus:ring-[#ff6363] focus:border-[#ff6363]"
                  placeholder="Enter system prompt..."
                />
             </div>
          </div>
       </div>
    </div>
  );
};

export default GatewayPlayground;
