'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Briefcase, 
  Trophy, 
  Code2, 
  Gauge, 
  MapPin 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const HeroSection: React.FC = () => {
  const { t } = useApp();

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      
      {/* ================= 1. VERSI MOBILE (< md) ================= */}
      <div className="md:hidden relative pt-12">
        <div className="relative bg-[#090e1f]/90 border border-white/10 rounded-3xl px-6 pt-16 pb-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
          
          {/* Avatar Melayang */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-cyan-400/40 via-purple-500/20 to-transparent shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#070913] border-2 border-[#090e1f]">
                <img
                  src="/assets/avatar.jpg"
                  alt="Ibe Laia"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#090e1f]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-400 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('Available for Internship & Projects', 'Terbuka untuk Magang & Proyek')}</span>
          </div>

          {/* Nama Karakter Kuat Mobile */}
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-1">
            Ibe Laia
          </h1>
          <p className="text-xs font-semibold text-purple-300 mb-3 font-mono">
            {t('Full-Stack Web Developer', 'Pengembang Web Full-Stack')}
          </p>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xs mb-6">
            {t(
              "Hi, I'm an Informatics student who loves building fast, practical web apps and solving real problems through clean code.",
              'Halo, saya mahasiswa Informatika yang antusias membangun aplikasi web yang cepat, fungsional, dan rapi.'
            )}
          </p>

          {/* 2 Metrik Ringkas */}
          <div className="grid grid-cols-2 gap-3 w-full p-3 rounded-xl bg-white/[0.02] border border-white/10 mb-6">
            <div className="flex items-center gap-2.5 px-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Briefcase size={15} />
              </div>
              <div className="text-left">
                <div className="text-lg font-black text-white">12+</div>
                <div className="text-[9px] font-mono text-slate-400 uppercase">{t('Projects', 'Proyek')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Trophy size={15} />
              </div>
              <div className="text-left">
                <div className="text-lg font-black text-white">5+</div>
                <div className="text-[9px] font-mono text-slate-400 uppercase">{t('Awards', 'Prestasi')}</div>
              </div>
            </div>
          </div>

          {/* Tombol Aksi Mobile */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <Link
              href="/projects"
              className="py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{t('Projects', 'Proyek')}</span>
              <ArrowRight size={13} />
            </Link>

            <Link
              href="/contact"
              className="py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{t('Contact', 'Kontak')}</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

        </div>
      </div>

      {/* ================= 2. VERSI DESKTOP / LAPTOP ================= */}
      <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Kolom Kiri */}
        <div className="md:col-span-7 flex flex-col items-start text-left space-y-5">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('Available for Internship & Freelance', 'Terbuka untuk Magang & Freelance')}</span>
          </div>

          <div>
            {/* Font Ibe Laia Lebih Hidup & Berkarakter */}
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
              Ibe Laia
            </h1>
            <p className="text-xl lg:text-2xl font-bold tracking-tight mt-1 text-slate-300">
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                Full-Stack
              </span>{' '}
              Developer
            </p>
          </div>

          <p className="text-sm lg:text-[15px] text-slate-300 leading-relaxed max-w-lg">
            {t(
              "I'm an Informatics student building scalable web applications and intuitive interfaces. I care about readable code, practical architecture, and continuous learning.",
              'Saya mahasiswa Informatika yang berfokus mengembangkan aplikasi web yang andal dan mudah digunakan. Terbiasa dengan arsitektur modular, kode yang terstruktur, dan terus mengeksplorasi teknologi baru.'
            )}
          </p>

          {/* 2 Counter Riil */}
          <div className="flex items-center gap-8 py-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Briefcase size={18} />
              </div>
              <div>
                <div className="text-2xl font-black text-white leading-none">12+</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                  {t('PROJECTS BUILT', 'PROYEK')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-white/10 pl-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Trophy size={18} />
              </div>
              <div>
                <div className="text-2xl font-black text-white leading-none">5+</div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
                  {t('ACHIEVEMENTS', 'PRESTASI')}
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-3 pt-1">
            <Link
              href="/projects"
              className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <span>{t('Explore My Work', 'Lihat Hasil Proyek')}</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-[#090e1f] hover:bg-white/5 border border-white/15 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all hover:-translate-y-0.5"
            >
              <span>{t('Contact Me', 'Hubungi Saya')}</span>
              <ArrowUpRight size={14} className="text-purple-400" />
            </Link>
          </div>

          {/* Status Bar Bawah */}
          <div className="flex flex-wrap items-center gap-5 pt-3 border-t border-white/10 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-cyan-400" />
              Surabaya, Indonesia
            </span>
            <span className="flex items-center gap-1.5">
              <Briefcase size={13} className="text-emerald-400" />
              {t('Internship / Freelance Ready', 'Siap Magang / Freelance')}
            </span>
          </div>

        </div>

        {/* Kolom Kanan: Foto Profil dengan Badge Animasi Bergerak */}
        <div className="md:col-span-5 flex justify-center md:justify-end">
          <div className="relative w-64 h-64 lg:w-72 lg:h-72">
            
            {/* Foto Profil Melingkar */}
            <div className="w-full h-full rounded-full p-2 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#070a16] border-2 border-white/10">
                <img
                  src="/assets/avatar.jpg"
                  alt="Ibe Laia"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>

            {/* Badge 1: Clean Code (Animasi Bergerak Naik-Turun Halus) */}
            <div className="absolute -top-2 -right-2 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#090e1f]/95 border border-white/15 shadow-xl animate-float-slow cursor-default select-none hover:border-purple-400/50 transition-colors">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Code2 size={14} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Clean Code</div>
                <div className="text-[10px] text-slate-400 font-mono">Architecture</div>
              </div>
            </div>

            {/* Badge 2: Scalable (Animasi Bergerak Berlawanan Ritme) */}
            <div className="absolute -bottom-2 -left-2 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#090e1f]/95 border border-white/15 shadow-xl animate-float-reverse cursor-default select-none hover:border-emerald-400/50 transition-colors">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Gauge size={14} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">Scalable</div>
                <div className="text-[10px] text-slate-400 font-mono">Performance</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;