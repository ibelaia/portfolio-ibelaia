'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Search,
  Award,
  CheckCircle2,
  Calendar,
  Building2,
  X,
  Maximize2,
  Loader2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const dynamic = 'force-dynamic';

interface CertificateItem {
  id: string;
  badge: string;
  badge_id?: string;
  title: string;
  title_id?: string;
  issuer: string;
  description: string;
  description_id?: string;
  skills: string[];
  skills_id?: string[];
  date_str: string;
  date_str_id?: string;
  image_url: string;
  credential_url: string;
}

const CERTIFICATES_SYNC_CHANNEL = 'portfolio-sync-certificates';

const DEFAULT_CERTIFICATE_IMAGE =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

const BASE_FILTER_KEYS = [
  'Web Development',
  'Python & Automation',
  'Programming & CS',
];

function parseStringArraySafely(raw: any, fallback: string[] = []): string[] {
  if (Array.isArray(raw)) {
    const cleaned = raw
      .map((entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (entry && typeof entry === 'object') {
          return String(entry.name || entry.label || entry.title || '').trim();
        }
        return '';
      })
      .filter(Boolean);
    return cleaned.length > 0 ? cleaned : fallback;
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const pgItems = trimmed
        .slice(1, -1)
        .split(',')
        .map((s) => s.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
      return pgItems.length > 0 ? pgItems : fallback;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parseStringArraySafely(parsed, fallback);
      }
    } catch {
      // Fallback ke pemisahan koma atau baris baru
    }

    const separator = trimmed.includes('\n') ? '\n' : ',';
    const splitItems = trimmed
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);
    return splitItems.length > 0 ? splitItems : fallback;
  }

  return fallback;
}

function isIndonesianLocale(lang: unknown): boolean {
  if (!lang) return false;
  const normalized = String(lang).trim().toLowerCase();
  return (
    normalized === 'id' ||
    normalized === 'ind' ||
    normalized === 'indonesia' ||
    normalized.startsWith('id-') ||
    normalized.startsWith('id_')
  );
}

