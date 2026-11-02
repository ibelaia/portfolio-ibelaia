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
  Layers
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

const fallbackDatabase: Record<string, ProjectDetail> = {
  'food-delivery-app-interface': {
    slug: 'food-delivery-app-interface',
    title: 'Food Delivery App Interface',
    category: 'UI/UX Design',
    year: '2026',
    role: 'Lead UI/UX Designer',
    client: 'Design Portfolio Case Study',
    bannerImage: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1200&q=80',
    summary: {
      en: 'A comprehensive mobile UI/UX engineering project focused on minimizing user checkout friction, enabling fluid real-time driver geo-tracking, and creating a unified design token system.',
      id: 'Proyek perancangan UI/UX mobile komprehensif yang berfokus pada pengurangan friksi saat checkout, pelacakan kurir real-time yang mulus, dan standardisasi design token.',
    },
    problem: {
      en: 'Most food delivery applications clutter the screen with inconsistent typography, confusing micro-interactions, and lengthy checkout funnels that drive high cart abandonment rates.',
      id: 'Banyak aplikasi pesan-antar makanan memiliki antarmuka yang terlalu padat, mikro-interaksi yang membingungkan, serta tahapan checkout yang panjang sehingga memicu tingginya angka pembatalan pesanan.',
    },
    solution: {
      en: 'Engineered high-fidelity Figma components with auto-layout, intuitive 3-tap checkout flows, clear micro-animations for cart updates, and accessible color contrasts verified against WCAG AA standards.',
      id: 'Merancang komponen Figma berkualitas tinggi dengan auto-layout presisi, menyederhanakan alur checkout menjadi 3 ketukan praktis, animasi transisi keranjang, dan kontras warna standar WCAG AA.',
    },
    keyDeliverables: [
      'Interactive Figma prototype with 40+ responsive mobile artboards',
      'Unified design system: typography tokens, 8pt spacing grid, reusable UI kit',
      'Complete end-to-end user journey: exploration, cart, tracking, post-purchase review',
      'Usability testing report showing a 35% reduction in task completion time'
    ],
    modularBlocks: [],
    techStack: ['Figma', 'FigJam', 'Prototyping', 'Design System', 'User Journey Mapping'],
    liveUrl: 'https://figma.com',
    githubUrl: 'https://github.com/ibelaia'
  },
  'jawatrip-mobile-travel-platform': {
    slug: 'jawatrip-mobile-travel-platform',
    title: 'JawaTrip Mobile Travel Platform',
    category: 'Mobile & UI/UX',
    year: '2026',
    role: 'UI/UX & Mobile Developer',
    client: 'Tourism Digital Initiative',
    bannerImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    summary: {
      en: 'An interactive itinerary planner and ticket booking application designed to streamline domestic tourism across Java with rich micro-interactions and offline ticketing support.',
      id: 'Aplikasi perencana jadwal perjalanan interaktif dan pemesanan tiket wisata di Pulau Jawa dengan mikro-interaksi dinamis dan dukungan tiket digital offline.',
    },
    problem: {
      en: 'Travelers often face fragmented booking systems across transport, local guides, and regional attraction tickets with little to no offline reliability.',
      id: 'Wisatawan kerap menemui sistem pemesanan yang terpisah-pisah antara tiket transportasi, pemandu lokal, dan tiket wisata, serta kendala sinyal di area tujuan.',
    },
    solution: {
      en: 'Built an integrated mobile experience combining interactive trip scheduling, cached QR-ticket passes, and cross-platform responsive layouts.',
      id: 'Membangun aplikasi mobile terintegrasi dengan sinkronisasi rencana perjalanan, tiket QR terenkripsi yang dapat dibuka offline, dan tata letak responsif.',
    },
    keyDeliverables: [
      'Full-flow UI/UX screen sequence from onboarding to ticket redemption',
      'Offline-first architecture with local cache state synchronization',
      'Modular React Native navigation with fluid gesture transitions',
      'API schema integration for real-time schedule & quota checks'
    ],
    modularBlocks: [],
    techStack: ['React Native', 'Figma', 'TypeScript', 'Tailwind CSS', 'REST API'],
    liveUrl: '#',
    githubUrl: 'https://github.com/ibelaia'
  }
};

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, language } = useApp();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [allSlugs, setAllSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjectData() {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await fetch('/api/projects');
        const json = await response.json();

        if (json.success && json.data && json.data.length > 0) {
          const slugs = json.data.map((d: any) => d.slug);
          setAllSlugs(slugs);

          const matched = json.data.find((d: any) => d.slug === slug);
          if (matched) {
            const fallback = fallbackDatabase[slug];
            const tagsArray = Array.isArray(matched.tags) ? matched.tags : [];
            const deliverablesArray = Array.isArray(matched.deliverables) && matched.deliverables.length > 0
              ? matched.deliverables
              : (fallback?.keyDeliverables || []);

            const rawItems = Array.isArray(matched.collection_items) ? matched.collection_items : [];
            const modularBlocks = rawItems.filter((item: any) => 'type' in item);

            setProject({
              slug: matched.slug,
              title: matched.title,
              category: matched.category || fallback?.category || 'Development',
              year: matched.year || fallback?.year || '2026',
              role: matched.role || fallback?.role || 'Full-Stack Developer',
              client: matched.client || fallback?.client || 'Personal Project',
              bannerImage: matched.thumbnail || matched.image_url || fallback?.bannerImage || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
              summary: {
                en: matched.overview || matched.description || fallback?.summary.en || '',
                id: matched.overview || matched.description || fallback?.summary.id || ''
              },
              problem: {
                en: matched.problem || fallback?.problem.en || matched.overview || '',
                id: matched.problem || fallback?.problem.id || matched.overview || ''
              },
              solution: {
                en: matched.solution || fallback?.solution.en || '',
                id: matched.solution || fallback?.solution.id || ''
              },
              keyDeliverables: deliverablesArray,
              modularBlocks: modularBlocks,
              techStack: tagsArray.length > 0 ? tagsArray : (fallback?.techStack || ['Next.js', 'TypeScript', 'Tailwind CSS']),
              liveUrl: matched.live_url || fallback?.liveUrl || '',
              githubUrl: matched.github_url || fallback?.githubUrl || 'https://github.com/ibelaia'
            });
          } else if (fallbackDatabase[slug]) {
            setProject(fallbackDatabase[slug]);
            setAllSlugs(Object.keys(fallbackDatabase));
          }
        } else if (fallbackDatabase[slug]) {
          setProject(fallbackDatabase[slug]);
          setAllSlugs(Object.keys(fallbackDatabase));
        }
      } catch (err) {
        if (fallbackDatabase[slug]) {
          setProject(fallbackDatabase[slug]);
          setAllSlugs(Object.keys(fallbackDatabase));
        }
      } finally {
        setLoading(false);
      }
    }

    loadProjectData();
  }, [slug]);

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-32 text-center flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-xs font-mono text-[var(--text-muted)]">Memuat detail studi kasus dari Neon...</span>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-main)] mb-2">Project Not Found</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Proyek yang Anda cari tidak tersedia atau tautan salah.</p>
        <Link
          href="/projects"
          className="px-4 py-2 rounded-xl bg-accent text-slate-950 font-bold text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Kembali ke Proyek
        </Link>
      </main>
    );
  }

  const isIndo = language === 'ID';
  const currentIndex = allSlugs.indexOf(slug);
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex !== -1 && currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      
      {/* Tombol Back */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
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
              className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
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
          src={project.bannerImage}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Grid Problem, Solution, Deliverables & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Kolom Kiri: Studi Kasus */}
        <div className="lg:col-span-8 space-y-6">
          
          {project.problem.id && (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-amber-400" />
                {t('Problem & Challenges', 'Tantangan & Masalah')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {isIndo ? project.problem.id : project.problem.en}
              </p>
            </div>
          )}

          {project.solution.id && (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-emerald-400" />
                {t('The Solution & Approach', 'Pendekatan & Solusi')}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {isIndo ? project.solution.id : project.solution.en}
              </p>
            </div>
          )}

          {project.keyDeliverables.length > 0 && (
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl">
              <h2 className="text-base font-bold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-accent" />
                {t('Key Deliverables & Results', 'Hasil & Luaran Utama')}
              </h2>
              <div className="space-y-2.5">
                {project.keyDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-muted)]">
                    <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Kolom Kanan: Metrics & Tools */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 backdrop-blur-xl">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-4 pb-2 border-b border-[var(--card-border)]">
              {t('PROJECT METRICS', 'DETAIL PROYEK')}
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[var(--text-muted)] font-mono block text-[10px] uppercase">Role</span>
                <span className="font-semibold text-[var(--text-main)]">{project.role}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-mono block text-[10px] uppercase">Client / Track</span>
                <span className="font-semibold text-[var(--text-main)]">{project.client}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-mono block text-[10px] uppercase">Timeline</span>
                <span className="font-semibold text-[var(--text-main)]">{project.year}</span>
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
              <div key={block.id || idx} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-accent/10 text-[10px] font-mono text-accent font-bold uppercase">
                    {block.type ? block.type.replace('_', ' ') : 'ulasan artikel'}
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-main)]">{block.title}</h3>
                </div>

                {block.type === 'narasi_foto' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{block.content}</p>
                    {block.image && (
                      <div className="rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-950 aspect-video shadow-lg">
                        <img src={block.image} alt={block.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'ulasan_artikel' && (
                  <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{block.content}</p>
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <span>{block.content || 'Buka Tautan'}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {block.type === 'linimasa' && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                    <Clock size={16} className="shrink-0 mt-0.5 text-purple-400" />
                    <p className="leading-relaxed whitespace-pre-line">{block.content}</p>
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
        ) : <div />}

        {nextSlug ? (
          <Link
            href={`/projects/${nextSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors"
          >
            <span>{t('Next Case Study', 'Studi Kasus Berikutnya')}</span>
            <ArrowRight size={13} />
          </Link>
        ) : <div />}
      </div>

    </main>
  );
}