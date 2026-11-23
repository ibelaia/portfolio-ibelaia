'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Code2,
  Palette,
  Database,
  Cpu,
  Layers,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const dynamic = 'force-dynamic';

const SERVICES_SYNC_CHANNEL = 'portfolio-sync-services';
const ADMIN_SYNC_CHANNEL = 'portfolio-admin-sync';
const SERVICES_STORAGE_KEY = 'portfolio_services_settings';

type LangCode = 'en' | 'id';

interface ServiceItem {
  id: string;
  title: string;
  title_id: string;
  desc: string;
  desc_id: string;
  tags: string[];
  tags_id: string[];
  icon: React.ReactNode;
}

interface AllServicesHeader {
  badge_text: string;
  badge_text_id: string;
  title: string;
  title_id: string;
  subtitle: string;
  subtitle_id: string;
}

const DEFAULT_HEADER: AllServicesHeader = {
  badge_text: 'ALL SERVICES',
  badge_text_id: 'SEMUA LAYANAN',
  title: 'All Professional Services',
  title_id: 'Seluruh Layanan Profesional',
  subtitle:
    'Comprehensive breakdown of engineering, design, and architecture capabilities via Neon.',
  subtitle_id:
    'Rincian lengkap kapabilitas rekayasa perangkat lunak, desain antarmuka, dan sistem arsitektur via Neon.',
};

function parseTagsSafely(rawTags: any, fallbackPrice?: any): string[] {
  if (Array.isArray(rawTags)) {
    const cleaned = rawTags
      .map((tag) => {
        if (typeof tag === 'string') return tag.trim();
        if (tag && typeof tag === 'object') {
          return String(tag.name || tag.label || tag.title || '').trim();
        }
        return '';
      })
      .filter(Boolean);
    if (cleaned.length > 0) return cleaned;
  }

  if (typeof rawTags === 'string') {
    const trimmed = rawTags.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parseTagsSafely(parsed, fallbackPrice);
        }
      } catch {
        // Fallback ke pemisahan koma atau baris baru
      }

      const separator = trimmed.includes('\n') ? '\n' : ',';
      const splitItems = trimmed
        .split(separator)
        .map((s) => s.trim())
        .filter(Boolean);
      if (splitItems.length > 0) return splitItems;
    }
  }

  if (fallbackPrice) {
    return [String(fallbackPrice)];
  }

  return ['Backend', 'API'];
}

