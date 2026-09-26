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
  Upload,
  Copy,
  Trash2,
  Image as ImageIcon,
  Eye,
  RefreshCcw
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface MediaFile {
  name: string;
  id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  size?: number | null;
  publicUrl: string;
}

export default function MediaLibraryPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('portfolio-images')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.warn('Error fetching storage list:', error.message);
        setMediaFiles([]);
      } else if (data) {
        const filesWithUrl = data.map((file: any) => {
          const { data: publicUrlData } = supabase.storage
            .from('portfolio-images')
            .getPublicUrl(file.name);

          return {
            name: file.name,
            id: file.id || null,
            updated_at: file.updated_at || null,
            created_at: file.created_at || file.updated_at || new Date().toISOString(),
            size: file.metadata?.size || file.size || 0,
            publicUrl: publicUrlData.publicUrl
          };
        });
        setMediaFiles(filesWithUrl);
      }
    } catch (err) {
      console.warn('System error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file);

      if (!error) {
        successCount++;
      }
    }

    setUploading(false);
    if (successCount > 0) {
      showToast(`${successCount} file gambar berhasil diunggah!`);
      fetchMediaFiles();
    } else {
      showToast('Gagal mengunggah file.', 'error');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('URL gambar berhasil disalin ke clipboard!');
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Hapus file "${fileName}" dari Media Library?`)) return;

    const { error } = await supabase.storage
      .from('portfolio-images')
      .remove([fileName]);

    if (!error) {
      setMediaFiles(mediaFiles.filter(f => f.name !== fileName));
      showToast('File berhasil dihapus.');
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

      {/* Toast Notification */}
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
              <Link href="/dashboard/media" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                <FolderArchive size={15} className="text-[#c084fc]" />
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
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* Header Title & Upload Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Media Library</h1>
            <p className="text-xs text-slate-400 mt-1">Pusat penyimpanan aset gambar dan berkas digital untuk portofolio.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMediaFiles}
              className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
              title="Refresh Galeri"
            >
              <RefreshCcw size={13} className="text-cyan-400" />
              <span>Muat Ulang</span>
            </button>

            <label className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 cursor-pointer active:scale-95">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{uploading ? 'Mengunggah...' : 'Upload Gambar Baru'}</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Hero Banner Upload Dropzone Box */}
        <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-sm font-bold text-white">Seret dan letakkan gambar ke sini, atau klik untuk memilih file</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Mendukung format PNG, JPG, WEBP, atau SVG. Setiap file yang diunggah akan otomatis menghasilkan URL publik untuk digunakan pada proyek atau sertifikat Anda.
          </p>
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 cursor-pointer transition-colors">
              <Upload size={13} className="text-cyan-400" />
              <span>Pilih Berkas dari Perangkat</span>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Gallery Grid List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <FolderArchive size={15} className="text-purple-400" />
              <span>Daftar Aset Tersimpan ({mediaFiles.length} File)</span>
            </h3>
          </div>

          {loading ? (
            <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-cyan-400" />
              <span>Memuat galeri media dari Supabase Storage...</span>
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="py-20 text-center bg-[#0b0e17] border border-white/5 rounded-2xl p-8 space-y-2">
              <ImageIcon size={32} className="mx-auto text-slate-600" />
              <p className="text-xs font-semibold text-white">Belum ada file media di dalam penyimpanan</p>
              <p className="text-[11px] text-slate-500">Silakan unggah gambar pertama Anda menggunakan tombol di atas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((file) => (
                <div
                  key={file.name}
                  className="bg-[#0b0e17] border border-white/5 hover:border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xl transition-all"
                >
                  {/* Image Preview Box */}
                  <div className="relative w-full h-36 bg-slate-950 overflow-hidden">
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={file.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
                        title="Buka Gambar di Tab Baru"
                      >
                        <Eye size={14} />
                      </a>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="p-3.5 space-y-1.5 flex-1">
                    <p className="text-xs font-bold text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{Math.round((file.size || 0) / 1024)} KB</span>
                      <span>{file.created_at ? new Date(file.created_at).toLocaleDateString('id-ID') : ''}</span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="px-3.5 py-2.5 border-t border-white/5 flex items-center justify-between bg-[#07090e]/60">
                    <button
                      onClick={() => handleCopyUrl(file.publicUrl)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Salin Tautan Publik"
                    >
                      <Copy size={11} />
                      <span>Salin URL</span>
                    </button>

                    <button
                      onClick={() => handleDeleteFile(file.name)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                      title="Hapus File"
                    >
                      <Trash2 size={13} />
                    </button>
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