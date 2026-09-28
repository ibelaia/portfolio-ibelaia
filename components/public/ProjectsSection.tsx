'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  ExternalLink,
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
  link?: string;
  isFeatured?: boolean;
}

const fallbackProjects: ProjectItem[] = [
  {
    id: '01',
    slug: 'e-commerce-dashboard',
    type: 'single',
    title: 'E-Commerce Dashboard',
    titleId: 'Dashboard E-Commerce',
    category: 'WEB',
    desc: 'A comprehensive analytics dashboard for tracking sales, users, and product metrics.',
    descId: 'Dashboard analitik komprehensif untuk memantau metrik penjualan, pengguna, dan performa produk.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tags: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
    link: '/projects/e-commerce-dashboard',
    isFeatured: true,
  },
  {
    id: '02',
    slug: 'uiux-design',
    type: 'multi',
    title: 'Food Delivery App',
    titleId: 'Aplikasi Pesan Makanan',
    category: 'UIUX',
    desc: 'A modern food delivery application with seamless ordering, tracking, and real-time updates.',
    descId: 'Aplikasi pemesanan makanan modern dengan pelacakan pesanan dan pembaruan instan.',
    image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
    tags: ['Figma', 'UI/UX', 'Prototyping'],
    link: '/projects/collection/uiux-design',
    isFeatured: false,
  },
  {
    id: '03',
    slug: 'interactive-portfolio-core',
    type: 'single',
    title: 'Personal Portfolio',
    titleId: 'Portofolio Pribadi',
    category: 'WEB',
    desc: 'A personal portfolio website to showcase my work, engineering skills, and experience.',
    descId: 'Situs web portofolio profesional untuk menampilkan karya, keahlian teknis, dan pengalaman.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    tags: ['Next.js', 'Tailwind', 'GSAP'],
    link: '/projects/interactive-portfolio-core',
    isFeatured: true,
  },
  {
    id: '04',
    slug: 'defi-liquidity-asset-protocol',
    type: 'single',
    title: 'DeFi Dashboard',
    titleId: 'Dashboard DeFi',
    category: 'WEB3',
    desc: 'A Web3 dashboard for monitoring assets, transactions, and decentralized finance analytics.',
    descId: 'Dashboard Web3 untuk memonitor aset kripto, transaksi jaringan, dan analitik finansial terdesentralisasi.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
    tags: ['Web3.js', 'Solidity', 'Tailwind'],
    link: '/projects/defi-liquidity-asset-protocol',
    isFeatured: false,
  },
  {
    id: '05',
    slug: 'jawatrip-mobile-travel-platform',
    type: 'single',
    title: 'Travel App (JawaTrip)',
    titleId: 'Aplikasi Travel JawaTrip',
    category: 'MOBILE',
    desc: 'Interactive booking application and itinerary planner designed with rich micro-interactions.',
    descId: 'Aplikasi pemesanan wisata dan perencana rencana perjalanan dengan antarmuka interaktif.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
    tags: ['UI/UX', 'Mobile App', 'Figma'],
    link: '/projects/jawatrip-mobile-travel-platform',
    isFeatured: false,
  },
  {
    id: '06',
    slug: 'releaf-paper-eco-store',
    type: 'single',
    title: 'Agricultural Media Platform',
    titleId: 'Platform Produk Pertanian',
    category: 'WEB',
    desc: 'Digital branding and eCommerce system crafted for sustainable and eco-friendly products.',
    descId: 'Branding digital dan platform e-commerce untuk produk ramah lingkungan berbasis daur ulang.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    tags: ['Full-Stack', 'MySQL', 'Node.js'],
    link: '/projects/releaf-paper-eco-store',
    isFeatured: true,
  },
].sort((a, b) => {
  if (a.isFeatured === b.isFeatured) return 0;
  return a.isFeatured ? -1 : 1;
});

