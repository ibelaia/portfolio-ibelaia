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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  GraduationCap,
  Code2,
  Sparkles,
  Terminal,
  Upload,
  Languages,
} from 'lucide-react';

const ABOUT_SYNC_CHANNEL = 'portfolio-sync-about';
const ABOUT_STORAGE_KEY = 'portfolio_about_settings';
const ABOUT_BILINGUAL_STORAGE_KEY = 'portfolio_about_bilingual';

function formatMultilineValue(raw: any, fallback: string): string {
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((item) => String(item ?? '').trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned.join('\n') : fallback;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return formatMultilineValue(parsed, fallback);
      }
    } catch {
      // Gunakan string mentah jika bukan JSON array
    }
    return trimmed;
  }
  return fallback;
}

function formatCommaTagsValue(raw: any, fallback: string): string {
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((item) => String(item ?? '').trim())
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned.join(', ') : fallback;
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return formatCommaTagsValue(parsed, fallback);
      }
    } catch {
      // Gunakan string mentah jika bukan JSON array
    }
    return trimmed;
  }
  return fallback;
}

export default function AboutManagementPage() {
  const router = useRouter();
  const cvInputRef = useRef<HTMLInputElement>(null);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editLang, setEditLang] = useState<'en' | 'id'>('en');
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [form, setForm] = useState({
    badge_text: 'ABOUT ME',
    badge_text_id: 'TENTANG SAYA',
    name: 'Ibe Laia',
    bio_paragraph_1:
      "I'm an Informatics student focusing on modern full-stack web development and clean system architectures. I bridge clean UI engineering with robust backend workflows, turning practical concepts into scalable, accessible digital solutions.",
    bio_paragraph_1_id:
      'Saya adalah mahasiswa Informatika yang berfokus pada pengembangan web full-stack modern dan arsitektur sistem yang bersih. Saya menghubungkan rekayasa UI yang rapi dengan alur kerja backend yang andal untuk menghadirkan solusi digital yang skalabel.',
    bio_paragraph_2:
      'Passionate about modular engineering, system reliability, and continuous exploration in modern web ecosystems.',
    bio_paragraph_2_id:
      'Antusias terhadap rekayasa modular, keandalan sistem, serta eksplorasi berkelanjutan di ekosistem web modern.',
    cv_url: '/resume.pdf',
    contact_btn_link: '/contact',
    edu_major: 'Informatics',
    edu_major_id: 'Informatika',
    edu_institution: 'UPN "Veteran" Jawa Timur',
    edu_period: '2024 — Present',
    focus_items: 'Web Architecture\nScalable APIs\nUI/UX Systems',
    focus_items_id: 'Arsitektur Web\nAPI Skalabel\nSistem UI/UX',
    focus_tag: 'Production Ready',
    focus_tag_id: 'Siap Produksi',
    interests_tags: 'Full-Stack, System Design, Web3',
    interests_tags_id: 'Full-Stack, Desain Sistem, Web3',
    interests_tag: 'Exploration Track',
    interests_tag_id: 'Jalur Eksplorasi',
    what_i_do_items:
      'Full-Stack Systems\nInterface Design\nWorkflow Automation',
    what_i_do_items_id:
      'Sistem Full-Stack\nDesain Antarmuka\nOtomatisasi Alur Kerja',
    what_i_do_tag: 'Problem Solver',
    what_i_do_tag_id: 'Pemecah Masalah',
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const broadcastAboutUpdate = (updatedPayload: Record<string, any>) => {
    const eventDetail = {
      section: 'about',
      updatedAt: Date.now(),
      data: updatedPayload,
      payload: updatedPayload,
    };

    try {
      if (syncChannelRef.current) {
        syncChannelRef.current.postMessage(eventDetail);
      }
    } catch {
      // Abaikan jika BroadcastChannel tidak tersedia
    }

    try {
      localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(updatedPayload));
      localStorage.setItem(
        ABOUT_BILINGUAL_STORAGE_KEY,
        JSON.stringify({
          en: {
            badge_text: updatedPayload.badge_text,
            bio_paragraph_1: updatedPayload.bio_paragraph_1,
            bio_paragraph_2: updatedPayload.bio_paragraph_2,
            edu_major: updatedPayload.edu_major,
            focus_items: updatedPayload.focus_items,
            focus_tag: updatedPayload.focus_tag,
            interests_tags: updatedPayload.interests_tags,
            interests_tag: updatedPayload.interests_tag,
            what_i_do_items: updatedPayload.what_i_do_items,
            what_i_do_tag: updatedPayload.what_i_do_tag,
          },
          id: {
            badge_text: updatedPayload.badge_text_id,
            bio_paragraph_1: updatedPayload.bio_paragraph_1_id,
            bio_paragraph_2: updatedPayload.bio_paragraph_2_id,
            edu_major: updatedPayload.edu_major_id,
            focus_items: updatedPayload.focus_items_id,
            focus_tag: updatedPayload.focus_tag_id,
            interests_tags: updatedPayload.interests_tags_id,
            interests_tag: updatedPayload.interests_tag_id,
            what_i_do_items: updatedPayload.what_i_do_items_id,
            what_i_do_tag: updatedPayload.what_i_do_tag_id,
          },
        })
      );
      localStorage.setItem(ABOUT_SYNC_CHANNEL, JSON.stringify(eventDetail));
    } catch {
      // Abaikan jika localStorage diblokir
    }

    window.dispatchEvent(
      new CustomEvent(ABOUT_SYNC_CHANNEL, { detail: eventDetail })
    );
  };

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      syncChannelRef.current = new BroadcastChannel(ABOUT_SYNC_CHANNEL);
    }

    async function loadAboutData() {
      try {
        const cachedRaw = localStorage.getItem(ABOUT_STORAGE_KEY);
        if (cachedRaw && isMounted) {
          const cached = JSON.parse(cachedRaw);
          if (cached && typeof cached === 'object') {
            setForm((prev) => ({
              ...prev,
              badge_text: cached.badge_text ?? prev.badge_text,
              badge_text_id: cached.badge_text_id ?? prev.badge_text_id,
              name: cached.name ?? prev.name,
              bio_paragraph_1: cached.bio_paragraph_1 ?? prev.bio_paragraph_1,
              bio_paragraph_1_id:
                cached.bio_paragraph_1_id ?? prev.bio_paragraph_1_id,
              bio_paragraph_2: cached.bio_paragraph_2 ?? prev.bio_paragraph_2,
              bio_paragraph_2_id:
                cached.bio_paragraph_2_id ?? prev.bio_paragraph_2_id,
              cv_url: cached.cv_url ?? prev.cv_url,
              contact_btn_link: cached.contact_btn_link ?? prev.contact_btn_link,
              edu_major: cached.edu_major ?? prev.edu_major,
              edu_major_id: cached.edu_major_id ?? prev.edu_major_id,
              edu_institution: cached.edu_institution ?? prev.edu_institution,
              edu_period: cached.edu_period ?? prev.edu_period,
              focus_items: formatMultilineValue(
                cached.focus_items,
                prev.focus_items
              ),
              focus_items_id: formatMultilineValue(
                cached.focus_items_id,
                prev.focus_items_id
              ),
              focus_tag: cached.focus_tag ?? prev.focus_tag,
              focus_tag_id: cached.focus_tag_id ?? prev.focus_tag_id,
              interests_tags: formatCommaTagsValue(
                cached.interests_tags,
                prev.interests_tags
              ),
              interests_tags_id: formatCommaTagsValue(
                cached.interests_tags_id,
                prev.interests_tags_id
              ),
              interests_tag: cached.interests_tag ?? prev.interests_tag,
              interests_tag_id: cached.interests_tag_id ?? prev.interests_tag_id,
              what_i_do_items: formatMultilineValue(
                cached.what_i_do_items,
                prev.what_i_do_items
              ),
              what_i_do_items_id: formatMultilineValue(
                cached.what_i_do_items_id,
                prev.what_i_do_items_id
              ),
              what_i_do_tag: cached.what_i_do_tag ?? prev.what_i_do_tag,
              what_i_do_tag_id: cached.what_i_do_tag_id ?? prev.what_i_do_tag_id,
            }));
          }
        }
      } catch {
        // Abaikan jika cache lokal tidak tersedia
      }

      try {
        const response = await fetch(`/api/about?t=${Date.now()}`, {
          cache: 'no-store',
        });
        const json = await response.json();

        if (!isMounted) return;

        if (response.ok && json.success && json.data) {
          const data = json.data;
          setForm((prev) => ({
            ...prev,
            badge_text: data.badge_text ?? prev.badge_text,
            badge_text_id: data.badge_text_id ?? prev.badge_text_id,
            name: data.name ?? prev.name,
            bio_paragraph_1: data.bio_paragraph_1 ?? prev.bio_paragraph_1,
            bio_paragraph_1_id:
              data.bio_paragraph_1_id ?? prev.bio_paragraph_1_id,
            bio_paragraph_2: data.bio_paragraph_2 ?? prev.bio_paragraph_2,
            bio_paragraph_2_id:
              data.bio_paragraph_2_id ?? prev.bio_paragraph_2_id,
            cv_url: data.cv_url ?? prev.cv_url,
            contact_btn_link: data.contact_btn_link ?? prev.contact_btn_link,
            edu_major: data.edu_major ?? prev.edu_major,
            edu_major_id: data.edu_major_id ?? prev.edu_major_id,
            edu_institution: data.edu_institution ?? prev.edu_institution,
            edu_period: data.edu_period ?? prev.edu_period,
            focus_items: formatMultilineValue(
              data.focus_items,
              prev.focus_items
            ),
            focus_items_id: formatMultilineValue(
              data.focus_items_id,
              prev.focus_items_id
            ),
            focus_tag: data.focus_tag ?? prev.focus_tag,
            focus_tag_id: data.focus_tag_id ?? prev.focus_tag_id,
            interests_tags: formatCommaTagsValue(
              data.interests_tags,
              prev.interests_tags
            ),
            interests_tags_id: formatCommaTagsValue(
              data.interests_tags_id,
              prev.interests_tags_id
            ),
            interests_tag: data.interests_tag ?? prev.interests_tag,
            interests_tag_id: data.interests_tag_id ?? prev.interests_tag_id,
            what_i_do_items: formatMultilineValue(
              data.what_i_do_items,
              prev.what_i_do_items
            ),
            what_i_do_items_id: formatMultilineValue(
              data.what_i_do_items_id,
              prev.what_i_do_items_id
            ),
            what_i_do_tag: data.what_i_do_tag ?? prev.what_i_do_tag,
            what_i_do_tag_id: data.what_i_do_tag_id ?? prev.what_i_do_tag_id,
          }));
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat data About dari API:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAboutData();

    return () => {
      isMounted = false;
      if (syncChannelRef.current) {
        syncChannelRef.current.close();
        syncChannelRef.current = null;
      }
    };
  }, []);

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran file CV maksimal 8MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, cv_url: reader.result as string }));
        showToast('Berkas CV berhasil diunggah!');
      }
    };
    reader.onerror = () => {
      showToast('Gagal membaca berkas CV', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      badge_text: form.badge_text.trim() || 'ABOUT ME',
      badge_text_id: form.badge_text_id.trim() || 'TENTANG SAYA',
      name: form.name.trim() || 'Ibe Laia',
      bio_paragraph_1: form.bio_paragraph_1,
      bio_paragraph_1_id: form.bio_paragraph_1_id,
      bio_paragraph_2: form.bio_paragraph_2,
      bio_paragraph_2_id: form.bio_paragraph_2_id,
      cv_url: form.cv_url.trim() || '/resume.pdf',
      contact_btn_link: form.contact_btn_link.trim() || '/contact',
      edu_major: form.edu_major.trim() || 'Informatics',
      edu_major_id: form.edu_major_id.trim() || 'Informatika',
      edu_institution: form.edu_institution.trim() || 'UPN "Veteran" Jawa Timur',
      edu_period: form.edu_period.trim() || '2024 — Present',
      focus_items: form.focus_items
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      focus_items_id: form.focus_items_id
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      focus_tag: form.focus_tag.trim() || 'Production Ready',
      focus_tag_id: form.focus_tag_id.trim() || 'Siap Produksi',
      interests_tags: form.interests_tags
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      interests_tags_id: form.interests_tags_id
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      interests_tag: form.interests_tag.trim() || 'Exploration Track',
      interests_tag_id: form.interests_tag_id.trim() || 'Jalur Eksplorasi',
      what_i_do_items: form.what_i_do_items
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      what_i_do_items_id: form.what_i_do_items_id
        .split('\n')
        .map((i) => i.trim())
        .filter(Boolean),
      what_i_do_tag: form.what_i_do_tag.trim() || 'Problem Solver',
      what_i_do_tag_id: form.what_i_do_tag_id.trim() || 'Pemecah Masalah',
    };

    try {
      const response = await fetch('/api/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (response.ok && json.success) {
        const mergedData = { ...payload, ...(json.data ?? {}) };
        broadcastAboutUpdate(mergedData);
        router.refresh();
        showToast(
          'Data halaman About berhasil disimpan ke Neon dan disinkronkan!'
        );
      } else {
        showToast(
          `Gagal menyimpan ke Neon: ${json.error || 'Terjadi kesalahan'}`,
          'error'
        );
      }
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Terjadi kesalahan'}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    router.replace('/login');
  };

  const isId = editLang === 'id';

  return (
    <div className="min-h-screen bg-[#07090e] text-[#94a3b8] flex flex-col lg:flex-row antialiased">
      <input
        type="file"
        ref={cvInputRef}
        onChange={handleCvUpload}
        accept=".pdf,.doc,.docx"
        className="hidden"
      />

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl backdrop-blur-md border shadow-2xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold bg-[#581c87]/60 text-white border border-[#9333ea]/30 transition-all"
                >
                  <User size={15} className="text-[#c084fc]" />
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
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Mail size={15} />
                  <span>Contact</span>
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
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Palette size={15} />
                  <span>Appearance</span>
                </Link>
                <Link
                  href="/dashboard/seo"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <SearchCheck size={15} />
                  <span>SEO Settings</span>
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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
            href="/about"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Preview About Page</span>
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
          <div className="flex items-center gap-3 px-3 py-2 pt-2 border-t border-white/5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
              IB
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">
                Ibe Laia
              </p>
              <p className="text-[10px] text-slate-500">Owner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* FORM MANAGEMENT */}
      <main className="flex-1 px-4 sm:px-8 py-6 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              About Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kelola bio profil, riwayat pendidikan, fokus teknologi, minat,
              serta tautan CV secara dinamis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="inline-flex items-center rounded-xl bg-[#0b0e17] border border-white/10 p-1 text-[10px] font-mono">
              <Languages size={12} className="text-cyan-400 mx-1.5" />
              <button
                type="button"
                onClick={() => setEditLang('en')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  !isId
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setEditLang('id')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isId
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ID
              </button>
            </div>

            <Link
              href="/about"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-[#0b0e17] border border-white/10 hover:border-white/20 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
            >
              <Eye size={13} className="text-cyan-400" />
              <span>Lihat Halaman Publik</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-cyan-400" />
            <span>Memuat data About dari Neon API...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Kolom Kiri: Profil & Bio */}
              <div className="lg:col-span-6 bg-[#0b0e17] border border-white/5 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                  <User size={16} className="text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                    1. Kartu Utama Profil & Bio ({isId ? 'ID' : 'EN'})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Badge Teks ({isId ? 'Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={isId ? form.badge_text_id : form.badge_text}
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, badge_text_id: e.target.value }
                            : { ...prev, badge_text: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Nama Tampilan
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs font-bold focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Paragraf Bio 1 ({isId ? 'Indonesia' : 'English'})
                  </label>
                  <textarea
                    rows={4}
                    value={
                      isId ? form.bio_paragraph_1_id : form.bio_paragraph_1
                    }
                    onChange={(e) =>
                      setForm((prev) =>
                        isId
                          ? { ...prev, bio_paragraph_1_id: e.target.value }
                          : { ...prev, bio_paragraph_1: e.target.value }
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs leading-relaxed focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Paragraf Bio 2 ({isId ? 'Indonesia' : 'English'})
                  </label>
                  <textarea
                    rows={3}
                    value={
                      isId ? form.bio_paragraph_2_id : form.bio_paragraph_2
                    }
                    onChange={(e) =>
                      setForm((prev) =>
                        isId
                          ? { ...prev, bio_paragraph_2_id: e.target.value }
                          : { ...prev, bio_paragraph_2: e.target.value }
                      )
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-[#07090e] border border-white/10 text-white text-xs leading-relaxed focus:border-cyan-400"
                  />
                </div>

                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Berkas CV (Tautan atau Unggah)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.cv_url}
                        onChange={(e) =>
                          setForm({ ...form, cv_url: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-slate-300 text-xs font-mono focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Upload size={13} />
                        <span>Unggah CV</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Tautan Tombol Sekunder
                    </label>
                    <input
                      type="text"
                      value={form.contact_btn_link}
                      onChange={(e) =>
                        setForm({ ...form, contact_btn_link: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#07090e] border border-white/10 text-slate-300 text-xs font-mono focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: 4 Kartu */}
              <div className="lg:col-span-6 space-y-5">
                {/* Education */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <GraduationCap size={15} className="text-cyan-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      2. Education
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">
                        Jurusan ({isId ? 'Indonesia' : 'English'})
                      </label>
                      <input
                        type="text"
                        value={isId ? form.edu_major_id : form.edu_major}
                        onChange={(e) =>
                          setForm((prev) =>
                            isId
                              ? { ...prev, edu_major_id: e.target.value }
                              : { ...prev, edu_major: e.target.value }
                          )
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs focus:border-cyan-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 mb-1">
                        Periode
                      </label>
                      <input
                        type="text"
                        value={form.edu_period}
                        onChange={(e) =>
                          setForm({ ...form, edu_period: e.target.value })
                        }
                        className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-cyan-400 font-mono text-xs focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Institusi
                    </label>
                    <input
                      type="text"
                      value={form.edu_institution}
                      onChange={(e) =>
                        setForm({ ...form, edu_institution: e.target.value })
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-300 text-xs focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Current Focus */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Code2 size={15} className="text-purple-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      3. Current Focus
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Poin Fokus ({isId ? 'Indonesia' : 'English'} - Satu baris
                      per poin)
                    </label>
                    <textarea
                      rows={3}
                      value={isId ? form.focus_items_id : form.focus_items}
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, focus_items_id: e.target.value }
                            : { ...prev, focus_items: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs font-mono leading-relaxed focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Label Tag Bawah ({isId ? 'Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={isId ? form.focus_tag_id : form.focus_tag}
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, focus_tag_id: e.target.value }
                            : { ...prev, focus_tag: e.target.value }
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-400 font-mono text-xs focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* Interests */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Sparkles size={15} className="text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      4. Interests
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Badge Minat ({isId ? 'Indonesia' : 'English'} - Pisahkan
                      dengan koma)
                    </label>
                    <input
                      type="text"
                      value={isId ? form.interests_tags_id : form.interests_tags}
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, interests_tags_id: e.target.value }
                            : { ...prev, interests_tags: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs font-mono focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Label Tag Bawah ({isId ? 'Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={isId ? form.interests_tag_id : form.interests_tag}
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, interests_tag_id: e.target.value }
                            : { ...prev, interests_tag: e.target.value }
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-400 font-mono text-xs focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* What I Do */}
                <div className="bg-[#0b0e17] border border-white/5 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <Terminal size={15} className="text-amber-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                      5. What I Do
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Layanan Utama ({isId ? 'Indonesia' : 'English'} - Satu
                      baris per poin)
                    </label>
                    <textarea
                      rows={3}
                      value={
                        isId ? form.what_i_do_items_id : form.what_i_do_items
                      }
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, what_i_do_items_id: e.target.value }
                            : { ...prev, what_i_do_items: e.target.value }
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/10 text-white text-xs font-mono leading-relaxed focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 mb-1">
                      Label Tag Bawah ({isId ? 'Indonesia' : 'English'})
                    </label>
                    <input
                      type="text"
                      value={isId ? form.what_i_do_tag_id : form.what_i_do_tag}
                      onChange={(e) =>
                        setForm((prev) =>
                          isId
                            ? { ...prev, what_i_do_tag_id: e.target.value }
                            : { ...prev, what_i_do_tag: e.target.value }
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg bg-[#07090e] border border-white/10 text-slate-400 font-mono text-xs focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 sticky bottom-4 z-20 p-4 bg-[#07090e]/80 backdrop-blur-md rounded-2xl border border-white/5">
              <Link
                href="/about"
                target="_blank"
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
              >
                Pratinjau Perubahan
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>Simpan Perubahan About</span>
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}