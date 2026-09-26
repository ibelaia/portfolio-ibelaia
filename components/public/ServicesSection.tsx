'use client';

import React, { useState, useRef } from 'react';
import { 
  Code, 
  Palette, 
  Database, 
  Boxes, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Layers,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const ServicesSection: React.FC = () => {
  const { t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const services = [
    {
      id: '01',
      title: 'Web Development',
      titleId: 'Pengembangan Web',
      desc: 'Building responsive websites and e-commerce experiences with modern web technologies.',
      descId: 'Membangun website responsif dan toko daring modern dengan teknologi web terkini.',
      icon: <Code size={18} className="text-cyan-400" />,
      tags: ['HTML', 'CSS', 'JavaScript', 'E-COMMERCE'],
    },
    {
      id: '02',
      title: 'UI/UX Design',
      titleId: 'Desain UI/UX',
      desc: 'Designing intuitive wireframes, mockups, and high-fidelity user interface prototypes.',
      descId: 'Merancang wireframe yang intuitif, mockup estetis, serta purwarupa antarmuka interaktif.',
      icon: <Palette size={18} className="text-emerald-400" />,
      tags: ['FIGMA', 'WIREFRAME', 'PROTOTYPE'],
    },
    {
      id: '03',
      title: 'Database & Backend',
      titleId: 'Basis Data & Backend',
      desc: 'Developing scalable backend architectures, RESTful APIs, and optimized databases.',
      descId: 'Mengembangkan arsitektur backend andal, API RESTful, serta optimasi basis data.',
      icon: <Database size={18} className="text-cyan-400" />,
      tags: ['MYSQL', 'DATABASE', 'API'],
    },
    {
      id: '04',
      title: 'Web3 Development',
      titleId: 'Pengembangan Web3',
      desc: 'Exploring smart contract interactions, dApps integration, and decentralized ecosystems.',
      descId: 'Mengeksplorasi integrasi dApps, interaksi smart contract, dan ekosistem terdesentralisasi.',
      icon: <Boxes size={18} className="text-purple-400" />,
      tags: ['SOLIDITY', 'WEB3', 'SMART CONTRACTS'],
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev > 0 ? prev - 1 : services.length - 1;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev < services.length - 1 ? prev + 1 : 0;
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
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-400 font-medium mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {t('MY SERVICES', 'LAYANAN SAYA')}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('My Services', 'Layanan Saya')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('Things I can build, design, and contribute to.', 'Bidang keahlian yang dapat saya bangun, rancang, dan kontribusikan.')}
          </p>
        </div>

        {/* Tombol Navigasi Desktop Carousel */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Previous service"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Next service"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#090e1e]/60 border border-white/10 rounded-3xl p-4 sm:p-8 backdrop-blur-xl shadow-2xl relative">
        {/* Mobile View All Trigger */}
        <div className="flex sm:hidden justify-end mb-4">
          <button 
            onClick={() => setShowAllModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e1b4b]/80 border border-purple-500/30 text-purple-200 text-xs font-semibold active:scale-95 transition-all"
          >
            <Layers size={13} />
            <span>{t('View all', 'Lihat semua')}</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Carousel Card List */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible"
        >
          {services.map((item, idx) => {
            const isActive = currentIndex === idx;
            return (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  scrollToCard(idx);
                }}
                className={`snap-center flex-shrink-0 w-[270px] sm:w-auto p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#0e162f] border-2 border-cyan-400/80 shadow-[0_0_25px_rgba(6,182,212,0.2)]'
                    : 'bg-[#090e1e] border border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="font-mono text-xs text-slate-400 tracking-wider">
                      {item.id} <span className="text-slate-600">/ 04</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white uppercase tracking-wide mb-2">
                    {t(item.title, item.titleId)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed min-h-[55px]">
                    {t(item.desc, item.descId)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-6 mt-4 border-t border-white/5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-slate-900/90 border border-white/10 text-[9px] font-mono font-medium text-slate-300 tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex flex-col items-center justify-center pt-6 gap-2">
          <div className="flex items-center gap-2">
            {services.map((_, dotIdx) => (
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

      {/* ================= MODAL LIHAT SEMUA LAYANAN (KHUSUS MOBILE) ================= */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#090e1f] border border-white/15 rounded-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-cyan-400" />
                <h3 className="text-base font-bold text-white">
                  {t('All Services', 'Semua Layanan')}
                </h3>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {services.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase">
                        {t(item.title, item.titleId)}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{item.id}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t(item.desc, item.descId)}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-mono text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ServicesSection;