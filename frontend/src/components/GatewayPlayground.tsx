import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Terminal, Sparkles, RefreshCw, StopCircle, CornerDownLeft } from 'lucide-react';
import { generateCompletion } from '../services/geminiService';
import { analyticsApi } from '../services/apiService';
import { LogEntry, Gateway } from '../types';
import { generateId } from '../utils';

interface GatewayPlaygroundProps {
  gateway: Gateway;
  onNewLog: (log: LogEntry) => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const GatewayPlayground: React.FC<GatewayPlaygroundProps> = ({ gateway, onNewLog }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Note: These chat messages are not saved and will be lost when you refresh.' }
  ]);
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
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const result = await generateCompletion(userMsg, 'free', gateway.id, credentials.secret, systemPrompt);

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
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden relative shadow-inner">
        
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 backdrop-blur-sm z-10">
           <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase text-gray-700 dark:text-gray-400 tracking-wide">Output Console</span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-800"></div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 border border-emerald-300 dark:border-emerald-500/20 font-mono">free</span>
           </div>
           <button 
             onClick={() => setMessages([{ role: 'system', content: `Connected to ${gateway.name} environment.` }])}
             className="text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Clear Chat"
            >
              <RefreshCw size={14} />
           </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 animate-slide-up ${msg.role === 'user' ? 'justify-end' : ''}`}>
              
              {/* Avatar */}
              {msg.role !== 'user' && (
                 <div className={`w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border mt-0.5 ${msg.role === 'system' ? 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-500' : 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-700 text-gray-800 dark:text-white'}`}>
                    {msg.role === 'system' ? <Terminal size={12} /> : <Sparkles size={12} />}
                 </div>
              )}
              
              {/* Content */}
              <div className={`max-w-[85%] text-sm leading-6 ${
                msg.role === 'user' 
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg rounded-tr-none px-4 py-2.5 shadow-sm' 
                  : msg.role === 'system'
                  ? 'text-gray-700 dark:text-gray-500 font-mono text-xs'
                  : 'text-gray-800 dark:text-gray-200'
              }`}>
                 {msg.content}
              </div>
            </div>
          ))}

          {loading && (
             <div className="flex gap-4">
                 <div className="w-7 h-7 rounded-sm bg-gray-200 dark:bg-gray-900 border border-gray-400 dark:border-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center shrink-0">
                    <Loader2 size={12} className="animate-spin" />
                 </div>
                 <div className="text-gray-700 dark:text-gray-500 text-sm py-1">
                    Generating response...
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-800">
           <div className="relative bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-800 focus-within:border-gray-400 dark:focus-within:border-gray-600 rounded-lg transition-colors flex items-end overflow-hidden shadow-sm">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="w-full bg-transparent border-none focus:ring-0 pl-4 pr-12 py-3 text-sm text-gray-900 dark:text-gray-200 resize-none min-h-[48px] max-h-32 placeholder:text-gray-500 dark:placeholder:text-gray-600 font-sans"
                    rows={1}
                />
                <div className="absolute right-2 bottom-2">
                   <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="p-1.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-md disabled:opacity-0 disabled:scale-90 transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100"
                    >
                        <CornerDownLeft size={14} strokeWidth={2.5} />
                    </button>
                </div>
             </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="w-64 border border-gray-200 dark:border-gray-800 rounded-lg p-5 hidden lg:block h-fit bg-gray-50 dark:bg-gray-900/20">
         <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-4">Model Configuration</h3>

         <div className="space-y-5">
            {/* System Prompt */}
            <div className="space-y-2">
               <label className="text-xs font-medium text-gray-700 dark:text-gray-400">System Prompt</label>
               <textarea
                 value={systemPrompt}
                 onChange={(e) => setSystemPrompt(e.target.value)}
                 className="w-full bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-xs text-gray-900 dark:text-gray-200 resize-none h-24 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                 placeholder="Enter system prompt..."
               />
            </div>
         </div>
      </div>
    </div>
  );
};

export default GatewayPlayground;
