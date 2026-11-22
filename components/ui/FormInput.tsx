'use client';

import React, { useEffect, useState } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function FormInput({
  label,
  error,
  className = '',
  style,
  ...props
}: FormInputProps) {
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

  const mergedStyle: React.CSSProperties | undefined =
    !error || style
      ? {
          ...(!error
            ? ({
                '--tw-border-opacity': '1',
              } as React.CSSProperties)
            : {}),
          ...style,
        }
      : undefined;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        style={mergedStyle}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--accent, #22d3ee)';
          }
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = '';
          }
          props.onBlur?.(e);
        }}
        className={`w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 ${
          error ? 'border-rose-500/50 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}