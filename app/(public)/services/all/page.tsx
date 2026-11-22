'use client';

import React, { useState, useEffect } from 'react';
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

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  icon: React.ReactNode;
}

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

export default function AllServicesPage() {
  const { t } = useApp();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [header, setHeader] = useState({
    badge_text: 'ALL SERVICES',
    title: 'All Professional Services',
    subtitle:
      'Comprehensive breakdown of engineering, design, and architecture capabilities via Neon.',
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchNeonAllServices() {
      try {
        const response = await fetch('/api/services', { cache: 'no-store' });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success) {
          if (json.header) {
            setHeader({
              badge_text: json.header.badge_text || 'ALL SERVICES',
              title: json.header.title || 'All Professional Services',
              subtitle:
                json.header.subtitle ||
                'Comprehensive breakdown of engineering, design, and architecture capabilities via Neon.',
            });
          }

          if (Array.isArray(json.data) && json.data.length > 0) {
            const mapped: ServiceItem[] = json.data.map(
              (item: any, idx: number) => {
                const numStr =
                  item.badge ||
                  (idx < 9 ? `0${idx + 1}` : `${idx + 1}`);
                const titleStr = item.title || `Service ${idx + 1}`;

                return {
                  id: String(numStr),
                  title: titleStr,
                  desc:
                    item.description ||
                    item.desc ||
                    'End-to-end engineering and architecture delivery.',
                  tags: parseTagsSafely(item.tags, item.price),
                  icon: resolveServiceIcon(titleStr),
                };
              }
            );
            setServices(mapped);
          } else {
            setServices([]);
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

    return () => {
      isMounted = false;
    };
  }, []);

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
          <span>{t(header.badge_text, 'SEMUA LAYANAN')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          {t(header.title, 'Seluruh Layanan Profesional')}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
          {t(
            header.subtitle,
            'Rincian lengkap kapabilitas rekayasa perangkat lunak, desain antarmuka, dan sistem arsitektur via Neon.'
          )}
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
          {services.map((service, idx) => (
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
                  {service.title}
                </h2>

                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  {service.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap gap-1.5">
                {service.tags.map((tag, tagIdx) => (
                  <span
                    key={`${tag}-${tagIdx}`}
                    className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}