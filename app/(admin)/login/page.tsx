'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-200 flex flex-col items-center justify-center p-4">
      {/* Tombol Kembali ke Website */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-accent transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Website</span>
        </Link>
      </div>

      {/* Box Card Container */}
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 text-accent font-bold flex items-center justify-center mx-auto text-sm font-mono shadow-lg">
            IB
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-main)] tracking-tight">Admin Console</h1>
          <p className="text-xs text-[var(--text-muted)]">Masuk untuk mengelola portofolio</p>
        </div>

        {/* Clerk SignIn Component dengan Pemaksaan Warna Teks Footer Menjadi Hitam Jelas */}
        <div className="w-full flex justify-center [&_.cl-card]:!bg-[#0b0e17] [&_.cl-card]:!border [&_.cl-card]:!border-[var(--card-border)] [&_.cl-card]:!text-slate-100 [&_.cl-headerTitle]:!text-white [&_.cl-headerSubtitle]:!text-slate-300 [&_.cl-formFieldLabel]:!text-slate-200 [&_.cl-formFieldLabel]:!font-semibold [&_.cl-formFieldInput]:!bg-[#121824] [&_.cl-formFieldInput]:!border-[var(--card-border)] [&_.cl-formFieldInput]:!text-white [&_.cl-formFieldInput]:!placeholder-slate-400 [&_.cl-socialButtonsBlockButton]:!bg-[#121824] [&_.cl-socialButtonsBlockButton]:!border-[var(--card-border)] [&_.cl-socialButtonsBlockButton]:!text-white [&_.cl-footerActionText]:!text-slate-900 [&_.cl-footerActionText]:!font-medium [&_.cl-footerActionLink]:!text-accent [&_.cl-footerActionLink]:!font-bold">
          <SignIn 
            routing="hash"
            fallbackRedirectUrl="/dashboard"
          />
        </div>
      </div>
    </main>
  );
}