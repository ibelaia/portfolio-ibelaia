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
  Eye,
  Menu,
  X,
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AchievementItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  date_str: string;
  location: string;
  image_url: string;
  credential_url: string;
}

export default function AchievementsManagementPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [headerForm, setHeaderForm] = useState({
    badge_text: 'HONORS & RECOGNITION',
    title: 'Honors & Milestones',
    subtitle: 'A timeline of competitive awards, hackathon recognitions, and academic milestones achieved throughout my software engineering journey.'
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State untuk form modal & file upload device
  const [modalForm, setModalForm] = useState({
    badge: 'Competitions',
    title: '',
    description: '',
    highlightsStr: 'Lighthouse 98/100, Clean Architecture',
    date_str: 'December 2024',
    location: 'Surabaya, Jawa Timur',
    image_url: '/placeholder.svg',
    credential_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const { data: headerData } = await supabase
          .from('achievements_header')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (headerData) {
          setHeaderForm({
            badge_text: headerData.badge_text || 'HONORS & RECOGNITION',
            title: headerData.title || 'Honors & Milestones',
            subtitle: headerData.subtitle || 'A timeline of competitive awards, hackathon recognitions, and academic milestones achieved throughout my software engineering journey.'
          });
        }

        const { data: achData } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });

        if (achData) {
          setAchievements(achData);
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

    const { data: existing } = await supabase.from('achievements_header').select('id').eq('id', 'default').maybeSingle();

    let error;
    if (existing) {
      const res = await supabase.from('achievements_header').update(payload).eq('id', 'default');
      error = res.error;
    } else {
      const res = await supabase.from('achievements_header').insert([payload]);
      error = res.error;
    }

    setSaving(false);
    if (!error) {
      showToast('Header Achievements berhasil disimpan!');
    } else {
      showToast(`Gagal menyimpan: ${error.message}`, 'error');
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setModalForm({
      badge: 'Competitions',
      title: '',
      description: '',
      highlightsStr: 'Lighthouse 98/100 performance, Clean Architecture',
      date_str: 'December 2024',
      location: 'Surabaya, Indonesia',
      image_url: '/placeholder.svg',
      credential_url: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AchievementItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    setModalForm({
      badge: item.badge,
      title: item.title,
      description: item.description,
      highlightsStr: Array.isArray(item.highlights) ? item.highlights.join(', ') : '',
      date_str: item.date_str,
      location: item.location,
      image_url: item.image_url,
      credential_url: item.credential_url || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let finalImageUrl = modalForm.image_url;

    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        showToast(`Gagal upload gambar: ${uploadError.message}`, 'error');
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);

      finalImageUrl = publicUrlData.publicUrl;
    }

    const highlightsArray = modalForm.highlightsStr.split(',').map(h => h.trim()).filter(Boolean);

    const payload = {
      badge: modalForm.badge,
      title: modalForm.title,
      description: modalForm.description,
      highlights: highlightsArray,
      date_str: modalForm.date_str,
      location: modalForm.location,
      image_url: finalImageUrl || '/placeholder.svg',
      credential_url: modalForm.credential_url
    };

    if (editingId) {
      const { error } = await supabase
        .from('achievements')
        .update(payload)
        .eq('id', editingId);

      if (!error) {
        setAchievements(achievements.map(a => a.id === editingId ? { ...a, ...payload } : a));
        showToast('Achievement berhasil diperbarui!');
        setIsModalOpen(false);
        setSelectedFile(null);
      } else {
        showToast(`Gagal memperbarui: ${error.message}`, 'error');
      }
    } else {
      const { data, error } = await supabase
        .from('achievements')
        .insert([payload])
        .select()
        .single();

      if (!error && data) {
        setAchievements([data, ...achievements]);
        showToast('Achievement baru berhasil ditambahkan!');
        setIsModalOpen(false);
        setSelectedFile(null);
      } else {
        showToast(`Gagal menambah: ${error?.message || 'Kesalahan database'}`, 'error');
      }
    }
    setSaving(false);
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Hapus achievement ini secara permanen?')) return;

    const { error } = await supabase.from('achievements').delete().eq('id', id);
    if (!error) {
      setAchievements(achievements.filter(a => a.id !== id));
      showToast('Achievement berhasil dihapus!');
    } else {
      showToast(`Gagal menghapus: ${error.message}`, 'error');
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
                <Link href="/dashboard/achievements" className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <Award size={15} className="text-[#c084fc]" />
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
          <Link href="/achievements" target="_blank" className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
            <span>Preview Achievements Page</span>
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Achievements Management</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola header penghargaan, milestone, dan pencapaian kompetisi.</p>
          </div>
          <Link href="/achievements" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data Achievements...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleSaveHeader} className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Award size={16} className="text-purple-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">1. Pengaturan Header Achievements</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Badge Teks Atas</label>
                  <input type="text" value={headerForm.badge_text} onChange={(e) => setHeaderForm({ ...headerForm, badge_text: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Judul Utama</label>
                  <input type="text" value={headerForm.title} onChange={(e) => setHeaderForm({ ...headerForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Subjudul / Deskripsi</label>
                <textarea rows={2} value={headerForm.subtitle} onChange={(e) => setHeaderForm({ ...headerForm, subtitle: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400" />
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md">
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  <span>Simpan Header</span>
                </button>
              </div>
            </form>

            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FolderArchive size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">2. Daftar Pencapaian (Achievements List)</span>
                </div>
                <button onClick={handleOpenAddModal} className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg">
                  <Plus size={14} />
                  <span>Tambah Achievement</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {achievements.length === 0 ? (
                  <p className="py-8 text-center text-xs font-mono text-slate-500">Belum ada achievement tercatat.</p>
                ) : (
                  achievements.map((item) => (
                    <div key={item.id} className="bg-[#07090e] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-purple-500/30 transition-all">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">{item.badge}</span>
                          <span className="text-xs font-mono text-slate-500">{item.date_str} • {item.location}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button onClick={() => handleOpenEditModal(item)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer" title="Edit">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteAchievement(item.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0e17] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">
              {editingId ? 'Edit Achievement' : 'Tambah Achievement Baru'}
            </h2>
            <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Kategori / Badge (Bebas)</label>
                  <input 
                    type="text" 
                    required
                    value={modalForm.badge} 
                    onChange={(e) => setModalForm({ ...modalForm, badge: e.target.value })} 
                    placeholder="Contoh: Awards, Hackathon"
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Tanggal</label>
                  <input type="text" required value={modalForm.date_str} onChange={(e) => setModalForm({ ...modalForm, date_str: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Judul Pencapaian</label>
                <input type="text" required value={modalForm.title} onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-bold focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Lokasi</label>
                <input type="text" required value={modalForm.location} onChange={(e) => setModalForm({ ...modalForm, location: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Deskripsi Singkat</label>
                <textarea rows={3} required value={modalForm.description} onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white leading-relaxed focus:border-cyan-400" />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Highlights (Pisahkan koma)</label>
                <textarea rows={2} value={modalForm.highlightsStr} onChange={(e) => setModalForm({ ...modalForm, highlightsStr: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400" />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Upload Gambar dari Perangkat</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-[11px] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer" 
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Atau gunakan URL teks di bawah jika gambar online.</span>
                <input 
                  type="text" 
                  value={modalForm.image_url} 
                  onChange={(e) => setModalForm({ ...modalForm, image_url: e.target.value })} 
                  className="w-full mt-2 px-3 py-1.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-[11px] focus:border-cyan-400" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Credential URL</label>
                <input type="text" value={modalForm.credential_url} onChange={(e) => setModalForm({ ...modalForm, credential_url: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-[11px] focus:border-cyan-400" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer">Batal</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold cursor-pointer flex items-center gap-2">
                  {saving && <Loader2 size={13} className="animate-spin" />}
                  <span>{saving ? 'Menyimpan...' : 'Simpan Achievement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}