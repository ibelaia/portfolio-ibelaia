'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Edit3, Check, X, FolderGit2 } from 'lucide-react';

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url?: string;
  live_url?: string;
  github_url?: string;
  is_featured?: boolean;
}

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      showToast('Gagal memuat data proyek', 'error');
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleOpenModal = (project?: ProjectItem) => {
    if (project) {
      setEditingId(project.id);
      setTitle(project.title);
      setCategory(project.category);
      setDescription(project.description);
      setImageUrl(project.image_url || '');
      setLiveUrl(project.live_url || '');
      setGithubUrl(project.github_url || '');
      setIsFeatured(project.is_featured || false);
    } else {
      setEditingId(null);
      setTitle('');
      setCategory('');
      setDescription('');
      setImageUrl('');
      setLiveUrl('');
      setGithubUrl('');
      setIsFeatured(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category) {
      showToast('Judul dan kategori wajib diisi!', 'error');
      return;
    }

    const payload = {
      title,
      category,
      description,
      image_url: imageUrl,
      live_url: liveUrl,
      github_url: githubUrl,
      is_featured: isFeatured,
    };

    if (editingId) {
      const { error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editingId);

      if (error) {
        showToast('Gagal memperbarui proyek', 'error');
      } else {
        showToast('Proyek berhasil diperbarui!');
        setIsModalOpen(false);
        fetchProjects();
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert([payload]);

      if (error) {
        showToast('Gagal menambah proyek baru', 'error');
      } else {
        showToast('Proyek berhasil ditambahkan!');
        setIsModalOpen(false);
        fetchProjects();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus proyek ini?')) return;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Gagal menghapus proyek', 'error');
    } else {
      showToast('Proyek berhasil dihapus!');
      fetchProjects();
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
          <h1 className="text-3xl font-extrabold text-white">Kelola Proyek Utama</h1>
          <p className="text-slate-400 text-sm mt-1">Tambah, ubah, atau hapus daftar portofolio proyek utama Anda.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
        >
          <Plus size={18} />
          <span>Tambah Proyek</span>
        </button>
      </div>

      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
          <span className="text-sm text-slate-400 font-mono">Memuat daftar proyek...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-white/5 rounded-2xl space-y-2">
          <FolderGit2 className="mx-auto text-slate-600" size={40} />
          <p className="text-slate-400">Belum ada proyek yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((item) => (
            <div key={item.id} className="bg-slate-900/60 border border-white/10 p-5 rounded-2xl flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{item.category}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{item.description}</p>
                {item.is_featured && (
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Featured</span>
                )}
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
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Judul Proyek</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: JawaTrip Mobile App"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="Contoh: Full-Stack / Mobile App"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi Proyek</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 resize-none"
                  placeholder="Penjelasan ringkas tentang proyek..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">URL Gambar / Thumbnail</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-white/10 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="featured" className="text-xs font-medium text-slate-300">Tandai sebagai Proyek Unggulan (Featured)</label>
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