'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

const DEFAULT_BANNER_PRIMARY = '/assets/banner.jpg';
const DEFAULT_BANNER_FALLBACK =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80';
const APPEARANCE_SYNC_CHANNEL = 'portfolio-sync-appearance';

function applyAppearanceAttributes(settings: Record<string, any>) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (!settings || typeof settings !== 'object') return;

  const root = document.documentElement;
  const body = document.body;
  const mode =
    settings.theme_mode === 'light' || settings.theme_mode === 'system'
      ? settings.theme_mode
      : 'dark';
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolvedTheme =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  root.classList.remove('dark', 'light');
  root.classList.add(resolvedTheme);
  root.setAttribute('data-theme', resolvedTheme);
  root.setAttribute('data-theme-mode', mode);

  if (settings.accent_color) {
    root.setAttribute('data-accent', String(settings.accent_color));
  }
  if (settings.border_radius) {
    root.setAttribute('data-radius', String(settings.border_radius));
  }
  if (settings.font_family) {
    root.setAttribute('data-font', String(settings.font_family));
    if (body) {
      body.classList.remove('font-sans', 'font-mono');
      body.classList.add(String(settings.font_family));
    }
  }
  if (typeof settings.glassmorphism !== 'undefined') {
    const isGlass =
      settings.glassmorphism === true ||
      settings.glassmorphism === 'true' ||
      settings.glassmorphism === 1;
    root.setAttribute('data-glass', isGlass ? 'true' : 'false');
  }
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteName, setSiteName] = useState('IbeLaia.Dev');
  const [bannerUrl, setBannerUrl] = useState(DEFAULT_BANNER_PRIMARY);
  const [bannerStage, setBannerStage] = useState<'primary' | 'fallback'>(
    'primary'
  );

  const syncAppearance = useCallback(async () => {
    try {
      const cachedRaw = localStorage.getItem(APPEARANCE_SYNC_CHANNEL);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached?.data) {
          applyAppearanceAttributes(cached.data);
        }
      }
    } catch {
      // Abaikan error akses localStorage
    }

    try {
      const res = await fetch(`/api/appearance?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          applyAppearanceAttributes(json.data);
          try {
            localStorage.setItem(
              APPEARANCE_SYNC_CHANNEL,
              JSON.stringify({
                section: 'appearance',
                data: json.data,
                updatedAt: json.updatedAt || Date.now(),
              })
            );
          } catch {
            // Abaikan error akses localStorage
          }
        }
      }
    } catch {
      // Abaikan error jaringan
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchNeonGeneralSettings() {
      try {
        const response = await fetch(`/api/settings?t=${Date.now()}`, {
          cache: 'no-store',
        });
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
    syncAppearance();

    let appearanceChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      appearanceChannel = new BroadcastChannel(APPEARANCE_SYNC_CHANNEL);
      appearanceChannel.onmessage = (event) => {
        if (!isMounted) return;
        const payload = event?.data;
        if (payload?.data) {
          applyAppearanceAttributes(payload.data);
        } else {
          syncAppearance();
        }
      };
    }

    const handleCustomAppearance = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.data) {
        applyAppearanceAttributes(customEvent.detail.data);
      } else {
        syncAppearance();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (!isMounted) return;
      if (!event.key || event.key === APPEARANCE_SYNC_CHANNEL) {
        syncAppearance();
      }
    };

    window.addEventListener(APPEARANCE_SYNC_CHANNEL, handleCustomAppearance);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(
        APPEARANCE_SYNC_CHANNEL,
        handleCustomAppearance
      );
      window.removeEventListener('storage', handleStorage);
      if (appearanceChannel) {
        appearanceChannel.close();
      }
    };
  }, [syncAppearance]);

  const handleBannerError = () => {
    if (bannerStage === 'primary' && bannerUrl !== DEFAULT_BANNER_FALLBACK) {
      setBannerStage('fallback');
      setBannerUrl(DEFAULT_BANNER_FALLBACK);
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col justify-between selection:bg-accent/30 transition-colors duration-250">
        <Navbar siteName={siteName} />

        {/* Banner Ramping Global (Muncul Konsisten di Semua Halaman) */}
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="w-full h-36 sm:h-44 md:h-48 lg:h-52 rounded-3xl overflow-hidden border border-[var(--card-border)] relative shadow-2xl bg-[var(--card-bg)]">
            <img
              src={bannerUrl}
              alt={`${siteName} Banner`}
              className="w-full h-full object-cover object-center brightness-90 hover:scale-102 transition-transform duration-700"
              onError={handleBannerError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/90 via-transparent to-transparent" />
          </div>
        </div>

        <div className="flex-grow w-full">{children}</div>
        <Footer />
      </div>
    </AppProvider>
  );
}