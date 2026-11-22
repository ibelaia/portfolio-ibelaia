'use client';

import React, { useEffect, useState, useCallback } from 'react';

export const TopBanner: React.FC = () => {
  const [coverUrl, setCoverUrl] = useState<string>('/assets/banner.jpg');

  const fetchCover = useCallback(async () => {
    try {
      const response = await fetch('/api/portfolio', { cache: 'no-store' });
      const json = await response.json();

      if (json.success && json.home && json.home.hero_cover_url) {
        setCoverUrl(json.home.hero_cover_url);
      }
    } catch (err) {
      console.warn('Gagal memuat cover banner dari API:', err);
    }
  }, []);

  useEffect(() => {
    fetchCover();

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('portfolio-admin-sync');
      channel.onmessage = () => {
        fetchCover();
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('portfolio')) {
        fetchCover();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [fetchCover]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div
        style={{
          borderColor:
            'color-mix(in srgb, var(--accent, #06b6d4) 30%, transparent)',
        }}
        className="relative w-full h-44 sm:h-60 md:h-64 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.2)] bg-[#4090ef]"
      >
        <img
          src={coverUrl}
          alt="Header Banner"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
      </div>
    </div>
  );
};

export default TopBanner;