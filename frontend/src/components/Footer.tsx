import React from 'react';
import { Hexagon } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#1b1c1e] bg-[#040506] py-12 px-6">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Hexagon size={14} className="text-coral-400" fill="#ff6363" />
          <span className="text-[13px] font-medium text-white">AI Gateway</span>
        </div>
        <p className="text-[12px] font-mono text-[#6a6b6c] tracking-[0.017em]">
          Unified AI gateway for managing multiple LLMs
        </p>
      </div>
    </footer>
  );
};

export default Footer;
