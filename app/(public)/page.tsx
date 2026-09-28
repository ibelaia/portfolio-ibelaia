'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Code, 
  Search, 
  Sparkles,
  ArrowUpRight,
  FolderArchive,
  Star 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  titleId?: string;
  category: string;
  type?: string;
  desc: string;
  descId?: string;
  image: string;
  tags: string[];
  githubUrl?: string;
  isFeatured?: boolean;
}

const fallbackProjects: ProjectItem[] = [
  {
    id: '01',
    type: 'single',
    slug: 'e-commerce-dashboard',
    title: 'E-Commerce Dashboard',
    titleId: 'Dashboard E-Commerce',
    category: 'WEB',
    desc: 'Real-time analytics engine and dashboard tracking customer conversion rates, sales volumes, and multi-tenant inventory.',
    descId: 'Mesin analitik real-time untuk memantau konversi pelanggan, volume penjualan, dan inventaris multi-toko.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tags: ['Next.js', 'Tailwind CSS', 'Chart.js', 'TypeScript'],
    githubUrl: 'https://github.com/ibelaia',
    isFeatured: true,
  },
  {
    id: '02',
    type: 'multi',
    slug: 'uiux-design',
    title: 'UI/UX Design Projects',
    titleId: 'Koleksi Desain UI/UX',
    category: 'UIUX',
    desc: 'Exploration archive of mobile UI designs, design systems, interactive Figma prototypes, and seamless user experiences.',
    descId: 'Arsip eksplorasi desain antarmuka mobile, design system, prototipe Figma interaktif, dan alur pengalaman pengguna.',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
    tags: ['Figma', 'Prototyping', 'Design System', 'User Flow'],
    githubUrl: 'https://github.com/ibelaia',
    isFeatured: false,
  },
  {
    id: '03',
    type: 'single',
    slug: 'jawatrip-mobile-travel-platform',
    title: 'JawaTrip Mobile Travel Platform',
    titleId: 'Aplikasi Travel & Wisata JawaTrip',
    category: 'MOBILE',
    desc: 'End-to-end interactive itinerary planner and ticket booking application engineered with rich micro-interactions.',
    descId: 'Aplikasi perencanaan rencana perjalanan dan pemesanan tiket wisata dengan antarmuka dinamis dan responsif.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    tags: ['React Native', 'Mobile UI', 'Figma', 'API Integration'],
    githubUrl: 'https://github.com/ibelaia',
    isFeatured: true,
  },
  {
    id: '04',
    type: 'single',
    slug: 'defi-liquidity-asset-protocol',
    title: 'DeFi Liquidity & Asset Protocol',
    titleId: 'Protokol Likuiditas & Analisis DeFi',
    category: 'WEB3',
    desc: 'Decentralized finance dashboard tracking liquidity pools, gas metrics, and automated smart contract transactions.',
    descId: 'Dashboard keuangan terdesentralisasi untuk monitoring likuiditas pool, estimasi gas fee, dan smart contract.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    tags: ['Solidity', 'Ethers.js', 'Web3', 'Tailwind'],
    githubUrl: 'https://github.com/ibelaia',
    isFeatured: false,
  },
  {
    id: '05',
    type: 'single',
    slug: 'releaf-paper-eco-store',
    title: 'Releaf Paper Eco-Store',
    titleId: 'E-Commerce Ramah Lingkungan Releaf',
    category: 'WEB',
    desc: 'Dedicated digital storefront and inventory management system engineered for sustainable agricultural paper products.',
    descId: 'Toko digital dan sistem manajemen stok produk pertanian ramah lingkungan berbahan baku serat daur ulang.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    tags: ['PHP', 'CodeIgniter', 'MySQL', 'Bootstrap'],
    githubUrl: 'https://github.com/ibelaia',
    isFeatured: false,
  },
  {
    id: '06',
    type: 'single',
    slug: 'interactive-portfolio-core',
    title: 'Interactive Portfolio Core',
    titleId: 'Portofolio Digital Interaktif',
    category: 'WEB',
    desc: 'Modern dual-view engineering portfolio equipped with custom state management, internationalization, and micro-animations.',
    descId: 'Situs portofolio berkinerja tinggi dengan arsitektur multi-bahasa, state kustom, dan animasi interaktif.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['Next.js 15', 'Tailwind v4', 'TypeScript', 'App Router'],
    githubUrl: 'https://github.com/ibelaia',
    isFeatured: true,
  },
].sort((a, b) => {
  if (a.isFeatured === b.isFeatured) return 0;
  return a.isFeatured ? -1 : 1;
});

