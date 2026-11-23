'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Code2,
  FileDown,
  User,
  ArrowUpRight,
  Terminal,
  Cpu,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const dynamic = 'force-dynamic';

const ABOUT_SYNC_CHANNEL = 'portfolio-sync-about';
const ADMIN_SYNC_CHANNEL = 'portfolio-admin-sync';
const ABOUT_STORAGE_KEY = 'portfolio_about_settings';
const ABOUT_BILINGUAL_STORAGE_KEY = 'portfolio_about_bilingual';

type LangCode = 'en' | 'id';

interface AboutLocalizedFields {
  badge_text: string;
  bio_paragraph_1: string;
  bio_paragraph_2: string;
  edu_major: string;
  focus_items: string[];
  focus_tag: string;
  interests_tags: string[];
  interests_tag: string;
  what_i_do_items: string[];
  what_i_do_tag: string;
}

interface AboutPublicData extends AboutLocalizedFields {
  name: string;
  cv_url: string;
  contact_btn_link: string;
  edu_institution: string;
  edu_period: string;
  badge_text_id: string;
  bio_paragraph_1_id: string;
  bio_paragraph_2_id: string;
  edu_major_id: string;
  focus_items_id: string[];
  focus_tag_id: string;
  interests_tags_id: string[];
  interests_tag_id: string;
  what_i_do_items_id: string[];
  what_i_do_tag_id: string;
}

const fallbackData: AboutPublicData = {
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
  cv_url: '/assets/resume.pdf',
  contact_btn_link: '/contact',
  edu_major: 'Informatics',
  edu_major_id: 'Informatika',
  edu_institution: 'UPN "Veteran" Jawa Timur',
  edu_period: '2026 - Present',
  focus_items: ['Web Architecture', 'Scalable APIs', 'UI/UX Systems'],
  focus_items_id: ['Arsitektur Web', 'API Skalabel', 'Sistem UI/UX'],
  focus_tag: 'Production Ready',
  focus_tag_id: 'Siap Produksi',
  interests_tags: ['Full-Stack', 'System Design', 'Web3'],
  interests_tags_id: ['Full-Stack', 'Desain Sistem', 'Web3'],
  interests_tag: 'Exploration Track',
  interests_tag_id: 'Jalur Eksplorasi',
  what_i_do_items: [
    'Full-Stack Systems',
    'Interface Design',
    'Workflow Automation',
  ],
  what_i_do_items_id: [
    'Sistem Full-Stack',
    'Desain Antarmuka',
    'Otomatisasi Alur Kerja',
  ],
  what_i_do_tag: 'Problem Solver',
  what_i_do_tag_id: 'Pemecah Masalah',
};

function parseStringListSafely(raw: any, fallback: string[]): string[] {
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (entry && typeof entry === 'object') {
          return String(entry.label || entry.name || entry.title || '').trim();
        }
        return '';
      })
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : fallback;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parseStringListSafely(parsed, fallback);
      }
    } catch {
      // Fallback ke pemisahan baris baru atau koma
    }

    const separator = trimmed.includes('\n') ? '\n' : ',';
    const items = trimmed
      .split(separator)
      .map((s) => s.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
    return items.length > 0 ? items : fallback;
  }

  return fallback;
}

async function parseJsonSafely(response: Response): Promise<any | null> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function resolveLangFromContext(appCtx: any): LangCode {
  const rawLang = String(
    appCtx?.lang || appCtx?.language || appCtx?.locale || ''
  )
    .toLowerCase()
    .trim();
  if (rawLang === 'id' || rawLang.startsWith('id-')) return 'id';
  if (rawLang === 'en' || rawLang.startsWith('en-')) return 'en';

  if (typeof window !== 'undefined') {
    const htmlLang =
      document.documentElement.lang?.toLowerCase().trim() || '';
    if (htmlLang === 'id' || htmlLang.startsWith('id-')) return 'id';

    const navLinks = Array.from(
      document.querySelectorAll('header a, nav a, header button, nav button')
    );
    for (const el of navLinks) {
      const txt = (el.textContent || '').trim();
      if (txt === 'Beranda' || txt === 'Tentang' || txt === 'Layanan') {
        return 'id';
      }
      if (txt === 'Home' || txt === 'About' || txt === 'Services') {
        return 'en';
      }
    }
  }

  return 'en';
}

