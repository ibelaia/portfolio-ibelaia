'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Radio } from 'lucide-react';
import { SignIn, useAuth } from '@clerk/nextjs';

const AUTH_SYNC_CHANNEL = 'portfolio-sync-auth';

export default function LoginPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const [livePulse, setLivePulse] = useState(false);

  const broadcastAuthSync = useCallback((status: 'signed_in' | 'ready') => {
    const eventDetail = {
      section: 'auth',
      status,
      updatedAt: Date.now(),
    };

    try {
      if (syncChannelRef.current) {
        syncChannelRef.current.postMessage(eventDetail);
      }
    } catch {
      // Abaikan jika BroadcastChannel tidak tersedia
    }

    try {
      localStorage.setItem(AUTH_SYNC_CHANNEL, JSON.stringify(eventDetail));
    } catch {
      // Abaikan jika localStorage diblokir
    }

    window.dispatchEvent(
      new CustomEvent(AUTH_SYNC_CHANNEL, { detail: eventDetail })
    );
    setLivePulse(true);
    setTimeout(() => setLivePulse(false), 1800);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(AUTH_SYNC_CHANNEL);
    }

    return () => {
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      broadcastAuthSync('signed_in');
      router.refresh();
    }
  }, [isSignedIn, broadcastAuthSync, router]);

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-200 flex flex-col items-center justify-center p-4">
      {/* Tombol Kembali ke Website */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-accent transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Website</span>
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border transition-colors ${
            livePulse
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <Radio size={11} className="text-emerald-400" />
          <span>LIVE SYNC</span>
        </span>
      </div>

      {/* Box Card Container */}
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 text-accent font-bold flex items-center justify-center mx-auto text-sm font-mono shadow-lg">
            IB
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">
            Admin Console
          </h1>
          <p className="text-xs text-[var(--text-muted)]">
            Masuk untuk mengelola portofolio
          </p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="w-full flex justify-center [&_.cl-card]:!bg-[#0b0e17] [&_.cl-card]:!border [&_.cl-card]:!border-[var(--card-border)] [&_.cl-card]:!text-slate-100 [&_.cl-headerTitle]:!text-white [&_.cl-headerSubtitle]:!text-slate-300 [&_.cl-formFieldLabel]:!text-slate-200 [&_.cl-formFieldLabel]:!font-semibold [&_.cl-formFieldInput]:!bg-[#121824] [&_.cl-formFieldInput]:!border-[var(--card-border)] [&_.cl-formFieldInput]:!text-white [&_.cl-formFieldInput]:!placeholder-slate-400 [&_.cl-socialButtonsBlockButton]:!bg-[#121824] [&_.cl-socialButtonsBlockButton]:!border-[var(--card-border)] [&_.cl-socialButtonsBlockButton]:!text-white [&_.cl-footerActionText]:!text-slate-300 [&_.cl-footerActionText]:!font-medium [&_.cl-footerActionLink]:!text-accent [&_.cl-footerActionLink]:!font-bold">
          <SignIn routing="hash" fallbackRedirectUrl="/dashboard" />
        </div>
      </div>
    </main>
  );
}