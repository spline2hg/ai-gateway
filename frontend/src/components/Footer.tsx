import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-[#030303] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="font-semibold text-white">Raven</span>
        </div>
        <p className="text-sm text-white/40 mb-6 max-w-md">
          Unified AI gateway for managing multiple LLMs with real-time analytics and cost tracking.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-white/40 hover:text-white transition-colors"><Github size={20} /></a>
          <a href="#" className="text-white/40 hover:text-white transition-colors"><Twitter size={20} /></a>
          <a href="#" className="text-white/40 hover:text-white transition-colors"><Linkedin size={20} /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
