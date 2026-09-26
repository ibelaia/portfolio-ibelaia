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
  Trash2,
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowLeft,
  Search,
  Layers,
  Plus,
  X,
  Save,
  Upload,
  Star
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

interface Project {
  id: string;
  type?: 'single' | 'multi';
  title: string;
  slug: string;
  category: string;
  status: string;
  overview: string;
  tags: string[];
  thumbnail: string;
  github_url?: string;
  live_url?: string;
  is_featured?: boolean;
  collection_items?: SubProjectItem[];
}

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'multi'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
  const [selectedMultiProject, setSelectedMultiProject] = useState<Project | null>(null);
  const [subItems, setSubItems] = useState<SubProjectItem[]>([]);
  const [savingSub, setSavingSub] = useState(false);

  const activeSubInputRef = useRef<HTMLInputElement>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Mengurutkan agar proyek yang berbintang (is_featured = true) otomatis naik ke urutan paling atas
      const sortedData = [...data].sort((a, b) => {
        if (a.is_featured === b.is_featured) return 0;
        return a.is_featured ? -1 : 1;
      });
      setProjects(sortedData);
    }
    setLoading(false);
  };

  // Fungsi Toggle Bintang (Featured) Proyek
  const handleToggleFeatured = async (id: string, currentStatus: boolean, title: string) => {
    const newStatus = !currentStatus;
    const { error } = await supabase
      .from('projects')
      .update({ is_featured: newStatus })
      .eq('id', id);

    if (error) {
      showToast(`Gagal memperbarui status bintang: ${error.message}`, 'error');
    } else {
      setProjects(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, is_featured: newStatus } : p);
        // Urutkan ulang secara dinamis agar langsung naik ke atas grid
        return updated.sort((a, b) => {
          if (a.is_featured === b.is_featured) return 0;
          return a.is_featured ? -1 : 1;
        });
      });
      showToast(newStatus ? `Proyek "${title}" disematkan ke halaman utama!` : `Proyek "${title}" dilepas dari sematan.`);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus proyek "${title}" secara permanen?`)) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus: ${error.message}`, 'error');
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
      showToast(`Proyek "${title}" berhasil dihapus.`);
    }
  };

  const handleOpenMultiModal = (p: Project) => {
    setSelectedMultiProject(p);
    setSubItems(Array.isArray(p.collection_items) ? p.collection_items : []);
    setIsMultiModalOpen(true);
  };

  const handleAddSubItem = () => {
    const newItem: SubProjectItem = {
      id: `item-${Date.now()}`,
      title: `Sub-Proyek Baru ${subItems.length + 1}`,
      subtitle: 'UI/UX Exploration',
      desc: 'Deskripsi singkat item eksplorasi desain ini...',
      image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
      link: '',
      tags: ['Figma', 'UI/UX']
    };
    setSubItems([...subItems, newItem]);
  };

  const handleUpdateSubItem = (id: string, field: keyof SubProjectItem, val: any) => {
    setSubItems(subItems.map(item => item.id === id ? { ...item, [field]: val } : item));
  };

  const handleRemoveSubItem = (id: string) => {
    setSubItems(subItems.filter(item => item.id !== id));
  };

  const handleSubFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSubId) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran file maksimal 4MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateSubItem(activeSubId, 'image', reader.result);
        showToast('Gambar sub-item berhasil dimuat dari laptop!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSubItems = async () => {
    if (!selectedMultiProject) return;
    setSavingSub(true);

    const { error } = await supabase
      .from('projects')
      .update({ collection_items: subItems })
      .eq('id', selectedMultiProject.id);

    setSavingSub(false);
    if (error) {
      showToast(`Gagal menyimpan item koleksi: ${error.message}`, 'error');
    } else {
      showToast('Item koleksi multi-proyek berhasil diperbarui!');
      setIsMultiModalOpen(false);
      fetchProjects();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const filteredProjects = projects.filter(p => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'single' && (p.type === 'single' || !p.type)) || 
      (activeTab === 'multi' && p.type === 'multi');

    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      <input type="file" ref={activeSubInputRef} onChange={handleSubFileUpload} accept="image/*" className="hidden" />

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
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6 overflow-x-hidden">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="space-y-1">
            <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline mb-1">
              <ArrowLeft size={13} />
              <span>Kembali ke Projects Hub</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Kelola & Daftar Proyek Terpublikasi</h1>
            <p className="text-xs text-slate-400">Pusat daftar seluruh studi kasus dan koleksi portofolio yang aktif.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek..."
              className="w-full pl-9 pr-4 py-2 bg-[#0b0e17] border border-white/10 focus:border-cyan-400 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none transition-all shadow-inner"
            />
            <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-[#0b0e17] border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-[#0b0e17] border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Single Case Study ({projects.filter(p => p.type === 'single' || !p.type).length})
          </button>
          <button
            onClick={() => setActiveTab('multi')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'multi'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-[#0b0e17] border border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            Multi-Project Collection ({projects.filter(p => p.type === 'multi').length})
          </button>
        </div>

        {/* Daftar Kartu Proyek */}
        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat daftar proyek...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-[#0b0e17] border border-white/5 rounded-3xl p-8 space-y-3">
            <FolderGit2 size={36} className="mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-white">Tidak ada proyek ditemukan pada kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((p) => {
              const isMulti = p.type === 'multi';
              const targetPublicUrl = isMulti ? `/projects/collection/${p.slug}` : `/projects/${p.slug}`;
              const subItemsCount = Array.isArray(p.collection_items) ? p.collection_items.length : 0;
              const isStarred = Boolean(p.is_featured);

              return (
                <div key={p.id} className={`bg-[#0b0e17] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl ${
                  isStarred ? 'border-amber-400/50 shadow-amber-500/10' : 'border-white/5 hover:border-white/15'
                }`}>
                  <div>
                    <div className="relative w-full h-36 bg-slate-950 overflow-hidden">
                      <img src={p.thumbnail || '/placeholder.svg'} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      
                      {/* Badge Kategori & Multi */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 backdrop-blur-md border border-white/10 text-cyan-400 font-bold">
                          {p.category}
                        </span>
                        {isMulti && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-purple-500/80 text-white flex items-center gap-1">
                            <FolderArchive size={10} /> Multi ({subItemsCount})
                          </span>
                        )}
                      </div>

                      {/* Tombol Bintang (Featured / Starred) di Pojok Kanan Atas */}
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p.id, isStarred, p.title)}
                          className={`p-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-lg flex items-center gap-1 text-[10px] font-mono font-bold ${
                            isStarred
                              ? 'bg-amber-500/90 border-amber-400 text-slate-950 shadow-amber-500/30'
                              : 'bg-black/60 border-white/10 text-slate-400 hover:text-amber-300'
                          }`}
                          title={isStarred ? 'Proyek Unggulan (Tampil di Web Personal)' : 'Jadikan Proyek Unggulan'}
                        >
                          <Star size={13} className={isStarred ? 'fill-slate-950 text-slate-950' : ''} />
                        </button>
                        
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {p.status || 'PUBLISHED'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{p.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.overview}</p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between bg-[#07090e]/50 text-xs">
                    <Link href={targetPublicUrl} target="_blank" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors" title="Lihat Halaman Publik">
                      <Eye size={13} />
                    </Link>
                    <div className="flex items-center gap-2">
                      {isMulti ? (
                        <button
                          type="button"
                          onClick={() => handleOpenMultiModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 font-mono text-[11px] text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Layers size={11} />
                          <span>Kelola Item ({subItemsCount})</span>
                        </button>
                      ) : (
                        <Link
                          href={`/dashboard/projects?edit=${p.id}`}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 font-mono text-[11px] text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <Edit3 size={11} />
                          <span>Edit Studi Kasus</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Hapus Proyek"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL KELOLA ITEM MULTI-PROJECT */}
      {isMultiModalOpen && selectedMultiProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0b0e17] border border-purple-500/30 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0b0e17] shrink-0">
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Kelola Sub-Item Koleksi: {selectedMultiProject.title}</h3>
                  <p className="text-[10px] font-mono text-slate-400">Tambah, ubah, atau unggah gambar mockup untuk setiap item di koleksi ini.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMultiModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">Daftar Sub-Proyek ({subItems.length})</span>
                <button
                  type="button"
                  onClick={handleAddSubItem}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-purple-500/30"
                >
                  <Plus size={12} />
                  <span>+ Tambah Sub-Proyek Baru</span>
                </button>
              </div>

              {subItems.length === 0 ? (
                <div className="py-12 text-center bg-[#07090e] border border-dashed border-white/10 rounded-2xl p-6 text-slate-500 font-mono text-xs">
                  Belum ada sub-proyek dalam koleksi ini. Klik tombol di atas untuk menambahkannya.
                </div>
              ) : (
                <div className="space-y-4">
                  {subItems.map((item, idx) => (
                    <div key={item.id} className="p-4 rounded-xl bg-[#07090e] border border-white/10 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white">Sub-Item #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubItem(item.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Hapus Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 text-[10px] font-mono mb-1">Judul Sub-Proyek</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateSubItem(item.id, 'title', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-white/10 text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] font-mono mb-1">Sub-judul / Badge</label>
                          <input
                            type="text"
                            value={item.subtitle}
                            onChange={(e) => handleUpdateSubItem(item.id, 'subtitle', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-white/10 text-white text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-slate-500 text-[10px] font-mono">Gambar Mockup / Pratinjau</label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                            <img src={item.image || '/placeholder.svg'} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={item.image}
                              onChange={(e) => handleUpdateSubItem(item.id, 'image', e.target.value)}
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-white/10 text-slate-300 font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setActiveSubId(item.id);
                                activeSubInputRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Upload size={12} />
                              <span>Laptop</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-500 text-[10px] font-mono mb-1">Tautan Figma / Live (Opsional)</label>
                          <input
                            type="text"
                            value={item.link || ''}
                            onChange={(e) => handleUpdateSubItem(item.id, 'link', e.target.value)}
                            placeholder="https://figma.com/..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-white/10 text-slate-300 font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-500 text-[10px] font-mono mb-1">Tech Tags (Pisahkan koma)</label>
                          <input
                            type="text"
                            value={Array.isArray(item.tags) ? item.tags.join(', ') : ''}
                            onChange={(e) => handleUpdateSubItem(item.id, 'tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                            placeholder="Figma, Mobile UI, Wireframe"
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-white/10 text-slate-300 font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-500 text-[10px] font-mono mb-1">Deskripsi Item</label>
                        <textarea
                          rows={2}
                          value={item.desc}
                          onChange={(e) => handleUpdateSubItem(item.id, 'desc', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-[#0b0e17] border border-white/10 text-white text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#0b0e17] shrink-0 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsMultiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={savingSub}
                onClick={handleSaveSubItems}
                className="px-5 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {savingSub && <Loader2 size={13} className="animate-spin" />}
                <Save size={13} />
                <span>Simpan Item Koleksi</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}