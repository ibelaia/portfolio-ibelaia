'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Code2,
  Palette,
  Database,
  Cpu,
  User,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const dynamic = 'force-dynamic';

const SERVICES_SYNC_CHANNEL = 'portfolio-sync-services';
const ADMIN_SYNC_CHANNEL = 'portfolio-admin-sync';
const SERVICES_STORAGE_KEY = 'portfolio_services_settings';

type LangCode = 'en' | 'id';

interface ServiceItem {
  id: string;
  rawId?: string;
  title: string;
  title_id: string;
  titleUpper: string;
  titleUpperId: string;
  desc: string;
  desc_id: string;
  tags: string[];
  tags_id: string[];
  icon: React.ReactNode;
  watermark: string;
}

interface ServicesHeaderState {
  badge_text: string;
  badge_text_id: string;
  title: string;
  title_id: string;
  subtitle: string;
  subtitle_id: string;
}

const DEFAULT_HEADER: ServicesHeaderState = {
  badge_text: 'MY SERVICES',
  badge_text_id: 'LAYANAN SAYA',
  title: 'My Services',
  title_id: 'Layanan Saya',
  subtitle: 'Things I can build, design, and contribute to.',
  subtitle_id: 'Hal yang dapat saya bangun, rancang, dan kontribusikan.',
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

function resolveServiceVisual(title: string): {
  icon: React.ReactNode;
  watermark: string;
} {
  const upperTitle = title.toUpperCase();

  if (upperTitle.includes('UI') || upperTitle.includes('DESIGN')) {
    return {
      icon: <Palette size={18} className="text-emerald-400" />,
      watermark: 'UI',
    };
  }
  if (upperTitle.includes('DATABASE') || upperTitle.includes('BACKEND')) {
    return {
      icon: <Database size={18} className="text-purple-400" />,
      watermark: 'SQL',
    };
  }
  if (upperTitle.includes('WEB3') || upperTitle.includes('BLOCKCHAIN')) {
    return {
      icon: <Cpu size={18} className="text-amber-400" />,
      watermark: 'ETH',
    };
  }

  return {
    icon: <Code2 size={18} className="text-accent" />,
    watermark: '{ }',
  };
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

function mapServiceCards(rawList: any[]): ServiceItem[] {
  return rawList.map((item: any, idx: number) => {
    const numStr =
      item.badge || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`);
    const titleStr = item.title || `Service ${idx + 1}`;
    const titleIdStr =
      typeof item.title_id === 'string' && item.title_id.trim()
        ? item.title_id.trim()
        : titleStr;
    const upperTitle = titleStr.toUpperCase();
    const upperTitleId = titleIdStr.toUpperCase();
    const visual = resolveServiceVisual(titleStr);
    const parsedTags = parseTagsSafely(item.tags, item.price);
    const parsedTagsId =
      item.tags_id !== undefined
        ? parseTagsSafely(item.tags_id, item.price)
        : parsedTags;

    return {
      id: String(numStr),
      rawId: item.id ? String(item.id) : undefined,
      title: titleStr,
      title_id: titleIdStr,
      titleUpper: upperTitle,
      titleUpperId: upperTitleId,
      desc:
        item.description ||
        item.desc ||
        'End-to-end engineering and architecture delivery.',
      desc_id:
        typeof (item.description_id ?? item.desc_id) === 'string' &&
        (item.description_id ?? item.desc_id).trim()
          ? (item.description_id ?? item.desc_id)
          : item.description ||
            item.desc ||
            'End-to-end engineering and architecture delivery.',
      tags: parsedTags,
      tags_id: parsedTagsId,
      icon: visual.icon,
      watermark: item.watermark || visual.watermark,
    };
  });
}

export default function ServicesPage() {
  const appContext = useApp() as any;
  const { t } = appContext;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [header, setHeader] = useState<ServicesHeaderState>(DEFAULT_HEADER);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
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
      singleCard?: Record<string, any> | null;
      action?: string;
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
        const mapped = mapServiceCards(payload.items);
        setServices(mapped);
        setActiveIndex((prev) => (prev >= mapped.length ? 0 : prev));
      } else if (payload.singleCard && typeof payload.singleCard === 'object') {
        const mappedSingle = mapServiceCards([payload.singleCard])[0];
        if (mappedSingle) {
          setServices((prev) => {
            const idxByRawId = mappedSingle.rawId
              ? prev.findIndex((s) => s.rawId === mappedSingle.rawId)
              : -1;
            const idxByBadge = prev.findIndex((s) => s.id === mappedSingle.id);
            const targetIdx = idxByRawId !== -1 ? idxByRawId : idxByBadge;

            if (targetIdx !== -1) {
              const next = [...prev];
              next[targetIdx] = {
                ...next[targetIdx],
                ...mappedSingle,
                icon: next[targetIdx].icon || mappedSingle.icon,
              };
              return next;
            }
            return [...prev, mappedSingle];
          });
        }
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

    async function fetchNeonServicesData() {
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
          console.warn('Gagal memuat data services dari Neon API:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchNeonServicesData();

    const handleRealtimeMessage = (event: MessageEvent) => {
      if (!isMounted) return;
      const payload = event?.data || {};
      if (payload.section && payload.section !== 'services') return;

      if (payload.action === 'header' && payload.data) {
        applyServicesPayload({ header: payload.data });
      } else if (Array.isArray(payload.data)) {
        applyServicesPayload({ items: payload.data });
      } else if (payload.data && typeof payload.data === 'object') {
        applyServicesPayload({ singleCard: payload.data });
      }
      fetchNeonServicesData();
    };

    const handleCustomSync = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent;
      const detail = customEvent.detail || {};
      if (detail.action === 'header' && detail.data) {
        applyServicesPayload({ header: detail.data });
      } else if (Array.isArray(detail.data)) {
        applyServicesPayload({ items: detail.data });
      } else if (detail.data && typeof detail.data === 'object') {
        applyServicesPayload({ singleCard: detail.data });
      }
      fetchNeonServicesData();
    };

    const handleStorage = (event: StorageEvent) => {
      if (!isMounted) return;
      if (
        !event.key ||
        event.key === SERVICES_STORAGE_KEY ||
        event.key === SERVICES_SYNC_CHANNEL
      ) {
        fetchNeonServicesData();
      }
      setLang(resolveLangFromContext(appContext));
    };

    let servicesChannel: BroadcastChannel | null = null;
    let adminChannel: BroadcastChannel | null = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      servicesChannel = new BroadcastChannel(SERVICES_SYNC_CHANNEL);
      servicesChannel.onmessage = handleRealtimeMessage;

      adminChannel = new BroadcastChannel(ADMIN_SYNC_CHANNEL);
      adminChannel.onmessage = handleRealtimeMessage;
    }

    window.addEventListener(SERVICES_SYNC_CHANNEL, handleCustomSync);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener(SERVICES_SYNC_CHANNEL, handleCustomSync);
      window.removeEventListener('storage', handleStorage);
      if (servicesChannel) servicesChannel.close();
      if (adminChannel) adminChannel.close();
    };
  }, [applyServicesPayload, appContext]);

  const handlePrev = () => {
    if (services.length === 0) return;
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : services.length - 1));
  };

  const handleNext = () => {
    if (services.length === 0) return;
    setActiveIndex((prev) => (prev < services.length - 1 ? prev + 1 : 0));
  };

  const handleMobileScroll = () => {
    if (scrollRef.current && services.length > 0) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const stepWidth = Math.max(offsetWidth * 0.75, 1);
      const rawIndex = Math.round(scrollLeft / stepWidth);
      const clampedIndex = Math.max(
        0,
        Math.min(rawIndex, services.length - 1)
      );
      setActiveIndex(clampedIndex);
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current && services.length > 0) {
      const clampedIndex = Math.max(0, Math.min(index, services.length - 1));
      const cardWidth = scrollRef.current.offsetWidth * 0.78;
      scrollRef.current.scrollTo({
        left: clampedIndex * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(clampedIndex);
    }
  };

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-mono text-slate-400 animate-pulse">
          {t(
            'Loading services from Neon database...',
            'Memuat layanan dari database Neon...'
          )}
        </p>
      </main>
    );
  }

  if (services.length === 0) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-xs font-mono text-[var(--text-muted)] border border-dashed border-[var(--card-border)] rounded-2xl py-12">
          {t(
            'No services recorded in Neon database yet.',
            'Belum ada data layanan tercatat di database Neon.'
          )}
        </p>
      </main>
    );
  }

  const isId = lang === 'id';
  const displayBadge =
    isId && header.badge_text_id.trim()
      ? header.badge_text_id
      : header.badge_text;
  const displayTitle =
    isId && header.title_id.trim() ? header.title_id : header.title;
  const displaySubtitle =
    isId && header.subtitle_id.trim()
      ? header.subtitle_id
      : header.subtitle;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{displayBadge}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
            {displayTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            {displaySubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous service"
            className="w-9 h-9 rounded-full border border-[var(--card-border)] bg-transparent hover:border-accent hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next service"
            className="w-9 h-9 rounded-full border border-[var(--card-border)] bg-transparent hover:border-accent hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="block md:hidden text-center my-4">
        <h1 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          {displayTitle}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
          {displaySubtitle}
        </p>
      </div>

      {/* DESKTOP CARDS GRID */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((item, index) => {
            const isSelected = activeIndex === index;
            const cardTitleUpper = isId ? item.titleUpperId : item.titleUpper;
            const cardDesc = isId ? item.desc_id : item.desc;
            const cardTags = isId ? item.tags_id : item.tags;

            return (
              <div
                key={`${item.id}-${index}`}
                role="button"
                tabIndex={0}
                onClick={() => setActiveIndex(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveIndex(index);
                  }
                }}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between min-h-[280px] ${
                  isSelected
                    ? 'bg-[var(--card-bg)] border-accent shadow-lg ring-1 ring-accent/30'
                    : 'bg-[var(--card-bg)] opacity-80 border-[var(--card-border)] hover:opacity-100 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-[var(--card-border)] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {item.id}
                    </span>
                  </div>

                  <h2 className="text-xs font-mono font-bold tracking-wider text-[var(--text-main)] mb-2 leading-snug">
                    {cardTitleUpper}
                  </h2>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                    {cardDesc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap gap-1 mt-4">
                  {cardTags.map((tag, tagIdx) => (
                    <span
                      key={`${tag}-${tagIdx}`}
                      className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[9px] font-mono text-[var(--text-muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE CARDS CAROUSEL */}
      <div className="block md:hidden">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[30px] p-5 backdrop-blur-xl shadow-2xl relative transition-colors duration-250">
          <div className="flex justify-end mb-3">
            <Link
              href="/services/all"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <User size={12} className="text-accent" />
              <span>{t('View all', 'Lihat semua')}</span>
              <ArrowRight size={12} className="text-accent" />
            </Link>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="w-20 h-[1px] bg-[var(--card-border)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-2" />
            <div className="w-20 h-[1px] bg-[var(--card-border)]" />
          </div>

          <div
            ref={scrollRef}
            onScroll={handleMobileScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-1"
          >
            {services.map((item, index) => {
              const isSelected = activeIndex === index;
              const cardTitle = isId ? item.title_id : item.title;
              const cardDesc = isId ? item.desc_id : item.desc;
              const cardTags = isId ? item.tags_id : item.tags;

              return (
                <div
                  key={`${item.id}-mobile-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => scrollToIndex(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      scrollToIndex(index);
                    }
                  }}
                  className={`snap-start shrink-0 w-[82%] rounded-3xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[320px] cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--card-bg)] border-2 border-accent shadow-xl'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] opacity-55'
                  }`}
                >
                  <span className="absolute -right-2 top-8 text-7xl font-mono font-black text-[var(--text-main)]/[0.04] select-none pointer-events-none">
                    {item.watermark}
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--card-border)] flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs font-mono tracking-wider text-[var(--text-muted)]">
                        {item.id}{' '}
                        <span className="text-slate-600">
                          /{' '}
                          {services.length < 10
                            ? `0${services.length}`
                            : services.length}
                        </span>
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight mb-2.5">
                      {cardTitle}
                    </h2>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {cardDesc}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-[var(--card-border)] flex flex-wrap gap-1.5 mt-5">
                    {cardTags.map((tag, tagIdx) => (
                      <span
                        key={`${tag}-${tagIdx}`}
                        className="px-2 py-0.5 rounded-lg bg-black/20 border border-[var(--card-border)] text-[9px] font-mono text-[var(--text-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}