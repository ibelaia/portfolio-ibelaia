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
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Eye,
  Menu,
  X,
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HomeManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    subtitle: 'Building the future of digital products',
    title: 'Ibe Laia , S.Kom',
    highlight_text: 'Full-Stack Developer',
    description: 'I build modern, secure, and scalable web applications with clean code and exceptional user experience.',
    hero_cover_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    primary_btn_text: 'Explore My Work',
    primary_btn_link: '/projects',
    secondary_btn_text: 'Contact Me',
    secondary_btn_link: '/contact',
    projects_completed: 45,
    happy_clients: 30,
    years_experience: 8
  });

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('home_settings').select('*').eq('id', 'default').single();
      if (data) {
        setFormData((prev) => ({
          ...prev,
          subtitle: data.subtitle || prev.subtitle,
          title: data.title || prev.title,
          highlight_text: data.highlight_text || prev.highlight_text,
          description: data.description || prev.description,
          hero_cover_url: data.hero_cover_url || prev.hero_cover_url,
          profile_photo_url: data.profile_photo_url || prev.profile_photo_url,
          projects_completed: data.projects_completed ?? prev.projects_completed,
          happy_clients: data.happy_clients ?? prev.happy_clients,
          years_experience: data.years_experience ?? prev.years_experience,
        }));
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profile_photo_url' | 'hero_cover_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('Ukuran file maksimal 4MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('home_settings').upsert({
      id: 'default',
      subtitle: formData.subtitle,
      title: formData.title,
      highlight_text: formData.highlight_text,
      description: formData.description,
      hero_cover_url: formData.hero_cover_url,
      profile_photo_url: formData.profile_photo_url,
      projects_completed: Number(formData.projects_completed),
      happy_clients: Number(formData.happy_clients),
      years_experience: Number(formData.years_experience),
      updated_at: new Date().toISOString()
    });

    setSaving(false);
    if (!error) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      alert(`Gagal menyimpan: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      
      {/* Hidden File Inputs */}
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

      {/* Toast Notifikasi */}
      {savedSuccess && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>Home settings saved successfully!</span>
        </div>
      )}

      {/* ===================== SIDEBAR ===================== */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-[#0b0e17] border-r border-white/5 p-5 shrink-0 min-h-screen sticky top-0">
        <div>
          <div className="flex items-center gap-1.5 px-3 py-2 mb-6">
            <span className="text-xl font-black text-white">IbeLaia</span>
            <span className="text-xl font-black text-[#a855f7]">.Dev</span>
          </div>

          <div className="space-y-6 text-xs">
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Overview</p>
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Website Content</p>
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
                  { name: 'Projects', icon: FolderGit2, link: '/dashboard' },
                  { name: 'Achievements', icon: Award, link: '/dashboard' },
                  { name: 'Certificates', icon: FileBadge, link: '/dashboard' },
                  { name: 'Contact', icon: Mail, link: '/dashboard' },
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
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Assets</p>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <FolderArchive size={15} />
                <span>Media Library</span>
              </button>
            </div>

            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Settings</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                  <Palette size={15} />
                  <span>Appearance</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                  <Settings size={15} />
                  <span>General Settings</span>
                </button>
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
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-3 px-3 py-2 pt-2 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
              IB
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Ibe Laia</p>
              <p className="text-[10px] text-slate-500">Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===================== MOBILE HEADER ===================== */}
      <header className="lg:hidden flex items-center justify-between px-5 py-4 bg-[#0b0e17] border-b border-white/5 sticky top-0 z-30">
        <div className="flex items-center gap-1">
          <span className="text-lg font-black text-white">IbeLaia</span>
          <span className="text-lg font-black text-[#a855f7]">.Dev</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-5xl w-full mx-auto space-y-6">
        
        {/* Header Title & View Live Page */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Home Management</h1>
            <p className="text-xs text-slate-400 mt-1">Manage and customize the content displayed on your portfolio home page.</p>
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
            
            {/* Card 1: Hero Section Editor */}
            <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 sm:p-7 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-sm font-bold text-white">Hero Section</h2>
                  <p className="text-[11px] text-slate-500">Customize your hero section content and appearance.</p>
                </div>
                <button 
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      subtitle: 'Building the future of digital products',
                      title: 'Ibe Laia , S.Kom',
                      highlight_text: 'Full-Stack Developer'
                    }));
                  }}
                  className="text-[11px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Hero Visuals */}
              <div className="space-y-5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Hero Visuals</span>
                
                {/* Hero Cover Image */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-mono">Hero Cover Image</label>
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

                {/* Profile Photo */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1.5 font-mono">Profile Photo</label>
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
                      <p className="text-[10px] text-slate-500">Mendukung format JPG, PNG, atau WEBP (Maksimal 4MB).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtitle, Title, Highlight */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Title (Name)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">Highlight Text (Role)</label>
                    <input
                      type="text"
                      value={formData.highlight_text}
                      onChange={(e) => setFormData({ ...formData, highlight_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                  />
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">CTA Buttons</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Primary Button Text</label>
                    <input
                      type="text"
                      value={formData.primary_btn_text}
                      onChange={(e) => setFormData({ ...formData, primary_btn_text: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Primary Button Link</label>
                    <input
                      type="text"
                      value={formData.primary_btn_link}
                      onChange={(e) => setFormData({ ...formData, primary_btn_link: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Secondary Button Text</label>
                    <input
                      type="text"
                      value={formData.secondary_btn_text}
                      onChange={(e) => setFormData({ ...formData, secondary_btn_text: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Secondary Button Link</label>
                    <input
                      type="text"
                      value={formData.secondary_btn_link}
                      onChange={(e) => setFormData({ ...formData, secondary_btn_link: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">Key Statistics</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Projects Completed</label>
                    <input
                      type="number"
                      value={formData.projects_completed}
                      onChange={(e) => setFormData({ ...formData, projects_completed: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Achievements</label>
                    <input
                      type="number"
                      value={formData.happy_clients}
                      onChange={(e) => setFormData({ ...formData, happy_clients: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">Years Experience</label>
                    <input
                      type="number"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-4 z-20 p-4 bg-[#07090e]/80 backdrop-blur-md rounded-2xl border border-white/5">
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Preview Changes
              </Link>
              <button
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