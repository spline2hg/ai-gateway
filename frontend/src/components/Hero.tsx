import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import GatewayFlow from './GatewayFlow';

interface HeroProps {
  onEnter?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10 w-full">
        
        {/* Announcement Pill */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <a href="#features" className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-xs font-medium text-white/70 hover:text-white backdrop-blur-md group">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>300+ LLM Models Supported</span>
                <ChevronRight size={12} className="text-white/40 group-hover:text-white transition-colors" />
            </a>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 max-w-5xl mx-auto leading-[0.9] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          API Gateway <br /> for LLMs
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Route requests across 300+ LLMs with a single API. Track costs, latency, and usage in real-time with full observability.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <button onClick={onEnter} className="h-12 px-8 rounded-full bg-white text-black text-sm font-semibold hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Open Dashboard
            <ArrowRight size={14} className="text-black" />
          </button>
          <button className="h-12 px-8 rounded-full bg-black border border-white/15 text-white text-sm font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm">
            View API Docs
          </button>
        </div>

        {/* Main Visualization */}
        <div className="w-full relative animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
           <GatewayFlow />
        </div>

      </div>
    </section>
  );
};

export default Hero;