export default function AboutPage() {
  const appContext = useApp() as any;
  const { t } = appContext;
  const [data, setData] = useState<AboutPublicData>(fallbackData);
  const [lang, setLang] = useState<LangCode>(() =>
    resolveLangFromContext(appContext)
  );

  useEffect(() => {
    setLang(resolveLangFromContext(appContext));
  }, [appContext]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('MutationObserver' in window)) {
      return;
    }
    const observer = new MutationObserver(() => {
      setLang(resolveLangFromContext(appContext));
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang'],
    });
    return () => observer.disconnect();
  }, [appContext]);

  const mapAboutRecord = useCallback(
    (res: Record<string, any>, prev: AboutPublicData): AboutPublicData => {
      let bilingualId: Record<string, any> = {};
      try {
        const biRaw = localStorage.getItem(ABOUT_BILINGUAL_STORAGE_KEY);
        if (biRaw) {
          const parsedBi = JSON.parse(biRaw);
          if (parsedBi?.id && typeof parsedBi.id === 'object') {
            bilingualId = parsedBi.id;
          }
        }
      } catch {
        // Abaikan error parse bilingual cache
      }

      const nextBadgeId =
        typeof (res.badge_text_id ?? bilingualId.badge_text) === 'string' &&
        (res.badge_text_id ?? bilingualId.badge_text).trim()
          ? (res.badge_text_id ?? bilingualId.badge_text)
          : prev.badge_text_id;

      const nextBio1Id =
        typeof (res.bio_paragraph_1_id ?? bilingualId.bio_paragraph_1) ===
        'string'
          ? (res.bio_paragraph_1_id ?? bilingualId.bio_paragraph_1)
          : prev.bio_paragraph_1_id;

      const nextBio2Id =
        typeof (res.bio_paragraph_2_id ?? bilingualId.bio_paragraph_2) ===
        'string'
          ? (res.bio_paragraph_2_id ?? bilingualId.bio_paragraph_2)
          : prev.bio_paragraph_2_id;

      const nextEduMajorId =
        typeof (res.edu_major_id ?? bilingualId.edu_major) === 'string' &&
        (res.edu_major_id ?? bilingualId.edu_major).trim()
          ? (res.edu_major_id ?? bilingualId.edu_major)
          : prev.edu_major_id;

      const rawFocusId = res.focus_items_id ?? bilingualId.focus_items;
      const nextFocusItemsId =
        rawFocusId !== undefined
          ? parseStringListSafely(rawFocusId, prev.focus_items_id)
          : prev.focus_items_id;

      const nextFocusTagId =
        typeof (res.focus_tag_id ?? bilingualId.focus_tag) === 'string' &&
        (res.focus_tag_id ?? bilingualId.focus_tag).trim()
          ? (res.focus_tag_id ?? bilingualId.focus_tag)
          : prev.focus_tag_id;

      const rawInterestsId = res.interests_tags_id ?? bilingualId.interests_tags;
      const nextInterestsTagsId =
        rawInterestsId !== undefined
          ? parseStringListSafely(rawInterestsId, prev.interests_tags_id)
          : prev.interests_tags_id;

      const nextInterestsTagId =
        typeof (res.interests_tag_id ?? bilingualId.interests_tag) ===
          'string' &&
        (res.interests_tag_id ?? bilingualId.interests_tag).trim()
          ? (res.interests_tag_id ?? bilingualId.interests_tag)
          : prev.interests_tag_id;

      const rawWhatId = res.what_i_do_items_id ?? bilingualId.what_i_do_items;
      const nextWhatItemsId =
        rawWhatId !== undefined
          ? parseStringListSafely(rawWhatId, prev.what_i_do_items_id)
          : prev.what_i_do_items_id;

      const nextWhatTagId =
        typeof (res.what_i_do_tag_id ?? bilingualId.what_i_do_tag) ===
          'string' &&
        (res.what_i_do_tag_id ?? bilingualId.what_i_do_tag).trim()
          ? (res.what_i_do_tag_id ?? bilingualId.what_i_do_tag)
          : prev.what_i_do_tag_id;

      return {
        badge_text:
          typeof res.badge_text === 'string' && res.badge_text.trim()
            ? res.badge_text
            : prev.badge_text,
        badge_text_id: nextBadgeId,
        name:
          typeof (res.name || res.title) === 'string' &&
          (res.name || res.title).trim()
            ? res.name || res.title
            : prev.name,
        bio_paragraph_1:
          typeof (res.bio_paragraph_1 ?? res.bio) === 'string'
            ? (res.bio_paragraph_1 ?? res.bio)
            : prev.bio_paragraph_1,
        bio_paragraph_1_id: nextBio1Id,
        bio_paragraph_2:
          typeof res.bio_paragraph_2 === 'string'
            ? res.bio_paragraph_2
            : prev.bio_paragraph_2,
        bio_paragraph_2_id: nextBio2Id,
        cv_url:
          typeof (res.cv_url || res.resume_url) === 'string' &&
          (res.cv_url || res.resume_url).trim()
            ? res.cv_url || res.resume_url
            : prev.cv_url,
        contact_btn_link:
          typeof res.contact_btn_link === 'string' &&
          res.contact_btn_link.trim()
            ? res.contact_btn_link
            : prev.contact_btn_link,
        edu_major:
          typeof (res.edu_major || res.education_major) === 'string' &&
          (res.edu_major || res.education_major).trim()
            ? res.edu_major || res.education_major
            : prev.edu_major,
        edu_major_id: nextEduMajorId,
        edu_institution:
          typeof (res.edu_institution || res.education_institution) ===
            'string' &&
          (res.edu_institution || res.education_institution).trim()
            ? res.edu_institution || res.education_institution
            : prev.edu_institution,
        edu_period:
          typeof (res.edu_period || res.education_period) === 'string' &&
          (res.edu_period || res.education_period).trim()
            ? res.edu_period || res.education_period
            : prev.edu_period,
        focus_items:
          res.focus_items !== undefined
            ? parseStringListSafely(res.focus_items, prev.focus_items)
            : prev.focus_items,
        focus_items_id: nextFocusItemsId,
        focus_tag:
          typeof res.focus_tag === 'string' && res.focus_tag.trim()
            ? res.focus_tag
            : prev.focus_tag,
        focus_tag_id: nextFocusTagId,
        interests_tags:
          res.interests_tags !== undefined
            ? parseStringListSafely(res.interests_tags, prev.interests_tags)
            : prev.interests_tags,
        interests_tags_id: nextInterestsTagsId,
        interests_tag:
          typeof res.interests_tag === 'string' && res.interests_tag.trim()
            ? res.interests_tag
            : prev.interests_tag,
        interests_tag_id: nextInterestsTagId,
        what_i_do_items:
          res.what_i_do_items !== undefined
            ? parseStringListSafely(res.what_i_do_items, prev.what_i_do_items)
            : prev.what_i_do_items,
        what_i_do_items_id: nextWhatItemsId,
        what_i_do_tag:
          typeof res.what_i_do_tag === 'string' && res.what_i_do_tag.trim()
            ? res.what_i_do_tag
            : prev.what_i_do_tag,
        what_i_do_tag_id: nextWhatTagId,
      };
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    try {
      const cachedRaw = localStorage.getItem(ABOUT_STORAGE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && typeof cached === 'object' && isMounted) {
          setData((prev) => mapAboutRecord(cached, prev));
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }

    async function fetchNeonAbout() {
      try {
        const response = await fetch('/api/about', { cache: 'no-store' });
        if (!response.ok || !isMounted) return;

        const json = await parseJsonSafely(response);
        if (!isMounted || !json) return;

        const record = json.data || json.about || (json.success ? json : null);
        if (record && typeof record === 'object') {
          setData((prev) => mapAboutRecord(record, prev));
          try {
            localStorage.setItem(ABOUT_STORAGE_KEY, JSON.stringify(record));
          } catch {
            // Abaikan error penyimpanan lokal
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading public about data from Neon API:', err);
        }
      }
    }

    fetchNeonAbout();

    const handleRealtimeMessage = (event: MessageEvent) => {
      if (!isMounted) return;
      const payload = event?.data || {};
      if (payload.section && payload.section !== 'about') return;
      const incoming =
        payload.data && typeof payload.data === 'object'
          ? payload.data
          : payload;
      if (incoming && typeof incoming === 'object') {
        setData((prev) => mapAboutRecord(incoming, prev));
      } else {
        fetchNeonAbout();
      }
    };

    const handleCustomSync = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent;
      const incoming = customEvent.detail?.data;
      if (incoming && typeof incoming === 'object') {
        setData((prev) => mapAboutRecord(incoming, prev));
      } else {
        fetchNeonAbout();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (!isMounted) return;
      if (
        !event.key ||
        event.key === ABOUT_STORAGE_KEY ||
        event.key === ABOUT_BILINGUAL_STORAGE_KEY
      ) {
        fetchNeonAbout();
      }
      setLang(resolveLangFromContext(appContext));
    };

    let aboutChannel: BroadcastChannel | null = null;
    let adminChannel: BroadcastChannel | null = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      aboutChannel = new BroadcastChannel(ABOUT_SYNC_CHANNEL);
      aboutChannel.onmessage = handleRealtimeMessage;

      adminChannel = new BroadcastChannel(ADMIN_SYNC_CHANNEL);
      adminChannel.onmessage = handleRealtimeMessage;
    }

    window.addEventListener(ABOUT_SYNC_CHANNEL, handleCustomSync);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(ABOUT_SYNC_CHANNEL, handleCustomSync);
      window.removeEventListener('storage', handleStorage);
      if (aboutChannel) aboutChannel.close();
      if (adminChannel) adminChannel.close();
    };
  }, [mapAboutRecord, appContext]);

  const isId = lang === 'id';
  const displayBadge =
    isId && data.badge_text_id.trim() ? data.badge_text_id : data.badge_text;
  const displayBio1 =
    isId && data.bio_paragraph_1_id.trim()
      ? data.bio_paragraph_1_id
      : data.bio_paragraph_1;
  const displayBio2 =
    isId && data.bio_paragraph_2_id.trim()
      ? data.bio_paragraph_2_id
      : data.bio_paragraph_2;
  const displayEduMajor =
    isId && data.edu_major_id.trim() ? data.edu_major_id : data.edu_major;
  const displayFocusItems =
    isId && data.focus_items_id.length > 0
      ? data.focus_items_id
      : data.focus_items;
  const displayFocusTag =
    isId && data.focus_tag_id.trim() ? data.focus_tag_id : data.focus_tag;
  const displayInterestsTags =
    isId && data.interests_tags_id.length > 0
      ? data.interests_tags_id
      : data.interests_tags;
  const displayInterestsTag =
    isId && data.interests_tag_id.trim()
      ? data.interests_tag_id
      : data.interests_tag;
  const displayWhatItems =
    isId && data.what_i_do_items_id.length > 0
      ? data.what_i_do_items_id
      : data.what_i_do_items;
  const displayWhatTag =
    isId && data.what_i_do_tag_id.trim()
      ? data.what_i_do_tag_id
      : data.what_i_do_tag;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Bento Grid Simetris & Proporsional */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        {/* KARTU KIRI (7 Kolom): Profil & Tombol Aksi */}
        <div className="md:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-colors duration-250">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{displayBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight leading-snug mb-3">
              {data.name}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4 whitespace-pre-line">
              {displayBio1}
            </p>

            {displayBio2 && (
              <p className="text-xs sm:text-sm text-[var(--text-muted)] opacity-80 leading-relaxed mb-6 whitespace-pre-line">
                {displayBio2}
              </p>
            )}
          </div>

          {/* Tombol Aksi: Download CV + Contact / About */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--card-border)]">
            <a
              href={data.cv_url}
              target="_blank"
              rel="noreferrer"
              download
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-2 transition-colors active:scale-95"
            >
              <FileDown size={14} />
              <span>{t('Download CV', 'Unduh CV')}</span>
            </a>

            <a
              href={data.contact_btn_link}
              className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <User size={14} />
              <span>{t('About Me', 'Tentang Saya')}</span>
              <ArrowUpRight size={14} className="text-slate-950" />
            </a>
          </div>
        </div>

        {/* KARTU KANAN (5 Kolom): 4 Mini Bento Box */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
          {/* Box 1: Education */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3">
                <GraduationCap size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-1">
                {t('Education', 'Pendidikan')}
              </h2>
              <div className="text-sm font-bold text-[var(--text-main)] leading-tight">
                {displayEduMajor}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">
                {data.edu_institution}
              </div>
            </div>
            <span className="text-[10px] font-mono text-accent mt-3 block">
              {data.edu_period}
            </span>
          </div>

          {/* Box 2: Current Focus */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Terminal size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
                {t('Current Focus', 'Fokus Saat Ini')}
              </h2>
              <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                {displayFocusItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] mt-3 block">
              {displayFocusTag}
            </span>
          </div>

          {/* Box 3: Technical Interests */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Cpu size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
                {t('Interests', 'Minat Teknis')}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {displayInterestsTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-3 block">
              {displayInterestsTag}
            </span>
          </div>

          {/* Box 4: Practical Output */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Code2 size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
                {t('What I Do', 'Bidang Garap')}
              </h2>
              <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                {displayWhatItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <span className="text-[10px] font-mono text-amber-400 mt-3 block">
              {displayWhatTag}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}