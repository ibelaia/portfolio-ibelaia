'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Upload,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
];

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export default function MediaLibraryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const loadMedia = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/media?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const rawText = await response.text();
        let json: any = null;
        try {
          json = rawText ? JSON.parse(rawText) : null;
        } catch {
          json = null;
        }

        if (response.ok && json?.success) {
          const list = Array.isArray(json.items)
            ? json.items
            : Array.isArray(json.media)
              ? json.media
              : [];
          setItems(list);
          if (isManualRefresh) {
            showToast('Galeri media diperbarui.');
          }
        } else {
          showToast(
            json?.error || `Gagal memuat galeri media (HTTP ${response.status})`,
            'error'
          );
        }
      } catch (err: any) {
        showToast(
          err?.message || 'Terjadi kesalahan saat memuat galeri media.',
          'error'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadMedia(false);
  }, [loadMedia]);

  const handleUploadFile = async (file: File | undefined | null) => {
    if (!file) return;

    if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast(
        'Format berkas tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG.',
        'error'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast('Ukuran gambar maksimal 2 MB.', 'error');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);

      const response = await fetch('/api/media', {
        method: 'POST',
        cache: 'no-store',
        body: formData,
      });
      const rawText = await response.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (response.ok && json?.success) {
        const created = json.item || json.data;
        if (created) {
          setItems((prev) => [created, ...prev]);
        } else {
          await loadMedia(false);
        }
        router.refresh();
        showToast('Gambar berhasil diunggah ke Media Library!');
      } else {
        showToast(
          json?.error || `Gagal mengunggah gambar (HTTP ${response.status})`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(
        err?.message || 'Terjadi kesalahan saat mengunggah gambar.',
        'error'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus aset gambar ini dari Media Library?')) return;

    try {
      const response = await fetch(
        `/api/media?id=${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          cache: 'no-store',
        }
      );
      const rawText = await response.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (response.ok && json?.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        router.refresh();
        showToast('Aset media berhasil dihapus.');
      } else {
        showToast(
          json?.error || `Gagal menghapus aset (HTTP ${response.status})`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(
        err?.message || 'Terjadi kesalahan saat menghapus aset.',
        'error'
      );
    }
  };

  const handleCopyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopiedId(item.id);
      showToast(`URL "${item.name}" disalin ke clipboard.`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Gagal menyalin URL ke clipboard.', 'error');
    }
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium ${
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
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
              >
                <FolderArchive size={15} className="text-[#c084fc]" />
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
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Palette size={15} />
                  <span>Appearance</span>
                </Link>
                <Link
                  href="/dashboard/seo"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
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
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Media Library
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Pusat penyimpanan aset gambar dan berkas digital untuk portofolio
              secara dinamis.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => loadMedia(true)}
              disabled={loading || refreshing}
              className="px-3.5 py-2.5 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading || refreshing ? 'animate-spin' : ''}
              />
              <span>Muat Ulang</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Upload size={14} />
              )}
              <span>{uploading ? 'Mengunggah...' : 'Upload Gambar Baru'}</span>
            </button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          onChange={(e) => handleUploadFile(e.target.files?.[0])}
          className="hidden"
        />

        {/* DROPZONE */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const droppedFile = e.dataTransfer.files?.[0];
            handleUploadFile(droppedFile);
          }}
          className={`bg-[#0b0e17] rounded-2xl p-8 sm:p-10 border border-dashed transition-all text-center space-y-3 ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/5'
              : 'border-white/15 hover:border-white/25'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
            <ImageIcon size={22} />
          </div>
          <p className="text-sm font-bold text-white">
            Seret dan letakkan gambar ke sini, atau klik untuk memilih file
          </p>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            Mendukung format PNG, JPG, WEBP, atau SVG (maks. 2 MB). Setiap file
            yang diunggah akan tersimpan di database dan dapat digunakan pada
            proyek, prestasi, atau sertifikat Anda.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Upload size={14} className="text-cyan-400" />
              <span>Pilih Berkas dari Perangkat</span>
            </button>
          </div>
        </div>

        {/* DAFTAR ASET TERSIMPAN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
              <FolderArchive size={14} className="text-purple-400" />
              <span>Daftar Aset Tersimpan ({items.length} File)</span>
            </h2>
          </div>

          {loading ? (
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl py-16 text-center text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-cyan-400" />
              <span>Memuat galeri media...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl py-14 px-4 text-center space-y-2">
              <ImageIcon size={30} className="mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-slate-300">
                Belum ada file media di dalam penyimpanan
              </p>
              <p className="text-[11px] text-slate-500">
                Silakan unggah gambar pertama Anda menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0b0e17] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div className="aspect-video bg-[#07090e] flex items-center justify-center overflow-hidden border-b border-white/5">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-slate-600" />
                    )}
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-bold text-white truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {item.mime_type} • {formatFileSize(item.size_bytes)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 text-[11px] font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} className="text-cyan-400" />
                            <span>Salin URL</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Hapus Aset"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}