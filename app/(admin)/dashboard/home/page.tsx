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
  RotateCcw,
  CheckCircle2,
  Loader2,
  Eye,
  Upload,
  Languages,
} from 'lucide-react';

const HOME_SYNC_CHANNEL = 'portfolio-sync-home';
const ADMIN_SYNC_CHANNEL = 'portfolio-admin-sync';
const LANG_SYNC_CHANNEL = 'portfolio-lang-sync';
const HOME_STORAGE_KEY = 'portfolio_home_settings';
const HOME_BILINGUAL_STORAGE_KEY = 'portfolio_home_bilingual';
const PROFILE_PHOTO_STORAGE_KEY = 'portfolio_profile_photo_url';

const DEFAULT_PROFILE_PHOTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const DEFAULT_COVER_PHOTO =
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';

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

function compressImageFile(
  file: File,
  maxWidth: number,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof reader.result === 'string' ? reader.result : '');
          return;
        }
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      } else {
        reject(new Error('Format gambar tidak valid'));
      }
    };
    reader.readAsDataURL(file);
  });
}

function safeSetLocalStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Jika kuota localStorage penuh, bersihkan cache lama lalu coba lagi
    try {
      localStorage.removeItem(HOME_BILINGUAL_STORAGE_KEY);
      localStorage.removeItem(HOME_SYNC_CHANNEL);
      localStorage.setItem(key, value);
    } catch {
      // Abaikan jika tetap gagal
    }
  }
}

