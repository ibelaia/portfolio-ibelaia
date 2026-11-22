'use client';

import React, { useEffect, useState } from 'react';

interface MasterDetailLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function MasterDetailLayout({
  children,
  title,
  description,
}: MasterDetailLayoutProps) {
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">{title}</h1>
        {description && (
          <p className="text-slate-400 text-sm">{description}</p>
        )}
      </div>

      <div
        style={{
          borderColor:
            'color-mix(in srgb, var(--accent, #06b6d4) 16%, rgba(255,255,255,0.1))',
        }}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}