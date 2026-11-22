'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Check, X, Radio } from 'lucide-react';

const MANAGE_ABOUT_SYNC_CHANNEL = 'portfolio-sync-about';

export default function ManageAboutPage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [livePulse, setLivePulse] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const broadcastAboutUpdate = useCallback(
    (updatedData: {
      bio: string;
      title: string;
      experience_years: string;
      avatar_url: string;
    }) => {
      const eventDetail = {
        section: 'about',
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
        localStorage.setItem(
          MANAGE_ABOUT_SYNC_CHANNEL,
          JSON.stringify(eventDetail)
        );
      } catch {
        // Abaikan jika localStorage diblokir
      }

      window.dispatchEvent(
        new CustomEvent(MANAGE_ABOUT_SYNC_CHANNEL, { detail: eventDetail })
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 1800);
    },
    []
  );

  const fetchAboutData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/about', { cache: 'no-store' });
      const json = await response.json();

      if (json.success && json.data) {
        const data = json.data;
        setBio(data.bio || data.bio_paragraph_1 || '');
        setTitle(data.title || data.badge_text || '');
        setExperienceYears(data.experience_years || '');
        setAvatarUrl(data.avatar_url || data.cv_url || '');
      }
    } catch (err) {
      console.warn('Gagal memuat data about profile:', err);
      showToast('Gagal memuat data profil', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(MANAGE_ABOUT_SYNC_CHANNEL);
      syncChannelRef.current.onmessage = () => {
        if (isMounted) {
          fetchAboutData();
        }
      };
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === MANAGE_ABOUT_SYNC_CHANNEL && isMounted) {
        fetchAboutData();
      }
    };

    window.addEventListener('storage', handleStorageSync);
    fetchAboutData();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageSync);
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, [fetchAboutData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      bio,
      title,
      experience_years: experienceYears,
      avatar_url: avatarUrl,
    };

    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        broadcastAboutUpdate(json.data ?? payload);
        router.refresh();
        showToast(
          'Profil About berhasil diperbarui ke Neon & disinkronkan secara real-time!'
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

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <span className="text-sm text-slate-400 font-mono">
          Memuat data About dari Neon API...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-3xl font-extrabold text-white">
            Kelola Halaman About
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
        <p className="text-slate-400 text-sm mt-1">
          Perbarui informasi profil dan bio utama portofolio Anda via Neon
          secara dinamis dan real-time.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Judul / Peran Utama (Headline)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            placeholder="Contoh: Full-Stack Developer & UI/UX Designer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Pengalaman (Tahun)
          </label>
          <input
            type="text"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            placeholder="Contoh: 3+ Tahun"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            URL Foto Profil / Avatar
          </label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Bio / Deskripsi Singkat
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
            placeholder="Tuliskan deskripsi diri atau latar belakang Anda di sini..."
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}