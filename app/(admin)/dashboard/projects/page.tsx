'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Eye,
  FileText,
  Sparkles,
  Wand2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SubProjectItem {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  link?: string;
  tags?: string[];
}

interface ModularBlock {
  id: string;
  type: 'narasi_foto' | 'kartu_proyek' | 'ulasan_artikel' | 'tombol_aksi' | 'linimasa';
  title: string;
  content: string;
  image?: string;
  link?: string;
}

const IT_CATEGORIES = [
  'Mobile Application',
  'Web Application',
  'Full-Stack System',
  'UI/UX Design',
  'Backend & API Engine',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Cybersecurity & Network',
  'Blockchain & Web3',
  'Data Science & Analytics',
  'Internet of Things (IoT)',
  'Game Development',
  'Enterprise Software'
];

function ProjectsManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdParam = searchParams.get('edit');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blockImageInputRef = useRef<HTMLInputElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [activeView, setActiveView] = useState<'hub' | 'form'>('hub');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: 'single' as 'single' | 'multi',
    title: '',
    slug: '',
    category: 'Web Application',
    status: 'PUBLISHED',
    overview: '',
    tags: 'Next.js, TypeScript, Tailwind CSS',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    github_url: 'https://github.com/ibelaia',
    live_url: '',
    role: 'Full-Stack Developer',
    client: 'Tourism Digital Initiative',
    year: '2026',
    problem: '',
    solution: '',
    deliverables: '',
    collection_items: [] as SubProjectItem[],
    modular_blocks: [] as ModularBlock[]
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchCountAndCheckEdit(editIdParam);
  }, [editIdParam]);

  const fetchCountAndCheckEdit = async (editId: string | null) => {
    setLoading(true);
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    if (count !== null) setTotalCount(count);

    if (editId) {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', editId)
        .single();

      if (!error && data) {
        setEditingId(data.id);
        
        const rawItems = Array.isArray(data.collection_items) ? data.collection_items : [];
        const isModular = rawItems.length > 0 && 'type' in rawItems[0];

        setForm({
          type: data.type || 'single',
          title: data.title || '',
          slug: data.slug || '',
          category: data.category || 'Web Application',
          status: data.status || 'PUBLISHED',
          overview: data.overview || '',
          tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
          thumbnail: data.thumbnail || '',
          github_url: data.github_url || '',
          live_url: data.live_url || '',
          role: data.role || 'Full-Stack Developer',
          client: data.client || 'Personal Project',
          year: data.year || '2026',
          problem: data.problem || '',
          solution: data.solution || '',
          deliverables: Array.isArray(data.deliverables) ? data.deliverables.join('\n') : '',
          collection_items: !isModular ? rawItems : [],
          modular_blocks: isModular ? rawItems : []
        });
        setActiveView('form');
      }
    }
    setLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran file maksimal 4MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm(prev => ({ ...prev, thumbnail: reader.result as string }));
        showToast('Banner utama berhasil dimuat!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBlockImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeBlockId) return;
    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran file maksimal 4MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateBlock(activeBlockId, 'image', reader.result);
        showToast('Gambar blok berhasil dimuat dari laptop!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      type: 'single',
      title: '',
      slug: '',
      category: 'Web Application',
      status: 'PUBLISHED',
      overview: '',
      tags: '',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      github_url: 'https://github.com/ibelaia',
      live_url: '',
      role: 'Full-Stack Developer',
      client: 'Internal Project',
      year: '2026',
      problem: '',
      solution: '',
      deliverables: '',
      collection_items: [],
      modular_blocks: []
    });
    setActiveView('form');
  };

  const handleAddBlock = (type: ModularBlock['type']) => {
    const titles: Record<ModularBlock['type'], string> = {
      narasi_foto: 'Narasi & Ilustrasi Foto',
      kartu_proyek: 'Komponen Kartu Proyek',
      ulasan_artikel: 'Ulasan Artikel / Studi Kasus',
      tombol_aksi: 'Tombol Tautan Aksi',
      linimasa: 'Linimasa Milestone'
    };

    const newBlock: ModularBlock = {
      id: `block-${Date.now()}`,
      type,
      title: titles[type],
      content: '',
      image: '',
      link: ''
    };

    setForm(prev => ({ ...prev, modular_blocks: [...prev.modular_blocks, newBlock] }));
    showToast(`Blok "${titles[type]}" berhasil ditambahkan!`);
  };

  const handleUpdateBlock = (id: string, field: keyof ModularBlock, val: string) => {
    setForm(prev => ({
      ...prev,
      modular_blocks: prev.modular_blocks.map(b => b.id === id ? { ...b, [field]: val } : b)
    }));
  };

  const handleRemoveBlock = (id: string) => {
    setForm(prev => ({
      ...prev,
      modular_blocks: prev.modular_blocks.filter(b => b.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const deliverablesArray = form.deliverables
      .split('\n')
      .map(d => d.trim())
      .filter(Boolean);

    const payload = {
      type: form.type,
      title: form.title,
      slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
      category: form.category,
      status: form.status,
      overview: form.overview,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail: form.thumbnail,
      github_url: form.github_url,
      live_url: form.live_url,
      role: form.role,
      client: form.client,
      year: form.year,
      problem: form.problem,
      solution: form.solution,
      deliverables: deliverablesArray,
      collection_items: form.type === 'multi' ? form.collection_items : form.modular_blocks
    };

    let resError;
    if (editingId) {
      const { error } = await supabase.from('projects').update(payload).eq('id', editingId);
      resError = error;
    } else {
      const { error } = await supabase.from('projects').insert([payload]);
      resError = error;
    }

    setSaving(false);
    if (resError) {
      showToast(`Gagal menyimpan: ${resError.message}`, 'error');
    } else {
      showToast(editingId ? 'Proyek & Blok berhasil diperbarui!' : 'Proyek baru berhasil disimpan!');
      router.push('/dashboard/projects/list');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
      <input type="file" ref={blockImageInputRef} onChange={handleBlockImageUpload} accept="image/*" className="hidden" />

      <datalist id="it-categories-list">
        {IT_CATEGORIES.map((cat, idx) => (
          <option key={idx} value={cat} />
        ))}
      </datalist>

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
                <Link href="/dashboard/projects/list" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <FolderGit2 size={15} className="text-[#c084fc]" />
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
                <Link href="/dashboard/settings" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                  <Settings size={15} />
                  <span>General Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <Link href="/projects" target="_blank" className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
            <span>Preview Projects</span>
            <ExternalLink size={13} />
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-400 mb-2">
              <Sparkles size={12} />
              <span>CUSTOM PROJECTS BUILDER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Projects Management Hub</h1>
            <p className="text-xs text-slate-400 mt-1">Pusat kontrol untuk merancang, menyusun blok modular, dan mengelola portofolio proyek.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Eye size={13} className="text-cyan-400" />
              <span>Lihat Halaman Publik</span>
            </Link>
            {activeView === 'form' && (
              <button
                type="button"
                onClick={() => setActiveView('hub')}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
              >
                ← Kembali ke Hub
              </button>
            )}
          </div>
        </div>

        {activeView === 'hub' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div 
                onClick={handleOpenAdd}
                className="group relative bg-gradient-to-br from-[#0e1424] to-[#0b0e17] border border-cyan-500/30 hover:border-cyan-400/60 rounded-3xl p-7 sm:p-8 cursor-pointer shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Plus size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight mb-1">Buat Proyek / Section Baru</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Rancang halaman studi kasus baru atau koleksi multi-proyek dengan menyusun blok modular sesuai kebutuhan portofolio Anda.
                    </p>
                  </div>
                </div>
                <div className="pt-8 relative z-10 flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Mulai Menyusun Form</span>
                  <span>→</span>
                </div>
              </div>

              <div 
                onClick={() => router.push('/dashboard/projects/list')}
                className="group relative bg-gradient-to-br from-[#0e1424] to-[#0b0e17] border border-purple-500/30 hover:border-purple-400/60 rounded-3xl p-7 sm:p-8 cursor-pointer shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
                <div className="space-y-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <FolderArchive size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight mb-1">Kelola & Daftar Proyek</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pantau ringkasan, sunting detail studi kasus, atau hapus arsip proyek yang pernah dipublikasikan di website.
                    </p>
                  </div>
                </div>
                <div className="pt-8 relative z-10 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Total Proyek: <strong className="text-white">{totalCount}</strong></span>
                  <span className="text-purple-400 font-bold group-hover:translate-x-1 transition-transform">Buka Halaman Daftar →</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {activeView === 'form' && (
          <div className="bg-[#0b0e17] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in duration-300 space-y-8">
            
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editingId ? '🛠️ Edit Detail Proyek & Blok Modular' : '🛠️ Buat Halaman & Blok Modular Baru'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Susun tata letak halaman studi kasus atau koleksi dengan blok fleksibel di bawah.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('hub')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 text-xs">
              
              <div className="p-4 rounded-2xl bg-[#07090e] border border-white/10 space-y-2">
                <label className="block text-slate-300 font-mono font-bold">Pilih Tipe Proyek:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'single' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      form.type === 'single'
                        ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/10'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText size={14} />
                    <span>Single Case Study</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'multi' })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      form.type === 'multi'
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-md shadow-purple-500/10'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    <FolderArchive size={14} />
                    <span>Multi-Project Collection</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400 font-mono">Foto Banner Utama / Cover</label>
                <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 group">
                  <img src={form.thumbnail || '/placeholder.svg'} alt="Hero Banner" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Upload size={14} />
                      <span>Ganti Gambar dari Laptop</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold block">1. Informasi Utama</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Judul Proyek / Koleksi</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. JawaTrip Mobile Travel Platform"
                      value={form.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setForm({ ...form, title: val, slug });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Slug URL / Rute</label>
                    <input
                      type="text"
                      required
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-400 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Kategori</label>
                    <input
                      list="it-categories-list"
                      type="text"
                      required
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="IN PROGRESS">IN PROGRESS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Timeline (Year)</label>
                    <input
                      type="text"
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Deskripsi Singkat (Teaser)</label>
                  <textarea
                    rows={2}
                    required
                    value={form.overview}
                    onChange={(e) => setForm({ ...form, overview: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Tech Stack / Tools (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              {form.type === 'single' && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider font-bold block">2. Project Metrics & Case Study Blocks</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Role (Peran)</label>
                      <input
                        type="text"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-mono">Client / Track</label>
                      <input
                        type="text"
                        value={form.client}
                        onChange={(e) => setForm({ ...form, client: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Problem & Challenges</label>
                    <textarea
                      rows={2}
                      value={form.problem}
                      onChange={(e) => setForm({ ...form, problem: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">The Solution & Approach</label>
                    <textarea
                      rows={2}
                      value={form.solution}
                      onChange={(e) => setForm({ ...form, solution: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">Key Deliverables & Results (1 baris per item)</label>
                    <textarea
                      rows={3}
                      value={form.deliverables}
                      onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* 🛠️ SUSUN BLOK HALAMAN DETAIL (MODULAR BLOCKS) */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Wand2 size={16} className="text-cyan-400" />
                      <span>🛠️ Susun Blok Halaman Detail (Modular Blocks)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Tambahkan berbagai jenis blok konten di bawah ini sesuai kebutuhan tanpa batas.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 pb-2">
                  <button
                    type="button"
                    onClick={() => handleAddBlock('narasi_foto')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Narasi Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock('kartu_proyek')}
                    className="px-3.5 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Kartu Proyek</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock('ulasan_artikel')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Ulasan Artikel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock('tombol_aksi')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Tombol Aksi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddBlock('linimasa')}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Linimasa (Timeline)</span>
                  </button>
                </div>

                {form.modular_blocks.length === 0 ? (
                  <div className="py-10 text-center bg-[#07090e] border border-dashed border-white/10 rounded-2xl p-6 text-slate-500 font-mono">
                    Belum ada blok tambahan. Klik tombol di atas untuk menyusun halaman detail.
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {form.modular_blocks.map((block, idx) => {
                      const blockType = (block.type || 'ulasan_artikel').toUpperCase();

                      return (
                        <div key={block.id} className="p-4 rounded-2xl bg-[#07090e] border border-white/10 space-y-3 relative group">
                          <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono font-bold text-cyan-400">
                                #{idx + 1} — {blockType}
                              </span>
                              <input
                                type="text"
                                value={block.title || ''}
                                onChange={(e) => handleUpdateBlock(block.id, 'title', e.target.value)}
                                className="bg-transparent text-white font-bold text-xs focus:outline-none border-b border-transparent focus:border-cyan-400 px-1"
                                placeholder="Judul Blok..."
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveBlock(block.id)}
                              className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Hapus Blok"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>

                          {block.type === 'narasi_foto' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                              <textarea
                                rows={3}
                                placeholder="Tulis narasi atau penjelasan cerita..."
                                value={block.content || ''}
                                onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-white text-xs leading-relaxed"
                              />
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                                  <img src={block.image || '/placeholder.svg'} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="URL Gambar..."
                                    value={block.image || ''}
                                    onChange={(e) => handleUpdateBlock(block.id, 'image', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-slate-300 font-mono text-[11px]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveBlockId(block.id);
                                      blockImageInputRef.current?.click();
                                    }}
                                    className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    <Upload size={12} />
                                    <span>Laptop</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {block.type === 'ulasan_artikel' && (
                            <textarea
                              rows={3}
                              placeholder="Tulis ulasan artikel, studi kasus, atau catatan riset lengkap..."
                              value={block.content || ''}
                              onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-white text-xs leading-relaxed"
                            />
                          )}

                          {block.type === 'kartu_proyek' && (
                            <input
                              type="text"
                              placeholder="Deskripsi ringkas atau daftar fitur kartu grid..."
                              value={block.content || ''}
                              onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-white text-xs"
                            />
                          )}

                          {block.type === 'tombol_aksi' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Label Tombol (e.g. Buka Dokumentasi)"
                                value={block.content || ''}
                                onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-white text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Tautan URL (https://...)"
                                value={block.link || ''}
                                onChange={(e) => handleUpdateBlock(block.id, 'link', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-slate-300 font-mono text-xs"
                              />
                            </div>
                          )}

                          {block.type === 'linimasa' && (
                            <textarea
                              rows={2}
                              placeholder="Tahapan milestone atau kronologi waktu kejadian..."
                              value={block.content || ''}
                              onChange={(e) => handleUpdateBlock(block.id, 'content', e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-[#0b0e17] border border-white/10 text-white text-xs leading-relaxed"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* TAUTAN SUMBER & SIMPAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">View Source / GitHub / Figma URL</label>
                  <input
                    type="text"
                    placeholder="https://github.com/..."
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">Live Demo URL (Opsional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={form.live_url}
                    onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveView('hub')}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:opacity-90 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  <span>💾 Simpan Halaman & Section Proyek</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default function ProjectsManagementPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-cyan-400 font-mono text-xs">
        Memuat halaman proyek...
      </div>
    }>
      <ProjectsManagementContent />
    </Suspense>
  );
}