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
  Plus,
  Trash2,
  Edit3,
  Eye,
  Languages,
} from 'lucide-react';

interface AchievementItem {
  id: string;
  badge: string;
  badge_id?: string;
  title: string;
  title_id?: string;
  description: string;
  description_id?: string;
  highlights: string[];
  highlights_id?: string[];
  date_str: string;
  date_str_id?: string;
  location: string;
  location_id?: string;
  image_url: string;
  credential_url: string;
}

const ACHIEVEMENTS_SYNC_CHANNEL = 'portfolio-sync-achievements';

function parseHighlightsString(raw: any): string {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
      .join(', ');
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parseHighlightsString(parsed);
      }
    } catch {
      // Gunakan string biasa jika bukan JSON array
    }
    return trimmed;
  }
  return '';
}

function parseHighlightsArray(raw: any): string[] {
  if (Array.isArray(raw)) {
    return raw.map((h: any) => String(h ?? '').trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((h) => h.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parseHighlightsArray(parsed);
      }
    } catch {
      // Lanjut split koma
    }
    return trimmed
      .split(',')
      .map((h: string) => h.trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeAchievementItem(item: any, index = 0): AchievementItem {
  const highlights = parseHighlightsArray(item?.highlights);
  const highlightsId = parseHighlightsArray(item?.highlights_id);

  return {
    id: item?.id ? String(item.id) : `ach-${Date.now()}-${index}`,
    badge: item?.badge || 'Competitions',
    badge_id: item?.badge_id || '',
    title: item?.title || 'Untitled Achievement',
    title_id: item?.title_id || '',
    description: item?.description || '',
    description_id: item?.description_id || '',
    highlights,
    highlights_id: highlightsId,
    date_str: item?.date_str || 'December 2024',
    date_str_id: item?.date_str_id || '',
    location: item?.location || 'Surabaya, Indonesia',
    location_id: item?.location_id || '',
    image_url: item?.image_url || '/placeholder.svg',
    credential_url: item?.credential_url || '',
  };
}

export default function AchievementsManagementPage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const [loading, setLoading] = useState(true);
  const [savingHeader, setSavingHeader] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [headerLang, setHeaderLang] = useState<'EN' | 'ID'>('EN');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [headerForm, setHeaderForm] = useState({
    badge_text: 'HONORS & RECOGNITION',
    badge_text_id: 'PENGHARGAAN & PENCAPAIAN',
    title: 'Honors & Milestones',
    title_id: 'Penghargaan & Pencapaian',
    subtitle:
      'A timeline of competitive awards, hackathon recognitions, and academic milestones achieved throughout my software engineering journey.',
    subtitle_id:
      'Linimasa penghargaan kompetisi, capaian hackathon, dan tonggak akademik sepanjang perjalanan rekayasa perangkat lunak saya.',
  });

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [modalForm, setModalForm] = useState({
    badge: 'Competitions',
    badge_id: 'Kompetisi',
    title: '',
    title_id: '',
    description: '',
    description_id: '',
    highlightsStr: 'Lighthouse 98/100, Clean Architecture',
    highlightsStr_id: 'Performa Lighthouse 98/100, Arsitektur Bersih',
    date_str: 'December 2024',
    date_str_id: 'Desember 2024',
    location: 'Surabaya, Jawa Timur',
    location_id: 'Surabaya, Jawa Timur',
    image_url: '/placeholder.svg',
    credential_url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const broadcastAchievementsUpdate = (action: string, detailData?: any) => {
    const eventDetail = {
      section: 'achievements',
      action,
      updatedAt: Date.now(),
      data: detailData,
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
        ACHIEVEMENTS_SYNC_CHANNEL,
        JSON.stringify(eventDetail)
      );
    } catch {
      // Abaikan jika localStorage diblokir
    }

    window.dispatchEvent(
      new CustomEvent(ACHIEVEMENTS_SYNC_CHANNEL, { detail: eventDetail })
    );
  };

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(ACHIEVEMENTS_SYNC_CHANNEL);
    }

    async function loadData() {
      try {
        const response = await fetch('/api/achievements', {
          cache: 'no-store',
        });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success) {
          if (json.header) {
            setHeaderForm({
              badge_text: json.header.badge_text || 'HONORS & RECOGNITION',
              badge_text_id:
                json.header.badge_text_id || 'PENGHARGAAN & PENCAPAIAN',
              title: json.header.title || 'Honors & Milestones',
              title_id: json.header.title_id || 'Penghargaan & Pencapaian',
              subtitle:
                json.header.subtitle ||
                'A timeline of competitive awards, hackathon recognitions, and academic milestones achieved throughout my software engineering journey.',
              subtitle_id:
                json.header.subtitle_id ||
                'Linimasa penghargaan kompetisi, capaian hackathon, dan tonggak akademik sepanjang perjalanan rekayasa perangkat lunak saya.',
            });
          }
          if (Array.isArray(json.data)) {
            setAchievements(
              json.data.map((item: any, idx: number) =>
                normalizeAchievementItem(item, idx)
              )
            );
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat data achievements:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, []);

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingHeader(true);

    try {
      const response = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ target: 'header', ...headerForm }),
      });
      const rawText = await response.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (response.ok && json?.success) {
        broadcastAchievementsUpdate('header', json.data ?? headerForm);
        router.refresh();
        showToast('Header Achievements berhasil disimpan dan disinkronkan!');
      } else {
        showToast(
          `Gagal menyimpan: ${json?.error || `HTTP ${response.status}`}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSavingHeader(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setSelectedFile(null);
    setModalForm({
      badge: 'Competitions',
      badge_id: 'Kompetisi',
      title: '',
      title_id: '',
      description: '',
      description_id: '',
      highlightsStr: 'Lighthouse 98/100 performance, Clean Architecture',
      highlightsStr_id: 'Performa Lighthouse 98/100, Arsitektur Bersih',
      date_str: 'December 2024',
      date_str_id: 'Desember 2024',
      location: 'Surabaya, Indonesia',
      location_id: 'Surabaya, Indonesia',
      image_url: '/placeholder.svg',
      credential_url: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: AchievementItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    setModalForm({
      badge: item.badge,
      badge_id: item.badge_id || '',
      title: item.title,
      title_id: item.title_id || '',
      description: item.description,
      description_id: item.description_id || '',
      highlightsStr: parseHighlightsString(item.highlights),
      highlightsStr_id: parseHighlightsString(item.highlights_id),
      date_str: item.date_str,
      date_str_id: item.date_str_id || '',
      location: item.location,
      location_id: item.location_id || '',
      image_url: item.image_url,
      credential_url: item.credential_url || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);

    try {
      let finalImageUrl = modalForm.image_url;

      if (selectedFile) {
        finalImageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () =>
            reject(new Error('Gagal membaca berkas gambar'));
          reader.readAsDataURL(selectedFile);
        });
      }

      const highlightsArray = parseHighlightsArray(modalForm.highlightsStr);
      const highlightsArrayId = parseHighlightsArray(modalForm.highlightsStr_id);

      const payload = {
        id: editingId,
        badge: modalForm.badge.trim() || 'Competitions',
        badge_id: modalForm.badge_id.trim(),
        title: modalForm.title.trim(),
        title_id: modalForm.title_id.trim(),
        description: modalForm.description.trim(),
        description_id: modalForm.description_id.trim(),
        highlights: highlightsArray,
        highlights_id: highlightsArrayId,
        date_str: modalForm.date_str.trim(),
        date_str_id: modalForm.date_str_id.trim(),
        location: modalForm.location.trim(),
        location_id: modalForm.location_id.trim(),
        image_url: finalImageUrl || '/placeholder.svg',
        credential_url: modalForm.credential_url.trim(),
      };

      const response = await fetch('/api/achievements', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        const normalizedSaved = normalizeAchievementItem(
          json.data ?? payload,
          0
        );

        if (editingId) {
          setAchievements((prev) =>
            prev.map((a) => (a.id === editingId ? normalizedSaved : a))
          );
          broadcastAchievementsUpdate('update', normalizedSaved);
          showToast('Achievement berhasil diperbarui & disinkronkan!');
        } else {
          setAchievements((prev) => [normalizedSaved, ...prev]);
          broadcastAchievementsUpdate('create', normalizedSaved);
          showToast('Achievement baru berhasil ditambahkan & disinkronkan!');
        }
        router.refresh();
        setIsModalOpen(false);
        setSelectedFile(null);
      } else {
        showToast(
          `Gagal menyimpan: ${json.error || 'Kesalahan database'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!confirm('Hapus achievement ini secara permanen?')) return;

    try {
      const response = await fetch(
        `/api/achievements?id=${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          cache: 'no-store',
        }
      );
      const json = await response.json();

      if (response.ok && json.success) {
        setAchievements((prev) => prev.filter((a) => a.id !== id));
        broadcastAchievementsUpdate('delete', { id });
        router.refresh();
        showToast('Achievement berhasil dihapus & disinkronkan!');
      } else {
        showToast(
          `Gagal menghapus: ${json.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleLogout = async () => {
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
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
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">
                Overview
              </p>
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">
                Website Content
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard/home"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home size={15} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/dashboard/about"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={15} />
                  <span>About</span>
                </Link>
                <Link
                  href="/dashboard/services"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Wrench size={15} />
                  <span>Services</span>
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FolderGit2 size={15} />
                  <span>Projects</span>
                </Link>
                <Link
                  href="/dashboard/achievements"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
                >
                  <Award size={15} className="text-[#c084fc]" />
                  <span>Achievements</span>
                </Link>
                <Link
                  href="/dashboard/certificates"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FileBadge size={15} />
                  <span>Certificates</span>
                </Link>
                <Link
                  href="/dashboard/contact"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Mail size={15} />
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">
                Assets
              </p>
              <Link
                href="/dashboard/media"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FolderArchive size={15} />
                <span>Media Library</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">
                Settings
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard/appearance"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Palette size={15} />
                  <span>Appearance</span>
                </Link>
                <Link
                  href="/dashboard/seo"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Settings size={15} />
                  <span>General Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 space-y-3">
          <Link
            href="/achievements"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Preview Achievements Page</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Achievements Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kelola header penghargaan, milestone, dan pencapaian kompetisi via
              Neon PostgreSQL secara dinamis.
            </p>
          </div>
          <Link
            href="/achievements"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data Achievements dari Neon API...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <form
              onSubmit={handleSaveHeader}
              className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5 flex-wrap">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    1. Pengaturan Header Achievements
                  </span>
                </div>

                {/* Translate Toggle Bahasa Inggris & Bahasa Indonesia */}
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#07090e] border border-white/10 text-[11px] font-mono">
                  <Languages size={13} className="text-cyan-400 ml-1.5 mr-1" />
                  <button
                    type="button"
                    onClick={() => setHeaderLang('EN')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      headerLang === 'EN'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setHeaderLang('ID')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      headerLang === 'ID'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Indonesia
                  </button>
                </div>
              </div>

              {headerLang === 'EN' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Badge Teks Atas (English)
                      </label>
                      <input
                        type="text"
                        value={headerForm.badge_text}
                        onChange={(e) =>
                          setHeaderForm({
                            ...headerForm,
                            badge_text: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Judul Utama (English)
                      </label>
                      <input
                        type="text"
                        value={headerForm.title}
                        onChange={(e) =>
                          setHeaderForm({
                            ...headerForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Subjudul / Deskripsi (English)
                    </label>
                    <textarea
                      rows={2}
                      value={headerForm.subtitle}
                      onChange={(e) =>
                        setHeaderForm({
                          ...headerForm,
                          subtitle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Badge Teks Atas (Indonesia)
                      </label>
                      <input
                        type="text"
                        value={headerForm.badge_text_id}
                        onChange={(e) =>
                          setHeaderForm({
                            ...headerForm,
                            badge_text_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        Judul Utama (Indonesia)
                      </label>
                      <input
                        type="text"
                        value={headerForm.title_id}
                        onChange={(e) =>
                          setHeaderForm({
                            ...headerForm,
                            title_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Subjudul / Deskripsi (Indonesia)
                    </label>
                    <textarea
                      rows={2}
                      value={headerForm.subtitle_id}
                      onChange={(e) =>
                        setHeaderForm({
                          ...headerForm,
                          subtitle_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingHeader}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingHeader && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  <span>Simpan Header</span>
                </button>
              </div>
            </form>

            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <FolderArchive size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    2. Daftar Pencapaian (Achievements List)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
                >
                  <Plus size={14} />
                  <span>Tambah Achievement</span>
                </button>
              </div>

              <div className="space-y-4 pt-2">
                {achievements.length === 0 ? (
                  <p className="py-8 text-center text-xs font-mono text-slate-500">
                    Belum ada achievement tercatat.
                  </p>
                ) : (
                  achievements.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#07090e] border border-white/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-purple-500/30 transition-all"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                            {item.badge}
                          </span>
                          {item.badge_id && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              ID: {item.badge_id}
                            </span>
                          )}
                          <span className="text-xs font-mono text-slate-500">
                            {item.date_str} • {item.location}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white">
                          {item.title}
                        </h3>
                        {item.title_id && (
                          <p className="text-[11px] text-cyan-300/90 font-medium">
                            ID: {item.title_id}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(item)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAchievement(item.id)}
                          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                          title="Hapus"
                        >
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
          <div className="bg-[#0b0e17] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 my-8">
            <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">
              {editingId ? 'Edit Achievement' : 'Tambah Achievement Baru'}
            </h2>
            <form onSubmit={handleSaveAchievement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Kategori / Badge (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.badge}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, badge: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Kategori / Badge (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={modalForm.badge_id}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, badge_id: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Tanggal (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.date_str}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, date_str: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Tanggal (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={modalForm.date_str_id}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        date_str_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Judul Pencapaian (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.title}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-bold focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Judul Pencapaian (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={modalForm.title_id}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, title_id: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-bold focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Lokasi (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={modalForm.location}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Lokasi (Indonesia)
                  </label>
                  <input
                    type="text"
                    value={modalForm.location_id}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        location_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Deskripsi Singkat (English)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={modalForm.description}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white leading-relaxed focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Deskripsi Singkat (Indonesia)
                  </label>
                  <textarea
                    rows={3}
                    value={modalForm.description_id}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        description_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white leading-relaxed focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Highlights (English, pisahkan koma)
                  </label>
                  <textarea
                    rows={2}
                    value={modalForm.highlightsStr}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        highlightsStr: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Highlights (Indonesia, pisahkan koma)
                  </label>
                  <textarea
                    rows={2}
                    value={modalForm.highlightsStr_id}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        highlightsStr_id: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Upload Gambar / Berkas
                </label>
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
                <input
                  type="text"
                  value={modalForm.image_url}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, image_url: e.target.value })
                  }
                  className="w-full mt-2 px-3 py-1.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-[11px] focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Credential URL
                </label>
                <input
                  type="text"
                  value={modalForm.credential_url}
                  onChange={(e) =>
                    setModalForm({
                      ...modalForm,
                      credential_url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono text-[11px] focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {savingItem && <Loader2 size={13} className="animate-spin" />}
                  <span>
                    {savingItem ? 'Menyimpan...' : 'Simpan Achievement'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}