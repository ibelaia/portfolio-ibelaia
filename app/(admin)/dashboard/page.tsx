'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Menu,
  X,
  Calendar,
  TrendingUp,
  Trash2,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Project {
  id: string;
  title: string;
  category: string;
  status?: string;
  created_at: string;
  slug: string;
}

interface VisitorLog {
  id: string;
  email: string;
  name: string;
  role: string;
  visited_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // State Auth & Navigasi
  const [authChecking, setAuthChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // State Supabase Data & Counts Otomatis
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [isVisitorLogsOpen, setIsVisitorLogsOpen] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // State Counter Otomatis dari Database
  const [counts, setCounts] = useState({
    projects: 0,
    services: 0,
    achievements: 0,
    certificates: 0,
    visitors: 0
  });

  // State Form Tambah Proyek Cepat
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    slug: '',
    category: 'Web Application',
    status: 'PUBLISHED',
    overview: '',
    tags: 'Next.js, TypeScript',
    github_url: 'https://github.com/ibelaia',
    live_url: '',
    thumbnail: '/placeholder.svg'
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
      } else {
        setAuthChecking(false);
        fetchAllDataCounts();
        fetchProjects();
        fetchVisitorLogs();
      }
    }
    checkAuth();
  }, [router]);

  // Fungsi untuk mengambil jumlah data secara otomatis dari setiap tabel Supabase
  const fetchAllDataCounts = async () => {
    try {
      const [pRes, sRes, aRes, cRes, vRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }),
        supabase.from('achievements').select('*', { count: 'exact', head: true }),
        supabase.from('certificates').select('*', { count: 'exact', head: true }),
        supabase.from('visitor_logs').select('*', { count: 'exact', head: true })
      ]);

      setCounts({
        projects: pRes.count ?? 0,
        services: sRes.count ?? 4, // Fallback default jika tabel services kosong
        achievements: aRes.count ?? 0,
        certificates: cRes.count ?? 0,
        visitors: vRes.count ?? 0
      });
    } catch (err) {
      console.warn('Error fetching counts:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data);
    setLoadingProjects(false);
  };

  const fetchVisitorLogs = async () => {
    setLoadingLogs(true);
    const { data } = await supabase
      .from('visitor_logs')
      .select('*')
      .order('visited_at', { ascending: false });
    if (data) setVisitorLogs(data);
    setLoadingLogs(false);
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Hapus proyek "${title}" secara permanen?`)) return;

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      showToast(`Gagal: ${error.message}`, 'error');
    } else {
      setProjects(prev => prev.filter(p => p.id !== id));
      fetchAllDataCounts(); // Refresh count otomatis
      showToast(`Proyek "${title}" berhasil dihapus.`);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProject(true);
    const payload = {
      title: projectForm.title,
      slug: projectForm.slug.toLowerCase().replace(/\s+/g, '-'),
      category: projectForm.category,
      status: projectForm.status,
      overview: projectForm.overview,
      tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      github_url: projectForm.github_url,
      live_url: projectForm.live_url,
      thumbnail: projectForm.thumbnail || '/placeholder.svg',
      type: 'single'
    };

    const { error } = await supabase.from('projects').insert([payload]);
    if (error) {
      showToast(error.message, 'error');
    } else {
      showToast('Proyek baru berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchProjects();
      fetchAllDataCounts(); // Refresh count otomatis
    }
    setSubmittingProject(false);
  };

  if (authChecking) {
    return (
      <main className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-cyan-400" />
        <span className="text-xs font-mono text-slate-400">Memeriksa izin akses IbeLaia.Dev...</span>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
     
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
          toast.type === 'success'
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
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
            {/* Overview */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Overview</p>
              <Link
                href="/dashboard"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
              >
                <LayoutDashboard size={16} className="text-[#c084fc]" />
                <span>Dashboard</span>
              </Link>
            </div>

            {/* Website Content */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Website Content</p>
              <div className="space-y-1">
                <Link
                  href="/dashboard/home"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home size={15} />
                  <span>Home</span>
                </Link>

                <Link
                  href="/dashboard/about"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={15} />
                  <span>About</span>
                </Link>

                <Link
                  href="/dashboard/services"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Wrench size={15} />
                  <span>Services</span>
                </Link>

                <Link
                  href="/dashboard/projects"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FolderGit2 size={15} />
                  <span>Projects</span>
                </Link>

                <Link
                  href="/dashboard/achievements"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Award size={15} />
                  <span>Achievements</span>
                </Link>

                <Link
                  href="/dashboard/certificates"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <FileBadge size={15} />
                  <span>Certificates</span>
                </Link>

                <Link
                  href="/dashboard/contact"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Mail size={15} />
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            {/* Assets */}
            <div>
              <p className="px-3 text-[10px] font-mono tracking-wider uppercase text-slate-500 mb-2">Assets</p>
              <Link href="/dashboard/media" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                <FolderArchive size={15} />
                <span>Media Library</span>
              </Link>
            </div>

            {/* Settings */}
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

      {/* Drawer Mobile */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[61px] bg-[#0b0e17] z-40 p-6 overflow-y-auto space-y-3">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs bg-[#581c87]/60 text-white"
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/home"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white"
          >
            <Home size={16} />
            <span>Home Management</span>
          </Link>
          <Link
            href="/dashboard/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white"
          >
            <User size={16} />
            <span>About Management</span>
          </Link>
          <Link
            href="/dashboard/services"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white"
          >
            <Wrench size={16} />
            <span>Services Management</span>
          </Link>
          <Link
            href="/dashboard/projects"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white"
          >
            <FolderGit2 size={16} />
            <span>Projects Management</span>
          </Link>
          <Link
            href="/dashboard/achievements"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white"
          >
            <Award size={16} />
            <span>Achievements Management</span>
          </Link>
          <Link
            href="/dashboard/certificates"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs text-slate-400 hover:text-white"
          >
            <FileBadge size={16} />
            <span>Certificates Management</span>
          </Link>
        </div>
      )}

      {/* ===================== MAIN CONTENT AREA ===================== */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">

        {/* Top Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 mb-1">Welcome Back</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Welcome back, Ibe Laia!</span>
              <span>👋</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Here&apos;s what&apos;s happening with your portfolio today.</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0b0e17] border border-white/10 text-xs font-mono text-slate-300 flex items-center gap-2">
              <Calendar size={13} className="text-slate-400" />
              <span>September 2026</span>
            </div>
          </div>
        </div>

        {/* 5 KPI Stat Metric Cards (Terhubung Otomatis ke Supabase) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
         
          <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <FolderGit2 size={16} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Projects</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{counts.projects}</p>
              <p className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1 font-mono">
                <TrendingUp size={11} /> Real-time count
              </p>
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Wrench size={16} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Total Services</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{counts.services}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Real-time count</p>
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <Award size={16} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Achievements</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{counts.achievements}</p>
              <p className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1 font-mono">
                <TrendingUp size={11} /> Real-time count
              </p>
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <FileBadge size={16} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Certificates</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{counts.certificates}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Real-time count</p>
            </div>
          </div>

          <div
            onClick={() => {
              fetchVisitorLogs();
              setIsVisitorLogsOpen(true);
            }}
            className="bg-[#0b0e17] border border-white/5 hover:border-pink-500/30 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1 cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-pink-400">
                <Users size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Visitor Logs</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400">Live</span>
            </div>
            <div>
              <p className="text-2xl font-black text-white">{counts.visitors}</p>
              <p className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1 font-mono">
                <TrendingUp size={11} /> Lihat Log →
              </p>
            </div>
          </div>

        </div>

        {/* Middle Section: Chart Overview & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
         
          {/* Chart Card (Span 8) */}
          <div className="lg:col-span-8 bg-[#0b0e17] border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Website Overview</span>
              <span className="text-[11px] font-mono text-slate-500 bg-white/5 px-2.5 py-1 rounded-lg">Last 30 Days</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Visitors</span>
                <p className="text-lg font-bold text-white">1,248</p>
                <span className="text-[10px] text-cyan-400 font-mono">+18.2%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Page Views</span>
                <p className="text-lg font-bold text-white">3,682</p>
                <span className="text-[10px] text-cyan-400 font-mono">+21.7%</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-500">Avg. Session</span>
                <p className="text-lg font-bold text-white">2m 45s</p>
                <span className="text-[10px] text-cyan-400 font-mono">+8.4%</span>
              </div>
            </div>

            {/* Neon Wave Vector Illustration */}
            <div className="w-full h-36 flex items-end">
              <svg viewBox="0 0 500 120" fill="none" className="w-full h-full">
                <defs>
                  <linearGradient id="waveGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 C80,95 130,40 210,65 C290,90 350,10 420,15 C460,20 480,5 500,2"
                  stroke="url(#waveGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-2">
              <span>15 Jun</span>
              <span>22 Jun</span>
              <span>29 Jun</span>
              <span>6 Jul</span>
              <span>13 Jul</span>
              <span>20 Jul</span>
            </div>
          </div>

          {/* Recent Activity Card (Span 4) */}
          <div className="lg:col-span-4 bg-[#0b0e17] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Recent Activity</span>
                <button
                  onClick={() => setIsVisitorLogsOpen(true)}
                  className="text-[11px] font-mono text-slate-500 hover:text-cyan-400 cursor-pointer"
                >
                  Logs →
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {[
                  { text: 'Published new project "AI Chat Interface"', time: '2 hours ago', icon: FolderGit2, color: 'text-cyan-400' },
                  { text: 'Updated AWS Solutions Architect certificate', time: '1 day ago', icon: Award, color: 'text-purple-400' },
                  { text: 'Draft saved for Weather App case study', time: '2 days ago', icon: FileText, color: 'text-emerald-400' },
                  { text: 'Added new achievement: Hackathon Winner', time: '3 days ago', icon: Award, color: 'text-blue-400' },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg bg-white/5 ${act.color} shrink-0 mt-0.5`}>
                      <act.icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-[11px] leading-snug truncate">{act.text}</p>
                      <span className="text-[10px] font-mono text-slate-500">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section: Recent Projects & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
         
          {/* Recent Projects Table (Span 8) */}
          <div className="lg:col-span-8 bg-[#0b0e17] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Recent Projects</span>
              <Link
                href="/dashboard/projects"
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} /> Kelola Semua Proyek →
              </Link>
            </div>

            {loadingProjects ? (
              <div className="py-12 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-cyan-400" />
                <span>Memuat data dari Supabase...</span>
              </div>
            ) : projects.length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-slate-600">Belum ada proyek di Supabase.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] font-mono uppercase text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="pb-2.5 font-normal">Project</th>
                      <th className="pb-2.5 font-normal">Category</th>
                      <th className="pb-2.5 font-normal">Status</th>
                      <th className="pb-2.5 font-normal">Updated</th>
                      <th className="pb-2.5 font-normal text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 font-semibold text-white">
                          <span className="truncate block max-w-[160px] sm:max-w-none">{p.title}</span>
                        </td>
                        <td className="py-3 text-slate-400">{p.category}</td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            {p.status || 'PUBLISHED'}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-slate-500 text-[11px]">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' }) : 'Recently'}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteProject(p.id, p.title)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                            title="Hapus Proyek"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions (Span 4) */}
          <div className="lg:col-span-4 bg-[#0b0e17] border border-white/5 rounded-2xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-4">Quick Actions</span>
           
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/dashboard/projects"
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-500/[0.03] transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <FolderGit2 size={20} className="text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Add Project</span>
              </Link>

              <Link
                href="/dashboard/home"
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <Home size={20} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Edit Home</span>
              </Link>

              <button
                onClick={() => {
                  fetchVisitorLogs();
                  setIsVisitorLogsOpen(true);
                }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/[0.03] transition-all flex flex-col items-center justify-center text-center group cursor-pointer col-span-2"
              >
                <Users size={20} className="text-pink-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold text-white">Visitor Logs</span>
              </button>
            </div>
          </div>

        </div>

        <footer className="pt-6 pb-2 text-center text-[11px] font-mono text-slate-600">
          © 2026 IbeLaia.Dev — All rights reserved.
        </footer>
      </main>

      {/* ===================== MODAL VISITOR LOGS ===================== */}
      {isVisitorLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b0e17] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-pink-400" />
                <h2 className="text-sm font-bold text-white">Riwayat Email & Pengunjung Masuk</h2>
              </div>
              <button
                onClick={() => setIsVisitorLogsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {loadingLogs ? (
                <div className="py-12 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-pink-400" />
                  <span>Memuat riwayat log...</span>
                </div>
              ) : visitorLogs.length === 0 ? (
                <div className="py-12 text-center text-xs font-mono text-slate-500">Belum ada log pengunjung.</div>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                  {visitorLogs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-[#07090e] border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                          {log.email ? log.email.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate flex items-center gap-2">
                            <span>{log.email}</span>
                            {log.role === 'Owner' && (
                              <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-0.5">
                                <ShieldCheck size={10} /> Owner
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-3 mt-0.5 text-[10px] font-mono text-slate-500">
                            <span>{log.name || 'Guest User'}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(log.visited_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/10">
                <button onClick={() => setIsVisitorLogsOpen(false)} className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold text-xs cursor-pointer">
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL ADD PROJECT ===================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0b0e17] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-sm font-bold text-white">Add Project to Supabase</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"
                  >
                    <option value="Web Application">Web Application</option>
                    <option value="Website">Website</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Overview</label>
                <textarea
                  rows={3}
                  required
                  value={projectForm.overview}
                  onChange={(e) => setProjectForm({ ...projectForm, overview: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/5 text-slate-300">Batal</button>
                <button type="submit" disabled={submittingProject} className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}