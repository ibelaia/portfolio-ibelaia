'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  FolderGit2, 
  Award, 
  MapPin, 
  Briefcase,
  Code2,
  Terminal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HomeData {
  title: string;
  subtitle: string;
  highlight_text: string;
  description: string;
  profile_photo_url: string;
  projects_completed: number;
  happy_clients: number;
  years_experience: number;
  availability_status: string;
  location: string;
  site_tagline: string;
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>({
    title: 'Ibe Laia , S.Kom',
    subtitle: 'Building the future of digital products',
    highlight_text: 'Full-Stack Developer',
    description: 'I build modern, secure, and scalable web applications with clean code and exceptional user experience.',
    profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    projects_completed: 0,
    happy_clients: 0,
    years_experience: 8,
    availability_status: 'Available for Hire',
    location: 'Surabaya, Indonesia',
    site_tagline: 'Software Engineer & Full-Stack Developer'
  });

  useEffect(() => {
    async function fetchPublicContent() {
      // 1. Ambil data dari home_settings
      const { data: homeSettings } = await supabase
        .from('home_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      // 2. Ambil data dari general_settings
      const { data: generalSettings } = await supabase
        .from('general_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      // 3. Hitung jumlah total projects secara real-time dari database
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // 4. Hitung jumlah total achievements secara real-time dari database
      const { count: achievementCount } = await supabase
        .from('achievements')
        .select('*', { count: 'exact', head: true });

      setData((prev) => ({
        ...prev,
        title: homeSettings?.title || prev.title,
        subtitle: homeSettings?.subtitle || prev.subtitle,
        highlight_text: homeSettings?.highlight_text || prev.highlight_text,
        description: homeSettings?.description || prev.description,
        profile_photo_url: homeSettings?.profile_photo_url || prev.profile_photo_url,
        years_experience: homeSettings?.years_experience ?? prev.years_experience,
        
        // Masukkan hasil hitung otomatis dari tabel Supabase
        projects_completed: projectCount ?? homeSettings?.projects_completed ?? prev.projects_completed,
        happy_clients: achievementCount ?? homeSettings?.happy_clients ?? prev.happy_clients,

        // Data dari General Settings
        availability_status: generalSettings?.availability_status || prev.availability_status,
        location: generalSettings?.location || prev.location,
        site_tagline: generalSettings?.site_tagline || prev.site_tagline,
      }));
    }

    fetchPublicContent();
  }, []);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Container Card Utama Pembungkus Hero Section */}
      <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden space-y-8 transition-colors duration-250">
        
        {/* Efek Cahaya Ambient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* 1. Foto Profil */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center relative">
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72">
              
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent/30 to-purple-500/30 blur-xl -z-10" />

              <div className="w-full h-full rounded-full overflow-hidden border-2 border-accent/30 bg-[var(--bg-primary)] shadow-2xl">
                <img 
                  src={data.profile_photo_url} 
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -top-1 -right-2 sm:-top-2 sm:-right-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md shadow-xl flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                <Code2 size={12} className="text-purple-400" />
                <div>
                  <p className="font-bold leading-tight">Clean Code</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-500">Architecture</p>
                </div>
              </div>

              <div className="absolute -bottom-1 -left-2 sm:-bottom-2 sm:-left-4 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] backdrop-blur-md shadow-xl flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono">
                <Terminal size={12} className="text-accent" />
                <div>
                  <p className="font-bold leading-tight">Scalable</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-500">Performance</p>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Bagian Teks & Konten */}
          <div className="order-2 lg:order-1 lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
            
            <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{data.site_tagline}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {data.title}
              </h1>
              <p className="text-base sm:text-xl lg:text-2xl font-bold text-accent font-mono tracking-wide">
                {data.highlight_text} & Achievements
              </p>
            </div>

            <p className="text-xs sm:text-sm lg:text-base text-[var(--text-muted)] max-w-xl leading-relaxed mx-auto lg:mx-0">
              {data.description}
            </p>

            {/* Statistik Otomatis Real-time dari Database */}
            <div className="grid grid-cols-2 gap-3 pt-1 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs font-mono shadow-inner">
                <FolderGit2 size={18} className="text-emerald-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm sm:text-base block">{data.projects_completed}+</span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Projects</span>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--card-border)] text-xs font-mono shadow-inner">
                <Award size={18} className="text-purple-400 shrink-0" />
                <div className="text-left">
                  <span className="font-bold text-sm sm:text-base block">{data.happy_clients}+</span>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Achievements</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link
                href="/projects"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Explore My Work</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--card-border)] font-semibold text-xs flex items-center justify-center transition-all"
              >
                Contact Me ↗
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs font-mono text-[var(--text-muted)] pt-2 border-t border-[var(--card-border)]">
              <span className="flex items-center gap-1.5">
                <MapPin size={12} className="text-[var(--text-muted)]" /> {data.location}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Briefcase size={12} className="text-[var(--text-muted)]" /> {data.availability_status}
              </span>
            </div>

          </div>

        </div>

      </div>

    </main>
  );
}