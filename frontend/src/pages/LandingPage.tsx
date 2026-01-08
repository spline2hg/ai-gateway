import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import BackgroundBeams from '../components/BackgroundBeams';

interface LandingPageProps {
  onEnter?: () => void;
  onProfile?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onProfile }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#030303] text-white selection:bg-white/20 selection:text-white overflow-hidden">
      <BackgroundBeams />
      <div className="relative z-10">
        <Navbar onEnter={onEnter} onProfile={onProfile} />
        <main>
          <Hero onEnter={onEnter} />
          <Features />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
