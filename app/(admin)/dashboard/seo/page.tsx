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
  Globe, 
  Search, 
  Share2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles, 
  FileText, 
  Tag, 
  Image as ImageIcon,
  Monitor,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SeoData {
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image: string;
  author_name: string;
}

export default function SeoSettingsAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [seo, setSeo] = useState<SeoData>({
    meta_title: 'Ibe Laia | Software Engineer & Full-Stack Developer',
    meta_description: 'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions berbasis di Surabaya, Indonesia.',
    keywords: 'Ibe Laia, Software Engineer, Full-Stack Developer, Portofolio IT',
    og_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    author_name: 'Ibe Laia'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function fetchSeo() {
      try {
        const { data, error } = await supabase
          .from('seo_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (data && !error) {
          setSeo({
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            keywords: data.keywords || '',
            og_image: data.og_image || '',
            author_name: data.author_name || ''
          });
        }
      } catch (err) {
        console.warn('Error fetching SEO settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('seo_settings')
        .upsert({
          id: 'default',
          ...seo,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSaving(false);
      showToast('Pengaturan SEO berhasil disimpan & diperbarui!');
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

      {/* SIDEBAR (Sama persis seperti halaman Appearance) */}
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
                <Link href="/dashboard/seo" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <SearchCheck size={15} className="text-[#c084fc]" />
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">SEO & Meta Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola identitas mesin pencari, metadata Google, dan pratinjau sosial media portofolio Anda.</p>
          </div>
          <Link href="/" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Website Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat konfigurasi SEO...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form Input Kiri (7 Kolom) */}
              <div className="lg:col-span-7 bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <Sparkles size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">Metadata Utama Website</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <FileText size={13} className="text-cyan-400" />
                    <span>Meta Title (Judul Halaman / Browser)</span>
                  </label>
                  <input
                    type="text"
                    value={seo.meta_title}
                    onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
                    placeholder="Contoh: Ibe Laia | Software Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white placeholder-slate-600 focus:border-cyan-400 outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-500 block">Panjang ideal: 50–60 karakter.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Search size={13} className="text-purple-400" />
                    <span>Meta Description (Deskripsi Ringkas Google)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={seo.meta_description}
                    onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                    placeholder="Tulis ringkasan portofolio Anda..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white placeholder-slate-600 focus:border-cyan-400 outline-none resize-none"
                  />
                  <span className="text-[10px] text-slate-500 block">Panjang ideal: 120–150 karakter.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <Tag size={13} className="text-emerald-400" />
                    <span>Keywords (Kata Kunci Pemisah Koma)</span>
                  </label>
                  <input
                    type="text"
                    value={seo.keywords}
                    onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
                    placeholder="Software Engineer, Full-Stack, Surabaya..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white placeholder-slate-600 focus:border-cyan-400 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <User size={13} className="text-amber-400" />
                    <span>Author Name (Pemilik / Pembuat Situs)</span>
                  </label>
                  <input
                    type="text"
                    value={seo.author_name}
                    onChange={(e) => setSeo({ ...seo, author_name: e.target.value })}
                    placeholder="Ibe Laia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white placeholder-slate-600 focus:border-cyan-400 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-rose-400" />
                    <span>OG Image URL (URL Gambar Share Sosmed / WhatsApp)</span>
                  </label>
                  <input
                    type="text"
                    value={seo.og_image}
                    onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white placeholder-slate-600 focus:border-cyan-400 outline-none font-mono truncate"
                  />
                </div>
              </div>

              {/* Live Preview Kanan (5 Kolom) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Google Preview */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Monitor size={14} className="text-cyan-400" />
                      <span>Google Search Preview</span>
                    </span>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">Live</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl text-slate-900 space-y-1 shadow-md">
                    <div className="flex items-center gap-1 text-[11px] text-emerald-800 font-mono">
                      <span>https://ibelaia.dev</span>
                      <span className="text-slate-400">› portfolio</span>
                    </div>
                    <h3 className="text-blue-600 font-medium text-sm hover:underline cursor-pointer leading-snug line-clamp-1">
                      {seo.meta_title || 'Judul Web Anda'}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {seo.meta_description || 'Deskripsi singkat website akan muncul di sini...'}
                    </p>
                  </div>
                </div>

                {/* Social Media Preview */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/5 pb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Share2 size={14} className="text-emerald-400" />
                      <span>Social Media Preview (WhatsApp)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">Card</span>
                  </div>

                  <div className="bg-[#07090e] border border-white/10 rounded-xl overflow-hidden shadow-md">
                    {seo.og_image && (
                      <div className="w-full h-32 bg-slate-950 overflow-hidden">
                        <img 
                          src={seo.og_image} 
                          alt="OG Preview" 
                          className="w-full h-full object-cover opacity-90"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      </div>
                    )}
                    <div className="p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">ibelaia.dev</span>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {seo.meta_title || 'Judul Website'}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {seo.meta_description || 'Deskripsi pratinjau saat dibagikan...'}
                      </p>
                    </div>
                  </div>
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
                <span>{saving ? 'Menyimpan...' : 'Simpan Pengaturan SEO'}</span>
              </button>
            </div>

          </form>
        )}
      </main>
    </div>
  );
}