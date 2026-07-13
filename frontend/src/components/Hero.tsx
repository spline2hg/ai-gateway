import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GatewayFlow from './GatewayFlow';

interface HeroProps {
  onEnter?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  const navigate = useNavigate();
  return (
    <>
      {/* Centered hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
        <div className="flex flex-col items-center text-center relative z-10 w-full">
          <h1 className="text-[44px] md:text-[56px] lg:text-[64px] font-semibold tracking-tight mb-6 max-w-3xl mx-auto leading-[0.95] animate-fade-in text-white">
            API Gateway<br /> for LLMs
          </h1>

          <p className="text-[16px] md:text-[18px] text-[#9c9c9d] max-w-[520px] mx-auto mb-10 leading-[1.5] font-normal animate-fade-in">
            Route requests across 300+ LLMs with a single API. Track costs, latency, and usage in real-time with full observability.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
            <button
              onClick={onEnter}
              className="btn-fill h-11 px-6 text-[13px] flex items-center gap-2 font-medium"
            >
              Open Dashboard
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/models')}
              className="h-11 px-6 rounded-[8px] border border-[#363739] text-[#9c9c9d] text-[13px] font-medium hover:text-white hover:border-[#454647] transition-all flex items-center gap-2"
            >
              View Model List
            </button>
          </div>
        </div>
      </section>

      {/* Flow visualization — below the fold */}
      <section className="relative px-6 pb-20">
        <div className="max-w-[1200px] mx-auto">
          <GatewayFlow />
        </div>
      </section>
    </>
  );
};

export default Hero;
