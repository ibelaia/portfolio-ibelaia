'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Save, Check, X } from 'lucide-react';

export default function ManageAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAboutData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('about_profile')
      .select('*')
      .single();

    if (data) {
      setBio(data.bio || '');
      setTitle(data.title || '');
      setExperienceYears(data.experience_years || '');
      setAvatarUrl(data.avatar_url || '');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      bio,
      title,
      experience_years: experienceYears,
      avatar_url: avatarUrl,
    };

    // Cek apakah data sudah ada, lakukan upsert
    const { error } = await supabase
      .from('about_profile')
      .upsert({ id: 1, ...payload });

    if (error) {
      showToast('Gagal menyimpan profil About', 'error');
    } else {
      showToast('Profil About berhasil diperbarui!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
        <span className="text-sm text-slate-400 font-mono">Memuat data About...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-white">Kelola Halaman About</h1>
        <p className="text-slate-400 text-sm mt-1">Perbarui informasi profil dan bio utama portofolio Anda.</p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Judul / Peran Utama (Headline)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            placeholder="Contoh: Full-Stack Developer & UI/UX Designer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Pengalaman (Tahun)</label>
          <input
            type="text"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            placeholder="Contoh: 3+ Tahun"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">URL Foto Profil / Avatar</label>
          <input
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Deskripsi Singkat</label>
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
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}