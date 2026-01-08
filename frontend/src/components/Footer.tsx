import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#030303] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <img src="/logo.png" alt="Raven" className="h-6 w-6" />
          <span className="font-semibold text-white">Raven</span>
        </div>
        <p className="text-sm text-white/40 max-w-md">
          Unified AI gateway for managing multiple LLMs with real-time analytics and cost tracking.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
