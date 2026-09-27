'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trash2, Mail, MailOpen, Check, X } from 'lucide-react';

interface MessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

export default function ManageMessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Gagal memuat pesan masuk', 'error');
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pesan ini?')) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Gagal menghapus pesan', 'error');
    } else {
      showToast('Pesan berhasil dihapus!');
      fetchMessages();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
          {toast.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-white">Pesan Masuk</h1>
        <p className="text-slate-400 text-sm mt-1">Daftar pesan atau pertanyaan dari pengunjung melalui formulir kontak.</p>
      </div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="text-sm text-slate-400 font-mono">Memuat pesan masuk...</span>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-2xl space-y-2">
          <Mail className="mx-auto text-slate-600" size={40} />
          <p className="text-slate-400">Belum ada pesan masuk.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((item) => (
            <div key={item.id} className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-white">{item.name}</h3>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">{item.email}</span>
                  <span className="text-xs text-slate-500 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-white/5">{item.message}</p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-colors self-end md:self-center"
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