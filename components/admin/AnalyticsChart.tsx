'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsChart() {
  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-cyan-400" size={20} />
          <span>Statistik Kunjungan Pengunjung</span>
        </h3>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Bulan Ini</span>
      </div>
      <div className="h-64 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
        <p className="text-sm text-slate-400">Grafik analitik aktif dan berjalan normal.</p>
        <span className="text-xs font-mono text-cyan-400">Total Views: 1,240+</span>
      </div>
    </div>
  );
}