export default function AllProjectsPage() {
  const { t } = useApp();
  const [projects] = useState<ProjectItem[]>(fallbackProjects);
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Menggunakan data lokal aman untuk mencegah error DNS di Vercel
    setLoading(false);
  }, []);

  const filterTabs = [
    { key: 'ALL', label: t('All Projects', 'Semua Proyek') },
    { key: 'WEB', label: 'Web Dev' },
    { key: 'MOBILE', label: 'Mobile' },
    { key: 'UIUX', label: 'UI/UX Design' },
    { key: 'WEB3', label: 'Web3' },
  ];

  const filteredProjects = projects.filter((item) => {
    const matchesCategory = selectedFilter === 'ALL' || item.category === selectedFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

      {/* Tombol Navigasi Kembali */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('Back to Home', 'Kembali ke Beranda')}</span>
        </Link>
      </div>

      {/* Header Halaman Arsip Proyek & Input Pencarian */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--card-border)]">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-mono text-accent">
            <Sparkles size={13} />
            <span>{t('PROJECT ARCHIVE', 'ARSIP LENGKAP')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
            {t('All Projects', 'Semua Proyek')}
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
            {t(
              'A complete archive of digital applications, interface designs, open-source utilities, and systems I have engineered.',
              'Koleksi lengkap aplikasi web, desain antarmuka, repositori perangkat lunak, dan sistem yang telah saya kembangkan.'
            )}
          </p>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search project or stack...', 'Cari proyek atau teknologi...')}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--card-bg)] border border-[var(--card-border)] focus:border-accent rounded-xl text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none transition-all shadow-inner"
          />
          <Search size={14} className="absolute left-3 top-3 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Filter Kategori Proyek */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedFilter === tab.key
                ? 'bg-accent text-slate-950 font-bold shadow-md shadow-accent/20'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Kartu Proyek */}
      {loading ? (
        <div className="py-24 text-center text-accent font-mono text-xs flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
          <span>Memuat data proyek...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-20 text-center text-[var(--text-muted)] font-mono text-xs bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl">
          {t('No projects match your search criteria.', 'Tidak ada proyek yang sesuai dengan kata kunci pencarian.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const targetUrl =
              proj.type === 'multi'
                ? `/projects/collection/${proj.slug}`
                : `/projects/${proj.slug}`;

            return (
              <div
                key={proj.id}
                className={`bg-[var(--card-bg)] border rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1.5 relative ${
                  proj.isFeatured ? 'border-accent shadow-accent/20 shadow-xl' : 'border-[var(--card-border)] hover:border-accent/30'
                }`}
              >
                {proj.isFeatured && (
                  <div className="absolute top-3 right-3 z-20 pointer-events-none">
                    <span className="p-1.5 rounded-xl bg-accent backdrop-blur-md border border-accent text-slate-950 flex items-center justify-center shadow-lg" title="Proyek Unggulan">
                      <Star size={13} className="fill-slate-950 text-slate-950" />
                    </span>
                  </div>
                )}

                <Link href={targetUrl} className="block">
                  <div className="relative w-full aspect-video bg-slate-950 overflow-hidden border-b border-[var(--card-border)]">
                    
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-accent">
                        {proj.category}
                      </span>
                      {proj.type === 'multi' && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/80 backdrop-blur-md text-[10px] font-mono text-white flex items-center gap-1">
                          <FolderArchive size={11} /> Multi
                        </span>
                      )}
                    </div>

                    <img
                      src={proj.image}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2 className="text-base font-bold text-[var(--text-main)] tracking-tight group-hover:text-accent transition-colors line-clamp-1">
                        {t(proj.title, proj.titleId || proj.title)}
                      </h2>
                      <ArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-accent transition-colors shrink-0 mt-0.5" />
                    </div>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed min-h-[48px] line-clamp-3">
                      {t(proj.desc, proj.descId || proj.desc)}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-[var(--card-border)]">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                <div className="px-5 sm:px-6 py-3.5 border-t border-[var(--card-border)] bg-white/[0.01] flex items-center justify-between text-xs font-mono">
                  <a
                    href={proj.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
                    <Code size={13} />
                    <span>Code</span>
                  </a>

                  <Link
                    href={targetUrl}
                    className="inline-flex items-center gap-1 font-semibold text-accent hover:opacity-80 transition-colors"
                  >
                    <span>
                      {proj.type === 'multi'
                        ? t('Open Collection', 'Buka Koleksi')
                        : t('View Details', 'Detail Studi Kasus')}
                    </span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}