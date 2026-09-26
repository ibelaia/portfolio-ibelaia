'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
      } else if (data.session) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050711] text-slate-200 flex flex-col items-center justify-center p-4">
      {/* Tombol Balik ke Web */}
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Kembali ke Website</span>
        </Link>
      </div>

      {/* Box Card Form */}
      <div className="w-full max-w-sm bg-[#090e1f]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold font-mono text-base mx-auto mb-3">
            IB
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-400 mt-1">Masuk untuk mengelola portofolio</p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono">Master Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050711] border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <span>{loading ? 'Memeriksa Akses...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>
      </div>
    </main>
  );
}