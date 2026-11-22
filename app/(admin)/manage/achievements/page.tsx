'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Radio,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  credential_url?: string;
}

const MANAGE_ACHIEVEMENTS_SYNC_CHANNEL = 'portfolio-sync-achievements';

export default function ManageAchievementsPage() {
  const router = useRouter();
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [livePulse, setLivePulse] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const broadcastAchievementsUpdate = useCallback(
    (action: string, detailData?: any) => {
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
          MANAGE_ACHIEVEMENTS_SYNC_CHANNEL,
          JSON.stringify(eventDetail)
        );
      } catch {
        // Abaikan jika localStorage diblokir
      }

      window.dispatchEvent(
        new CustomEvent(MANAGE_ACHIEVEMENTS_SYNC_CHANNEL, {
          detail: eventDetail,
        })
      );
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 1800);
    },
    []
  );

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/achievements', { cache: 'no-store' });
      const json = await response.json();

      if (json.success && Array.isArray(json.data)) {
        setAchievements(json.data);
      } else {
        showToast('Gagal memuat data pencapaian', 'error');
      }
    } catch (err) {
      console.warn('Gagal mengambil data achievements:', err);
      showToast('Gagal memuat data pencapaian', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(
        MANAGE_ACHIEVEMENTS_SYNC_CHANNEL
      );
      syncChannelRef.current.onmessage = () => {
        if (isMounted) {
          fetchAchievements();
        }
      };
    }

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === MANAGE_ACHIEVEMENTS_SYNC_CHANNEL && isMounted) {
        fetchAchievements();
      }
    };

    window.addEventListener('storage', handleStorageSync);
    fetchAchievements();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageSync);
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, [fetchAchievements]);

  const handleOpenModal = (achievement?: Achievement) => {
    if (achievement) {
      setEditingId(achievement.id);
      setTitle(achievement.title);
      setIssuer(achievement.issuer);
      setDate(achievement.date);
      setDescription(achievement.description);
      setCredentialUrl(achievement.credential_url || '');
    } else {
      setEditingId(null);
      setTitle('');
      setIssuer('');
      setDate('');
      setDescription('');
      setCredentialUrl('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !issuer) {
      showToast('Judul dan penerbit wajib diisi!', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      id: editingId,
      title,
      issuer,
      date,
      description,
      credential_url: credentialUrl,
    };

    try {
      const response = await fetch('/api/achievements', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        broadcastAchievementsUpdate(
          editingId ? 'update' : 'create',
          json.data ?? payload
        );
        router.refresh();
        showToast(
          editingId
            ? 'Pencapaian berhasil diperbarui ke Neon & disinkronkan secara real-time!'
            : 'Pencapaian berhasil ditambahkan ke Neon & disinkronkan secara real-time!'
        );
        setIsModalOpen(false);
        await fetchAchievements();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pencapaian ini?')) return;

    try {
      const response = await fetch(`/api/achievements?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      const json = await response.json();

      if (response.ok && json.success) {
        broadcastAchievementsUpdate('delete', { id });
        router.refresh();
        showToast('Pencapaian berhasil dihapus secara real-time!');
        await fetchAchievements();
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

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-3xl font-extrabold text-white">
              Kelola Pencapaian
            </h1>
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
            Tambah, ubah, atau hapus daftar sertifikat dan prestasi Anda via
            Neon secara dinamis dan real-time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>Tambah Pencapaian</span>
        </button>
      </div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="text-sm text-slate-400 font-mono">
            Memuat data pencapaian dari Neon API...
          </span>
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-2xl">
          <p className="text-slate-400">
            Belum ada pencapaian yang ditambahkan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.date || 'Terbaru'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-300">
                  Penerbit:{' '}
                  <span className="text-slate-400">{item.issuer}</span>
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleOpenModal(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Pencapaian' : 'Tambah Pencapaian Baru'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Judul Pencapaian / Sertifikat
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: AWS Certified Developer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Penerbit / Organisasi
                </label>
                <input
                  type="text"
                  value={issuer}
                  onChange={(e) => setIssuer(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: Amazon Web Services"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tanggal / Tahun
                </label>
                <input
                  type="text"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: Des 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Deskripsi singkat mengenai sertifikat/pencapaian..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL Kredensial (Opsional)
                </label>
                <input
                  type="url"
                  value={credentialUrl}
                  onChange={(e) => setCredentialUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}