export default function CertificatesPage() {
  const appContext = useApp() as any;
  const t =
    typeof appContext?.t === 'function'
      ? appContext.t
      : (en: string, id: string) => (isIndonesianLocale(appContext?.lang) ? id : en);

  const isId = useMemo(() => {
    const rawLang =
      appContext?.lang ??
      appContext?.locale ??
      appContext?.language ??
      (typeof t('EN_CHECK', 'ID_CHECK') === 'string' &&
      t('EN_CHECK', 'ID_CHECK') === 'ID_CHECK'
        ? 'id'
        : 'en');
    return isIndonesianLocale(rawLang);
  }, [appContext, t]);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [modalImageFailed, setModalImageFailed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [headerData, setHeaderData] = useState({
    badge_text: 'VERIFIED CREDENTIALS & LICENSES',
    badge_text_id: 'KREDENSIAL & LISENSI TERVERIFIKASI',
    title: 'All Certificates',
    title_id: 'Semua Sertifikat',
    subtitle:
      'A verified index of technical certifications, developer accreditations, and coursework completed from recognized institutions.',
    subtitle_id:
      'Indeks terverifikasi sertifikasi teknis, akreditasi developer, dan pembelajaran dari institusi terkemuka.',
  });
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  const fetchPublicNeonData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch(`/api/certificates?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const rawText = await response.text();
      let json: any = null;
      try {
        json = rawText ? JSON.parse(rawText) : null;
      } catch {
        json = null;
      }

      if (json?.success) {
        if (json.header) {
          setHeaderData((prev) => ({
            badge_text:
              json.header.badge_text || 'VERIFIED CREDENTIALS & LICENSES',
            badge_text_id:
              json.header.badge_text_id ?? prev.badge_text_id,
            title: json.header.title || 'All Certificates',
            title_id: json.header.title_id ?? prev.title_id,
            subtitle:
              json.header.subtitle ||
              'A verified index of technical certifications, developer accreditations, and coursework completed from recognized institutions.',
            subtitle_id: json.header.subtitle_id ?? prev.subtitle_id,
          }));
        }

        if (Array.isArray(json.data)) {
          const mapped: CertificateItem[] = json.data.map(
            (item: any, idx: number) => {
              const rawSkills =
                item.skills !== undefined && item.skills !== null
                  ? item.skills
                  : item.tags;
              const rawSkillsId =
                item.skills_id !== undefined && item.skills_id !== null
                  ? item.skills_id
                  : item.tags_id;

              const parsedSkills = parseStringArraySafely(rawSkills, [
                'Web Development',
                'Engineering',
              ]);
              const parsedSkillsId = parseStringArraySafely(rawSkillsId, []);

              return {
                id: item.id ? String(item.id) : String(idx + 1),
                badge: item.badge || item.category || item.issuer || 'Certificate',
                badge_id: item.badge_id || '',
                title: item.title || `Certificate #${idx + 1}`,
                title_id: item.title_id || '',
                issuer: item.issuer || 'Verified Institution',
                description:
                  item.description ||
                  item.overview ||
                  'Professional certification and technical training.',
                description_id: item.description_id || '',
                skills: parsedSkills,
                skills_id: parsedSkillsId,
                date_str: item.date_str || item.date || '2026',
                date_str_id: item.date_str_id || '',
                image_url:
                  item.image_url ||
                  item.thumbnail ||
                  DEFAULT_CERTIFICATE_IMAGE,
                credential_url: item.credential_url || '#',
              };
            }
          );
          setCertificates(mapped);
        } else {
          setCertificates([]);
        }
      }
    } catch (err) {
      console.warn('Gagal memuat certificates dari Neon API:', err);
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    fetchPublicNeonData(true).finally(() => {
      if (isMounted) setLoading(false);
    });

    const handleSyncEvent = () => {
      if (!isMounted) return;
      fetchPublicNeonData(false);
    };

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel(CERTIFICATES_SYNC_CHANNEL);
      channel.onmessage = handleSyncEvent;
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === CERTIFICATES_SYNC_CHANNEL) {
        handleSyncEvent();
      }
    };

    window.addEventListener(CERTIFICATES_SYNC_CHANNEL, handleSyncEvent);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleSyncEvent);

    return () => {
      isMounted = false;
      if (channel) {
        channel.close();
      }
      window.removeEventListener(CERTIFICATES_SYNC_CHANNEL, handleSyncEvent);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleSyncEvent);
    };
  }, [fetchPublicNeonData]);

  const getLocalizedBadge = useCallback(
    (item: CertificateItem) =>
      isId && item.badge_id?.trim() ? item.badge_id.trim() : item.badge,
    [isId]
  );

  const getLocalizedTitle = useCallback(
    (item: CertificateItem) =>
      isId && item.title_id?.trim() ? item.title_id.trim() : item.title,
    [isId]
  );

  const getLocalizedDescription = useCallback(
    (item: CertificateItem) =>
      isId && item.description_id?.trim()
        ? item.description_id.trim()
        : item.description,
    [isId]
  );

  const getLocalizedDate = useCallback(
    (item: CertificateItem) =>
      isId && item.date_str_id?.trim()
        ? item.date_str_id.trim()
        : item.date_str,
    [isId]
  );

  const getLocalizedSkills = useCallback(
    (item: CertificateItem) =>
      isId && item.skills_id && item.skills_id.length > 0
        ? item.skills_id
        : item.skills,
    [isId]
  );

  const displayHeaderBadge =
    isId && headerData.badge_text_id?.trim()
      ? headerData.badge_text_id.trim()
      : headerData.badge_text;

  const displayHeaderTitle =
    isId && headerData.title_id?.trim()
      ? headerData.title_id.trim()
      : headerData.title;

  const displayHeaderSubtitle =
    isId && headerData.subtitle_id?.trim()
      ? headerData.subtitle_id.trim()
      : headerData.subtitle;

  const filterTabs = useMemo(() => {
    const dynamicBadges = new Map<string, string>();

    for (const key of BASE_FILTER_KEYS) {
      dynamicBadges.set(key.toLowerCase(), key);
    }

    for (const cert of certificates) {
      const cleanBadge = String(getLocalizedBadge(cert) || '').trim();
      if (!cleanBadge) continue;
      const lowerKey = cleanBadge.toLowerCase();
      if (!dynamicBadges.has(lowerKey)) {
        dynamicBadges.set(lowerKey, cleanBadge);
      }
    }

    return [
      { key: 'ALL', label: t('All Certificates', 'Semua Sertifikat') },
      ...Array.from(dynamicBadges.values()).map((label) => ({
        key: label,
        label,
      })),
    ];
  }, [certificates, getLocalizedBadge, t]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredData = certificates.filter((item) => {
    const badgeLabel = getLocalizedBadge(item);
    const titleLabel = getLocalizedTitle(item);
    const descLabel = getLocalizedDescription(item);
    const skillsLabel = getLocalizedSkills(item);

    const matchesCategory =
      activeFilter === 'ALL' ||
      String(badgeLabel || '').toLowerCase() === activeFilter.toLowerCase() ||
      String(item.badge || '').toLowerCase() === activeFilter.toLowerCase();

    if (!normalizedQuery) return matchesCategory;

    const matchesSearch =
      String(titleLabel || '').toLowerCase().includes(normalizedQuery) ||
      String(item.title || '').toLowerCase().includes(normalizedQuery) ||
      String(item.issuer || '').toLowerCase().includes(normalizedQuery) ||
      String(badgeLabel || '').toLowerCase().includes(normalizedQuery) ||
      String(descLabel || '').toLowerCase().includes(normalizedQuery) ||
      skillsLabel.some((skill) =>
        String(skill).toLowerCase().includes(normalizedQuery)
      );

    return matchesCategory && matchesSearch;
  });

  const openCertificateModal = (cert: CertificateItem) => {
    setModalImageFailed(false);
    setSelectedCert(cert);
  };

  if (loading) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          {t(
            'Loading verified certificates from Neon API...',
            'Memuat sertifikat resmi dari Neon API...'
          )}
        </span>
      </main>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>{t('Back to Home', 'Kembali ke Beranda')}</span>
        </Link>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--card-border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-2">
            <Sparkles size={13} />
            <span>{displayHeaderBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            {displayHeaderTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            {displayHeaderSubtitle}
          </p>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(
              'Search certification or skill...',
              'Cari sertifikat atau skill...'
            )}
            className="w-full pl-9 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors shadow-inner"
          />
          <Search
            size={14}
            className="absolute left-3 top-2.5 text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Filter Tabs Dinamis */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 mb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-accent text-slate-950 font-bold shadow-md shadow-accent/20'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Kartu Sertifikat */}
      {filteredData.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-[var(--text-muted)] border border-dashed border-[var(--card-border)] rounded-2xl">
          {t(
            'No certificates found in Neon database.',
            'Belum ada sertifikat yang ditemukan di database Neon.'
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map((item) => {
            const activeImageSrc = failedImages[item.id]
              ? DEFAULT_CERTIFICATE_IMAGE
              : item.image_url || DEFAULT_CERTIFICATE_IMAGE;

            const badgeLabel = getLocalizedBadge(item);
            const titleLabel = getLocalizedTitle(item);
            const descLabel = getLocalizedDescription(item);
            const dateLabel = getLocalizedDate(item);
            const skillsLabel = getLocalizedSkills(item);

            return (
              <article
                key={item.id}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-accent/40 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1"
              >
                {/* Bagian Atas Kartu */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => openCertificateModal(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openCertificateModal(item);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <div className="relative w-full h-44 bg-slate-950 overflow-hidden border-b border-[var(--card-border)]">
                    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-accent flex items-center gap-1">
                      <Award size={11} /> {badgeLabel}
                    </span>
                    <img
                      src={activeImageSrc}
                      alt={titleLabel}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      onError={() =>
                        setFailedImages((prev) => ({
                          ...prev,
                          [item.id]: true,
                        }))
                      }
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white gap-1.5 backdrop-blur-[2px]">
                      <Maximize2 size={13} />
                      <span>{t('Click for Details', 'Klik untuk Detail')}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
                      <span className="truncate max-w-[160px]">
                        {item.issuer}
                      </span>
                      <span>{dateLabel}</span>
                    </div>

                    <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] tracking-tight group-hover:text-accent transition-colors mb-2">
                      {titleLabel}
                    </h2>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed min-h-[44px] line-clamp-3">
                      {descLabel}
                    </p>

                    {/* Badge Keahlian */}
                    <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-[var(--card-border)]">
                      {skillsLabel.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tombol Bagian Bawah Kartu */}
                <div className="px-5 py-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-[var(--text-muted)]">
                    ID: {item.id.slice(0, 8)}...
                  </span>

                  <button
                    type="button"
                    onClick={() => openCertificateModal(item)}
                    className="inline-flex items-center gap-1 text-accent hover:opacity-85 font-semibold transition-colors cursor-pointer"
                  >
                    <span>
                      {t('Verify Credential', 'Verifikasi Sertifikat')}
                    </span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detail Modal Saat Kartu Ditekan */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-5 py-4 bg-[var(--bg-primary)] border-b border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent">
                  {getLocalizedBadge(selectedCert)}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  ID: {selectedCert.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCert(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Isi Konten Modal */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-950">
                <img
                  src={
                    modalImageFailed
                      ? DEFAULT_CERTIFICATE_IMAGE
                      : selectedCert.image_url || DEFAULT_CERTIFICATE_IMAGE
                  }
                  alt={getLocalizedTitle(selectedCert)}
                  className="w-full h-full object-cover"
                  onError={() => setModalImageFailed(true)}
                />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight mb-2">
                  {getLocalizedTitle(selectedCert)}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-accent" />
                    {selectedCert.issuer}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-accent" />
                    {getLocalizedDate(selectedCert)}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-[var(--card-border)] rounded-xl p-4">
                <h3 className="text-xs font-mono uppercase text-[var(--text-muted)] mb-1.5">
                  {t(
                    'CURRICULUM & PROFICIENCY BREAKDOWN',
                    'RINCIAN KURIKULUM & KOMPETENSI'
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {getLocalizedDescription(selectedCert)}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-[var(--text-muted)] mb-2.5">
                  {t('VERIFIED SKILLS', 'KEAHLIAN TERVERIFIKASI')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {getLocalizedSkills(selectedCert).map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 text-xs text-[var(--text-main)]"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-accent shrink-0"
                      />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCert.credential_url &&
                selectedCert.credential_url !== '#' && (
                  <div className="pt-3">
                    <a
                      href={selectedCert.credential_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 px-4 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
                    >
                      <span>
                        {t(
                          'Verify Official Credential on Issuer Website',
                          'Verifikasi Kredensial di Situs Resmi'
                        )}
                      </span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}