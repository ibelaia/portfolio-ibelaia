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
  Save,
  Trash2,
  MailOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContactContent {
  badge_text: string;
  email: string;
  title: string;
  subtitle: string;
  phone: string;
  location: string;
  response_time: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function AdminContactPage() {
  const router = useRouter();

  // State Pengaturan Konten Kontak
  const [contentForm, setContentForm] = useState<ContactContent>({
    badge_text: 'GET IN TOUCH',
    email: 'hello@ibelaia.dev',
    title: "Let's Build Something Meaningful.",
    subtitle: "I'm always open to discussing web engineering projects, partnership opportunities, or technical inquiries. Have an idea, project, or role in mind? Let's talk.",
    phone: '+62 812 3015 6692',
    location: 'Surabaya, Indonesia',
    response_time: '< 24 Jam Kerja'
  });

  // State Pesan Masuk
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Ambil data form konten & daftar pesan masuk
  const loadData = async () => {
    try {
      // 1. Ambil Konten Halaman Kontak
      const { data: contentData } = await supabase
        .from('contact_content')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (contentData) {
        setContentForm({
          badge_text: contentData.badge_text || '',
          email: contentData.email || '',
          title: contentData.title || '',
          subtitle: contentData.subtitle || '',
          phone: contentData.phone || '',
          location: contentData.location || '',
          response_time: contentData.response_time || ''
        });
      }

      // 2. Ambil Pesan Masuk dari Pengunjung
      const { data: messagesData, error: msgError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!msgError && messagesData) {
        setMessages(messagesData);
      }
    } catch (err) {
      console.warn('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Simpan perubahan form informasi kontak
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);

    try {
      const { error } = await supabase
        .from('contact_content')
        .upsert({
          id: 'default',
          ...contentForm,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      showToast('Informasi kontak berhasil diperbarui!');
    } catch (err: any) {
      showToast(`Gagal menyimpan: ${err.message}`, 'error');
    } finally {
      setSavingContent(false);
    }
  };

  // Hapus pesan tertentu
  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Hapus pesan ini secara permanen?')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      showToast('Pesan berhasil dihapus!');
    } catch (err: any) {
      showToast(`Gagal menghapus pesan: ${err.message}`, 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium ${
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
                <Link href="/dashboard/contact" className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <Mail size={15} className="text-[#c084fc]" />
                    <span>Contact</span>
                  </div>
                  {messages.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black text-[10px]">
                      {messages.length}
                    </span>
                  )}
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
          <Link href="/contact" target="_blank" className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
            <span>Preview Contact Page</span>
            <ExternalLink size={13} />
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Contact Management & Inbox</h1>
            <p className="text-xs text-slate-400 mt-1">Kelola informasi kontak, email, nomor telepon, dan baca pesan masuk dari pengunjung.</p>
          </div>
          <Link href="/contact" target="_blank" className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto">
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data kontak & pesan...</span>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* BAGIAN 1: FORM PENGATURAN INFORMASI HALAMAN KONTAK */}
            <form onSubmit={handleSaveContent} className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                <Mail size={16} className="text-purple-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">1. Informasi Halaman Contact</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Badge Teks Atas</label>
                  <input
                    type="text"
                    value={contentForm.badge_text}
                    onChange={(e) => setContentForm({ ...contentForm, badge_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Email Kontak</label>
                  <input
                    type="email"
                    value={contentForm.email}
                    onChange={(e) => setContentForm({ ...contentForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Judul Utama</label>
                  <input
                    type="text"
                    value={contentForm.title}
                    onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Subjudul / Deskripsi</label>
                  <textarea
                    rows={3}
                    value={contentForm.subtitle}
                    onChange={(e) => setContentForm({ ...contentForm, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Nomor Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={contentForm.phone}
                    onChange={(e) => setContentForm({ ...contentForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Lokasi</label>
                  <input
                    type="text"
                    value={contentForm.location}
                    onChange={(e) => setContentForm({ ...contentForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-mono text-slate-400">Jam Respon</label>
                  <input
                    type="text"
                    value={contentForm.response_time}
                    onChange={(e) => setContentForm({ ...contentForm, response_time: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingContent}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingContent && <Loader2 size={14} className="animate-spin" />}
                  <Save size={14} />
                  <span>{savingContent ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>

            {/* BAGIAN 2: DAFTAR PESAN MASUK DARI PENGUNJUNG (INBOX) */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">2. Pesan Masuk (Visitor Messages)</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                  {messages.length} Pesan
                </span>
              </div>

              {messages.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <MailOpen size={32} className="mx-auto text-slate-600" />
                  <p className="text-xs font-medium text-slate-400">Belum ada pesan masuk dari pengunjung.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-xl bg-[#07090e] border border-white/10 space-y-2.5 hover:border-white/20 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-white">{msg.name}</p>
                          <a href={`mailto:${msg.email}`} className="text-xs font-mono text-cyan-400 hover:underline">
                            {msg.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-slate-500">
                            {new Date(msg.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Hapus Pesan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-slate-400">
                          <strong className="text-slate-300">Subjek:</strong> {msg.subject || 'Tanpa Subjek'}
                        </p>
                        <div className="mt-1.5 p-3 rounded-lg bg-[#0b0e17] text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}