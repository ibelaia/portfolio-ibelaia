'use client';

import React, { useEffect, useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

const DEFAULT_BANNER_PRIMARY = '/assets/banner.jpg';
const DEFAULT_BANNER_FALLBACK =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteName, setSiteName] = useState('IbeLaia.Dev');
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER_PRIMARY);
  const [bannerStage, setBannerStage] = useState<'primary' | 'fallback'>('primary');

  useEffect(() => {
    let isMounted = true;

    async function fetchNeonGeneralSettings() {
      try {
        const response = await fetch('/api/settings', { cache: 'no-store' });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success && json.data) {
          if (json.data.site_name) {
            setSiteName(String(json.data.site_name));
          }
          if (json.data.banner_url) {
            setBannerUrl(String(json.data.banner_url));
            setBannerStage('primary');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat general settings dari Neon API:', err);
        }
      }
    }

    fetchNeonGeneralSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleBannerError = () => {
    if (bannerStage === 'primary' && bannerUrl !== DEFAULT_BANNER_FALLBACK) {
      setBannerStage('fallback');
      setBannerUrl(DEFAULT_BANNER_FALLBACK);
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#050711] text-white flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar siteName={siteName} />

        {/* Banner Ramping Global (Muncul Konsisten di Semua Halaman) */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="w-full h-36 sm:h-44 md:h-48 lg:h-52 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#090d1f]">
            <img
              src={bannerUrl}
              alt={`${siteName} Banner`}
              className="w-full h-full object-cover object-center brightness-90 hover:scale-102 transition-transform duration-700"
              onError={handleBannerError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050711]/90 via-transparent to-transparent" />
          </div>
        </div>

        <div className="flex-grow w-full">{children}</div>
        <Footer />
      </div>
    </AppProvider>
  );
}