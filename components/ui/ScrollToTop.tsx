'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Tombol muncul jika scroll vertikal lebih dari 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#0d1326]/90 border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-500 hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 active:scale-95"
    >
      <ArrowUp size={18} />
    </button>
  );
};

export default ScrollToTop;