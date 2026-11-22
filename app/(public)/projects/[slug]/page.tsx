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
  CheckCircle2,
  Loader2,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ModularBlock {
  id: string;
  type: 'narasi_foto' | 'kartu_proyek' | 'ulasan_artikel' | 'tombol_aksi' | 'linimasa';
  title: string;
  content: string;
  image?: string;
  link?: string;
}

interface ProjectDetail {
  slug: string;
  title: string;
  category: string;
  year: string;
  role: string;
  client: string;
  bannerImage: string;
  summary: { en: string; id: string };
  problem: { en: string; id: string };
  solution: { en: string; id: string };
  keyDeliverables: string[];
  modularBlocks: ModularBlock[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
}

const DEFAULT_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80';

function toSlug(value: string): string {
  return decodeURIComponent(String(value || ''))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ProjectDetailPage() {
  const params = useParams();
  const rawSlug = String(params?.slug || '');
  const normalizedSlug = toSlug(rawSlug);
  const { t, language } = useApp();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [allSlugs, setAllSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerFailed, setBannerFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadNeonProjectDetail() {
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
            d.slug ? toSlug(d.slug) : toSlug(d.title || `project-${idx + 1}`)
          );
          setAllSlugs(slugs);

          const matched = json.data.find((d: any, idx: number) => {
            const itemSlug = d.slug ? toSlug(d.slug) : toSlug(d.title || `project-${idx + 1}`);
            return (
              d.slug === rawSlug ||
              itemSlug === normalizedSlug ||
              toSlug(d.title || '') === normalizedSlug
            );
          });

          if (matched) {
            const parseSafely = (data: any): any[] => {
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
            };

            const tagsArray = parseSafely(matched.tags);
            const deliverablesArray = parseSafely(matched.deliverables);
            const rawItems = parseSafely(matched.collection_items);
            const modularBlocks: ModularBlock[] = rawItems.filter(
              (item: any) => item && typeof item === 'object' && 'type' in item
            );

            const resolvedSlug = matched.slug
              ? toSlug(matched.slug)
              : toSlug(matched.title || rawSlug);

            const overviewText =
              matched.overview ||
              matched.description ||
              'Detailed case study, architecture notes, and implementation highlights.';

            const problemText =
              matched.problem ||
              matched.overview ||
              matched.description ||
              'Key challenges addressed during development and system design.';

            const solutionText =
              matched.solution ||
              'Structured implementation with responsive UI, maintainable components, and database integration.';

            const finalDeliverables =
              deliverablesArray.length > 0
                ? deliverablesArray
                : [
                    'Responsive interface and structured case study view',
                    'Dynamic data management via Admin & PostgreSQL (Neon)',
                  ];

            setProject({
              slug: resolvedSlug,
              title: matched.title || 'Untitled Project',
              category: matched.category || 'Web Application',
              year: matched.year ? String(matched.year) : '2026',
              role: matched.role || 'Full-Stack Developer',
              client: matched.client || 'Personal Project',
              bannerImage:
                matched.thumbnail || matched.image_url || DEFAULT_BANNER_IMAGE,
              summary: {
                en: matched.overview_en || overviewText,
                id: matched.overview_id || overviewText,
              },
              problem: {
                en: matched.problem_en || problemText,
                id: matched.problem_id || problemText,
              },
              solution: {
                en: matched.solution_en || solutionText,
                id: matched.solution_id || solutionText,
              },
              keyDeliverables: finalDeliverables,
              modularBlocks,
              techStack:
                tagsArray.length > 0
                  ? tagsArray
                  : ['Next.js', 'PostgreSQL', 'Tailwind CSS'],
              liveUrl: matched.live_url || '',
              githubUrl: matched.github_url || 'https://github.com/ibelaia',
            });
          } else {
            setProject(null);
          }
        } else {
          setProject(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Gagal memuat detail proyek dari Neon API:', err);
          setProject(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNeonProjectDetail();

    return () => {
      isMounted = false;
    };
  }, [rawSlug, normalizedSlug]);

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-32 text-center flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-xs font-mono text-[var(--text-muted)]">
          Memuat detail studi kasus dari Neon API...
        </span>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">
          Project Not Found
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Proyek yang Anda cari tidak tersedia atau tautan salah.
        </p>
        <Link
          href="/projects"
          className="px-4 py-2 rounded-xl bg-accent text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali ke Proyek
        </Link>
      </main>
    );
  }

  const isIndo = language === 'ID';
  const currentIndex = allSlugs.indexOf(project.slug);
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug =
    currentIndex !== -1 && currentIndex < allSlugs.length - 1
      ? allSlugs[currentIndex + 1]
      : null;

  const activeBannerSrc = bannerFailed
    ? DEFAULT_BANNER_IMAGE
    : project.bannerImage || DEFAULT_BANNER_IMAGE;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      {/* Tombol Back */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft
            size={13}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>{t('Back to Projects Archive', 'Kembali ke Arsip Proyek')}</span>
        </Link>
      </div>

      {/* Header Info Proyek */}
      <div className="pb-6 border-b border-[var(--card-border)] space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent">
            {project.category}
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
          {isIndo ? project.summary.id : project.summary.en}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-3">
          {project.liveUrl && project.liveUrl !== '#' && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>{t('Live Preview', 'Lihat Pratinjau')}</span>
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
              <span>{t('View Source / Figma', 'Lihat Sumber / Figma')}</span>
            </a>
          )}
        </div>
      </div>

      {/* Hero Banner Proyek */}
      <div className="w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-[var(--card-border)] bg-[#090e1f] shadow-2xl">
        <img
          src={activeBannerSrc}
          alt={project.title}
          className="w-full h-full object-cover"
          onError={() => setBannerFailed(true)}
        />
      </div>

      {/* Grid Problem, Solution, Deliverables & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Studi Kasus */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-amber-400" />
              {t('Problem & Challenges', 'Tantangan & Masalah')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {isIndo ? project.problem.id : project.problem.en}
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-base font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-emerald-400" />
              {t('The Solution & Approach', 'Pendekatan & Solusi')}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {isIndo ? project.solution.id : project.solution.en}
            </p>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
            <h2 className="text-base font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-accent" />
              {t('Key Deliverables & Results', 'Hasil & Luaran Utama')}
            </h2>
            <div className="space-y-2.5">
              {project.keyDeliverables.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-muted)]"
                >
                  <CheckCircle2
                    size={16}
                    className="text-accent shrink-0 mt-0.5"
                  />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Metrics & Tools */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-4 pb-2 border-b border-[var(--card-border)]">
              {t('PROJECT METRICS', 'DETAIL PROYEK')}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[var(--text-muted)] font-mono block text-[10px] uppercase">
                  Role
                </span>
                <span className="font-semibold text-[var(--text-main)]">
                  {project.role}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-mono block text-[10px] uppercase">
                  Client / Track
                </span>
                <span className="font-semibold text-[var(--text-main)]">
                  {project.client}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-mono block text-[10px] uppercase">
                  Timeline
                </span>
                <span className="font-semibold text-[var(--text-main)]">
                  {project.year}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-3 pb-2 border-b border-[var(--card-border)]">
              {t('TECH STACK & TOOLS', 'PERKAKAS & TEKNOLOGI')}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg bg-white/5 border border-[var(--card-border)] text-[11px] font-mono text-[var(--text-muted)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RENDER MODULAR BLOCKS */}
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
                          alt={block.title}
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

      {/* Footer Navigasi Antar Proyek */}
      <div className="pt-6 border-t border-[var(--card-border)] flex items-center justify-between">
        {prevSlug ? (
          <Link
            href={`/projects/${prevSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors"
          >
            <ArrowLeft size={13} />
            <span>{t('Previous Case Study', 'Studi Kasus Sebelumnya')}</span>
          </Link>
        ) : (
          <div />
        )}

        {nextSlug ? (
          <Link
            href={`/projects/${nextSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors"
          >
            <span>{t('Next Case Study', 'Studi Kasus Berikutnya')}</span>
            <ArrowRight size={13} />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </main>
  );
}