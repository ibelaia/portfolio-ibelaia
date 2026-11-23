'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

interface ServiceItem {
  id: string;
  title: string;
  title_id?: string;
  description: string;
  description_id?: string;
  badge: string;
  tags: string[];
  tags_id?: string[];
  icon_name?: string;
}

const SERVICES_SYNC_CHANNEL = 'portfolio-sync-services';
const DASHBOARD_SYNC_CHANNEL = 'portfolio-sync-dashboard';
const ADMIN_SYNC_CHANNEL = 'portfolio-admin-sync';
const SERVICES_STORAGE_KEY = 'portfolio_services_settings';

export default function ServicesManagementPage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const dashboardChannelRef = useRef<BroadcastChannel | null>(null);
  const adminChannelRef = useRef<BroadcastChannel | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [editLang, setEditLang] = useState<'en' | 'id'>('en');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [headerForm, setHeaderForm] = useState({
    badge_text: 'MY SERVICES',
    badge_text_id: 'LAYANAN SAYA',
    title: 'My Services',
    title_id: 'Layanan Saya',
    subtitle: 'Things I can build, design, and contribute to.',
    subtitle_id: 'Hal yang dapat saya bangun, rancang, dan kontribusikan.',
  });

  const [services, setServices] = useState<ServiceItem[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalForm, setModalForm] = useState({
    title: '',
    title_id: '',
    description: '',
    description_id: '',
    badge: '01',
    tagsStr: 'HTML, CSS, JavaScript',
    tagsIdStr: 'HTML, CSS, JavaScript',
    icon_name: 'Code2',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const persistServicesCache = useCallback(
    (nextHeader: Record<string, any>, nextItems: ServiceItem[]) => {
      try {
        localStorage.setItem(
          SERVICES_STORAGE_KEY,
          JSON.stringify({
            header: nextHeader,
            data: nextItems,
          })
        );
      } catch {
        // Abaikan jika localStorage diblokir
      }
    },
    []
  );

  const broadcastServicesUpdate = useCallback(
    (action: string, detailData?: any, totalCount?: number) => {
      const eventDetail = {
        section: 'services',
        action,
        count: typeof totalCount === 'number' ? totalCount : undefined,
        updatedAt: Date.now(),
        data: detailData,
      };

      try {
        if (syncChannelRef.current) {
          syncChannelRef.current.postMessage(eventDetail);
        }
        if (dashboardChannelRef.current) {
          dashboardChannelRef.current.postMessage(eventDetail);
        }
        if (adminChannelRef.current) {
          adminChannelRef.current.postMessage(eventDetail);
        }
      } catch {
        // Abaikan jika BroadcastChannel tidak tersedia
      }

      try {
        localStorage.setItem(
          SERVICES_SYNC_CHANNEL,
          JSON.stringify(eventDetail)
        );
        if (typeof totalCount === 'number') {
          localStorage.setItem(
            'portfolio_services_count',
            String(totalCount)
          );
        }
      } catch {
        // Abaikan jika localStorage diblokir
      }

      window.dispatchEvent(
        new CustomEvent(SERVICES_SYNC_CHANNEL, { detail: eventDetail })
      );
      window.dispatchEvent(
        new CustomEvent(DASHBOARD_SYNC_CHANNEL, { detail: eventDetail })
      );
      window.dispatchEvent(
        new CustomEvent(ADMIN_SYNC_CHANNEL, { detail: eventDetail })
      );
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(SERVICES_SYNC_CHANNEL);
      dashboardChannelRef.current = new BroadcastChannel(DASHBOARD_SYNC_CHANNEL);
      adminChannelRef.current = new BroadcastChannel(ADMIN_SYNC_CHANNEL);
    }

    async function loadData() {
      try {
        const cachedRaw = localStorage.getItem(SERVICES_STORAGE_KEY);
        if (cachedRaw && isMounted) {
          const cached = JSON.parse(cachedRaw);
          if (cached?.header && typeof cached.header === 'object') {
            setHeaderForm((prev) => ({
              ...prev,
              badge_text: cached.header.badge_text || prev.badge_text,
              badge_text_id: cached.header.badge_text_id || prev.badge_text_id,
              title: cached.header.title || prev.title,
              title_id: cached.header.title_id || prev.title_id,
              subtitle: cached.header.subtitle || prev.subtitle,
              subtitle_id: cached.header.subtitle_id || prev.subtitle_id,
            }));
          }
          if (Array.isArray(cached?.data) && cached.data.length > 0) {
            setServices(cached.data);
          }
        }
      } catch {
        // Abaikan jika cache lokal tidak tersedia
      }

      try {
        const response = await fetch('/api/services', { cache: 'no-store' });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success) {
          let loadedHeader = { ...headerForm };
          if (json.header) {
            loadedHeader = {
              badge_text: json.header.badge_text || 'MY SERVICES',
              badge_text_id: json.header.badge_text_id || 'LAYANAN SAYA',
              title: json.header.title || 'My Services',
              title_id: json.header.title_id || 'Layanan Saya',
              subtitle:
                json.header.subtitle ||
                'Things I can build, design, and contribute to.',
              subtitle_id:
                json.header.subtitle_id ||
                'Hal yang dapat saya bangun, rancang, dan kontribusikan.',
            };
            setHeaderForm(loadedHeader);
          }

          let loadedList: ServiceItem[] = [];
          if (Array.isArray(json.data) && json.data.length > 0) {
            loadedList = json.data;
            setServices(loadedList);
            persistServicesCache(loadedHeader, loadedList);
            broadcastServicesUpdate('loaded', loadedList, loadedList.length);
          } else {
            loadedList = [
              {
                id: '1',
                title: 'WEB DEVELOPMENT',
                title_id: 'PENGEMBANGAN WEB',
                description:
                  'Building responsive websites and commerce experiences with modern web technologies.',
                description_id:
                  'Membangun situs web responsif dan pengalaman commerce dengan teknologi web modern.',
                badge: '01',
                tags: ['HTML', 'CSS', 'JavaScript', 'E-COMMERCE'],
                tags_id: ['HTML', 'CSS', 'JavaScript', 'E-COMMERCE'],
                icon_name: 'Code2',
              },
              {
                id: '2',
                title: 'UI/UX DESIGN',
                title_id: 'DESAIN UI/UX',
                description:
                  'Designing intuitive wireframes, mockups, and high-fidelity user interface prototypes.',
                description_id:
                  'Merancang wireframe intuitif, mockup, dan prototipe antarmuka beresolusi tinggi.',
                badge: '02',
                tags: ['FIGMA', 'WIREFRAME', 'PROTOTYPE'],
                tags_id: ['FIGMA', 'WIREFRAME', 'PROTOTIPE'],
                icon_name: 'Palette',
              },
              {
                id: '3',
                title: 'DATABASE & BACKEND',
                title_id: 'DATABASE & BACKEND',
                description:
                  'Developing scalable backend architectures, RESTful APIs, and optimized databases.',
                description_id:
                  'Mengembangkan arsitektur backend skalabel, RESTful API, dan database teroptimasi.',
                badge: '03',
                tags: ['MYSQL', 'DATABASE', 'API'],
                tags_id: ['MYSQL', 'DATABASE', 'API'],
                icon_name: 'Server',
              },
              {
                id: '4',
                title: 'WEB3 DEVELOPMENT',
                title_id: 'PENGEMBANGAN WEB3',
                description:
                  'Exploring smart contract interactions, dApps integration, and decentralized ecosystems.',
                description_id:
                  'Mengeksplorasi interaksi smart contract, integrasi dApps, dan ekosistem terdesentralisasi.',
                badge: '04',
                tags: ['SOLIDITY', 'WEB3', 'SMART CONTRACTS'],
                tags_id: ['SOLIDITY', 'WEB3', 'SMART CONTRACTS'],
                icon_name: 'Cpu',
              },
            ];
            setServices(loadedList);
            persistServicesCache(loadedHeader, loadedList);
            broadcastServicesUpdate('loaded', loadedList, loadedList.length);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat data services:', err);
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
      if (dashboardChannelRef.current) {
        dashboardChannelRef.current.close();
        dashboardChannelRef.current = null;
      }
      if (adminChannelRef.current) {
        adminChannelRef.current.close();
        adminChannelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broadcastServicesUpdate, persistServicesCache]);

  const handleSaveHeader = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/services/header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(headerForm),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        const mergedHeader = { ...headerForm, ...(json.data ?? {}) };
        persistServicesCache(mergedHeader, services);
        broadcastServicesUpdate('header', mergedHeader, services.length);
        setTimeout(() => router.refresh(), 50);
        showToast(
          'Judul dan Deskripsi Services berhasil disimpan ke Neon & disinkronkan!'
        );
      } else {
        showToast(
          `Gagal menyimpan: ${json.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setModalForm({
      title: '',
      title_id: '',
      description: '',
      description_id: '',
      badge: `0${services.length + 1}`,
      tagsStr: 'React, Next.js, Tailwind',
      tagsIdStr: 'React, Next.js, Tailwind',
      icon_name: 'Code2',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingId(service.id);
    setModalForm({
      title: service.title,
      title_id: service.title_id || service.title,
      description: service.description,
      description_id: service.description_id || service.description,
      badge: service.badge,
      tagsStr: Array.isArray(service.tags) ? service.tags.join(', ') : '',
      tagsIdStr: Array.isArray(service.tags_id)
        ? service.tags_id.join(', ')
        : Array.isArray(service.tags)
        ? service.tags.join(', ')
        : '',
      icon_name: service.icon_name || 'Code2',
    });
    setIsModalOpen(true);
  };

  const handleSaveServiceCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCard(true);

    const tagsArray = modalForm.tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const tagsIdArray = modalForm.tagsIdStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const localItem: ServiceItem = {
      id: editingId || String(Date.now()),
      title: modalForm.title,
      title_id: modalForm.title_id || modalForm.title,
      description: modalForm.description,
      description_id: modalForm.description_id || modalForm.description,
      badge: modalForm.badge,
      tags: tagsArray,
      tags_id: tagsIdArray.length > 0 ? tagsIdArray : tagsArray,
      icon_name: modalForm.icon_name || 'Code2',
    };

    const apiBody = {
      ...(editingId ? { id: editingId } : {}),
      title: localItem.title,
      title_id: localItem.title_id,
      description: localItem.description,
      description_id: localItem.description_id,
      badge: localItem.badge,
      tags: localItem.tags,
      tags_id: localItem.tags_id,
      icon_name: localItem.icon_name,
    };

    try {
      const response = await fetch('/api/services', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(apiBody),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        const cleanServerData =
          json.data && typeof json.data === 'object'
            ? (() => {
                const copy = { ...json.data };
                delete copy.icon;
                return copy;
              })()
            : {};

        if (editingId) {
          const updatedItem: ServiceItem = {
            ...localItem,
            ...cleanServerData,
            id: editingId,
          };
          const nextList = services.map((s) =>
            s.id === editingId ? { ...s, ...updatedItem } : s
          );
          setServices(nextList);
          persistServicesCache(headerForm, nextList);
          broadcastServicesUpdate('update_card', updatedItem, nextList.length);
          showToast('Card Service berhasil diperbarui & disinkronkan!');
        } else {
          const savedItem: ServiceItem = {
            ...localItem,
            ...cleanServerData,
            id: cleanServerData?.id ? String(cleanServerData.id) : localItem.id,
          };
          const nextList = [...services, savedItem];
          setServices(nextList);
          persistServicesCache(headerForm, nextList);
          broadcastServicesUpdate('create_card', savedItem, nextList.length);
          showToast('Card Service baru berhasil ditambahkan & disinkronkan!');
        }
        setTimeout(() => router.refresh(), 50);
        setIsModalOpen(false);
      } else {
        showToast(
          `Gagal menyimpan: ${json.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSavingCard(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Hapus card layanan ini?')) return;

    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const json = await response.json();

      if (response.ok && json.success) {
        const nextList = services.filter((s) => s.id !== id);
        setServices(nextList);
        persistServicesCache(headerForm, nextList);
        broadcastServicesUpdate('delete_card', { id }, nextList.length);
        setTimeout(() => router.refresh(), 50);
        showToast('Card Service berhasil dihapus & disinkronkan!');
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

  const isId = editLang === 'id';

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased"
    >
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
                >
                  <Wrench size={15} className="text-[#c084fc]" />
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
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Award size={15} />
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
            href="/services"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Preview Services Page</span>
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
            <h1
              suppressHydrationWarning
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
            >
              Services Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kelola judul halaman, subjudul, dan kartu layanan (services cards)
              via Neon secara dinamis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="inline-flex items-center rounded-xl bg-[#0b0e17] border border-white/10 p-1 text-[10px] font-mono">
              <Languages size={12} className="text-cyan-400 mx-1.5" />
              <button
                type="button"
                onClick={() => setEditLang('en')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  !isId
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setEditLang('id')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isId
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            <Link
              href="/services"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Eye size={13} className="text-cyan-400" />
              <span>Lihat Halaman Publik</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data Services dari Neon API...</span>
          </div>
        ) : (
          <div className="space-y-8">
            <form
              onSubmit={handleSaveHeader}
              className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Wrench size={16} className="text-cyan-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  1. Pengaturan Judul & Header Halaman ({isId ? 'ID' : 'EN'})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Badge Teks Atas ({isId ? 'Indonesia' : 'English'})
                  </label>
                  <input
                    type="text"
                    value={
                      isId ? headerForm.badge_text_id : headerForm.badge_text
                    }
                    onChange={(e) =>
                      setHeaderForm((prev) =>
                        isId
                          ? { ...prev, badge_text_id: e.target.value }
                          : { ...prev, badge_text: e.target.value }
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Judul Utama (Title - {isId ? 'Indonesia' : 'English'})
                  </label>
                  <input
                    type="text"
                    value={isId ? headerForm.title_id : headerForm.title}
                    onChange={(e) =>
                      setHeaderForm((prev) =>
                        isId
                          ? { ...prev, title_id: e.target.value }
                          : { ...prev, title: e.target.value }
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Subjudul / Deskripsi Singkat ({isId ? 'Indonesia' : 'English'})
                </label>
                <input
                  type="text"
                  value={isId ? headerForm.subtitle_id : headerForm.subtitle}
                  onChange={(e) =>
                    setHeaderForm((prev) =>
                      isId
                        ? { ...prev, subtitle_id: e.target.value }
                        : { ...prev, subtitle: e.target.value }
                    )
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    2. Daftar Kartu Layanan (Services Cards)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
                >
                  <Plus size={14} />
                  <span>Tambah Card Layanan</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {services.map((item) => {
                  const displayCardTitle =
                    isId && item.title_id ? item.title_id : item.title;
                  const displayCardDesc =
                    isId && item.description_id
                      ? item.description_id
                      : item.description;
                  const displayCardTags =
                    isId && Array.isArray(item.tags_id) && item.tags_id.length > 0
                      ? item.tags_id
                      : item.tags;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#07090e] border border-white/10 rounded-xl p-5 flex flex-col justify-between group hover:border-cyan-500/30 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                            {item.badge}
                          </span>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Edit Card"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(item.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                              title="Hapus Card"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-white pt-1">
                          {displayCardTitle}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {displayCardDesc}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-white/5 flex flex-wrap gap-1">
                        {Array.isArray(displayCardTags) &&
                          displayCardTags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-white border-b border-white/5 pb-3">
              {editingId
                ? 'Edit Kartu Layanan'
                : 'Tambah Kartu Layanan Baru'}
            </h2>

            <form onSubmit={handleSaveServiceCard} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Judul Layanan (Title - English)
                </label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, title: e.target.value })
                  }
                  placeholder="Contoh: MOBILE APP DEV"
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Judul Layanan (Indonesia)
                </label>
                <input
                  type="text"
                  value={modalForm.title_id}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, title_id: e.target.value })
                  }
                  placeholder="Contoh: PENGEMBANGAN APLIKASI MOBILE"
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Deskripsi Layanan (English)
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalForm.description}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat layanan..."
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white leading-relaxed focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Deskripsi Layanan (Indonesia)
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
                  placeholder="Deskripsi singkat dalam bahasa Indonesia..."
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white leading-relaxed focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Nomor Badge (cth: 01)
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
                    Icon (Code2, Cpu, dll)
                  </label>
                  <input
                    type="text"
                    value={modalForm.icon_name}
                    onChange={(e) =>
                      setModalForm({ ...modalForm, icon_name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Tags (Pisahkan dengan koma - English)
                </label>
                <input
                  type="text"
                  value={modalForm.tagsStr}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, tagsStr: e.target.value })
                  }
                  placeholder="React, Next.js, API"
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Tags (Pisahkan dengan koma - Indonesia)
                </label>
                <input
                  type="text"
                  value={modalForm.tagsIdStr}
                  onChange={(e) =>
                    setModalForm({ ...modalForm, tagsIdStr: e.target.value })
                  }
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
                  disabled={savingCard}
                  className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-all cursor-pointer shadow-lg shadow-cyan-400/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingCard && <Loader2 size={13} className="animate-spin" />}
                  <span>Simpan Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}