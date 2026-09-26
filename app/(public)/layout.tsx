'use client';

import React, { useEffect, useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { supabase } from '@/lib/supabase';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteName, setSiteName] = useState('IbeLaia.Dev');

  useEffect(() => {
    async function fetchGeneralSettings() {
      try {
        const { data, error } = await supabase
          .from('general_settings')
          .select('site_name')
          .eq('id', 'default')
          .maybeSingle();

        if (data && !error && data.site_name) {
          setSiteName(data.site_name);
        }
      } catch (err) {
        console.warn('Error loading site name:', err);
      }
    }

    fetchGeneralSettings();
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#050711] text-white flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar siteName={siteName} />
        
        {/* Banner Ramping Global (Muncul Konsisten di Semua Halaman) */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="w-full h-36 sm:h-44 md:h-48 lg:h-52 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl bg-[#090d1f]">
            <img
              src="/assets/banner.jpg"
              alt="Digital Frontier Banner"
              className="w-full h-full object-cover object-center brightness-90 hover:scale-102 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';
              }}
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