import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const isLanding = location.pathname === '/';
  const isDark = theme === 'dark' || isLanding;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavLinks = () => {
    const links = [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Models', path: '/models' }];
    if (location.pathname === '/dashboard') {
      return [...links, { label: 'Profile', path: '/profile' }];
    }
    if (location.pathname === '/profile') {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Models', path: '/models' }];
    }
    if (location.pathname === '/models') {
      return [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Profile', path: '/profile' }];
    }
    if (location.pathname.startsWith('/gateway/')) {
      return [...links, { label: 'Profile', path: '/profile' }];
    }
    return [...links, { label: 'Profile', path: '/profile' }];
  };

  const navLinks = getNavLinks();

  const brandTextClass = isDark ? 'text-white' : 'text-gray-900';
  const linkClass = isDark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900';
  const mobileBgClass = isDark ? 'bg-black/95 border-white/10' : 'bg-white/95 border-gray-200';
  const mobileBtnClass = isDark
    ? 'text-white/70 hover:text-white'
    : 'text-gray-500 hover:text-gray-900';
  const mobileLinkClass = isDark
    ? 'text-white/70 hover:text-white'
    : 'text-gray-600 hover:text-gray-900';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isLanding
          ? scrolled
            ? 'glass-nav py-4'
            : 'bg-transparent py-6'
          : 'h-14 glass-panel'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-full">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <span className={`font-semibold text-lg tracking-tight ${brandTextClass}`}>
            AI Gateway
          </span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-sm font-medium transition-colors ${linkClass}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={mobileBtnClass}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`absolute top-full left-0 right-0 backdrop-blur-xl border-b p-6 md:hidden flex flex-col gap-4 ${mobileBgClass}`}
        >
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setMobileMenuOpen(false);
              }}
              className={`text-center py-2 rounded-md font-medium ${mobileLinkClass}`}
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
