'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Home,
  User,
  Wrench,
  FolderGit2,
  Award,
  FileBadge,
  Mail,
  FolderArchive,
  Palette,
  SearchCheck,
  Settings,
  ExternalLink,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Save,
  Sparkles,
  Monitor,
  Moon,
  Sun
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AppearanceManagementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    theme_mode: 'dark',
    accent_color: 'cyan',
    border_radius: 'rounded-2xl',
    font_family: 'font-sans',
    glassmorphism: true
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadAppearance() {
      try {
        const { data, error } = await supabase
          .from('appearance_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (data && !error) {
          setForm({
            theme_mode: data.theme_mode || 'dark',
            accent_color: data.accent_color || 'cyan',
            border_radius: data.border_radius || 'rounded-2xl',
            font_family: data.font_family || 'font-sans',
            glassmorphism: data.glassmorphism ?? true
          });
        }
      } catch (err) {
        console.warn('Load appearance error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAppearance();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: 'default',
      theme_mode: form.theme_mode,
      accent_color: form.accent_color,
      border_radius: form.border_radius,
      font_family: form.font_family,
      glassmorphism: form.glassmorphism,
      updated_at: new Date().toISOString()
    };

    try {
      const { data: existing } = await supabase
        .from('appearance_settings')
        .select('id')
        .eq('id', 'default')
        .maybeSingle();

      let resError;
      if (existing) {
        const { error } = await supabase
          .from('appearance_settings')
          .update(payload)
          .eq('id', 'default');
        resError = error;
      } else {
        const { error } = await supabase
          .from('appearance_settings')
          .insert([payload]);
        resError = error;
      }

      setSaving(false);
      if (!resError) {
        showToast('Pengaturan Appearance berhasil disimpan!');
      } else {
        showToast(`Gagal menyimpan: ${resError.message}`, 'error');
      }
    } catch (err: any) {
      setSaving(false);
      showToast(`Error: ${err.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const accentColorsList = [
    { id: 'cyan', name: 'Cyber Cyan', bg: 'bg-cyan-400', border: 'border-cyan-400' },
    { id: 'purple', name: 'Neon Purple', bg: 'bg-purple-500', border: 'border-purple-500' },
    { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-400', border: 'border-emerald-400' },
    { id: 'rose', name: 'Rose Pink', bg: 'bg-rose-500', border: 'border-rose-500' },
    { id: 'amber', name: 'Amber Gold', bg: 'bg-amber-400', border: 'border-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
          toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#0b0e17] border-r border-white/5 p-5 shrink-0 min-h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-1.5 px-3 py-2 mb-6">
            <span className="text-xl font-black text-white">IbeLaia</span>
            <span className="text-xl font-black text-[#a855f7]">.Dev</span>
          </div>

          <div className="space-y-6 text-xs">
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Overview</p>
              <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Website Content</p>
              <div className="space-y-1">
                <Link href="/dashboard/home" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Home size={15} />
                  <span>Home</span>
                </Link>
                <Link href="/dashboard/about" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <User size={15} />
                  <span>About</span>
                </Link>
                <Link href="/dashboard/services" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Wrench size={15} />
                  <span>Services</span>
                </Link>
                <Link href="/dashboard/projects" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <FolderGit2 size={15} />
                  <span>Projects</span>
                </Link>
                <Link href="/dashboard/achievements" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Award size={15} />
                  <span>Achievements</span>
                </Link>
                <Link href="/dashboard/certificates" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <FileBadge size={15} />
                  <span>Certificates</span>
                </Link>
                <Link href="/dashboard/contact" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Mail size={15} />
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Assets</p>
              <Link href="/dashboard/media" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <FolderArchive size={15} />
                <span>Media Library</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Settings</p>
              <div className="space-y-1">
                <Link href="/dashboard/appearance" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <Palette size={15} className="text-[#c084fc]" />
                  <span>Appearance</span>
                </Link>
                <Link href="/dashboard/seo" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </Link>
                <Link href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                  <Settings size={15} />
                  <span>General Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <Link href="/" target="_blank" className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
            <span>Preview Website</span>
            <ExternalLink size={13} />
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Appearance Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola tema visual, warna aksen, dan gaya komponen antarmuka portofolio publik.</p>
          </div>
          <Link href="/" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Website Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat pengaturan tampilan...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Tema Mode */}
              <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <Moon size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">1. Mode Tampilan (Theme Mode)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark Mode', icon: Moon },
                    { id: 'light', label: 'Light Mode', icon: Sun },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setForm({ ...form, theme_mode: mode.id })}
                      className={`p-4 rounded-xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        form.theme_mode === mode.id
                          ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-500/10'
                          : 'bg-[#07090e] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <mode.icon size={18} />
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Warna Aksen Utama */}
              <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <Sparkles size={16} className="text-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">2. Warna Aksen (Accent Color)</span>
                </div>

                <div className="grid grid-cols-5 gap-3 pt-2">
                  {accentColorsList.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setForm({ ...form, accent_color: color.id })}
                      className={`h-12 rounded-xl ${color.bg} flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                        form.accent_color === color.id ? 'ring-4 ring-white/30 scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={color.name}
                    >
                      {form.accent_color === color.id && <CheckCircle2 size={16} className="text-slate-950 font-bold" />}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-1">Terpilih: <strong className="text-white capitalize">{form.accent_color}</strong></p>
              </div>

            </div>

            {/* Layout & Styling Detail */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Palette size={16} className="text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">3. Gaya Kartu & Efek Visual</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Kelengkungan Sudut (Border Radius)</label>
                  <select
                    value={form.border_radius}
                    onChange={(e) => setForm({ ...form, border_radius: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  >
                    <option value="rounded-xl">Rounded Medium (12px)</option>
                    <option value="rounded-2xl">Rounded Large (16px)</option>
                    <option value="rounded-3xl">Rounded Extra Large (24px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Gaya Tipografi (Font Family)</label>
                  <select
                    value={form.font_family}
                    onChange={(e) => setForm({ ...form, font_family: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  >
                    <option value="font-sans">Inter / Modern Sans</option>
                    <option value="font-mono">JetBrains / Monospace Code</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between p-4 rounded-xl bg-[#07090e] border border-white/10">
                <div>
                  <p className="text-xs font-bold text-white">Efek Transparansi Kaca (Glassmorphism)</p>
                  <p className="text-[11px] text-slate-500">Mengaktifkan efek blur latar belakang pada navbar dan kartu portofolio.</p>
                </div>
                <input
                  type="checkbox"
                  checked={form.glassmorphism}
                  onChange={(e) => setForm({ ...form, glassmorphism: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan Tampilan'}</span>
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}