export const ProjectsSection: React.FC = () => {
  const { t } = useApp();
  const [projects, setProjects] = useState<ProjectItem[]>(fallbackProjects);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Menggunakan data lokal cadangan yang aman untuk mencegah error DNS di Vercel
    setProjects(fallbackProjects);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev > 0 ? prev - 1 : projects.length - 1;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev < projects.length - 1 ? prev + 1 : 0;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 310;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="projects" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          {/* Badge Mini */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] text-accent font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {t('SELECTED PROJECTS', 'PROYEK PILIHAN')}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('Selected Projects', 'Proyek Pilihan')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t("Things I've built and proud of.", 'Karya yang telah saya bangun dan banggakan.')}
          </p>
        </div>

        {/* Tombol Navigasi Desktop Carousel */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Previous project"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Next project"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ================= TAMPILAN MOBILE SLIDER DENGAN CONTAINER CARD ================= */}
      <div className="md:hidden bg-[#090e1e]/70 border border-white/10 rounded-3xl p-4 backdrop-blur-xl shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-wider font-semibold text-accent">
            {t('SELECTED PROJECTS', 'PROYEK PILIHAN')}
          </span>

          <Link
            href="/projects"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1b4b]/80 border border-purple-500/30 text-purple-200 text-xs font-semibold"
          >
            <Layers size={13} />
            <span>{t('View all', 'Semua')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Scroll Container Mobile */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none"
        >
          {projects.map((proj, idx) => (
            <div
              key={proj.id}
              onClick={() => {
                setCurrentIndex(idx);
                scrollToCard(idx);
              }}
              className={`snap-center flex-shrink-0 w-[290px] bg-[#0c1226] border rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg relative ${
                proj.isFeatured ? 'border-accent shadow-accent/20 shadow-lg' : 'border-white/10'
              }`}
            >
              {/* Ikon Bintang Menggunakan bg-accent & border-accent */}
              {proj.isFeatured && (
                <div className="absolute top-3 right-3 z-20 pointer-events-none">
                  <span className="p-1.5 rounded-xl bg-accent backdrop-blur-md border border-accent text-slate-950 flex items-center justify-center shadow-lg" title="Proyek Unggulan">
                    <Star size={13} className="fill-slate-950 text-slate-950" />
                  </span>
                </div>
              )}

              <div>
                {/* Preview Image Container */}
                <div className="relative w-full h-44 bg-slate-900 overflow-hidden border-b border-white/10">
                  <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-mono text-accent">
                    {proj.id} / 06
                  </span>
                  <img
                    src={proj.image}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-white tracking-tight mb-2">
                    {t(proj.title, proj.titleId)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                    {t(proj.desc, proj.descId)}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px] font-mono text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="p-5 pt-0">
                <Link
                  href={proj.link || '#'}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:opacity-80 transition-colors"
                >
                  <span>{t('View Project', 'Lihat Proyek')}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Dots & Swipe Hint Mobile */}
        <div className="flex flex-col items-center justify-center pt-4 gap-2">
          <div className="flex items-center gap-2">
            {projects.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => {
                  setCurrentIndex(dotIdx);
                  scrollToCard(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === dotIdx ? 'w-5 bg-accent' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Slide ${dotIdx + 1}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            &lt; {t('SWIPE TO EXPLORE', 'GESER UNTUK JELAJAHI')} &gt;
          </span>
        </div>
      </div>

      {/* ================= TAMPILAN DESKTOP GRID 3x2 SESUAI FIGMA ================= */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className={`bg-[#090e1e]/80 border rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative ${
              proj.isFeatured ? 'border-accent shadow-accent/20 shadow-xl' : 'border-white/10 hover:border-accent/30'
            }`}
          >
            {proj.isFeatured && (
              <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span className="p-1.5 rounded-xl bg-accent backdrop-blur-md border border-accent text-slate-950 flex items-center justify-center shadow-lg" title="Proyek Unggulan">
                  <Star size={13} className="fill-slate-950 text-slate-950" />
                </span>
              </div>
            )}

            <div>
              {/* Header Preview Image */}
              <div className="relative w-full h-48 bg-slate-900 overflow-hidden border-b border-white/5">
                <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-accent">
                  {proj.id} / 06
                </span>
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Body Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-accent transition-colors">
                  {t(proj.title, proj.titleId)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[48px]">
                  {t(proj.desc, proj.descId)}
                </p>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-white/5">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded bg-slate-900/80 border border-white/10 text-[10px] font-mono font-medium text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="px-6 pb-6 pt-0">
              <Link
                href={proj.link || '#'}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:opacity-80 transition-colors"
              >
                <span>{t('View Project', 'Lihat Proyek')}</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Indikator Dots & Swipe Label Desktop di Bawah Grid */}
      <div className="hidden md:flex flex-col items-center justify-center pt-10 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-1.5 rounded-full bg-accent" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        </div>
        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          &lt; {t('SWIPE TO EXPLORE', 'GESER UNTUK JELAJAHI')} &gt;
        </span>
      </div>
    </section>
  );
};

export default ProjectsSection;