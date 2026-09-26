'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Award, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Layers, 
  ShieldCheck,
  ExternalLink,
  Code2,
  Terminal
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const CertificatesSection: React.FC = () => {
  const { t } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const certificates = [
    {
      id: '01',
      issuer: 'freeCodeCamp',
      title: 'Responsive Web Design Certification',
      titleId: 'Sertifikasi Desain Web Responsif',
      year: '2024',
      credentialId: 'FCC-8921-X90',
      desc: 'Completed the Responsive Web Design Developer Certification covering HTML, CSS, Flexbox, CSS Grid, and responsive design principles.',
      descId: 'Menyelesaikan sertifikasi pengembang desain web responsif mencakup HTML, CSS, Flexbox, CSS Grid, dan prinsip desain ramah pengguna.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      icon: <Award size={16} className="text-cyan-400" />,
      link: 'https://www.freecodecamp.org/certification',
    },
    {
      id: '02',
      issuer: 'Google',
      title: 'Google IT Automation with Python',
      titleId: 'Otomatisasi IT Google dengan Python',
      year: '2024',
      credentialId: 'GGL-IT-7734-AU',
      desc: 'Completed automation training including Python scripting, system administration, and IT automation best practices.',
      descId: 'Menyelesaikan pelatihan otomasi sistem tingkat lanjut menggunakan Python, administrasi server, dan praktik terbaik IT.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      icon: <Terminal size={16} className="text-emerald-400" />,
      link: 'https://coursera.org/verify/professional-cert',
    },
    {
      id: '03',
      issuer: 'Udemy',
      title: 'The Complete JavaScript Course 2024',
      titleId: 'Kursus Komprehensif JavaScript 2024',
      year: '2024',
      credentialId: 'UC-9023-8812-JS',
      desc: 'Completed an in-depth JavaScript course covering ES6+, DOM manipulation, APIs, and modern JavaScript concepts.',
      descId: 'Menyelesaikan kursus intensif JavaScript modern mencakup ES6+, manipulasi DOM, integrasi API, dan pemrograman asinkron.',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      icon: <Code2 size={16} className="text-purple-400" />,
      link: 'https://www.udemy.com/certificate/UC-EXAMPLE',
    },
  ];

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev > 0 ? prev - 1 : certificates.length - 1;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev < certificates.length - 1 ? prev + 1 : 0;
      scrollToCard(nextIndex);
      return nextIndex;
    });
  };

  const scrollToCard = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = 295;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="certificates" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-400 font-medium mb-3 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{t('CERTIFICATES', 'SERTIFIKAT')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t('Certificates', 'Sertifikat')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {t(
              'Professional certifications and continuous learning milestones.',
              'Sertifikasi profesional dan tahapan pembelajaran berkelanjutan.'
            )}
          </p>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/certificates"
            className="px-4 py-2 rounded-full border border-cyan-500/30 bg-[#092524]/60 hover:bg-[#092524] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 mr-2 transition-all"
          >
            <span>{t('View All Certificates', 'Lihat Semua Sertifikat')}</span>
            <ArrowRight size={13} />
          </Link>

          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Previous certificate"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full border border-white/10 bg-[#090e1f] hover:bg-white/5 text-slate-300 hover:text-white transition-all"
            aria-label="Next certificate"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ================= TAMPILAN MOBILE CONTAINER ================= */}
      <div className="md:hidden bg-[#090e1e]/80 border border-white/10 rounded-3xl p-5 backdrop-blur-xl shadow-2xl relative pb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono tracking-wider font-semibold text-cyan-400">
            {t('CERTIFICATES', 'SERTIFIKAT')}
          </span>

          {/* Tombol View All ke Halaman Penuh */}
          <Link
            href="/certificates"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1e1b4b]/80 border border-purple-500/30 text-purple-200 text-xs font-semibold active:scale-95 transition-all shadow-sm"
          >
            <Layers size={13} />
            <span>{t('View all', 'Semua')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Scroll Horizontal Mobile */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-none"
        >
          {certificates.map((cert, idx) => (
            <div
              key={cert.id}
              onClick={() => {
                setCurrentIndex(idx);
                scrollToCard(idx);
              }}
              className="snap-center flex-shrink-0 w-[285px] bg-[#0c1226] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="relative w-full h-44 bg-slate-900 overflow-hidden border-b border-white/10 p-2">
                  <img
                    src={cert.image}
                    alt={cert.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-400">
                    ID: {cert.credentialId}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
                      {cert.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 font-semibold">
                      {cert.year}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-cyan-400 font-semibold block mb-1">
                    {cert.issuer}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight mb-2">
                    {t(cert.title, cert.titleId)}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {t(cert.desc, cert.descId)}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  href="/certificates"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>{t('View Certificate Details', 'Lihat Detail Sertifikat')}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Dots & Swipe Indicator */}
        <div className="flex flex-col items-center justify-center pt-5 gap-2.5">
          <div className="flex items-center gap-2">
            {certificates.map((_, dotIdx) => (
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

      {/* ================= DESKTOP GRID 3 KOLOM ================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-[#090e1e]/80 border border-white/10 hover:border-cyan-500/40 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
          >
            <div>
              <div className="relative w-full h-48 bg-[#0b1022] overflow-hidden border-b border-white/5 p-3">
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-500"
                />
                <span className="absolute bottom-5 right-5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-400">
                  {cert.credentialId}
                </span>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {cert.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                    {cert.year}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block mb-1">
                  {cert.issuer}
                </span>

                <h3 className="text-base font-bold text-white tracking-tight mb-2 group-hover:text-cyan-400 transition-colors">
                  {t(cert.title, cert.titleId)}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[50px]">
                  {t(cert.desc, cert.descId)}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link
                href="/certificates"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>{t('View Certificate', 'Lihat Sertifikat')}</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificatesSection;