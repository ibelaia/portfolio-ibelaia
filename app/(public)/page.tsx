'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  FolderGit2,
  Award,
  MapPin,
  Briefcase,
  Code2,
  Terminal,
} from 'lucide-react';

type LangCode = 'en' | 'id';

interface HomeData {
  title: string;
  subtitle: string;
  subtitle_id: string;
  highlight_text: string;
  highlight_text_id: string;
  description: string;
  description_id: string;
  primary_btn_text: string;
  primary_btn_text_id: string;
  primary_btn_link: string;
  secondary_btn_text: string;
  secondary_btn_text_id: string;
  secondary_btn_link: string;
  profile_photo_url: string;
  projects_completed: number;
  happy_clients: number;
  years_experience: number;
  availability_status: string;
  location: string;
  site_tagline: string;
}

const DEFAULT_PROFILE_PHOTO =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const HIDDEN_LEGACY_SUBTITLES = new Set([
  'membangun produk digital modern dengan arsitektur bersih',
  'building modern digital products with clean architecture',
  'building the future of digital products',
]);

function sanitizeSubtitle(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (HIDDEN_LEGACY_SUBTITLES.has(trimmed.toLowerCase())) return '';
  return trimmed;
}

const INITIAL_HOME_DATA: HomeData = {
  title: 'Ibe Laia',
  subtitle: '',
  subtitle_id: '',
  highlight_text: 'Full-Stack Developer',
  highlight_text_id: 'Software Developer',
  description:
    'I build modern, responsive, and scalable web applications with clean code, reliable databases, and thoughtful user experiences.',
  description_id:
    'Saya membangun aplikasi web modern, responsif, dan skalabel dengan kode yang bersih, basis data yang andal, serta pengalaman pengguna yang optimal.',
  primary_btn_text: 'Explore My Work',
  primary_btn_text_id: 'Jelajahi Karya Saya',
  primary_btn_link: '/projects',
  secondary_btn_text: 'Contact Me',
  secondary_btn_text_id: 'Hubungi Saya',
  secondary_btn_link: '/contact',
  profile_photo_url: DEFAULT_PROFILE_PHOTO,
  projects_completed: 4,
  happy_clients: 6,
  years_experience: 8,
  availability_status: 'Available for Hire',
  location: 'Surabaya, Indonesia',
  site_tagline: '',
};

const UI_COPY: Record<
  LangCode,
  {
    achievementsSuffix: string;
    projectsLabel: string;
    achievementsLabel: string;
    cleanCodeTitle: string;
    cleanCodeSub: string;
    scalableTitle: string;
    scalableSub: string;
    availableForHire: string;
  }
> = {
  en: {
    achievementsSuffix: '& Achievements',
    projectsLabel: 'Projects',
    achievementsLabel: 'Achievements',
    cleanCodeTitle: 'Clean Code',
    cleanCodeSub: 'Architecture',
    scalableTitle: 'Scalable',
    scalableSub: 'Performance',
    availableForHire: 'Available for Hire',
  },
  id: {
    achievementsSuffix: '& Prestasi',
    projectsLabel: 'Proyek',
    achievementsLabel: 'Prestasi',
    cleanCodeTitle: 'Kode Bersih',
    cleanCodeSub: 'Arsitektur',
    scalableTitle: 'Skalabel',
    scalableSub: 'Performa',
    availableForHire: 'Tersedia untuk Direkrut',
  },
};

