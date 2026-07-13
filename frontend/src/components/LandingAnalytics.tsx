import React from 'react';
import GatewayAnalytics from './GatewayAnalytics';
import demoData from '../data/demoAnalytics.json';

const LandingAnalytics: React.FC = () => {
  return (
    <section className="relative py-24 px-4 border-t border-[#1b1c1e]">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-[32px] font-semibold tracking-tight text-white mb-3">
            Real-Time Analytics
          </h2>
          <p className="text-[#6a6b6c] text-[15px] max-w-md mx-auto">
            Full visibility into requests, costs, latency, and model usage across your gateway.
          </p>
        </div>
        <GatewayAnalytics gatewayId="" logs={[]} hideControls staticData={demoData} />
      </div>
    </section>
  );
};

export default LandingAnalytics;
