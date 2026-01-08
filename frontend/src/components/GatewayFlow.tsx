import React, { useState, useEffect } from 'react';
import { Globe, Zap } from 'lucide-react';

const GatewayFlow: React.FC = () => {
  // Phase: 
  // 0: Idle (Reset)
  // 1: Client -> Gateway (Inbound)
  // 2: Gateway Processing (Pulse)
  // 3: Gateway -> Provider (Outbound)
  // 4: Provider Received (Glow)
  const [phase, setPhase] = useState(0);
  const [targetProvider, setTargetProvider] = useState<number>(0); // 0: Top, 1: Mid, 2: Bot

  useEffect(() => {
    let mounted = true;

    const cycle = async () => {
      if (!mounted) return;

      // Start Cycle
      setPhase(1); // Inbound Animation Start
      
      // Wait for inbound animation (approx 1s)
      await new Promise(r => setTimeout(r, 900));
      if (!mounted) return;
      
      setPhase(2); // Processing
      // Pick random next provider
      const next = Math.floor(Math.random() * 3);
      setTargetProvider(next);
      
      await new Promise(r => setTimeout(r, 400));
      if (!mounted) return;
      
      setPhase(3); // Outbound Animation Start
      
      // Wait for outbound animation (approx 1s)
      await new Promise(r => setTimeout(r, 900));
      if (!mounted) return;
      
      setPhase(4); // Provider active
      
      await new Promise(r => setTimeout(r, 800));
      if (!mounted) return;
      
      setPhase(0); // Reset
      
      // Short pause before next request
      await new Promise(r => setTimeout(r, 300));
      if (!mounted) return;
      
      cycle();
    };

    cycle();
    
    return () => { mounted = false; };
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-[2/1] md:aspect-[2.5/1] my-16 select-none pointer-events-none">
      
      {/* Container for the diagram */}
      <div className="absolute inset-0 w-full h-full">
        
        {/* SVG Layer for connecting lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* === INBOUND (Client -> Gateway) === */}
          {/* Base dim line */}
          <path d="M 100 200 L 400 200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          
          {/* Active flow line - Only shows during Phase 1 */}
          {phase === 1 && (
            <path 
              d="M 100 200 L 400 200" 
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              fill="none"
              style={{
                animation: 'dash 0.9s linear forwards'
              }}
            />
          )}

          {/* === OUTBOUND LINES === */}
          
          {/* Top Branch (Index 0) */}
          <path d="M 400 200 C 500 200 550 100 700 100" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          {phase === 3 && targetProvider === 0 && (
            <path 
              d="M 400 200 C 500 200 550 100 700 100" 
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              fill="none"
              style={{
                animation: 'dash 0.9s linear forwards'
              }}
            />
          )}

          {/* Mid Branch (Index 1) */}
          <path d="M 400 200 L 700 200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          {phase === 3 && targetProvider === 1 && (
             <path 
              d="M 400 200 L 700 200" 
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              fill="none"
              style={{
                animation: 'dash 0.9s linear forwards'
              }}
            />
          )}

          {/* Bot Branch (Index 2) */}
          <path d="M 400 200 C 500 200 550 300 700 300" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
          {phase === 3 && targetProvider === 2 && (
            <path 
              d="M 400 200 C 500 200 550 300 700 300" 
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2"
              fill="none"
              style={{
                animation: 'dash 0.9s linear forwards'
              }}
            />
          )}

          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: 0;
              }
              from {
                stroke-dashoffset: 1000;
              }
            }
            path.path-inactive {
              stroke: rgba(255,255,255,0.1);
              stroke-width: 2;
              fill: none;
            }
            path.path-active {
              stroke: rgba(255,255,255,0.8);
              stroke-width: 2;
              fill: none;
              stroke-dasharray: 1000;
              animation: dash 0.9s linear forwards;
            }
          `}</style>
        </svg>

        {/* === NODES === */}
        
        {/* Client Node (Left) */}
        <div className="absolute left-[12.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-10">
          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-black border transition-all duration-300 flex items-center justify-center ${phase === 1 ? 'border-white node-glow scale-105' : 'border-white/20'}`}>
            <Globe className={`w-6 h-6 md:w-8 md:h-8 transition-colors duration-300 ${phase === 1 ? 'text-white' : 'text-white/40'}`} />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/50 bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-white/10">App</span>
        </div>

        {/* Gateway Node (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-20">
          <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-black border transition-all duration-200 flex items-center justify-center ${phase === 2 ? 'border-white node-glow scale-110' : 'border-white/20'}`}>
            {/* Pulse effect */}
            {phase === 2 && (
               <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            )}
            <Zap className={`w-8 h-8 md:w-10 md:h-10 transition-colors duration-200 ${phase === 2 ? 'text-white fill-white' : 'text-white/40'}`} />
          </div>
          <span className={`text-xs font-bold tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md transition-colors duration-300 ${phase === 2 ? 'bg-white text-black border-white' : 'bg-black/80 text-white border-white/20'}`}>
            RAVEN
          </span>
        </div>

        {/* === PROVIDERS === */}

        {/* Provider 1 (Top) - OpenAI */}
        <div className="absolute left-[87.5%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
          <div className={`w-12 h-12 rounded-xl bg-[#0A0A0A] border transition-all duration-300 flex items-center justify-center shadow-lg ${phase >= 3 && targetProvider === 0 ? 'border-green-400 node-glow scale-110' : 'border-white/10'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border transition-colors duration-300 ${phase >= 3 && targetProvider === 0 ? 'bg-green-500 text-black border-green-400' : 'bg-green-900/20 text-green-700 border-green-900/30'}`}>O</div>
          </div>
          <div className={`hidden md:flex flex-col transition-opacity duration-300 ${phase >= 3 && targetProvider === 0 ? 'opacity-100' : 'opacity-40'}`}>
              <span className="text-xs font-semibold text-white/90">OpenAI</span>
              <span className="text-[10px] text-white/40 font-mono">gpt-4o</span>
          </div>
        </div>

        {/* Provider 2 (Mid) - Anthropic */}
        <div className="absolute left-[87.5%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
          <div className={`w-12 h-12 rounded-xl bg-[#0A0A0A] border transition-all duration-300 flex items-center justify-center shadow-lg ${phase >= 3 && targetProvider === 1 ? 'border-purple-400 node-glow scale-110' : 'border-white/10'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border transition-colors duration-300 ${phase >= 3 && targetProvider === 1 ? 'bg-purple-500 text-black border-purple-400' : 'bg-purple-900/20 text-purple-700 border-purple-900/30'}`}>A</div>
          </div>
          <div className={`hidden md:flex flex-col transition-opacity duration-300 ${phase >= 3 && targetProvider === 1 ? 'opacity-100' : 'opacity-40'}`}>
              <span className="text-xs font-semibold text-white/90">Anthropic</span>
              <span className="text-[10px] text-white/40 font-mono">claude-opus</span>
          </div>
        </div>

        {/* Provider 3 (Bot) - Mistral */}
        <div className="absolute left-[87.5%] top-[75%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
          <div className={`w-12 h-12 rounded-xl bg-[#0A0A0A] border transition-all duration-300 flex items-center justify-center shadow-lg ${phase >= 3 && targetProvider === 2 ? 'border-orange-400 node-glow scale-110' : 'border-white/10'}`}>
             <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border transition-colors duration-300 ${phase >= 3 && targetProvider === 2 ? 'bg-orange-500 text-black border-orange-400' : 'bg-orange-900/20 text-orange-700 border-orange-900/30'}`}>M</div>
          </div>
          <div className={`hidden md:flex flex-col transition-opacity duration-300 ${phase >= 3 && targetProvider === 2 ? 'opacity-100' : 'opacity-40'}`}>
              <span className="text-xs font-semibold text-white/90">Mistral</span>
              <span className="text-[10px] text-white/40 font-mono">large-latest</span>
          </div>
        </div>

        <style>{`
          .node-glow {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
          }
        `}</style>

      </div>
    </div>
  );
};

export default GatewayFlow;
