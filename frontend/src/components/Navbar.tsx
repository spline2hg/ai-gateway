import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon } from 'lucide-react';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Models', path: '/models' },
    { label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 mt-4">
        <div className="glass-nav px-4 sm:px-6 h-12 flex items-center justify-between">
          {/* Logo — always goes to landing */}
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <Hexagon size={16} className="text-coral-400" fill="#ff6363" />
            <span className="font-semibold text-[13px] text-white tracking-[0.01em]">
              AI Gateway
            </span>
          </div>

          {/* Desktop Nav — always show all links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const active = location.pathname === link.path || (link.path === '/dashboard' && location.pathname.startsWith('/gateway'));
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`text-[13px] font-medium tracking-[0.008em] transition-colors ${
                    active ? 'text-white' : 'text-[#9c9c9d] hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#9c9c9d] hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-4 glass-nav p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 rounded-lg text-[14px] font-medium text-[#9c9c9d] hover:text-white hover:bg-white/5 transition-all"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
