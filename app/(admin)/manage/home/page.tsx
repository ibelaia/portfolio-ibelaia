'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Radio,
} from 'lucide-react';

interface HomeManageData {
  badge_text: string;
  hero_title: string;
  hero_subtitle: string;
  hero_description: string;
}

const MANAGE_HOME_SYNC_CHANNEL = 'portfolio-sync-home';

export default function ManageHomePage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [livePulse, setLivePulse] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [form, setForm] = useState<HomeManageData>({
    badge_text: 'WELCOME TO MY PORTFOLIO',
    hero_title: 'Ibe Laia',
    hero_subtitle: 'Software Engineer & Full-Stack Developer',
    hero_description:
      'Building responsive web applications and digital solutions.',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const broadcastHomeUpdate = useCallback((updatedData: HomeManageData) => {
    const eventDetail = {
      section: 'home',
      updatedAt: Date.now(),
      data: updatedData,
    };

    try {
      if (syncChannelRef.current) {
        syncChannelRef.current.postMessage(eventDetail);
      }
    } catch {
      // Abaikan jika BroadcastChannel tidak tersedia
    }

    try {
      localStorage.setItem(MANAGE_HOME_SYNC_CHANNEL, JSON.stringify(eventDetail));
    } catch {
      // Abaikan jika localStorage diblokir
    }

    window.dispatchEvent(
      new CustomEvent(MANAGE_HOME_SYNC_CHANNEL, { detail: eventDetail })
    );
    setLivePulse(true);
    setTimeout(() => setLivePulse(false), 1800);
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(MANAGE_HOME_SYNC_CHANNEL);
    }

    async function loadHome() {
      try {
        const response = await fetch('/api/home', { cache: 'no-store' });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success && json.data) {
          const data = json.data;
          setForm({
            badge_text: data.badge_text || 'WELCOME TO MY PORTFOLIO',
            hero_title: data.hero_title || 'Ibe Laia',
            hero_subtitle:
              data.hero_subtitle || 'Software Engineer & Full-Stack Developer',
            hero_description:
              data.hero_description ||
              'Building responsive web applications and digital solutions.',
          });
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat konten Home:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHome();

    return () => {
      isMounted = false;
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(form),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        broadcastHomeUpdate(json.data ?? form);
        router.refresh();
        showToast(
          'Konten Home berhasil disimpan ke Neon & disinkronkan secara real-time!'
        );
      } else {
        showToast(
          `Gagal menyimpan: ${json.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold text-white">
              Kelola Beranda (Home)
            </h1>
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
          <p className="text-slate-300 mt-1">
            Pusat pengaturan konten halaman utama portofolio.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
          <Loader2 size={18} className="animate-spin text-cyan-400" />
          <span>Memuat konten Home dari Neon API...</span>
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="bg-[#0b0e17] border border-white/10 rounded-2xl p-6 space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-400">
                Badge Teks Atas
              </label>
              <input
                type="text"
                value={form.badge_text}
                onChange={(e) =>
                  setForm({ ...form, badge_text: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-slate-400">
                Judul Utama (Hero Title)
              </label>
              <input
                type="text"
                value={form.hero_title}
                onChange={(e) =>
                  setForm({ ...form, hero_title: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-400">
              Subjudul / Peran
            </label>
            <input
              type="text"
              value={form.hero_subtitle}
              onChange={(e) =>
                setForm({ ...form, hero_subtitle: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-slate-400">
              Deskripsi Hero
            </label>
            <textarea
              rows={3}
              value={form.hero_description}
              onChange={(e) =>
                setForm({ ...form, hero_description: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              <Save size={14} />
              <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}