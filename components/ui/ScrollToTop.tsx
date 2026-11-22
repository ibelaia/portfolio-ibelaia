'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    void syncTick;
    let channel: BroadcastChannel | null = null;

    const handleSyncSignal = () => {
      setSyncTick((prev) => prev + 1);
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('portfolio-admin-sync');
      channel.onmessage = handleSyncSignal;
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('portfolio')) {
        handleSyncSignal();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [syncTick]);

  useEffect(() => {
    // Tombol muncul jika scroll vertikal lebih dari 300px
    const toggleVisibility = () => {
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
      style={{
        color: 'var(--accent, #22d3ee)',
        borderColor:
          'color-mix(in srgb, var(--accent, #06b6d4) 40%, transparent)',
      }}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-[#0d1326]/90 border border-cyan-500/40 text-cyan-400 hover:text-white hover:bg-cyan-500 hover:border-cyan-400 shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer"
    >
      <ArrowUp size={18} />
    </button>
  );
};

export default ScrollToTop;