'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Edit3, Check, X, Briefcase } from 'lucide-react';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  price?: string;
}

export default function ManageServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('');
  const [price, setPrice] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Gagal memuat data layanan', 'error');
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenModal = (service?: ServiceItem) => {
    if (service) {
      setEditingId(service.id);
      setTitle(service.title);
      setDescription(service.description);
      setIcon(service.icon || '');
      setPrice(service.price || '');
    } else {
      setEditingId(null);
      setTitle('');
      setDescription('');
      setIcon('');
      setPrice('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('Judul layanan wajib diisi!', 'error');
      return;
    }

    const payload = {
      title,
      description,
      icon,
      price,
    };

    if (editingId) {
      const { error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        showToast('Gagal memperbarui layanan', 'error');
      } else {
        showToast('Layanan berhasil diperbarui!');
        setIsModalOpen(false);
        fetchServices();
      }
    } else {
      const { error } = await supabase
        .from('services')
        .insert([payload]);

      if (error) {
        showToast('Gagal menambah layanan baru', 'error');
      } else {
        showToast('Layanan berhasil ditambahkan!');
        setIsModalOpen(false);
        fetchServices();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return;

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Gagal menghapus layanan', 'error');
    } else {
      showToast('Layanan berhasil dihapus!');
      fetchServices();
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Kelola Layanan</h1>
          <p className="text-slate-400 text-sm mt-1">Tambah, ubah, atau hapus daftar layanan atau penawaran jasa Anda.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Layanan</span>
        </button>
      </div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="text-sm text-slate-400 font-mono">Memuat daftar layanan...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-2xl space-y-2">
          <Briefcase className="mx-auto text-slate-600" size={40} />
          <p className="text-slate-400">Belum ada layanan yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((item) => (
            <div key={item.id} className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  {item.price && (
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{item.price}</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors"
                >
                  <Edit3 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-400 transition-colors"
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
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Judul Layanan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: Full-Stack Web Development"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Estimasi Harga / Tarif (Opsional)</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: Mulai dari $100 / Custom"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi Layanan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Penjelasan detail tentang layanan yang Anda tawarkan..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}