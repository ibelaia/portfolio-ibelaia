'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
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
  Star,
} from 'lucide-react';

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

const PROJECTS_LIST_SYNC_CHANNEL = 'portfolio-sync-projects';
const ADMIN_SYNC_CHANNEL = 'portfolio-admin-sync';
const APPEARANCE_SYNC_CHANNEL = 'portfolio-sync-appearance';
const PROJECTS_CACHE_KEY = 'portfolio_projects_cache';
const PROJECTS_COUNT_KEY = 'portfolio_projects_count';

const ACCENT_HEX_MAP: Record<string, string> = {
  cyan: '#06b6d4',
  purple: '#a855f7',
  emerald: '#34d399',
  rose: '#f43f5e',
  amber: '#fbbf24',
};

function applyAppearanceToDom(settings: Record<string, any>) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (!settings || typeof settings !== 'object') return;

  const root = document.documentElement;
  const body = document.body;

  const mode =
    settings.theme_mode === 'light' || settings.theme_mode === 'system'
      ? settings.theme_mode
      : 'dark';
  const prefersDark =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolvedTheme =
    mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

  root.classList.remove('dark', 'light');
  root.classList.add(resolvedTheme);
  root.setAttribute('data-theme', resolvedTheme);
  root.setAttribute('data-theme-mode', mode);

  if (settings.accent_color) {
    const accentKey = String(settings.accent_color);
    root.setAttribute('data-accent', accentKey);
    if (ACCENT_HEX_MAP[accentKey]) {
      root.style.setProperty('--accent', ACCENT_HEX_MAP[accentKey]);
    }
  }
  if (settings.border_radius) {
    root.setAttribute('data-radius', String(settings.border_radius));
  }
  if (settings.font_family) {
    root.setAttribute('data-font', String(settings.font_family));
    if (body) {
      body.classList.remove('font-sans', 'font-mono');
      body.classList.add(String(settings.font_family));
    }
  }
  if (typeof settings.glassmorphism !== 'undefined') {
    const isGlass =
      settings.glassmorphism === true ||
      settings.glassmorphism === 'true' ||
      settings.glassmorphism === 1;
    root.setAttribute('data-glass', isGlass ? 'true' : 'false');
  }
}

