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
  Globe,
  Briefcase,
  MapPin,
  AtSign,
  Code2,
  PanelBottom
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GeneralData {
  site_name: string;
  site_tagline: string;
  availability_status: string;
  contact_email: string;
  location: string;
  github_url: string;
  linkedin_url: string;
  footer_description: string;
  copyright_text: string;
}

export default function GeneralSettingsAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState<GeneralData>({
    site_name: 'IbeLaia.Dev',
    site_tagline: 'Software Engineer & Full-Stack Developer',
    availability_status: 'Available for Hire',
    contact_email: 'ibelaia@example.com',
    location: 'Surabaya, Indonesia',
    github_url: '',
    linkedin_url: '',
    footer_description: 'Building digital solutions with code, creativity, and purpose.',
    copyright_text: '2026 IbeLaia.Dev. All rights reserved.'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadGeneral() {
      try {
        const { data, error } = await supabase
          .from('general_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (data && !error) {
          setForm({
            site_name: data.site_name || '',
            site_tagline: data.site_tagline || '',
            availability_status: data.availability_status || 'Available for Hire',
            contact_email: data.contact_email || '',
            location: data.location || '',
            github_url: data.github_url || '',
            linkedin_url: data.linkedin_url || '',
            footer_description: data.footer_description || '',
            copyright_text: data.copyright_text || ''
          });
        }
      } catch (err) {
        console.warn('Load general settings error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGeneral();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert({
          id: 'default',
          ...form,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSaving(false);
      showToast('Pengaturan General & Footer berhasil disimpan!');
    } catch (err: any) {
      setSaving(false);
      showToast(`Gagal menyimpan: ${err.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

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
                <Link href="/dashboard/appearance" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Palette size={15} />
                  <span>Appearance</span>
                </Link>
                <Link href="/dashboard/seo" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </Link>
                <Link href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <Settings size={15} className="text-[#c084fc]" />
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">General & Footer Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola identitas dasar website, status kerja, tautan sosial, serta konten bagian Footer publik.</p>
          </div>
          <Link href="/" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Website Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat pengaturan umum...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Kartu 1: Identitas Situs */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Globe size={16} className="text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">1. Identitas & Slogan Situs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Nama Situs (Site Name & Logo)</label>
                  <input
                    type="text"
                    value={form.site_name}
                    onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Slogan / Tagline Profesional</label>
                  <input
                    type="text"
                    value={form.site_tagline}
                    onChange={(e) => setForm({ ...form, site_tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Kartu 2: Status & Kontak */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Briefcase size={16} className="text-purple-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">2. Status Ketersediaan & Lokasi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Status Kerja (Availability)</label>
                  <input
                    type="text"
                    value={form.availability_status}
                    onChange={(e) => setForm({ ...form, availability_status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <AtSign size={12} className="text-emerald-400" />
                    <span>Email Kontak Utama</span>
                  </label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="text-rose-400" />
                    <span>Lokasi / Domisili</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Kartu 3: Pengaturan Konten Footer */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <PanelBottom size={16} className="text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">3. Konten Footer Website</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Deskripsi Footer (Di bawah Logo)</label>
                  <textarea
                    rows={2}
                    value={form.footer_description}
                    onChange={(e) => setForm({ ...form, footer_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Teks Hak Cipta (Copyright Footer)</label>
                  <input
                    type="text"
                    value={form.copyright_text}
                    onChange={(e) => setForm({ ...form, copyright_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>
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
                <span>{saving ? 'Menyimpan...' : 'Simpan General & Footer'}</span>
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}