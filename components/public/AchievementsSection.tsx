'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Presentation, 
  GraduationCap, 
  GitPullRequest, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Layers 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const AchievementsSection: React.FC = () => {
  const { t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const achievements = [
    {
      id: '01',
      title: 'Web Development Competition',
      titleId: 'Kompetisi Web Development',
      badge: '1st Place',
      badgeId: 'Juara 1',
      year: '2024',
      desc: 'Secured 1st place in a university-level web development competition focusing on accessible UI & high performance.',
      descId: 'Meraih Juara 1 pada kompetisi web tingkat universitas dengan fokus aksesibilitas UI dan performa tinggi.',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      icon: <Trophy size={16} className="text-purple-300" />,
    },
    {
      id: '02',
      title: 'Hackathon Finalist',
      titleId: 'Finalis Hackathon',
      badge: 'Finalist',
      badgeId: 'Finalis',
      year: '2024',
      desc: 'Built and presented a digital solution in a competitive 48-hour hackathon sprint.',
      descId: 'Membangun dan mempresentasikan solusi platform digital dalam kompetisi hackathon 48 jam.',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      icon: <Presentation size={16} className="text-cyan-300" />,
    },
    {
      id: '03',
      title: 'Academic Excellence',
      titleId: 'Prestasi Akademik',
      badge: 'Academic',
      badgeId: 'Akademik',
      year: '2023',
      desc: 'Recognized for strong academic performance and consistent technical development throughout coursework.',
      descId: 'Apresiasi atas performa akademik unggul dan konsistensi pengembangan teknis selama perkuliahan.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      icon: <GraduationCap size={16} className="text-emerald-300" />,
    },
    {
      id: '04',
      title: 'Open Source Contributor',
      titleId: 'Kontributor Open Source',
      badge: 'Contributor',
      badgeId: 'Kontributor',
      year: '2023',
      desc: 'Contributed to collaborative developer toolkits, reusable components, and community software.',
      descId: 'Berkontribusi pada proyek sumber terbuka, komponen modular, dan perangkat komunitas developer.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      icon: <GitPullRequest size={16} className="text-amber-300" />,
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev > 0 ? prev - 1 : achievements.length - 1;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev < achievements.length - 1 ? prev + 1 : 0;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 290;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="achievements" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-400 font-medium mb-3 font-mono">
            <Trophy size={13} className="text-cyan-400" />
            <span>{t('ACHIEVEMENTS', 'PRESTASI')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('Achievements', 'Prestasi')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {t(
              'A track record of technical excellence, competitive problem-solving, and academic distinction.',
              'Rekam jejak keunggulan teknis, pemecahan masalah kompetitif, dan pencapaian akademik.'
            )}
          </p>
        </div>

        {/* Tombol Navigasi Desktop Carousel */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/achievements"
            className="px-4 py-2 rounded-full border border-purple-500/30 bg-[#1e1b4b]/60 hover:bg-[#1e1b4b] text-purple-200 text-xs font-semibold flex items-center gap-1.5 mr-2 transition-all"
          >
            <span>{t('View All Achievements', 'Lihat Semua Prestasi')}</span>
            <ArrowRight size={13} />
          </Link>

          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Previous achievement"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Next achievement"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ================= TAMPILAN MOBILE CONTAINER ================= */}
      <div className="md:hidden bg-[#090e1e]/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl relative pb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-wider font-semibold text-cyan-400">
            {t('ACHIEVEMENTS', 'PRESTASI')}
          </span>

          {/* Tombol View All ke Halaman Baru */}
          <Link
            href="/achievements"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1b4b]/80 border border-purple-500/30 text-purple-200 text-xs font-semibold active:scale-95 transition-all shadow-sm"
          >
            <Layers size={13} />
            <span>{t('View all', 'Semua')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Horizontal Card Slider Mobile */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none"
        >
          {achievements.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setCurrentIndex(idx);
                scrollToCard(idx);
              }}
              className="snap-center flex-shrink-0 w-[280px] bg-[#0c1226] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="relative w-full h-40 bg-slate-900 overflow-hidden border-b border-white/10">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1e1b4b]/80 border border-purple-500/30 text-[10px] font-mono text-purple-200 font-semibold">
                      {item.year}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight mb-2">
                    {t(item.title, item.titleId)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {t(item.desc, item.descId)}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-[10px] font-mono text-slate-300">
                  <Trophy size={11} className="text-purple-400" />
                  {t(item.badge, item.badgeId)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots & Swipe Hint Mobile */}
        <div className="flex flex-col items-center justify-center pt-5 gap-2.5">
          <div className="flex items-center gap-2">
            {achievements.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => {
                  setCurrentIndex(dotIdx);
                  scrollToCard(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === dotIdx ? 'w-5 bg-cyan-400' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
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

      {/* ================= TAMPILAN DESKTOP GRID 4 KOLOM ================= */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {achievements.map((item) => (
          <div
            key={item.id}
            className="bg-[#090e1e]/80 border border-white/10 hover:border-cyan-500/40 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className="relative w-full h-36 bg-slate-900 overflow-hidden border-b border-white/5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                    {item.year}
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-1">
                  {t(item.badge, item.badgeId)}
                </span>

                <h3 className="text-sm font-bold text-white tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
                  {t(item.title, item.titleId)}
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {t(item.desc, item.descId)}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-0">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AchievementsSection;