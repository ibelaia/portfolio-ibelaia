'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsChart() {
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
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3
            className="text-cyan-400"
            style={{ color: 'var(--accent, #22d3ee)' }}
            size={20}
          />
          <span>Statistik Kunjungan Pengunjung</span>
        </h3>
        <span
          style={{
            backgroundColor:
              'color-mix(in srgb, var(--accent, #06b6d4) 12%, transparent)',
            color: 'var(--accent, #22d3ee)',
            borderColor:
              'color-mix(in srgb, var(--accent, #06b6d4) 25%, transparent)',
          }}
          className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
        >
          Bulan
        </span>
      </div>

      <div className="h-64 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
        <p className="text-sm text-slate-400">
          Grafik analitik aktif dan berjalan normal.
        </p>
        <span
          style={{ color: 'var(--accent, #22d3ee)' }}
          className="text-xs font-mono text-cyan-400"
        >
          Total Views: 1,240+
        </span>
      </div>
    </div>
  );
}