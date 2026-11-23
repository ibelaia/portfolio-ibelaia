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
  Save,
  Trash2,
  MailOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageSquare,
  Languages,
  BellRing,
  RefreshCw,
  Reply,
} from 'lucide-react';

interface ContactContent {
  badge_text: string;
  badge_text_id: string;
  email: string;
  title: string;
  title_id: string;
  subtitle: string;
  subtitle_id: string;
  phone: string;
  location: string;
  location_id: string;
  response_time: string;
  response_time_id: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const CONTACT_SYNC_CHANNEL = 'portfolio-sync-contact';

function formatMessageDate(rawDate: string): string {
  if (!rawDate) return '-';
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function buildMailtoHref(msg: ContactMessage): string {
  const subject = encodeURIComponent(
    msg.subject ? `Re: ${msg.subject}` : 'Balasan Pesan dari Portfolio'
  );
  return `mailto:${encodeURIComponent(msg.email)}?subject=${subject}`;
}

export default function AdminContactPage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const knownMessageIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  const [contactLang, setContactLang] = useState<'EN' | 'ID'>('EN');

  const [contentForm, setContentForm] = useState<ContactContent>({
    badge_text: 'GET IN TOUCH',
    badge_text_id: 'HUBUNGI SAYA',
    email: 'hello@ibelaia.dev',
    title: "Let's Build Something Meaningful.",
    title_id: 'Mari Membangun Sesuatu yang Bermakna.',
    subtitle:
      "I'm always open to discussing web engineering projects, partnership opportunities, or technical inquiries. Have an idea, project, or role in mind? Let's talk.",
    subtitle_id:
      'Saya selalu terbuka untuk berdiskusi mengenai proyek rekayasa web, peluang kemitraan, maupun pertanyaan teknis. Punya ide atau proyek? Mari ngobrol.',
    phone: '+62 812 3015 6692',
    location: 'Surabaya, Indonesia',
    location_id: 'Surabaya, Indonesia',
    response_time: '< 24 Business Hours',
    response_time_id: '< 24 Jam Kerja',
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [unreadIds, setUnreadIds] = useState<string[]>([]);
  const [incomingAlert, setIncomingAlert] = useState<ContactMessage | null>(
    null
  );
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingInbox, setRefreshingInbox] = useState(false);
  const [savingContent, setSavingContent] = useState(false);
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

  const broadcastContactUpdate = useCallback(
    (action: string, detailData?: any) => {
      const eventDetail = {
        section: 'contact',
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
          CONTACT_SYNC_CHANNEL,
          JSON.stringify(eventDetail)
        );
      } catch {
        // Abaikan jika localStorage diblokir
      }

      window.dispatchEvent(
        new CustomEvent(CONTACT_SYNC_CHANNEL, { detail: eventDetail })
      );
    },
    []
  );

  const loadData = useCallback(
    async (
      isMountedRef?: { current: boolean },
      notifyNew = false,
      manualRefresh = false
    ) => {
      if (manualRefresh) setRefreshingInbox(true);
      try {
        const response = await fetch(`/api/contact?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const rawText = await response.text();
        let json: any = null;
        try {
          json = rawText ? JSON.parse(rawText) : null;
        } catch {
          json = null;
        }

        if (isMountedRef && !isMountedRef.current) return;

        if (json?.success) {
          setInboxError(null);

          if (json.content) {
            setContentForm((prev) => ({
              badge_text: json.content.badge_text ?? prev.badge_text,
              badge_text_id: json.content.badge_text_id ?? prev.badge_text_id,
              email: json.content.email ?? prev.email,
              title: json.content.title ?? prev.title,
              title_id: json.content.title_id ?? prev.title_id,
              subtitle: json.content.subtitle ?? prev.subtitle,
              subtitle_id: json.content.subtitle_id ?? prev.subtitle_id,
              phone: json.content.phone ?? prev.phone,
              location: json.content.location ?? prev.location,
              location_id: json.content.location_id ?? prev.location_id,
              response_time: json.content.response_time ?? prev.response_time,
              response_time_id:
                json.content.response_time_id ?? prev.response_time_id,
            }));
          }

          if (Array.isArray(json.messages)) {
            const normalizedList: ContactMessage[] = json.messages.map(
              (m: any, idx: number) => ({
                id:
                  m?.id !== undefined && m?.id !== null
                    ? String(m.id)
                    : `msg-${idx}`,
                name: m?.name || m?.nama || 'Pengunjung',
                email: m?.email || '',
                subject: m?.subject || m?.subjek || '',
                message: m?.message || m?.pesan || '',
                created_at: m?.created_at || new Date().toISOString(),
              })
            );

            if (isInitialLoadRef.current) {
              knownMessageIdsRef.current = new Set(
                normalizedList.map((m) => m.id)
              );
              isInitialLoadRef.current = false;
            } else {
              const brandNewMessages = normalizedList.filter(
                (m) => !knownMessageIdsRef.current.has(m.id)
              );

              if (brandNewMessages.length > 0) {
                brandNewMessages.forEach((m) =>
                  knownMessageIdsRef.current.add(m.id)
                );
                setUnreadIds((prev) =>
                  Array.from(
                    new Set([...brandNewMessages.map((m) => m.id), ...prev])
                  )
                );

                const latest = brandNewMessages[0];
                setIncomingAlert(latest);
                if (notifyNew) {
                  showToast(
                    `Pesan baru dari ${latest.name} (${latest.email}) masuk ke Inbox!`,
                    'success'
                  );
                }
              }
            }

            setMessages(normalizedList);
          }
        } else if (json?.error) {
          setInboxError(json.error);
        }
      } catch (err: any) {
        if (!isMountedRef || isMountedRef.current) {
          console.warn('Gagal memuat data contact:', err);
          setInboxError(err?.message || 'Gagal memuat pesan masuk.');
        }
      } finally {
        if (!isMountedRef || isMountedRef.current) {
          setLoading(false);
          if (manualRefresh) setRefreshingInbox(false);
        }
      }
    },
    [showToast]
  );

  useEffect(() => {
    const isMountedRef = { current: true };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(CONTACT_SYNC_CHANNEL);
      syncChannelRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        const shouldNotify = event?.data?.action === 'new_message';
        loadData(isMountedRef, shouldNotify, false);
      };
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === CONTACT_SYNC_CHANNEL && isMountedRef.current) {
        let shouldNotify = false;
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null;
          shouldNotify = parsed?.action === 'new_message';
        } catch {
          shouldNotify = false;
        }
        loadData(isMountedRef, shouldNotify, false);
      }
    };

    const handleCustomSync = (event: Event) => {
      if (!isMountedRef.current) return;
      const customEvent = event as CustomEvent;
      const shouldNotify = customEvent?.detail?.action === 'new_message';
      loadData(isMountedRef, shouldNotify, false);
    };

    const handleFocusSync = () => {
      if (isMountedRef.current) {
        loadData(isMountedRef, true, false);
      }
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener(CONTACT_SYNC_CHANNEL, handleCustomSync);
    window.addEventListener('focus', handleFocusSync);

    loadData(isMountedRef, false, false);

    const intervalId = window.setInterval(() => {
      if (isMountedRef.current && document.visibilityState === 'visible') {
        loadData(isMountedRef, true, false);
      }
    }, 5000);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener(CONTACT_SYNC_CHANNEL, handleCustomSync);
      window.removeEventListener('focus', handleFocusSync);
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, [loadData]);

  const handleMarkAsRead = (id: string) => {
    setUnreadIds((prev) => prev.filter((itemId) => itemId !== id));
    if (incomingAlert?.id === id) {
      setIncomingAlert(null);
    }
  };

  const handleMarkAllAsRead = () => {
    setUnreadIds([]);
    setIncomingAlert(null);
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          target: 'content',
          ...contentForm,
        }),
      });
      const rawText = await response.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (response.ok && json?.success) {
        broadcastContactUpdate('content', json.content ?? contentForm);
        router.refresh();
        showToast('Informasi kontak berhasil disimpan dan disinkronkan!');
      } else {
        showToast(
          `Gagal menyimpan: ${json?.error || `HTTP ${response.status}`}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSavingContent(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Hapus pesan ini secara permanen?')) return;

    try {
      const response = await fetch(
        `/api/contact?id=${encodeURIComponent(id)}`,
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
        knownMessageIdsRef.current.delete(id);
        setUnreadIds((prev) => prev.filter((itemId) => itemId !== id));
        if (incomingAlert?.id === id) {
          setIncomingAlert(null);
        }
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        broadcastContactUpdate('delete_message', { id });
        router.refresh();
        showToast('Pesan berhasil dihapus dan disinkronkan!');
      } else {
        showToast(
          `Gagal menghapus pesan: ${json?.error || `HTTP ${response.status}`}`,
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
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Mail size={15} className="text-[#c084fc]" />
                    <span>Contact</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black text-[10px]">
                    {unreadIds.length > 0
                      ? `${unreadIds.length} Baru`
                      : messages.length}
                  </span>
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
            href="/contact"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Preview Contact Page</span>
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
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Contact Management & Inbox
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kelola informasi kontak, email, dan baca pesan masuk dari
              pengunjung via Neon secara dinamis.
            </p>
          </div>
          <Link
            href="/contact"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <Eye size={13} className="text-cyan-400" />
            <span>Lihat Halaman Publik</span>
          </Link>
        </div>

        {/* Banner Notifikasi Pesan Masuk Baru */}
        {incomingAlert && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-400/20 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing size={16} />
              </div>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-white">
                  Pesan Masuk Baru dari {incomingAlert.name}
                </p>
                <p className="text-cyan-200/90 font-mono text-[11px]">
                  {incomingAlert.email} •{' '}
                  {incomingAlert.subject || 'Tanpa Subjek'}
                </p>
                <p className="text-slate-300 line-clamp-2 pt-0.5">
                  {incomingAlert.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleMarkAsRead(incomingAlert.id)}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer transition-colors"
            >
              Tutup Notifikasi
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data kontak & pesan dari Neon API...</span>
          </div>
        ) : (
          <div className="space-y-10">
            {/* BAGIAN 1: FORM PENGATURAN INFORMASI HALAMAN KONTAK */}
            <form
              onSubmit={handleSaveContent}
              className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl"
            >
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5 flex-wrap">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-purple-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    1. Informasi Halaman Contact
                  </span>
                </div>

                {/* Translate Toggle Bahasa Inggris & Bahasa Indonesia */}
                <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#07090e] border border-white/10 text-[11px] font-mono">
                  <Languages size={13} className="text-cyan-400 ml-1.5 mr-1" />
                  <button
                    type="button"
                    onClick={() => setContactLang('EN')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      contactLang === 'EN'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setContactLang('ID')}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      contactLang === 'ID'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Indonesia
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {contactLang === 'EN' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Badge Teks Atas (English)
                      </label>
                      <input
                        type="text"
                        value={contentForm.badge_text}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            badge_text: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Email Kontak
                      </label>
                      <input
                        type="email"
                        value={contentForm.email}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Judul Utama (English)
                      </label>
                      <input
                        type="text"
                        value={contentForm.title}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Subjudul / Deskripsi (English)
                      </label>
                      <textarea
                        rows={3}
                        value={contentForm.subtitle}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            subtitle: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={contentForm.phone}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Lokasi (English)
                      </label>
                      <input
                        type="text"
                        value={contentForm.location}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Jam Respon (English)
                      </label>
                      <input
                        type="text"
                        value={contentForm.response_time}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            response_time: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Badge Teks Atas (Indonesia)
                      </label>
                      <input
                        type="text"
                        value={contentForm.badge_text_id}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            badge_text_id: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Email Kontak
                      </label>
                      <input
                        type="email"
                        value={contentForm.email}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Judul Utama (Indonesia)
                      </label>
                      <input
                        type="text"
                        value={contentForm.title_id}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            title_id: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Subjudul / Deskripsi (Indonesia)
                      </label>
                      <textarea
                        rows={3}
                        value={contentForm.subtitle_id}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            subtitle_id: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Nomor Telepon / WhatsApp
                      </label>
                      <input
                        type="text"
                        value={contentForm.phone}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Lokasi (Indonesia)
                      </label>
                      <input
                        type="text"
                        value={contentForm.location_id}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            location_id: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-[11px] font-mono text-slate-400">
                        Jam Respon (Indonesia)
                      </label>
                      <input
                        type="text"
                        value={contentForm.response_time_id}
                        onChange={(e) =>
                          setContentForm({
                            ...contentForm,
                            response_time_id: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white font-mono focus:border-cyan-400 outline-none"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingContent}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {savingContent && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  <Save size={14} />
                  <span>
                    {savingContent ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </span>
                </button>
              </div>
            </form>

            {/* BAGIAN 2: DAFTAR PESAN MASUK DARI PENGUNJUNG (INBOX) */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/5 flex-wrap">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    2. Pesan Masuk (Visitor Messages)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={refreshingInbox}
                    onClick={() => loadData({ current: true }, true, true)}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={12}
                      className={refreshingInbox ? 'animate-spin' : ''}
                    />
                    <span>Refresh</span>
                  </button>
                  {unreadIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/30 cursor-pointer transition-colors"
                    >
                      Tandai Semua Dibaca ({unreadIds.length})
                    </button>
                  )}
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                    {messages.length} Pesan
                  </span>
                </div>
              </div>

              {inboxError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300">
                  {inboxError}
                </div>
              )}

              {messages.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <MailOpen size={32} className="mx-auto text-slate-600" />
                  <p className="text-xs font-medium text-slate-400">
                    Belum ada pesan masuk dari pengunjung.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isUnread = unreadIds.includes(msg.id);
                    return (
                      <div
                        key={msg.id}
                        onClick={() => isUnread && handleMarkAsRead(msg.id)}
                        className={`p-4 rounded-xl bg-[#07090e] border space-y-2.5 transition-all ${
                          isUnread
                            ? 'border-cyan-400/40 ring-1 ring-cyan-400/20'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white">
                              {msg.name}
                            </p>
                            {isUnread && (
                              <span className="px-2 py-0.5 rounded-md bg-cyan-400 text-slate-950 font-black text-[10px] uppercase">
                                Baru
                              </span>
                            )}
                            <a
                              href={buildMailtoHref(msg)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs font-mono text-cyan-400 hover:underline"
                            >
                              {msg.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-mono text-slate-500">
                              {formatMessageDate(msg.created_at)}
                            </span>
                            <a
                              href={buildMailtoHref(msg)}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/25 text-[11px] font-mono inline-flex items-center gap-1 transition-colors"
                              title="Balas via Email"
                            >
                              <Reply size={12} />
                              <span>Balas</span>
                            </a>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(msg.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                              title="Hapus Pesan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                          <p className="text-xs text-slate-400">
                            <strong className="text-slate-300">Subjek:</strong>{' '}
                            {msg.subject || 'Tanpa Subjek'}
                          </p>
                          <div className="mt-1.5 p-3 rounded-lg bg-[#0b0e17] text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}