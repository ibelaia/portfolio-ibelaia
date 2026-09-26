'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  GraduationCap,
  Code2,
  Sparkles,
  Terminal,
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AboutManagementPage() {
  const router = useRouter();
  const cvInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    badge_text: 'ABOUT ME',
    name: 'Ibe Laia',
    bio_paragraph_1: "I'm an Informatics student focusing on modern full-stack web development and clean system architectures. I bridge clean UI engineering with robust backend workflows, turning practical concepts into scalable, accessible digital solutions.",
    bio_paragraph_2: 'Passionate about modular engineering, system reliability, and continuous exploration in modern web ecosystems.',
    cv_url: '/resume.pdf',
    contact_btn_link: '/contact',
    edu_major: 'Informatics',
    edu_institution: 'UPN "Veteran" Jawa Timur',
    edu_period: '2024 — Present',
    focus_items: 'Web Architecture\nScalable APIs\nUI/UX Systems',
    focus_tag: 'Production Ready',
    interests_tags: 'Full-Stack, System Design, Web3',
    interests_tag: 'Exploration Track',
    what_i_do_items: 'Full-Stack Systems\nInterface Design\nWorkflow Automation',
    what_i_do_tag: 'Problem Solver'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadAboutData() {
      try {
        const { data, error } = await supabase
          .from('about_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (error) {
          console.warn('Error loading about settings:', error);
        }

        if (data) {
          setForm({
            badge_text: data.badge_text ?? 'ABOUT ME',
            name: data.name ?? 'Ibe Laia',
            bio_paragraph_1: data.bio_paragraph_1 ?? '',
            bio_paragraph_2: data.bio_paragraph_2 ?? '',
            cv_url: data.cv_url ?? '/resume.pdf',
            contact_btn_link: data.contact_btn_link ?? '/contact',
            edu_major: data.edu_major ?? 'Informatics',
            edu_institution: data.edu_institution ?? 'UPN "Veteran" Jawa Timur',
            edu_period: data.edu_period ?? '2024 — Present',
            focus_items: Array.isArray(data.focus_items) ? data.focus_items.join('\n') : '',
            focus_tag: data.focus_tag ?? 'Production Ready',
            interests_tags: Array.isArray(data.interests_tags) ? data.interests_tags.join(', ') : '',
            interests_tag: data.interests_tag ?? 'Exploration Track',
            what_i_do_items: Array.isArray(data.what_i_do_items) ? data.what_i_do_items.join('\n') : '',
            what_i_do_tag: data.what_i_do_tag ?? 'Problem Solver'
          });
        }
      } finally {
        setLoading(false);
      }
    }
    loadAboutData();
  }, []);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran file CV maksimal 8MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm(prev => ({ ...prev, cv_url: reader.result as string }));
        showToast('Berkas CV berhasil diunggah!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: 'default',
      badge_text: form.badge_text,
      name: form.name,
      bio_paragraph_1: form.bio_paragraph_1,
      bio_paragraph_2: form.bio_paragraph_2,
      cv_url: form.cv_url,
      contact_btn_link: form.contact_btn_link,
      edu_major: form.edu_major,
      edu_institution: form.edu_institution,
      edu_period: form.edu_period,
      focus_items: form.focus_items.split('\n').map(i => i.trim()).filter(Boolean),
      focus_tag: form.focus_tag,
      interests_tags: form.interests_tags.split(',').map(i => i.trim()).filter(Boolean),
      interests_tag: form.interests_tag,
      what_i_do_items: form.what_i_do_items.split('\n').map(i => i.trim()).filter(Boolean),
      what_i_do_tag: form.what_i_do_tag,
      updated_at: new Date().toISOString()
    };

    try {
      const { data: existing, error: checkError } = await supabase
        .from('about_settings')
        .select('id')
        .eq('id', 'default')
        .maybeSingle();

      let resError;

      if (existing && !checkError) {
        const { error } = await supabase
          .from('about_settings')
          .update(payload)
          .eq('id', 'default');
        resError = error;
      } else {
        const { error } = await supabase
          .from('about_settings')
          .insert([payload]);
        resError = error;
      }

      setSaving(false);
      if (!resError) {
        showToast('Data halaman About berhasil disimpan ke Supabase!');
      } else {
        console.error('Gagal menyimpan ke Supabase:', resError);
        showToast(`Gagal menyimpan: ${resError.message}`, 'error');
      }
    } catch (err: any) {
      setSaving(false);
      console.error('System error:', err);
      showToast(`Error: ${err.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      <input type="file" ref={cvInputRef} onChange={handleCvUpload} accept=".pdf,.doc,.docx" className="hidden" />

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
                <Link href="/dashboard/about" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <User size={15} className="text-[#c084fc]" />
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
                <Link href="/dashboard/appearance" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                  <Palette size={15} />
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
          <Link href="/about" target="_blank" className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
            <span>Preview About Page</span>
            <ExternalLink size={13} />
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2 pt-2 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
              IB
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Ibe Laia</p>
              <p className="text-[10px] text-slate-500">Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* FORM MANAGEMENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">About Management</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola bio profil, riwayat pendidikan, fokus teknologi, minat, serta tautan CV.</p>
          </div>
          <Link href="/about" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data About dari Supabase...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Kolom Kiri: Profil & Bio */}
              <div className="lg:col-span-6 bg-[#0b0e17] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <User size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">1. Kartu Utama Profil & Bio</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Badge Teks</label>
                    <input type="text" value={form.badge_text} onChange={(e) => setForm({ ...form, badge_text: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Nama Tampilan</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Paragraf Bio 1</label>
                  <textarea rows={4} value={form.bio_paragraph_1} onChange={(e) => setForm({ ...form, bio_paragraph_1: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs leading-relaxed focus:border-cyan-400" />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Paragraf Bio 2</label>
                  <textarea rows={3} value={form.bio_paragraph_2} onChange={(e) => setForm({ ...form, bio_paragraph_2: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs leading-relaxed focus:border-cyan-400" />
                </div>

                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Berkas CV (Tautan atau Unggah)</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.cv_url} onChange={(e) => setForm({ ...form, cv_url: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-slate-300 text-xs font-mono focus:border-cyan-400" />
                      <button type="button" onClick={() => cvInputRef.current?.click()} className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 shrink-0 cursor-pointer">
                        <Upload size={13} />
                        <span>Unggah CV</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Tautan Tombol Sekunder</label>
                    <input type="text" value={form.contact_btn_link} onChange={(e) => setForm({ ...form, contact_btn_link: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-slate-300 text-xs font-mono focus:border-cyan-400" />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: 4 Kartu */}
              <div className="lg:col-span-6 space-y-5">
                
                {/* Education */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <GraduationCap size={15} className="text-cyan-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">2. Education</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Jurusan</label>
                      <input type="text" value={form.edu_major} onChange={(e) => setForm({ ...form, edu_major: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">Periode</label>
                      <input type="text" value={form.edu_period} onChange={(e) => setForm({ ...form, edu_period: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-cyan-400 font-mono text-xs focus:border-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Institusi</label>
                    <input type="text" value={form.edu_institution} onChange={(e) => setForm({ ...form, edu_institution: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-300 text-xs focus:border-cyan-400" />
                  </div>
                </div>

                {/* Current Focus */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Code2 size={15} className="text-purple-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">3. Current Focus</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Poin Fokus (Satu baris per poin)</label>
                    <textarea rows={3} value={form.focus_items} onChange={(e) => setForm({ ...form, focus_items: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs font-mono leading-relaxed focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Label Tag Bawah</label>
                    <input type="text" value={form.focus_tag} onChange={(e) => setForm({ ...form, focus_tag: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-400 font-mono text-xs focus:border-cyan-400" />
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Sparkles size={15} className="text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">4. Interests</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Badge Minat (Pisahkan dengan koma)</label>
                    <input type="text" value={form.interests_tags} onChange={(e) => setForm({ ...form, interests_tags: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Label Tag Bawah</label>
                    <input type="text" value={form.interests_tag} onChange={(e) => setForm({ ...form, interests_tag: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-400 font-mono text-xs focus:border-cyan-400" />
                  </div>
                </div>

                {/* What I Do */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Terminal size={15} className="text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">5. What I Do</span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Layanan Utama (Satu baris per poin)</label>
                    <textarea rows={3} value={form.what_i_do_items} onChange={(e) => setForm({ ...form, what_i_do_items: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs font-mono leading-relaxed focus:border-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Label Tag Bawah</label>
                    <input type="text" value={form.what_i_do_tag} onChange={(e) => setForm({ ...form, what_i_do_tag: e.target.value })} className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-400 font-mono text-xs focus:border-cyan-400" />
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center justify-end gap-3 sticky bottom-4 z-20 p-4 bg-[#07090e]/80 backdrop-blur-md rounded-2xl border border-white/5">
              <Link href="/about" target="_blank" className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-colors">
                Pratinjau Perubahan
              </Link>
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer">
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Simpan Perubahan About</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}