export default function HomeManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [editLang, setEditLang] = useState<'en' | 'id'>('en');

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const adminChannelRef = useRef<BroadcastChannel | null>(null);

  const [formData, setFormData] = useState({
    subtitle: '',
    subtitle_id: '',
    title: 'Ibe Laia',
    highlight_text: 'Full-Stack Developer',
    highlight_text_id: 'Software Developer',
    description:
      'I build modern, responsive, and scalable web applications with clean code, reliable databases, and thoughtful user experiences.',
    description_id:
      'Saya membangun aplikasi web modern, responsif, dan skalabel dengan kode yang bersih, basis data yang andal, serta pengalaman pengguna yang optimal.',
    hero_cover_url: DEFAULT_COVER_PHOTO,
    profile_photo_url: DEFAULT_PROFILE_PHOTO,
    primary_btn_text: 'Explore My Work',
    primary_btn_text_id: 'Jelajahi Karya Saya',
    primary_btn_link: '/projects',
    secondary_btn_text: 'Contact Me',
    secondary_btn_text_id: 'Hubungi Saya',
    secondary_btn_link: '/contact',
  });

  const broadcastHomeUpdate = (updatedData: Record<string, any>) => {
    const eventDetail = {
      section: 'home',
      updatedAt: Date.now(),
      data: updatedData,
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

    safeSetLocalStorage(HOME_STORAGE_KEY, JSON.stringify(updatedData));
    safeSetLocalStorage(
      HOME_BILINGUAL_STORAGE_KEY,
      JSON.stringify({
        en: {
          subtitle: updatedData.subtitle ?? '',
          title: updatedData.title,
          highlight_text: updatedData.highlight_text,
          description: updatedData.description,
          primary_btn_text: updatedData.primary_btn_text,
          secondary_btn_text: updatedData.secondary_btn_text,
        },
        id: {
          subtitle: updatedData.subtitle_id ?? '',
          title: updatedData.title,
          highlight_text: updatedData.highlight_text_id,
          description: updatedData.description_id,
          primary_btn_text: updatedData.primary_btn_text_id,
          secondary_btn_text: updatedData.secondary_btn_text_id,
        },
      })
    );
    if (updatedData.profile_photo_url) {
      safeSetLocalStorage(
        PROFILE_PHOTO_STORAGE_KEY,
        updatedData.profile_photo_url
      );
    }

    window.dispatchEvent(
      new CustomEvent(HOME_SYNC_CHANNEL, { detail: eventDetail })
    );
    window.dispatchEvent(
      new CustomEvent(LANG_SYNC_CHANNEL, { detail: eventDetail })
    );
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(HOME_SYNC_CHANNEL);
      adminChannelRef.current = new BroadcastChannel(ADMIN_SYNC_CHANNEL);
    }

    async function loadSettings() {
      let localPhoto: string | null = null;
      let cachedHome: Record<string, any> = {};

      try {
        const cachedRaw = localStorage.getItem(HOME_STORAGE_KEY);
        localPhoto = localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY);
        const cachedBilingualRaw = localStorage.getItem(
          HOME_BILINGUAL_STORAGE_KEY
        );

        if (cachedRaw && isMounted) {
          cachedHome = JSON.parse(cachedRaw) || {};
          const cachedBilingual = cachedBilingualRaw
            ? JSON.parse(cachedBilingualRaw)
            : null;

          const resolvedLocalPhoto =
            localPhoto ||
            cachedHome.profile_photo_url ||
            cachedHome.avatar_url ||
            DEFAULT_PROFILE_PHOTO;

          setFormData((prev) => ({
            ...prev,
            ...cachedHome,
            subtitle:
              typeof cachedHome.subtitle === 'string'
                ? cachedHome.subtitle
                : prev.subtitle,
            subtitle_id:
              typeof cachedHome.subtitle_id === 'string'
                ? cachedHome.subtitle_id
                : typeof cachedBilingual?.id?.subtitle === 'string'
                  ? cachedBilingual.id.subtitle
                  : prev.subtitle_id,
            highlight_text_id:
              cachedHome.highlight_text_id ||
              cachedBilingual?.id?.highlight_text ||
              prev.highlight_text_id,
            description_id:
              cachedHome.description_id ||
              cachedBilingual?.id?.description ||
              prev.description_id,
            primary_btn_text_id:
              cachedHome.primary_btn_text_id ||
              cachedBilingual?.id?.primary_btn_text ||
              prev.primary_btn_text_id,
            secondary_btn_text_id:
              cachedHome.secondary_btn_text_id ||
              cachedBilingual?.id?.secondary_btn_text ||
              prev.secondary_btn_text_id,
            hero_cover_url:
              cachedHome.hero_cover_url || prev.hero_cover_url,
            profile_photo_url: resolvedLocalPhoto,
          }));
        } else if (localPhoto && isMounted) {
          setFormData((prev) => ({
            ...prev,
            profile_photo_url: localPhoto as string,
          }));
        }
      } catch {
        // Abaikan error parse cache lokal
      }

      try {
        const response = await fetch('/api/portfolio', { cache: 'no-store' });
        if (response.ok && isMounted) {
          const json = await parseJsonSafely(response);
          if (json && json.success !== false) {
            const loadedRecord = json.home || json.data?.home || json.data;
            if (loadedRecord && typeof loadedRecord === 'object') {
              const apiPhoto =
                loadedRecord?.profile_photo_url || loadedRecord?.avatar_url;
              const hasLocalOverride = Boolean(
                localPhoto ||
                  cachedHome.profile_photo_url ||
                  cachedHome.avatar_url
              );
              const finalPhoto = hasLocalOverride
                ? localPhoto ||
                  cachedHome.profile_photo_url ||
                  cachedHome.avatar_url ||
                  apiPhoto ||
                  DEFAULT_PROFILE_PHOTO
                : apiPhoto || DEFAULT_PROFILE_PHOTO;

              setFormData((prev) => ({
                ...prev,
                subtitle:
                  typeof loadedRecord?.subtitle === 'string'
                    ? loadedRecord.subtitle
                    : prev.subtitle,
                subtitle_id:
                  typeof loadedRecord?.subtitle_id === 'string'
                    ? loadedRecord.subtitle_id
                    : prev.subtitle_id,
                title: loadedRecord?.title || prev.title,
                highlight_text:
                  loadedRecord?.highlight_text || prev.highlight_text,
                highlight_text_id:
                  loadedRecord?.highlight_text_id || prev.highlight_text_id,
                description: loadedRecord?.description || prev.description,
                description_id:
                  loadedRecord?.description_id || prev.description_id,
                hero_cover_url:
                  loadedRecord?.hero_cover_url || prev.hero_cover_url,
                profile_photo_url: finalPhoto,
                primary_btn_text:
                  loadedRecord?.primary_btn_text || prev.primary_btn_text,
                primary_btn_text_id:
                  loadedRecord?.primary_btn_text_id || prev.primary_btn_text_id,
                primary_btn_link:
                  loadedRecord?.primary_btn_link || prev.primary_btn_link,
                secondary_btn_text:
                  loadedRecord?.secondary_btn_text || prev.secondary_btn_text,
                secondary_btn_text_id:
                  loadedRecord?.secondary_btn_text_id ||
                  prev.secondary_btn_text_id,
                secondary_btn_link:
                  loadedRecord?.secondary_btn_link || prev.secondary_btn_link,
              }));
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat data home:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
      if (adminChannelRef.current) {
        adminChannelRef.current.close();
        adminChannelRef.current = null;
      }
    };
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'profile_photo_url' | 'hero_cover_url'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file maksimal 4MB');
      return;
    }

    try {
      const maxWidth = field === 'profile_photo_url' ? 600 : 1200;
      const compressedUrl = await compressImageFile(file, maxWidth, 0.82);

      setFormData((prev) => {
        const updated = { ...prev, [field]: compressedUrl };
        safeSetLocalStorage(HOME_STORAGE_KEY, JSON.stringify(updated));
        if (field === 'profile_photo_url') {
          safeSetLocalStorage(PROFILE_PHOTO_STORAGE_KEY, compressedUrl);
        }
        broadcastHomeUpdate(updated);
        return updated;
      });
    } catch {
      alert('Gagal memproses gambar. Silakan coba file JPG/PNG/WEBP lain.');
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const payload = {
      ...formData,
      avatar_url: formData.profile_photo_url,
    };

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ home: payload }),
      });

      const json = await parseJsonSafely(response);
      if (!response.ok || !json || json.success === false) {
        alert(
          `Gagal menyimpan ke Neon: ${json?.error || `HTTP ${response.status}`}`
        );
        return;
      }

      const apiHome =
        json.home && typeof json.home === 'object'
          ? json.home
          : json.data && typeof json.data === 'object'
            ? json.data
            : {};

      const mergedData: Record<string, any> = {
        ...payload,
        ...apiHome,
        profile_photo_url:
          apiHome.profile_photo_url ||
          apiHome.avatar_url ||
          payload.profile_photo_url,
        avatar_url:
          apiHome.avatar_url ||
          apiHome.profile_photo_url ||
          payload.profile_photo_url,
      };

      broadcastHomeUpdate(mergedData);
      setTimeout(() => router.refresh(), 50);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Gagal menyimpan ke Neon: ${err?.message || 'Terjadi kesalahan'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    router.replace('/login');
  };

  const isId = editLang === 'id';

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      <input
        type="file"
        ref={profileInputRef}
        onChange={(e) => handleFileUpload(e, 'profile_photo_url')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={(e) => handleFileUpload(e, 'hero_cover_url')}
        accept="image/*"
        className="hidden"
      />

      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>
            Home settings saved successfully to Neon & synced in real-time!
          </span>
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
                >
                  <Home size={15} className="text-[#c084fc]" />
                  <span>Home</span>
                </Link>
                {[
                  { name: 'About', icon: User, link: '/dashboard/about' },
                  { name: 'Services', icon: Wrench, link: '/dashboard/services' },
                  {
                    name: 'Projects',
                    icon: FolderGit2,
                    link: '/dashboard/projects',
                  },
                  {
                    name: 'Achievements',
                    icon: Award,
                    link: '/dashboard/achievements',
                  },
                  {
                    name: 'Certificates',
                    icon: FileBadge,
                    link: '/dashboard/certificates',
                  },
                  { name: 'Contact', icon: Mail, link: '/dashboard/contact' },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.link}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <item.icon size={15} />
                    <span>{item.name}</span>
                  </Link>
                ))}
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
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Preview Website</span>
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
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Home Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage and customize the content displayed on your portfolio home
              page.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <Eye size={13} className="text-cyan-400" />
            <span>View Live Page</span>
            <ExternalLink size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat konfigurasi beranda...</span>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 sm:p-7 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-sm font-bold text-white">Hero Section</h2>
                  <p className="text-[11px] text-slate-500">
                    Customize your hero section content and appearance.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center rounded-xl bg-[#07090e] border border-white/10 p-1 text-[10px] font-mono">
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
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        subtitle: '',
                        subtitle_id: '',
                        title: 'Ibe Laia',
                        highlight_text: 'Full-Stack Developer',
                        highlight_text_id: 'Software Developer',
                      }));
                    }}
                    className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  Hero Visuals
                </span>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-mono">
                    Hero Cover Image
                  </label>
                  <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden border border-white/10 bg-slate-950 group">
                    <img
                      src={formData.hero_cover_url}
                      alt="Hero Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <Upload size={13} />
                        <span>Pilih dari Laptop</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-mono">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-cyan-500/40 bg-slate-900 shrink-0">
                      <img
                        src={formData.profile_photo_url}
                        alt="Profile Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={12} />
                        <span>Pilih Foto dari Laptop</span>
                      </button>
                      <p className="text-[10px] text-slate-500">
                        Mendukung format JPG, PNG, atau WEBP (Maksimal 4MB).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Subtitle ({isId ? 'Bahasa Indonesia' : 'English'})
                  </label>
                  <input
                    type="text"
                    value={isId ? formData.subtitle_id : formData.subtitle}
                    onChange={(e) =>
                      setFormData((prev) =>
                        isId
                          ? { ...prev, subtitle_id: e.target.value }
                          : { ...prev, subtitle: e.target.value }
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Title (Name)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Highlight Text (Role) (
                      {isId ? 'Bahasa Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={
                        isId
                          ? formData.highlight_text_id
                          : formData.highlight_text
                      }
                      onChange={(e) =>
                        setFormData((prev) =>
                          isId
                            ? { ...prev, highlight_text_id: e.target.value }
                            : { ...prev, highlight_text: e.target.value }
                        )
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Description ({isId ? 'Bahasa Indonesia' : 'English'})
                  </label>
                  <textarea
                    rows={3}
                    value={
                      isId ? formData.description_id : formData.description
                    }
                    onChange={(e) =>
                      setFormData((prev) =>
                        isId
                          ? { ...prev, description_id: e.target.value }
                          : { ...prev, description: e.target.value }
                      )
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                  CTA Buttons
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Primary Button Text (
                      {isId ? 'Bahasa Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={
                        isId
                          ? formData.primary_btn_text_id
                          : formData.primary_btn_text
                      }
                      onChange={(e) =>
                        setFormData((prev) =>
                          isId
                            ? { ...prev, primary_btn_text_id: e.target.value }
                            : { ...prev, primary_btn_text: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Primary Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.primary_btn_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primary_btn_link: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Secondary Button Text (
                      {isId ? 'Bahasa Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={
                        isId
                          ? formData.secondary_btn_text_id
                          : formData.secondary_btn_text
                      }
                      onChange={(e) =>
                        setFormData((prev) =>
                          isId
                            ? { ...prev, secondary_btn_text_id: e.target.value }
                            : { ...prev, secondary_btn_text: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Secondary Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.secondary_btn_link}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondary_btn_link: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-4 z-20 p-4 bg-[#07090e]/80 backdrop-blur-md rounded-2xl border border-white/5">
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Preview Changes
              </Link>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}