async function parseJsonSafely(response: Response): Promise<any | null> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export default function ProjectsListPage() {
  const router = useRouter();
  const { signOut } = useAuth();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const adminChannelRef = useRef<BroadcastChannel | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'multi'>('all');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [isMultiModalOpen, setIsMultiModalOpen] = useState(false);
  const [selectedMultiProject, setSelectedMultiProject] =
    useState<Project | null>(null);
  const [subItems, setSubItems] = useState<SubProjectItem[]>([]);
  const [savingSub, setSavingSub] = useState(false);

  const activeSubInputRef = useRef<HTMLInputElement>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const syncProjectsCache = useCallback((list: Project[]) => {
    try {
      localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(list));
      localStorage.setItem(PROJECTS_COUNT_KEY, String(list.length));
    } catch {
      // Abaikan jika localStorage diblokir
    }
  }, []);

  const broadcastProjectsUpdate = useCallback(
    (action: string, detailData?: any, nextList?: Project[]) => {
      if (Array.isArray(nextList)) {
        syncProjectsCache(nextList);
      }

      const eventDetail = {
        section: 'projects',
        action,
        count: Array.isArray(nextList) ? nextList.length : undefined,
        updatedAt: Date.now(),
        data: detailData,
      };

      try {
        if (syncChannelRef.current) {
          syncChannelRef.current.postMessage(eventDetail);
        }
        if (adminChannelRef.current) {
          adminChannelRef.current.postMessage(eventDetail);
        }
      } catch {
        // Abaikan jika BroadcastChannel tidak tersedia
      }

      try {
        localStorage.setItem(
          PROJECTS_LIST_SYNC_CHANNEL,
          JSON.stringify(eventDetail)
        );
      } catch {
        // Abaikan jika localStorage diblokir
      }

      window.dispatchEvent(
        new CustomEvent(PROJECTS_LIST_SYNC_CHANNEL, { detail: eventDetail })
      );
      window.dispatchEvent(
        new CustomEvent(ADMIN_SYNC_CHANNEL, { detail: eventDetail })
      );
    },
    [syncProjectsCache]
  );

  const syncAppearanceSettings = useCallback(async () => {
    try {
      const cachedRaw = localStorage.getItem(APPEARANCE_SYNC_CHANNEL);
      if (cachedRaw) {
        const parsed = JSON.parse(cachedRaw);
        if (parsed?.data) {
          applyAppearanceToDom(parsed.data);
        }
      }
    } catch {
      // Abaikan jika localStorage gagal dibaca
    }

    try {
      const res = await fetch(`/api/appearance?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const json = await parseJsonSafely(res);
      if (res.ok && json?.success && json?.data) {
        applyAppearanceToDom(json.data);
        try {
          localStorage.setItem(
            APPEARANCE_SYNC_CHANNEL,
            JSON.stringify({
              section: 'appearance',
              data: json.data,
              updatedAt: json.updatedAt || Date.now(),
            })
          );
        } catch {
          // Abaikan jika localStorage gagal ditulis
        }
      }
    } catch {
      // Abaikan jika fetch appearance gagal
    }
  }, []);

  const fetchProjects = useCallback(
    async (isMountedRef?: { current: boolean }) => {
      if (!isMountedRef || isMountedRef.current) {
        setLoading(true);
      }
      try {
        const response = await fetch(`/api/projects?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const json = await parseJsonSafely(response);

        if (isMountedRef && !isMountedRef.current) return;

        if (response.ok && json && Array.isArray(json.data)) {
          const sortedData = [...json.data].sort((a, b) => {
            if (a.is_featured === b.is_featured) return 0;
            return a.is_featured ? -1 : 1;
          });
          setProjects(sortedData);
          syncProjectsCache(sortedData);
        }
      } catch (err) {
        if (!isMountedRef || isMountedRef.current) {
          console.warn('Gagal memuat daftar proyek dari Neon:', err);
        }
      } finally {
        if (!isMountedRef || isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [syncProjectsCache]
  );

  useEffect(() => {
    const isMountedRef = { current: true };
    let appearanceChannel: BroadcastChannel | null = null;

    syncAppearanceSettings();

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(PROJECTS_LIST_SYNC_CHANNEL);
      syncChannelRef.current.onmessage = () => {
        if (isMountedRef.current) {
          fetchProjects(isMountedRef);
        }
      };

      adminChannelRef.current = new BroadcastChannel(ADMIN_SYNC_CHANNEL);
      adminChannelRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        if (event?.data?.section === 'appearance' && event?.data?.data) {
          applyAppearanceToDom(event.data.data);
        } else {
          fetchProjects(isMountedRef);
        }
      };

      appearanceChannel = new BroadcastChannel(APPEARANCE_SYNC_CHANNEL);
      appearanceChannel.onmessage = (event) => {
        if (!isMountedRef.current) return;
        if (event?.data?.data) {
          applyAppearanceToDom(event.data.data);
        } else {
          syncAppearanceSettings();
        }
      };
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (!isMountedRef.current) return;
      if (e.key === APPEARANCE_SYNC_CHANNEL) {
        syncAppearanceSettings();
      }
      if (
        e.key === PROJECTS_LIST_SYNC_CHANNEL ||
        e.key === ADMIN_SYNC_CHANNEL ||
        e.key === PROJECTS_CACHE_KEY
      ) {
        fetchProjects(isMountedRef);
      }
    };

    const handleCustomAppearance = (event: Event) => {
      if (!isMountedRef.current) return;
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.data) {
        applyAppearanceToDom(customEvent.detail.data);
      } else {
        syncAppearanceSettings();
      }
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener(APPEARANCE_SYNC_CHANNEL, handleCustomAppearance);
    fetchProjects(isMountedRef);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener(
        APPEARANCE_SYNC_CHANNEL,
        handleCustomAppearance
      );
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
      if (adminChannelRef.current) {
        adminChannelRef.current.close();
        adminChannelRef.current = null;
      }
      if (appearanceChannel) {
        appearanceChannel.close();
      }
    };
  }, [fetchProjects, syncAppearanceSettings]);

  const handleToggleFeatured = async (
    id: string,
    currentStatus: boolean,
    title: string
  ) => {
    const newStatus = !currentStatus;
    const targetProject = projects.find((p) => p.id === id);

    const payload: Record<string, any> = {
      id,
      is_featured: newStatus,
      featured: newStatus,
      title: targetProject?.title || title,
      category: targetProject?.category || 'Web Application',
      slug: targetProject?.slug,
      status: targetProject?.status || 'PUBLISHED',
      overview: targetProject?.overview,
      tags: targetProject?.tags,
      thumbnail: targetProject?.thumbnail,
    };

    try {
      let response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });
      let json = await parseJsonSafely(response);

      if (!response.ok || !json || !json.success) {
        const fallbackRes = await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify(payload),
        });
        const fallbackJson = await parseJsonSafely(fallbackRes);
        if (fallbackRes.ok || fallbackJson) {
          response = fallbackRes;
          json = fallbackJson;
        }
      }

      if (response.ok && json && json.success) {
        const nextSorted = projects
          .map((p) => (p.id === id ? { ...p, is_featured: newStatus } : p))
          .sort((a, b) => {
            if (a.is_featured === b.is_featured) return 0;
            return a.is_featured ? -1 : 1;
          });

        setProjects(nextSorted);
        broadcastProjectsUpdate(
          'featured',
          { id, is_featured: newStatus },
          nextSorted
        );
        setTimeout(() => router.refresh(), 50);
        showToast(
          newStatus
            ? `Proyek "${title}" disematkan ke halaman utama & disinkronkan!`
            : `Proyek "${title}" dilepas dari sematan & disinkronkan.`
        );
      } else {
        showToast(
          `Gagal memperbarui status: ${json?.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus proyek "${title}" secara permanen?`)) return;

    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const json = await parseJsonSafely(response);

      if (response.ok && json && json.success) {
        const nextList = projects.filter((p) => p.id !== id);
        setProjects(nextList);
        broadcastProjectsUpdate('delete', { id }, nextList);
        setTimeout(() => router.refresh(), 50);
        showToast(`Proyek "${title}" berhasil dihapus.`);
      } else {
        showToast(
          `Gagal menghapus: ${json?.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
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
      image:
        'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
      link: '',
      tags: ['Figma', 'UI/UX'],
    };
    setSubItems((prev) => [...prev, newItem]);
  };

  const handleUpdateSubItem = (
    id: string,
    field: keyof SubProjectItem,
    val: any
  ) => {
    setSubItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveSubItem = (id: string) => {
    setSubItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSubId) return;

    if (file.size > 4 * 1024 * 1024) {
      showToast('Ukuran file maksimal 4MB', 'error');
      e.target.value = '';
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
    e.target.value = '';
  };

  const handleSaveSubItems = async () => {
    if (!selectedMultiProject) return;
    setSavingSub(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          id: selectedMultiProject.id,
          title: selectedMultiProject.title,
          category: selectedMultiProject.category,
          collection_items: subItems,
        }),
      });
      const json = await parseJsonSafely(response);

      if (response.ok && json && json.success) {
        const nextList = projects.map((p) =>
          p.id === selectedMultiProject.id
            ? { ...p, collection_items: subItems }
            : p
        );
        setProjects(nextList);
        broadcastProjectsUpdate(
          'sub_items',
          {
            id: selectedMultiProject.id,
            collection_items: subItems,
          },
          nextList
        );
        setTimeout(() => router.refresh(), 50);
        showToast(
          'Item koleksi multi-proyek berhasil diperbarui ke Neon & disinkronkan!'
        );
        setIsMultiModalOpen(false);
        await fetchProjects();
      } else {
        showToast(
          `Gagal menyimpan item koleksi: ${json?.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSavingSub(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof signOut === 'function') {
        await signOut();
      }
    } catch {
      // Lanjutkan navigasi meski signOut gagal
    } finally {
      router.replace('/login');
    }
  };

  const filteredProjects = projects.filter((p) => {
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
    <div
      suppressHydrationWarning
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-muted)] flex flex-col lg:flex-row antialiased selection:bg-accent/30 transition-colors duration-250"
    >
      <input
        type="file"
        ref={activeSubInputRef}
        onChange={handleSubFileUpload}
        accept="image/*"
        className="hidden"
      />

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
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[var(--card-bg)] border-r border-[var(--card-border)] p-5 shrink-0 min-h-screen sticky top-0 transition-colors duration-250">
        <div>
          <div className="flex items-center gap-1.5 px-3 py-2 mb-6">
            <span className="text-xl font-black text-[var(--text-main)]">
              IbeLaia
            </span>
            <span className="text-xl font-black text-accent">.Dev</span>
          </div>

          <div className="space-y-6 text-xs">
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2">
                Overview
              </p>
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2">
                Website Content
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard/home"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <Home size={15} />
                  <span>Home</span>
                </Link>
                <Link
                  href="/dashboard/about"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <User size={15} />
                  <span>About</span>
                </Link>
                <Link
                  href="/dashboard/services"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <Wrench size={15} />
                  <span>Services</span>
                </Link>
                <Link
                  href="/dashboard/projects/list"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-accent/15 text-[var(--text-main)] border border-accent/40 transition-all"
                >
                  <FolderGit2 size={15} className="text-accent" />
                  <span>Projects</span>
                </Link>
                <Link
                  href="/dashboard/achievements"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <Award size={15} />
                  <span>Achievements</span>
                </Link>
                <Link
                  href="/dashboard/certificates"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <FileBadge size={15} />
                  <span>Certificates</span>
                </Link>
                <Link
                  href="/dashboard/contact"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <Mail size={15} />
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2">
                Assets
              </p>
              <Link
                href="/dashboard/media"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <FolderArchive size={15} />
                <span>Media Library</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-[var(--text-muted)] mb-2">
                Settings
              </p>
              <div className="space-y-1">
                <Link
                  href="/dashboard/appearance"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <Palette size={15} />
                  <span>Appearance</span>
                </Link>
                <Link
                  href="/dashboard/seo"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors"
                >
                  <Settings size={15} />
                  <span>General Settings</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--card-border)] space-y-3">
          <Link
            href="/projects"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-[var(--card-border)] hover:border-accent/50 text-[var(--text-main)] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Preview Projects</span>
            <ExternalLink size={13} />
          </Link>
          <button
            type="button"
            suppressHydrationWarning
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--card-border)]">
          <div className="space-y-1">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline mb-1"
            >
              <ArrowLeft size={13} />
              <span>Kembali ke Projects Hub</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
              Kelola & Daftar Proyek Terpublikasi
            </h1>
            <p className="text-xs text-[var(--text-muted)]">
              Pusat daftar seluruh studi kasus dan koleksi portofolio yang aktif
              via Neon secara dinamis.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              suppressHydrationWarning
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari proyek..."
              className="w-full pl-9 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] focus:border-accent rounded-xl text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none transition-all shadow-inner"
            />
            <Search
              size={14}
              className="absolute left-3 top-3 text-[var(--text-muted)]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-accent text-slate-950 shadow-lg'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Semua ({projects.length})
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab('single')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-accent text-slate-950 shadow-lg'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Single Case Study (
            {projects.filter((p) => p.type === 'single' || !p.type).length})
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setActiveTab('multi')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === 'multi'
                ? 'bg-accent text-slate-950 shadow-lg'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            Multi-Project Collection (
            {projects.filter((p) => p.type === 'multi').length})
          </button>
        </div>

        {/* Daftar Kartu Proyek */}
        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-[var(--text-muted)] flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-accent" />
            <span>Memuat daftar proyek dari Neon API...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 space-y-3">
            <FolderGit2
              size={36}
              className="mx-auto text-[var(--text-muted)]"
            />
            <p className="text-sm font-semibold text-[var(--text-main)]">
              Tidak ada proyek ditemukan pada kategori ini
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((p) => {
              const isMulti = p.type === 'multi';
              const targetPublicUrl = isMulti
                ? `/projects/collection/${p.slug}`
                : `/projects/${p.slug}`;
              const subItemsCount = Array.isArray(p.collection_items)
                ? p.collection_items.length
                : 0;
              const isStarred = Boolean(p.is_featured);

              return (
                <div
                  key={p.id}
                  className={`bg-[var(--card-bg)] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl ${
                    isStarred
                      ? 'border-accent/70 shadow-accent/10'
                      : 'border-[var(--card-border)] hover:border-accent/40'
                  }`}
                >
                  <div>
                    <div className="relative w-full h-36 bg-[var(--bg-primary)] overflow-hidden">
                      <img
                        src={p.thumbnail || '/placeholder.svg'}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/80 backdrop-blur-md border border-white/10 text-accent font-bold">
                          {p.category}
                        </span>
                        {isMulti && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-accent/90 text-slate-950 font-bold flex items-center gap-1">
                            <FolderArchive size={10} /> Multi ({subItemsCount})
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() =>
                            handleToggleFeatured(p.id, isStarred, p.title)
                          }
                          className={`p-1.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer shadow-lg flex items-center gap-1 text-[10px] font-mono font-bold ${
                            isStarred
                              ? 'bg-accent border-accent text-slate-950'
                              : 'bg-black/60 border-white/10 text-slate-300 hover:text-accent'
                          }`}
                          title={
                            isStarred
                              ? 'Proyek Unggulan (Tampil di Web Personal)'
                              : 'Jadikan Proyek Unggulan'
                          }
                        >
                          <Star
                            size={13}
                            className={
                              isStarred ? 'fill-slate-950 text-slate-950' : ''
                            }
                          />
                        </button>

                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {p.status || 'PUBLISHED'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-accent transition-colors line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {p.overview}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-[var(--card-border)] flex items-center justify-between bg-[var(--bg-primary)]/50 text-xs">
                    <Link
                      href={targetPublicUrl}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-accent transition-colors"
                      title="Lihat Halaman Publik"
                    >
                      <Eye size={13} />
                    </Link>
                    <div className="flex items-center gap-2">
                      {isMulti ? (
                        <div className="flex items-center gap-1.5">
                          <Link
                            href={`/dashboard/projects?edit=${p.id}`}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--card-border)] font-mono text-[11px] text-[var(--text-main)] flex items-center gap-1 transition-colors"
                            title="Edit Informasi Utama Koleksi"
                          >
                            <Edit3 size={11} />
                            <span>Edit Koleksi</span>
                          </Link>
                          <button
                            type="button"
                            suppressHydrationWarning
                            onClick={() => handleOpenMultiModal(p)}
                            className="px-2.5 py-1 rounded-lg bg-accent/15 hover:bg-accent/25 border border-accent/40 font-mono text-[11px] text-accent flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Layers size={11} />
                            <span>Item ({subItemsCount})</span>
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/dashboard/projects?edit=${p.id}`}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-[var(--card-border)] font-mono text-[11px] text-[var(--text-main)] flex items-center gap-1 transition-colors"
                        >
                          <Edit3 size={11} />
                          <span>Edit Studi Kasus</span>
                        </Link>
                      )}

                      <button
                        type="button"
                        suppressHydrationWarning
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
          <div className="bg-[var(--card-bg)] border border-accent/40 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] bg-[var(--card-bg)] shrink-0">
              <div className="flex items-center gap-2.5">
                <Layers size={18} className="text-accent" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    Kelola Sub-Item Koleksi: {selectedMultiProject.title}
                  </h3>
                  <p className="text-[10px] font-mono text-[var(--text-muted)]">
                    Tambah, ubah, atau unggah gambar mockup untuk setiap item di
                    koleksi ini.
                  </p>
                </div>
              </div>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsMultiModalOpen(false)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                  Daftar Sub-Proyek ({subItems.length})
                </span>
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={handleAddSubItem}
                  className="px-3 py-1.5 rounded-xl bg-accent/15 hover:bg-accent/25 text-accent font-mono text-xs flex items-center gap-1.5 cursor-pointer border border-accent/40"
                >
                  <Plus size={12} />
                  <span>+ Tambah Sub-Proyek Baru</span>
                </button>
              </div>

              {subItems.length === 0 ? (
                <div className="py-12 text-center bg-[var(--bg-primary)] border border-dashed border-[var(--card-border)] rounded-2xl p-6 text-[var(--text-muted)] font-mono text-xs">
                  Belum ada sub-proyek dalam koleksi ini. Klik tombol di atas
                  untuk menambahkannya.
                </div>
              ) : (
                <div className="space-y-4">
                  {subItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--card-border)] space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[var(--text-main)]">
                          Sub-Item #{idx + 1}
                        </span>
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => handleRemoveSubItem(item.id)}
                          className="p-1 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer"
                          title="Hapus Item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[var(--text-muted)] text-[10px] font-mono mb-1">
                            Judul Sub-Proyek
                          </label>
                          <input
                            type="text"
                            suppressHydrationWarning
                            value={item.title}
                            onChange={(e) =>
                              handleUpdateSubItem(
                                item.id,
                                'title',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[var(--text-muted)] text-[10px] font-mono mb-1">
                            Sub-judul / Badge
                          </label>
                          <input
                            type="text"
                            suppressHydrationWarning
                            value={item.subtitle}
                            onChange={(e) =>
                              handleUpdateSubItem(
                                item.id,
                                'subtitle',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[var(--text-muted)] text-[10px] font-mono">
                          Gambar Mockup / Pratinjau
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-[var(--bg-primary)] border border-[var(--card-border)] shrink-0">
                            <img
                              src={item.image || '/placeholder.svg'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              suppressHydrationWarning
                              value={item.image}
                              onChange={(e) =>
                                handleUpdateSubItem(
                                  item.id,
                                  'image',
                                  e.target.value
                                )
                              }
                              placeholder="https://images.unsplash.com/..."
                              className="w-full px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] font-mono text-[11px]"
                            />
                            <button
                              type="button"
                              suppressHydrationWarning
                              onClick={() => {
                                setActiveSubId(item.id);
                                activeSubInputRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              <Upload size={12} />
                              <span>Laptop</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[var(--text-muted)] text-[10px] font-mono mb-1">
                            Tautan Figma / Live (Opsional)
                          </label>
                          <input
                            type="text"
                            suppressHydrationWarning
                            value={item.link || ''}
                            onChange={(e) =>
                              handleUpdateSubItem(
                                item.id,
                                'link',
                                e.target.value
                              )
                            }
                            placeholder="https://figma.com/..."
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] font-mono text-[11px]"
                          />
                        </div>
                        <div>
                          <label className="block text-[var(--text-muted)] text-[10px] font-mono mb-1">
                            Tech Tags (Pisahkan koma)
                          </label>
                          <input
                            type="text"
                            suppressHydrationWarning
                            value={
                              Array.isArray(item.tags)
                                ? item.tags.join(', ')
                                : ''
                            }
                            onChange={(e) =>
                              handleUpdateSubItem(
                                item.id,
                                'tags',
                                e.target.value
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                              )
                            }
                            placeholder="Figma, Mobile UI, Wireframe"
                            className="w-full px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[var(--text-muted)] text-[10px] font-mono mb-1">
                          Deskripsi Item
                        </label>
                        <textarea
                          rows={2}
                          suppressHydrationWarning
                          value={item.desc}
                          onChange={(e) =>
                            handleUpdateSubItem(item.id, 'desc', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-main)] text-xs leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] shrink-0 flex items-center justify-end gap-2">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setIsMultiModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                suppressHydrationWarning
                disabled={savingSub}
                onClick={handleSaveSubItems}
                className="px-5 py-2 rounded-xl bg-accent text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {savingSub && <Loader2 size={13} className="animate-spin" />}
                <Save size={13} />
                <span>Simpan Item Koleksi ke Neon</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}