function toSafeNumber(value: any, fallback: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

function detectActiveLanguage(): LangCode {
  if (typeof window === 'undefined') return 'en';

  try {
    const htmlLang = document.documentElement.lang?.toLowerCase().trim() || '';
    if (htmlLang === 'id' || htmlLang.startsWith('id-')) return 'id';

    const navLinks = Array.from(
      document.querySelectorAll('header a, nav a, header button, nav button')
    );
    for (const el of navLinks) {
      const txt = (el.textContent || '').trim();
      if (
        txt === 'Beranda' ||
        txt === 'Tentang' ||
        txt === 'Layanan' ||
        txt === 'Proyek' ||
        txt === 'Prestasi' ||
        txt === 'Sertifikat'
      ) {
        return 'id';
      }
      if (
        txt === 'Home' ||
        txt === 'About' ||
        txt === 'Services' ||
        txt === 'Projects' ||
        txt === 'Achievements' ||
        txt === 'Certificates'
      ) {
        return 'en';
      }
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) || '';
      if (/lang|locale|bahasa|i18n/i.test(key)) {
        const val = (localStorage.getItem(key) || '').toLowerCase().trim();
        if (val === 'id' || val === '"id"' || val.startsWith('id-')) return 'id';
        if (val === 'en' || val === '"en"' || val.startsWith('en-')) return 'en';
      }
    }
  } catch {
    // Abaikan error akses DOM/storage
  }

  return 'en';
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>(INITIAL_HOME_DATA);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [lang, setLang] = useState<LangCode>('en');

  const applyHomePayload = useCallback(
    (
      homeRow: Record<string, any> = {},
      generalRow: Record<string, any> = {},
      liveCounts?: { projects?: number; achievements?: number }
    ) => {
      let localPhoto: string | null = null;
      let localHome: Record<string, any> = {};
      let localBilingual: Record<string, any> = {};
      let cachedProjectsCount: number | null = null;

      try {
        localPhoto = localStorage.getItem('portfolio_profile_photo_url');
        const cachedHomeRaw = localStorage.getItem('portfolio_home_settings');
        if (cachedHomeRaw) {
          localHome = JSON.parse(cachedHomeRaw) || {};
          const cleanedHome = {
            ...localHome,
            subtitle: sanitizeSubtitle(localHome.subtitle),
            subtitle_id: sanitizeSubtitle(localHome.subtitle_id),
          };
          if (
            cleanedHome.subtitle !== (localHome.subtitle ?? '') ||
            cleanedHome.subtitle_id !== (localHome.subtitle_id ?? '')
          ) {
            localStorage.setItem(
              'portfolio_home_settings',
              JSON.stringify(cleanedHome)
            );
            localHome = cleanedHome;
          }
        }
        const cachedBilingualRaw = localStorage.getItem(
          'portfolio_home_bilingual'
        );
        if (cachedBilingualRaw) {
          localBilingual = JSON.parse(cachedBilingualRaw) || {};
        }
        const cachedProj = localStorage.getItem('portfolio_projects_count');
        if (cachedProj !== null && !Number.isNaN(Number(cachedProj))) {
          cachedProjectsCount = Number(cachedProj);
        }
      } catch {
        // Abaikan error akses localStorage
      }

      const nextPhoto =
        localPhoto ||
        localHome.profile_photo_url ||
        localHome.avatar_url ||
        homeRow.profile_photo_url ||
        homeRow.avatar_url ||
        generalRow.avatar_url ||
        generalRow.profile_photo_url ||
        DEFAULT_PROFILE_PHOTO;

      setPhotoFailed(false);
      setData((prev) => {
        const resolvedProjects =
          typeof liveCounts?.projects === 'number'
            ? liveCounts.projects
            : cachedProjectsCount !== null
              ? cachedProjectsCount
              : toSafeNumber(
                  localHome.projects_completed ??
                    homeRow.projects_completed ??
                    generalRow.projects_completed,
                  prev.projects_completed
                );

        const resolvedAchievements =
          typeof liveCounts?.achievements === 'number'
            ? liveCounts.achievements
            : toSafeNumber(
                localHome.happy_clients ??
                  homeRow.happy_clients ??
                  generalRow.happy_clients,
                prev.happy_clients
              );

        return {
          title:
            localHome.title ||
            homeRow.title ||
            homeRow.hero_title ||
            generalRow.full_name ||
            generalRow.site_name ||
            prev.title,
          subtitle:
            typeof localHome.subtitle === 'string'
              ? sanitizeSubtitle(localHome.subtitle)
              : typeof localBilingual?.en?.subtitle === 'string'
                ? sanitizeSubtitle(localBilingual.en.subtitle)
                : sanitizeSubtitle(homeRow.subtitle),
          subtitle_id:
            typeof localHome.subtitle_id === 'string'
              ? sanitizeSubtitle(localHome.subtitle_id)
              : typeof localBilingual?.id?.subtitle === 'string'
                ? sanitizeSubtitle(localBilingual.id.subtitle)
                : sanitizeSubtitle(homeRow.subtitle_id),
          highlight_text:
            localHome.highlight_text ||
            localBilingual?.en?.highlight_text ||
            homeRow.highlight_text ||
            homeRow.hero_highlight ||
            prev.highlight_text,
          highlight_text_id:
            localHome.highlight_text_id ||
            localBilingual?.id?.highlight_text ||
            homeRow.highlight_text_id ||
            prev.highlight_text_id,
          description:
            localHome.description ||
            localBilingual?.en?.description ||
            homeRow.description ||
            homeRow.hero_description ||
            prev.description,
          description_id:
            localHome.description_id ||
            localBilingual?.id?.description ||
            homeRow.description_id ||
            prev.description_id,
          primary_btn_text:
            localHome.primary_btn_text ||
            localBilingual?.en?.primary_btn_text ||
            homeRow.primary_btn_text ||
            prev.primary_btn_text,
          primary_btn_text_id:
            localHome.primary_btn_text_id ||
            localBilingual?.id?.primary_btn_text ||
            homeRow.primary_btn_text_id ||
            prev.primary_btn_text_id,
          primary_btn_link:
            localHome.primary_btn_link ||
            homeRow.primary_btn_link ||
            prev.primary_btn_link,
          secondary_btn_text:
            localHome.secondary_btn_text ||
            localBilingual?.en?.secondary_btn_text ||
            homeRow.secondary_btn_text ||
            prev.secondary_btn_text,
          secondary_btn_text_id:
            localHome.secondary_btn_text_id ||
            localBilingual?.id?.secondary_btn_text ||
            homeRow.secondary_btn_text_id ||
            prev.secondary_btn_text_id,
          secondary_btn_link:
            localHome.secondary_btn_link ||
            homeRow.secondary_btn_link ||
            prev.secondary_btn_link,
          profile_photo_url: nextPhoto,
          projects_completed: resolvedProjects,
          happy_clients: resolvedAchievements,
          years_experience: toSafeNumber(
            localHome.years_experience ??
              homeRow.years_experience ??
              generalRow.years_experience,
            prev.years_experience
          ),
          availability_status:
            generalRow.availability_status ||
            homeRow.availability_status ||
            prev.availability_status,
          location: generalRow.location || homeRow.location || prev.location,
          site_tagline: sanitizeSubtitle(homeRow.site_tagline),
        };
      });
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const syncLanguageState = (candidateLang?: any) => {
      if (!isMounted) return;
      if (candidateLang === 'id' || candidateLang === 'en') {
        setLang(candidateLang);
      } else {
        setLang(detectActiveLanguage());
      }
    };

    syncLanguageState();

    let domObserver: MutationObserver | null = null;
    if (typeof window !== 'undefined' && 'MutationObserver' in window) {
      domObserver = new MutationObserver(() => {
        syncLanguageState();
      });
      domObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      domObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['lang'],
      });
    }

    async function fetchNeonHomeData() {
      applyHomePayload();

      let liveProjectsCount: number | undefined;
      let liveAchievementsCount: number | undefined;
      let homeRow: Record<string, any> = {};
      let generalRow: Record<string, any> = {};

      try {
        const [portfolioRes, projectsRes] = await Promise.allSettled([
          fetch(`/api/portfolio?t=${Date.now()}`, { cache: 'no-store' }),
          fetch(`/api/projects?t=${Date.now()}`, { cache: 'no-store' }),
        ]);

        if (portfolioRes.status === 'fulfilled' && portfolioRes.value.ok) {
          const ct = portfolioRes.value.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const json = await portfolioRes.value.json();
            if (json.success) {
              homeRow = json.home || json.data || {};
              generalRow = json.general || {};
              if (Array.isArray(json.projects)) {
                liveProjectsCount = json.projects.length;
              }
              if (Array.isArray(json.achievements)) {
                liveAchievementsCount = json.achievements.length;
              }
            }
          }
        }

        if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
          const ct = projectsRes.value.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const projJson = await projectsRes.value.json();
            if (Array.isArray(projJson?.data)) {
              liveProjectsCount = projJson.data.length;
            }
          }
        }

        if (!isMounted) return;
        applyHomePayload(homeRow, generalRow, {
          projects: liveProjectsCount,
          achievements: liveAchievementsCount,
        });
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat home data dari Neon API:', err);
        }
      }
    }

    fetchNeonHomeData();

    let adminChannel: BroadcastChannel | null = null;
    let homeChannel: BroadcastChannel | null = null;
    let dashboardChannel: BroadcastChannel | null = null;
    let projectsChannel: BroadcastChannel | null = null;
    let langChannel: BroadcastChannel | null = null;

    const handleRealtimeUpdate = (event?: MessageEvent) => {
      if (!isMounted) return;
      const payload = event?.data || {};
      const incomingData =
        payload?.data && typeof payload.data === 'object' ? payload.data : payload;
      const explicitCount =
        typeof payload?.count === 'number'
          ? payload.count
          : typeof incomingData?.count === 'number'
            ? incomingData.count
            : undefined;

      if (payload?.lang === 'id' || payload?.lang === 'en') {
        syncLanguageState(payload.lang);
      } else if (incomingData?.lang === 'id' || incomingData?.lang === 'en') {
        syncLanguageState(incomingData.lang);
      }

      if (payload?.section === 'dashboard' || payload?.section === 'projects') {
        if (typeof explicitCount === 'number') {
          applyHomePayload({}, {}, { projects: explicitCount });
        } else {
          fetchNeonHomeData();
        }
        return;
      }

      if (incomingData && typeof incomingData === 'object') {
        applyHomePayload(
          incomingData,
          {},
          typeof explicitCount === 'number'
            ? { projects: explicitCount }
            : undefined
        );
      } else {
        fetchNeonHomeData();
      }
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      adminChannel = new BroadcastChannel('portfolio-admin-sync');
      adminChannel.onmessage = handleRealtimeUpdate;

      homeChannel = new BroadcastChannel('portfolio-sync-home');
      homeChannel.onmessage = handleRealtimeUpdate;

      dashboardChannel = new BroadcastChannel('portfolio-sync-dashboard');
      dashboardChannel.onmessage = handleRealtimeUpdate;

      projectsChannel = new BroadcastChannel('portfolio-sync-projects');
      projectsChannel.onmessage = handleRealtimeUpdate;

      langChannel = new BroadcastChannel('portfolio-lang-sync');
      langChannel.onmessage = (event) => {
        const nextLang = event?.data?.lang || event?.data;
        if (nextLang === 'id' || nextLang === 'en') {
          syncLanguageState(nextLang);
        } else {
          syncLanguageState();
        }
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (!isMounted) return;
      syncLanguageState();
      if (
        !event.key ||
        event.key.startsWith('portfolio') ||
        event.key.includes('photo') ||
        event.key.includes('avatar')
      ) {
        fetchNeonHomeData();
      }
    };

    const handleCustomHomeSync = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent;
      const incomingData = customEvent.detail?.data || {};
      const explicitCount =
        typeof customEvent.detail?.count === 'number'
          ? customEvent.detail.count
          : undefined;
      if (
        customEvent.detail?.lang === 'id' ||
        customEvent.detail?.lang === 'en'
      ) {
        syncLanguageState(customEvent.detail.lang);
      }
      applyHomePayload(
        incomingData,
        {},
        typeof explicitCount === 'number'
          ? { projects: explicitCount }
          : undefined
      );
    };

    const handleCustomLangSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      const nextLang = customEvent.detail?.lang || customEvent.detail;
      if (nextLang === 'id' || nextLang === 'en') {
        syncLanguageState(nextLang);
      } else {
        syncLanguageState();
      }
    };

    const handleWindowClick = () => {
      setTimeout(() => syncLanguageState(), 0);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('click', handleWindowClick);
    window.addEventListener('portfolio-sync-home', handleCustomHomeSync);
    window.addEventListener('portfolio-sync-dashboard', handleCustomHomeSync);
    window.addEventListener('portfolio-sync-projects', handleCustomHomeSync);
    window.addEventListener('portfolio-lang-sync', handleCustomLangSync);
    window.addEventListener('language-change', handleCustomLangSync);

    return () => {
      isMounted = false;
      if (domObserver) domObserver.disconnect();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('portfolio-sync-home', handleCustomHomeSync);
      window.removeEventListener(
        'portfolio-sync-dashboard',
        handleCustomHomeSync
      );
      window.removeEventListener(
        'portfolio-sync-projects',
        handleCustomHomeSync
      );
      window.removeEventListener('portfolio-lang-sync', handleCustomLangSync);
      window.removeEventListener('language-change', handleCustomLangSync);
      if (adminChannel) adminChannel.close();
      if (homeChannel) homeChannel.close();
      if (dashboardChannel) dashboardChannel.close();
      if (projectsChannel) projectsChannel.close();
      if (langChannel) langChannel.close();
    };
  }, [applyHomePayload]);

  const activePhotoSrc = photoFailed
    ? DEFAULT_PROFILE_PHOTO
    : data.profile_photo_url || DEFAULT_PROFILE_PHOTO;

  const isId = lang === 'id';
  const ui = UI_COPY[lang];
  const displayBadge = sanitizeSubtitle(
    isId
      ? data.subtitle_id || data.subtitle || data.site_tagline
      : data.subtitle || data.site_tagline
  );
  const displayHighlight = isId
    ? data.highlight_text_id || data.highlight_text
    : data.highlight_text;
  const displayDescription = isId
    ? data.description_id || data.description
    : data.description;
  const displayPrimaryBtn = isId
    ? data.primary_btn_text_id || data.primary_btn_text
    : data.primary_btn_text;
  const displaySecondaryBtn = isId
    ? data.secondary_btn_text_id || data.secondary_btn_text
    : data.secondary_btn_text;
  const displayAvailability =
    isId && data.availability_status === 'Available for Hire'
      ? ui.availableForHire
      : data.availability_status;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Container Card Utama Pembungkus Hero Section */}
      <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden space-y-8 transition-colors duration-250">
        {/* Efek Cahaya Ambient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* 1. Foto Profil */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center relative">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent/30 to-purple-500/30 blur-xl -z-10" />

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-accent/30 bg-[var(--bg-primary)] shadow-2xl">
                <img
                  src={activePhotoSrc}
                  alt={data.title}
                  className="w-full h-full object-cover"
                  onError={() => setPhotoFailed(true)}
                />
              </div>

              <div className="absolute -top-1 -right-2 sm:-top-2 sm:-right-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md shadow-xl flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                <Code2 size={12} className="text-purple-400" />
                <div>
                  <p className="font-bold leading-tight">{ui.cleanCodeTitle}</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-500">
                    {ui.cleanCodeSub}
                  </p>
                </div>
              </div>

              <div className="absolute -bottom-1 -left-2 sm:-bottom-2 sm:-left-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md shadow-xl flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                <Terminal size={12} className="text-accent" />
                <div>
                  <p className="font-bold leading-tight">{ui.scalableTitle}</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-500">
                    {ui.scalableSub}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Bagian Teks & Konten */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            {displayBadge && (
              <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mx-auto lg:mx-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{displayBadge}</span>
              </div>
            )}

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {data.title}
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-accent font-mono tracking-wide">
                {displayHighlight} {ui.achievementsSuffix}
              </p>
            </div>

            <p className="text-xs sm:text-sm lg:text-base text-[var(--text-muted)] max-w-xl leading-relaxed mx-auto lg:mx-0">
              {displayDescription}
            </p>

            {/* Statistik */}
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs font-mono shadow-inner">
                <FolderGit2 size={18} className="text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm sm:text-base block">
                    {data.projects_completed}+
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {ui.projectsLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs font-mono shadow-inner">
                <Award size={18} className="text-purple-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm sm:text-base block">
                    {data.happy_clients}+
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {ui.achievementsLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href={data.primary_btn_link || '/projects'}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>{displayPrimaryBtn}</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href={data.secondary_btn_link || '/contact'}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--card-border)] font-semibold text-xs flex items-center justify-center transition-all cursor-pointer"
              >
                {displaySecondaryBtn} ↗
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--card-border)]">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[var(--text-muted)]" />{' '}
                {data.location}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={12} className="text-[var(--text-muted)]" />{' '}
                {displayAvailability}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}