function resolveServiceIcon(title: string): React.ReactNode {
  const upperTitle = title.toUpperCase();

  if (upperTitle.includes('UI') || upperTitle.includes('DESIGN')) {
    return <Palette size={20} className="text-emerald-400" />;
  }
  if (upperTitle.includes('DATABASE') || upperTitle.includes('BACKEND')) {
    return <Database size={20} className="text-purple-400" />;
  }
  if (upperTitle.includes('WEB3') || upperTitle.includes('BLOCKCHAIN')) {
    return <Cpu size={20} className="text-amber-400" />;
  }

  return <Code2 size={20} className="text-accent" />;
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

function mapAllServicesList(rawList: any[]): ServiceItem[] {
  return rawList.map((item: any, idx: number) => {
    const numStr =
      item.badge || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`);
    const titleStr = item.title || `Service ${idx + 1}`;
    const titleIdStr =
      typeof item.title_id === 'string' && item.title_id.trim()
        ? item.title_id.trim()
        : titleStr;
    const descStr =
      item.description ||
      item.desc ||
      'End-to-end engineering and architecture delivery.';
    const descIdStr =
      typeof (item.description_id ?? item.desc_id) === 'string' &&
      (item.description_id ?? item.desc_id).trim()
        ? (item.description_id ?? item.desc_id)
        : descStr;
    const tagsList = parseTagsSafely(item.tags, item.price);
    const tagsIdList =
      item.tags_id !== undefined
        ? parseTagsSafely(item.tags_id, item.price)
        : tagsList;

    return {
      id: String(numStr),
      title: titleStr,
      title_id: titleIdStr,
      desc: descStr,
      desc_id: descIdStr,
      tags: tagsList,
      tags_id: tagsIdList,
      icon: resolveServiceIcon(titleStr),
    };
  });
}

export default function AllServicesPage() {
  const appContext = useApp() as any;
  const { t } = appContext;
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [header, setHeader] = useState<AllServicesHeader>(DEFAULT_HEADER);
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

  const applyServicesPayload = useCallback(
    (payload: {
      header?: Record<string, any> | null;
      items?: any[] | null;
    }) => {
      if (payload.header && typeof payload.header === 'object') {
        setHeader((prev) => ({
          badge_text: payload.header?.badge_text || prev.badge_text,
          badge_text_id:
            typeof payload.header?.badge_text_id === 'string' &&
            payload.header.badge_text_id.trim()
              ? payload.header.badge_text_id
              : prev.badge_text_id,
          title: payload.header?.title || prev.title,
          title_id:
            typeof payload.header?.title_id === 'string' &&
            payload.header.title_id.trim()
              ? payload.header.title_id
              : prev.title_id,
          subtitle: payload.header?.subtitle || prev.subtitle,
          subtitle_id:
            typeof payload.header?.subtitle_id === 'string' &&
            payload.header.subtitle_id.trim()
              ? payload.header.subtitle_id
              : prev.subtitle_id,
        }));
      }

      if (Array.isArray(payload.items)) {
        setServices(mapAllServicesList(payload.items));
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    try {
      const cachedRaw = localStorage.getItem(SERVICES_STORAGE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached && typeof cached === 'object' && isMounted) {
          applyServicesPayload({
            header: cached.header || null,
            items: Array.isArray(cached.data) ? cached.data : null,
          });
          setLoading(false);
        }
      }
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }

    async function fetchNeonAllServices() {
      try {
        const response = await fetch('/api/services', { cache: 'no-store' });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success) {
          applyServicesPayload({
            header: json.header || null,
            items: Array.isArray(json.data) ? json.data : [],
          });
          try {
            localStorage.setItem(
              SERVICES_STORAGE_KEY,
              JSON.stringify({
                header: json.header || null,
                data: Array.isArray(json.data) ? json.data : [],
              })
            );
          } catch {
            // Abaikan error penyimpanan lokal
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat semua services dari Neon API:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNeonAllServices();

    const handleSync = () => {
      if (isMounted) {
        fetchNeonAllServices();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (!isMounted) return;
      if (
        !event.key ||
        event.key === SERVICES_STORAGE_KEY ||
        event.key === SERVICES_SYNC_CHANNEL
      ) {
        fetchNeonAllServices();
      }
      setLang(resolveLangFromContext(appContext));
    };

    let servicesChannel: BroadcastChannel | null = null;
    let adminChannel: BroadcastChannel | null = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      servicesChannel = new BroadcastChannel(SERVICES_SYNC_CHANNEL);
      servicesChannel.onmessage = handleSync;

      adminChannel = new BroadcastChannel(ADMIN_SYNC_CHANNEL);
      adminChannel.onmessage = handleSync;
    }

    window.addEventListener(SERVICES_SYNC_CHANNEL, handleSync);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(SERVICES_SYNC_CHANNEL, handleSync);
      window.removeEventListener('storage', handleStorage);
      if (servicesChannel) servicesChannel.close();
      if (adminChannel) adminChannel.close();
    };
  }, [applyServicesPayload, appContext]);

  const isId = lang === 'id';
  const displayBadge =
    isId && header.badge_text_id.trim()
      ? header.badge_text_id
      : isId
      ? 'SEMUA LAYANAN'
      : header.badge_text;
  const displayTitle =
    isId && header.title_id.trim()
      ? header.title_id
      : isId
      ? 'Seluruh Layanan Profesional'
      : header.title;
  const displaySubtitle =
    isId && header.subtitle_id.trim()
      ? header.subtitle_id
      : isId
      ? 'Rincian lengkap kapabilitas rekayasa perangkat lunak, desain antarmuka, dan sistem arsitektur via Neon.'
      : header.subtitle;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Tombol Kembali ke Halaman Layanan */}
      <div className="mb-4">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{t('Back to Services', 'Kembali ke Layanan')}</span>
        </Link>
      </div>

      {/* Header Halaman Lengkap */}
      <div className="mb-6 pb-5 border-b border-[var(--card-border)]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-2">
          <Layers size={13} />
          <span>{displayBadge}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          {displayTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
          {displaySubtitle}
        </p>
      </div>

      {/* Grid Semua Layanan */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)]">
          {t('Loading services...', 'Memuat layanan dari Neon API...')}
        </div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-[var(--text-muted)] border border-dashed border-[var(--card-border)] rounded-2xl">
          {t(
            'No services found.',
            'Tidak ada layanan ditemukan di database Neon.'
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, idx) => {
            const cardTitle = isId ? service.title_id : service.title;
            const cardDesc = isId ? service.desc_id : service.desc;
            const cardTags = isId ? service.tags_id : service.tags;

            return (
              <div
                key={`${service.id}-${idx}`}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--card-border)] flex items-center justify-center">
                      {service.icon}
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)] font-bold">
                      {service.id}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-[var(--text-main)] mb-2">
                    {cardTitle}
                  </h2>

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                    {cardDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap gap-1.5">
                  {cardTags.map((tag, tagIdx) => (
                    <span
                      key={`${tag}-${tagIdx}`}
                      className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}