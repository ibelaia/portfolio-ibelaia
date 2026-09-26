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
  Plus,
  Trash2,
  Edit3,
  Save,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  tags: string[];
  icon_name: string;
}

export default function ServicesManagementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Bagian Header Halaman Services
  const [headerForm, setHeaderForm] = useState({
    badge_text: 'MY SERVICES',
    title: 'My Services',
    subtitle: 'Things I can build, design, and contribute to.'
  });

  // Daftar Card Services
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Modal State untuk Tambah / Edit Card Service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    description: '',
    badge: '01',
    tagsStr: 'HTML, CSS, JavaScript',
    icon_name: 'Code2'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: headerData } = await supabase
          .from('services_header')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (headerData) {
          setHeaderForm({
            badge_text: headerData.badge_text || 'MY SERVICES',
            title: headerData.title || 'My Services',
            subtitle: headerData.subtitle || 'Things I can build, design, and contribute to.'
          });
        }

        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (servicesData && servicesData.length > 0) {
          setServices(servicesData);
        } else {
          setServices([
            {
              id: '1',
              title: 'WEB DEVELOPMENT',
              description: 'Building responsive websites and commerce experiences with modern web technologies.',
              badge: '01',
              tags: ['HTML', 'CSS', 'JavaScript', 'E-COMMERCE'],
              icon_name: 'Code2'
            },
            {
              id: '2',
              title: 'UI/UX DESIGN',
              description: 'Designing intuitive wireframes, mockups, and high-fidelity user interface prototypes.',
              badge: '02',
              tags: ['FIGMA', 'WIREFRAME', 'PROTOTYPE'],
              icon_name: 'Palette'
            },
            {
              id: '3',
              title: 'DATABASE & BACKEND',
              description: 'Developing scalable backend architectures, RESTful APIs, and optimized databases.',
              badge: '03',
              tags: ['MYSQL', 'DATABASE', 'API'],
              icon_name: 'Server'
            },
            {
              id: '4',
              title: 'WEB3 DEVELOPMENT',
              description: 'Exploring smart contract interactions, dApps integration, and decentralized ecosystems.',
              badge: '04',
              tags: ['SOLIDITY', 'WEB3', 'SMART CONTRACTS'],
              icon_name: 'Cpu'
            }
          ]);
        }
      } catch (err) {
        console.warn('Load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      id: 'default',
      badge_text: headerForm.badge_text,
      title: headerForm.title,
      subtitle: headerForm.subtitle,
      updated_at: new Date().toISOString()
    };

    const { data: existing } = await supabase.from('services_header').select('id').eq('id', 'default').maybeSingle();

    let error;
    if (existing) {
      const res = await supabase.from('services_header').update(payload).eq('id', 'default');
      error = res.error;
    } else {
      const res = await supabase.from('services_header').insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (!error) {
      showToast('Judul dan Deskripsi Services berhasil disimpan!');
    } else {
      showToast(`Gagal menyimpan: ${error.message}`, 'error');
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setModalForm({
      title: '',
      description: '',
      badge: `0${services.length + 1}`,
      tagsStr: 'React, Next.js, Tailwind',
      icon_name: 'Code2'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingId(service.id);
    setModalForm({
      title: service.title,
      description: service.description,
      badge: service.badge,
      tagsStr: Array.isArray(service.tags) ? service.tags.join(', ') : '',
      icon_name: service.icon_name || 'Code2'
    });
    setIsModalOpen(true);
  };

  const handleSaveServiceCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = modalForm.tagsStr.split(',').map(t => t.trim()).filter(Boolean);

    const cardPayload = {
      title: modalForm.title,
      description: modalForm.description,
      badge: modalForm.badge,
      tags: tagsArray,
      icon_name: modalForm.icon_name
    };

    if (editingId) {
      const { error } = await supabase
        .from('services')
        .update(cardPayload)
        .eq('id', editingId);

      if (!error) {
        setServices(services.map(s => s.id === editingId ? { ...s, ...cardPayload } : s));
        showToast('Card Service berhasil diperbarui!');
        setIsModalOpen(false);
      } else {
        showToast(`Gagal memperbarui: ${error.message}`, 'error');
      }
    } else {
      const { data, error } = await supabase
        .from('services')
        .insert([cardPayload])
        .select()
        .single();

      if (!error && data) {
        setServices([...services, data]);
        showToast('Card Service baru berhasil ditambahkan!');
        setIsModalOpen(false);
      } else {
        const fallbackNew: ServiceItem = {
          id: Date.now().toString(),
          ...cardPayload
        };
        setServices([...services, fallbackNew]);
        showToast('Card Service ditambahkan secara lokal!');
        setIsModalOpen(false);
      }
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Hapus card layanan ini?')) return;

    await supabase.from('services').delete().eq('id', id);
    setServices(services.filter(s => s.id !== id));
    showToast('Card Service berhasil dihapus!');
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
                <Link href="/dashboard/services" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <Wrench size={15} className="text-[#c084fc]" />
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
          <Link href="/services" target="_blank" className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
            <span>Preview Services Page</span>
            <ExternalLink size={13} />
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Services Management</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola judul halaman, subjudul, dan kartu layanan (services cards).</p>
          </div>
          <Link href="/services" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data Services...</span>
          </div>
        ) : (
          <div className="space-y-8">
            
            <form onSubmit={handleSaveHeader} className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Wrench size={16} className="text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">1. Pengaturan Judul & Header Halaman</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Badge Teks Atas</label>
                  <input
                    type="text"
                    value={headerForm.badge_text}
                    onChange={(e) => setHeaderForm({ ...headerForm, badge_text: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Judul Utama (Title)</label>
                  <input
                    type="text"
                    value={headerForm.title}
                    onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Subjudul / Deskripsi Singkat</label>
                <input
                  type="text"
                  value={headerForm.subtitle}
                  onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  <span>Simpan Header</span>
                </button>
              </div>
            </form>

            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FolderArchive size={16} className="text-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">2. Daftar Kartu Layanan (Services Cards)</span>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Plus size={14} />
                  <span>Tambah Card Layanan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {services.map((item) => (
                  <div key={item.id} className="bg-[#07090e] border border-white/10 rounded-xl p-5 flex flex-col justify-between group hover:border-cyan-500/30 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                          {item.badge}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Card"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteService(item.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Hapus Card"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white pt-1">{item.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-white/5 flex flex-wrap gap-1">
                      {Array.isArray(item.tags) && item.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">
              {editingId ? 'Edit Kartu Layanan' : 'Tambah Kartu Layanan Baru'}
            </h2>

            <form onSubmit={handleSaveServiceCard} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Judul Layanan (Title)</label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  placeholder="Contoh: MOBILE APP DEV"
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Deskripsi Layanan</label>
                <textarea
                  rows={3}
                  required
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  placeholder="Deskripsi singkat layanan..."
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white leading-relaxed focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Nomor Badge (cth: 01)</label>
                  <input
                    type="text"
                    required
                    value={modalForm.badge}
                    onChange={(e) => setModalForm({ ...modalForm, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Icon (Code2, Cpu, dll)</label>
                  <input
                    type="text"
                    value={modalForm.icon_name}
                    onChange={(e) => setModalForm({ ...modalForm, icon_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Tags (Pisahkan dengan koma)</label>
                <input
                  type="text"
                  value={modalForm.tagsStr}
                  onChange={(e) => setModalForm({ ...modalForm, tagsStr: e.target.value })}
                  placeholder="React, Next.js, API"
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all cursor-pointer shadow-lg shadow-cyan-400/20"
                >
                  Simpan Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}