'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Code2,
  Calendar,
  Loader2,
  Clock,
  Layers,
  Eye,
  X,
} from 'lucide-react';

interface ModularBlock {
  id?: string;
  type?: 'narasi_foto' | 'kartu_proyek' | 'ulasan_artikel' | 'tombol_aksi' | 'linimasa';
  title?: string;
  content?: string;
  image?: string;
  link?: string;
}

interface CollectionSubItem {
  title: string;
  subtitle?: string;
  desc?: string;
  description?: string;
  image?: string;
  link?: string;
  tags: string[];
}

interface CollectionProjectDetail {
  slug: string;
  title: string;
  category: string;
  year: string;
  bannerImage: string;
  summary: string;
  modularBlocks: ModularBlock[];
  collectionItems: CollectionSubItem[];
  liveUrl?: string;
  githubUrl?: string;
}

const DEFAULT_COLLECTION_BANNER =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

function toSlug(value: string): string {
  return decodeURIComponent(String(value || ''))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function parseJsonArraySafely(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return trimmed
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export default function CollectionDetailPage() {
  const params = useParams();
  const rawSlug = String(params?.slug || '');
  const normalizedSlug = toSlug(rawSlug);

  const [project, setProject] = useState<CollectionProjectDetail | null>(null);
  const [allSlugs, setAllSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerFailed, setBannerFailed] = useState(false);
  const [activeSubDetail, setActiveSubDetail] = useState<CollectionSubItem | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNeonCollectionData() {
      if (!rawSlug) {
        if (isMounted) setLoading(false);
        return;
      }

      setLoading(true);
      setBannerFailed(false);

      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        const json = await response.json();

        if (!isMounted) return;

        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const slugs = json.data.map((d: any, idx: number) =>
            d.slug ? toSlug(d.slug) : toSlug(d.title || `collection-${idx + 1}`)
          );
          setAllSlugs(slugs);

          const matchedData = json.data.find((item: any, idx: number) => {
            const itemSlug = item.slug
              ? toSlug(item.slug)
              : toSlug(item.title || `collection-${idx + 1}`);
            return (
              item.slug === rawSlug ||
              itemSlug === normalizedSlug ||
              toSlug(item.title || '') === normalizedSlug
            );
          });

          if (matchedData) {
            const rawItems = parseJsonArraySafely(matchedData.collection_items);
            const rawBlocks = parseJsonArraySafely(matchedData.modular_blocks);

            const modularBlocks: ModularBlock[] =
              rawBlocks.length > 0
                ? rawBlocks
                : rawItems.filter((item: any) => item && typeof item === 'object' && 'type' in item);

            const collectionItems: CollectionSubItem[] = rawItems
              .filter(
                (item: any) =>
                  item &&
                  typeof item === 'object' &&
                  !('type' in item) &&
                  ('title' in item || 'desc' in item || 'description' in item)
              )
              .map((sub: any, subIdx: number) => ({
                title: sub.title || `Sub-Item #${subIdx + 1}`,
                subtitle: sub.subtitle || '',
                desc: sub.desc || sub.description || '',
                description: sub.description || sub.desc || '',
                image: sub.image || sub.image_url || sub.thumbnail || '',
                link: sub.link || sub.url || '',
                tags: parseJsonArraySafely(sub.tags),
              }));

            const resolvedSlug = matchedData.slug
              ? toSlug(matchedData.slug)
              : toSlug(matchedData.title || rawSlug);

            setProject({
              slug: resolvedSlug,
              title: matchedData.title || 'Untitled Collection',
              category: matchedData.category || 'Web Application',
              year: matchedData.year ? String(matchedData.year) : '2026',
              bannerImage:
                matchedData.thumbnail ||
                matchedData.image_url ||
                DEFAULT_COLLECTION_BANNER,
              summary:
                matchedData.overview ||
                matchedData.description ||
                'Koleksi proyek multi-item dan dokumentasi modular.',
              modularBlocks,
              collectionItems,
              liveUrl: matchedData.live_url || '',
              githubUrl: matchedData.github_url || 'https://github.com/ibelaia',
            });
          } else {
            setProject(null);
          }
        } else {
          setProject(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat koleksi proyek dari Neon API:', err);
          setProject(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNeonCollectionData();

    return () => {
      isMounted = false;
    };
  }, [rawSlug, normalizedSlug]);

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-32 text-center flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Memuat koleksi dari Neon API...
        </span>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
          Koleksi Tidak Ditemukan
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Koleksi proyek yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/projects"
          className="px-4 py-2 rounded-xl bg-accent text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali ke Semua Proyek
        </Link>
      </main>
    );
  }

  const currentIndex = allSlugs.indexOf(project.slug);
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug =
    currentIndex !== -1 && currentIndex < allSlugs.length - 1
      ? allSlugs[currentIndex + 1]
      : null;

  const activeBannerSrc = bannerFailed
    ? DEFAULT_COLLECTION_BANNER
    : project.bannerImage || DEFAULT_COLLECTION_BANNER;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Kembali ke Arsip Proyek</span>
        </Link>
      </div>

      <div className="pb-6 border-b border-[var(--card-border)] space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-400">
            Multi-Project Collection
          </span>
          <span className="text-[var(--text-muted)] text-xs">•</span>
          <span className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-1">
            <Calendar size={12} /> {project.year}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-main)] tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-3xl leading-relaxed">
          {project.summary}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          {project.liveUrl && project.liveUrl !== '#' && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Lihat Pratinjau</span>
              <ExternalLink size={13} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[var(--card-bg)] hover:bg-white/10 border border-[var(--card-border)] text-[var(--text-main)] text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Code2 size={13} />
              <span>Lihat Sumber / Figma</span>
            </a>
          )}
        </div>
      </div>

      <div className="w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-[var(--card-border)] bg-[#090e1f] shadow-2xl">
        <img
          src={activeBannerSrc}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={() => setBannerFailed(true)}
        />
      </div>

      {project.collectionItems.length > 0 && (
        <div className="space-y-6 pt-4">
          <h2 className="text-lg font-extrabold text-[var(--text-main)] tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-accent" />
            <span>Sub-Item Koleksi ({project.collectionItems.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.collectionItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between group hover:border-accent/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-accent/10 text-[10px] font-mono text-accent font-bold uppercase">
                      Sub-Item #{idx + 1}
                    </span>
                    {item.subtitle && (
                      <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[var(--text-main)] group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>

                  {item.image && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveSubDetail(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveSubDetail(item);
                        }
                      }}
                      className="rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-950 aspect-video shadow-lg cursor-pointer"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3 whitespace-pre-line">
                    {item.desc || item.description || ''}
                  </p>

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubDetail(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-mono font-bold text-xs transition-all border border-purple-500/30 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Detail Sub-Proyek</span>
                  </button>

                  {item.link && item.link !== '#' && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-bold text-xs transition-all border border-accent/20"
                    >
                      <span>Tautan</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.modularBlocks.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-[var(--card-border)]">
          <h2 className="text-lg font-extrabold text-[var(--text-main)] tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-accent" />
            <span>Detail & Galeri Blok Modular</span>
          </h2>

          <div className="space-y-6">
            {project.modularBlocks.map((block, idx) => (
              <div
                key={block.id || idx}
                className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-accent/10 text-[10px] font-mono text-accent font-bold uppercase">
                    {block.type ? block.type.replace('_', ' ') : 'ulasan artikel'}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    {block.title}
                  </h3>
                </div>

                {block.type === 'narasi_foto' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                      {block.content}
                    </p>
                    {block.image && (
                      <div className="rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-950 aspect-video shadow-lg">
                        <img
                          src={block.image}
                          alt={block.title || 'Modular block image'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'ulasan_artikel' && (
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                    {block.content}
                  </p>
                )}

                {block.type === 'kartu_proyek' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-[var(--card-border)] text-xs text-[var(--text-muted)] leading-relaxed">
                    {block.content}
                  </div>
                )}

                {block.type === 'tombol_aksi' && (
                  <div className="pt-2">
                    <a
                      href={block.link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>{block.content || 'Buka Tautan'}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {block.type === 'linimasa' && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                    <Clock size={16} className="shrink-0 mt-0.5 text-purple-400" />
                    <p className="leading-relaxed whitespace-pre-line">
                      {block.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL POPUP DETAIL SUB-ITEM */}
      {activeSubDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0b0e17] border border-accent/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] bg-[#090e1f] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-accent/20 text-accent font-mono text-[11px] uppercase font-extrabold tracking-wider">
                  Detail Sub-Proyek
                </span>
                <span className="text-xs font-semibold text-[var(--text-main)] line-clamp-1">
                  {activeSubDetail.title}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubDetail(null)}
                className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="space-y-2.5">
                {activeSubDetail.subtitle && (
                  <span className="inline-block text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 font-semibold">
                    {activeSubDetail.subtitle}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
                  {activeSubDetail.title}
                </h2>
              </div>

              {activeSubDetail.image && (
                <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-slate-950 aspect-video shadow-2xl">
                  <img
                    src={activeSubDetail.image}
                    alt={activeSubDetail.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-accent uppercase tracking-wider">
                  Deskripsi & Penjelasan Lengkap Modul
                </h4>
                <div className="bg-[#07090e] p-5 rounded-2xl border border-[var(--card-border)] text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line shadow-inner">
                  {activeSubDetail.desc ||
                    activeSubDetail.description ||
                    'Tidak ada deskripsi tersedia.'}
                </div>
              </div>

              {activeSubDetail.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
                    Tech Stack & Tools Digunakan
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeSubDetail.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-[var(--card-border)] text-xs font-mono text-accent font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[var(--card-border)] bg-[#090e1f] shrink-0 flex items-center justify-between">
              {activeSubDetail.link && activeSubDetail.link !== '#' ? (
                <a
                  href={activeSubDetail.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <span>Buka Tautan Repositori / Live Demo</span>
                  <ExternalLink size={13} />
                </a>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setActiveSubDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[var(--text-main)] transition-colors cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-[var(--card-border)] flex items-center justify-between">
        {prevSlug ? (
          <Link
            href={`/projects/collection/${prevSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Studi Kasus Sebelumnya</span>
          </Link>
        ) : (
          <div />
        )}

        {nextSlug ? (
          <Link
            href={`/projects/collection/${nextSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors cursor-pointer"
          >
            <span>Studi Kasus Berikutnya</span>
            <ArrowRight size={13} />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}