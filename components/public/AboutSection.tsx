'use client';

import React from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  Code2, 
  Compass, 
  MapPin, 
  Download, 
  User, 
  ArrowRight 
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { useApp } from '@/context/AppContext';

export const AboutSection: React.FC = () => {
  const { t } = useApp();

  return (
    <section id="about" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Kolom Kiri: Kartu Utama Narasi Profil */}
        <div className="lg:col-span-6 flex">
          <GlassCard className="w-full flex flex-col justify-between p-6 sm:p-8 bg-[#090e1e]/80 border-white/10 rounded-2xl shadow-xl backdrop-blur-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-400 font-medium mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {t('About Me', 'Tentang Saya')}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                {t('About Me', 'Tentang Saya')}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
                {t(
                  'I am a software engineer focused on building robust, scalable applications. With a background in structural architecture, I bring a methodical approach to software design, ensuring clean code, resilient systems, and intuitive user experiences. My passion lies in solving complex problems through elegant, technical solutions.',
                  'Saya adalah seorang software engineer yang berfokus membangun aplikasi yang tangguh dan scalable. Dengan pemahaman arsitektur terstruktur, saya menerapkan pendekatan metodis dalam perancangan perangkat lunak untuk menghasilkan kode bersih, sistem yang andal, dan antarmuka yang intuitif. Fokus saya adalah menyelesaikan tantangan kompleks melalui solusi teknis yang elegan.'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-white/5">
              <a
                href="/assets/resume.pdf"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Download size={14} />
                {t('Download CV', 'Unduh CV')}
                <ArrowRight size={13} />
              </a>

              <Link
                href="/about"
                className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <User size={14} />
                {t('About Me', 'Tentang Saya')}
                <ArrowRight size={13} />
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Kolom Kanan: 4 Kotak Bento Grid */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Bento 1: Education */}
          <GlassCard className="p-5 bg-[#090e1e]/80 border-white/10 rounded-2xl flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mb-3">
              <GraduationCap size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-1">{t('Education', 'Pendidikan')}</h3>
              <p className="text-xs font-medium text-cyan-400">{t('Informatics', 'Informatika')}</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">UPN &quot;Veteran&quot; Jawa Timur</p>
              <span className="inline-block mt-2 text-[10px] font-mono text-slate-500">
                {t('Undergraduate · 2024 — Present', 'Sarjana · 2024 — Sekarang')}
              </span>
            </div>
          </GlassCard>

          {/* Bento 2: Current Focus */}
          <GlassCard className="p-5 bg-[#090e1e]/80 border-white/10 rounded-2xl flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mb-3">
              <Code2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">{t('Current Focus', 'Fokus Saat Ini')}</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400">•</span> {t('Web Development', 'Pengembangan Web')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400">•</span> {t('UI/UX Design', 'Desain UI/UX')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">•</span> {t('Digital Products', 'Produk Digital')}
                </li>
              </ul>
            </div>
          </GlassCard>

          {/* Bento 3: Interests */}
          <GlassCard className="p-5 bg-[#090e1e]/80 border-white/10 rounded-2xl flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mb-3">
              <Compass size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">{t('Interests', 'Minat')}</h3>
              <div className="flex flex-wrap gap-1.5">
                {['Web Development', 'UI/UX', 'System Design', 'WEB 3'].map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Bento 4: What I Do */}
          <GlassCard className="p-5 bg-[#090e1e]/80 border-white/10 rounded-2xl flex flex-col justify-between">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mb-3">
              <MapPin size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white mb-2">{t('What I Do', 'Bidang Keahlian')}</h3>
              <ul className="text-xs text-slate-300 space-y-1.5 font-mono">
                <li className="flex items-center gap-1.5">
                  <span className="text-cyan-400">•</span> {t('Build Web Apps', 'Membangun Web App')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-purple-400">•</span> {t('Design Interfaces', 'Merancang Antarmuka')}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-emerald-400">•</span> {t('Solve Problems', 'Menyelesaikan Masalah')}
                </li>
              </ul>
            </div>
          </GlassCard>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;