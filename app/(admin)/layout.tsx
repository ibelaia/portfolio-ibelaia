'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_SYNC_CHANNELS = [
  'portfolio-sync-home',
  'portfolio-sync-about',
  'portfolio-sync-services',
  'portfolio-sync-projects',
  'portfolio-sync-achievements',
  'portfolio-sync-certificates',
  'portfolio-sync-contact',
  'portfolio-sync-media',
  'portfolio-sync-appearance',
  'portfolio-sync-seo',
  'portfolio-sync-settings',
  'portfolio-sync-dashboard',
  'portfolio-sync-auth',
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    const channels: BroadcastChannel[] = [];

    const triggerRefresh = () => {
      if (!isMounted) return;

      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = setTimeout(() => {
        if (isMounted) {
          router.refresh();
        }
      }, 50);
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      ADMIN_SYNC_CHANNELS.forEach((channelName) => {
        try {
          const channel = new BroadcastChannel(channelName);
          channel.onmessage = triggerRefresh;
          channels.push(channel);
        } catch {
          // Abaikan jika BroadcastChannel tidak tersedia untuk kanal tertentu
        }
      });
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key && ADMIN_SYNC_CHANNELS.includes(e.key)) {
        triggerRefresh();
      }
    };

    const customEventCleanups: Array<() => void> = [];
    ADMIN_SYNC_CHANNELS.forEach((eventName) => {
      const listener = () => triggerRefresh();
      window.addEventListener(eventName, listener);
      customEventCleanups.push(() =>
        window.removeEventListener(eventName, listener)
      );
    });

    window.addEventListener('storage', handleStorageSync);

    return () => {
      isMounted = false;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      window.removeEventListener('storage', handleStorageSync);
      customEventCleanups.forEach((cleanup) => cleanup());
      channels.forEach((channel) => {
        try {
          channel.close();
        } catch {
          // Abaikan saat menutup kanal
        }
      });
    };
  }, [router]);

  return <>{children}</>;
}