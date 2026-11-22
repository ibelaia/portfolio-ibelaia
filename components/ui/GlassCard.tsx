'use client';

import React, { useEffect, useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowOnHover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glowOnHover = false,
  style,
  ...props
}) => {
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

  const mergedStyle: React.CSSProperties = {
    borderColor:
      'color-mix(in srgb, var(--accent, #06b6d4) 14%, rgba(255,255,255,0.1))',
    ...style,
  };

  return (
    <div
      style={mergedStyle}
      className={`rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 shadow-xl transition-all duration-300 ${
        glowOnHover
          ? 'hover:border-cyan-500/40 hover:shadow-cyan-500/10 hover:-translate-y-1'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;