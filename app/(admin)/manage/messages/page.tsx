'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Trash2,
  Mail,
  MailOpen,
  Check,
  X,
  Radio,
} from 'lucide-react';

interface MessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

const MANAGE_MESSAGES_SYNC_CHANNEL = 'portfolio-sync-contact';

export default function ManageMessagesPage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [livePulse, setLivePulse] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const broadcastMessagesUpdate = useCallback(
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
          MANAGE_MESSAGES_SYNC_CHANNEL,
          JSON.stringify(eventDetail)
        );
      } catch {
        // Abaikan jika localStorage diblokir
      }

      window.dispatchEvent(
        new CustomEvent(MANAGE_MESSAGES_SYNC_CHANNEL, {
          detail: eventDetail,
        })
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 1800);
    },
    []
  );

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contact', { cache: 'no-store' });
      const json = await response.json();

      if (json.success && Array.isArray(json.messages)) {
        setMessages(json.messages);
      } else if (json.success && Array.isArray(json.data)) {
        setMessages(json.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.warn('Gagal memuat pesan masuk:', err);
      showToast('Gagal memuat pesan masuk', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(
        MANAGE_MESSAGES_SYNC_CHANNEL
      );
      syncChannelRef.current.onmessage = () => {
        if (isMounted) {
          fetchMessages();
        }
      };
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === MANAGE_MESSAGES_SYNC_CHANNEL && isMounted) {
        fetchMessages();
      }
    };

    window.addEventListener('storage', handleStorageSync);
    fetchMessages();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageSync);
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, [fetchMessages]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    try {
      const response = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const json = await response.json();

      if (response.ok && json.success) {
        broadcastMessagesUpdate('delete', { id });
        router.refresh();
        showToast('Pesan berhasil dihapus secara real-time!');
        await fetchMessages();
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

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : 'bg-rose-500 text-white'
          }`}
        >
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-3xl font-extrabold text-white">Pesan Masuk</h1>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border transition-colors ${
              livePulse
                ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            <Radio size={11} className="text-emerald-400" />
            <span>LIVE SYNC</span>
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">
          Daftar pesan atau pertanyaan dari pengunjung melalui formulir kontak
          via Neon secara dinamis dan real-time.
        </p>
      </div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="text-sm text-slate-400 font-mono">
            Memuat pesan masuk dari Neon API...
          </span>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-2xl space-y-2">
          <Mail className="mx-auto text-slate-600" size={40} />
          <p className="text-slate-400">Belum ada pesan masuk.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  {item.is_read ? (
                    <MailOpen size={15} className="text-slate-400" />
                  ) : (
                    <Mail size={15} className="text-cyan-400" />
                  )}
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                    {item.email}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-colors self-end md:self-center cursor-pointer"
              >
                <Trash2 size={16} />
                <span>Hapus</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}