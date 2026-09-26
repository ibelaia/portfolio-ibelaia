'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const TopBanner: React.FC = () => {
  const [coverUrl, setCoverUrl] = useState<string>('/assets/banner.jpg');

  useEffect(() => {
    async function fetchCover() {
      const { data } = await supabase
        .from('home_settings')
        .select('hero_cover_url')
        .eq('id', 'default')
        .single();

      if (data?.hero_cover_url) {
        setCoverUrl(data.hero_cover_url);
      }
    }
    fetchCover();
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="relative w-full h-44 sm:h-60 md:h-64 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_35px_rgba(6,182,212,0.2)] bg-[#090e1f]">
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