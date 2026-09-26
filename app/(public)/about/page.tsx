'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Code2, 
  FileDown, 
  User, 
  ArrowUpRight, 
  Terminal, 
  Cpu 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface AboutPublicData {
  badge_text: string;
  name: string;
  bio_paragraph_1: string;
  bio_paragraph_2: string;
  cv_url: string;
  contact_btn_link: string;
  edu_major: string;
  edu_institution: string;
  edu_period: string;
  focus_items: string[];
  focus_tag: string;
  interests_tags: string[];
  interests_tag: string;
  what_i_do_items: string[];
  what_i_do_tag: string;
}

const fallbackData: AboutPublicData = {
  badge_text: 'ABOUT ME',
  name: 'Ibe Laia',
  bio_paragraph_1: "I'm an Informatics student focusing on modern full-stack web development and clean system architectures. I bridge clean UI engineering with robust backend workflows, turning practical concepts into scalable, accessible digital solutions.",
  bio_paragraph_2: 'Passionate about modular engineering, system reliability, and continuous exploration in modern web ecosystems.',
  cv_url: '/assets/resume.pdf',
  contact_btn_link: '/contact',
  edu_major: 'Informatics',
  edu_institution: 'UPN "Veteran" Jawa Timur',
  edu_period: '2024 — Present',
  focus_items: ['Web Architecture', 'Scalable APIs', 'UI/UX Systems'],
  focus_tag: 'Production Ready',
  interests_tags: ['Full-Stack', 'System Design', 'Web3'],
  interests_tag: 'Exploration Track',
  what_i_do_items: ['Full-Stack Systems', 'Interface Design', 'Workflow Automation'],
  what_i_do_tag: 'Problem Solver',
};

export default function AboutPage() {
  const { t } = useApp();
  const [data, setData] = useState<AboutPublicData>(fallbackData);

  useEffect(() => {
    async function fetchSupabaseAbout() {
      try {
        const { data: res, error } = await supabase
          .from('about_settings')
          .select('*')
          .eq('id', 'default')
          .single();

        if (!error && res) {
          setData({
            badge_text: res.badge_text || fallbackData.badge_text,
            name: res.name || fallbackData.name,
            bio_paragraph_1: res.bio_paragraph_1 ?? fallbackData.bio_paragraph_1,
            bio_paragraph_2: res.bio_paragraph_2 ?? fallbackData.bio_paragraph_2,
            cv_url: res.cv_url || fallbackData.cv_url,
            contact_btn_link: res.contact_btn_link || fallbackData.contact_btn_link,
            edu_major: res.edu_major || fallbackData.edu_major,
            edu_institution: res.edu_institution || fallbackData.edu_institution,
            edu_period: res.edu_period || fallbackData.edu_period,
            focus_items: Array.isArray(res.focus_items) && res.focus_items.length > 0 ? res.focus_items : fallbackData.focus_items,
            focus_tag: res.focus_tag || fallbackData.focus_tag,
            interests_tags: Array.isArray(res.interests_tags) && res.interests_tags.length > 0 ? res.interests_tags : fallbackData.interests_tags,
            interests_tag: res.interests_tag || fallbackData.interests_tag,
            what_i_do_items: Array.isArray(res.what_i_do_items) && res.what_i_do_items.length > 0 ? res.what_i_do_items : fallbackData.what_i_do_items,
            what_i_do_tag: res.what_i_do_tag || fallbackData.what_i_do_tag,
          });
        }
      } catch (err) {
        console.error('Error loading public about data:', err);
      }
    }

    fetchSupabaseAbout();
  }, []);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">

      {/* Bento Grid Simetris & Proporsional */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-5 items-stretch">

        {/* KARTU KIRI (7 Kolom): Profil & Tombol Aksi */}
        <div className="md:col-span-7 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl flex flex-col justify-between transition-colors duration-250">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{data.badge_text}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight leading-snug mb-3">
              {data.name}
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4 whitespace-pre-line">
              {data.bio_paragraph_1}
            </p>

            {data.bio_paragraph_2 && (
              <p className="text-xs sm:text-sm text-[var(--text-muted)] opacity-80 leading-relaxed mb-6 whitespace-pre-line">
                {data.bio_paragraph_2}
              </p>
            )}
          </div>

          {/* Tombol Aksi: Download CV + About Me */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[var(--card-border)]">
            <a
              href={data.cv_url}
              target="_blank"
              rel="noreferrer"
              download
              className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center gap-2 transition-colors active:scale-95"
            >
              <FileDown size={14} />
              <span>{t('Download CV', 'Unduh CV')}</span>
            </a>

            <a
              href={data.contact_btn_link}
              className="px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <User size={14} />
              <span>{t('About Me', 'Tentang Saya')}</span>
              <ArrowUpRight size={14} className="text-slate-950" />
            </a>
          </div>
        </div>

        {/* KARTU KANAN (5 Kolom): 4 Mini Bento Box */}
        <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">

          {/* Box 1: Education */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center mb-3">
                <GraduationCap size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-1">
                {t('Education', 'Pendidikan')}
              </h2>
              <div className="text-sm font-bold text-[var(--text-main)] leading-tight">{data.edu_major}</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-1">{data.edu_institution}</div>
            </div>
            <span className="text-[10px] font-mono text-accent mt-3 block">
              {data.edu_period}
            </span>
          </div>

          {/* Box 2: Current Focus */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Terminal size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
                {t('Current Focus', 'Fokus Saat Ini')}
              </h2>
              <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                {data.focus_items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)] mt-3 block">
              {data.focus_tag}
            </span>
          </div>

          {/* Box 3: Technical Interests */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <Cpu size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
                {t('Interests', 'Minat Teknis')}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {data.interests_tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 mt-3 block">
              {data.interests_tag}
            </span>
          </div>

          {/* Box 4: Practical Output */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between transition-colors duration-250">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Code2 size={16} />
              </div>
              <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-bold mb-2">
                {t('What I Do', 'Bidang Garap')}
              </h2>
              <ul className="space-y-1 text-xs text-[var(--text-muted)]">
                {data.what_i_do_items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <span className="text-[10px] font-mono text-amber-400 mt-3 block">
              {data.what_i_do_tag}
            </span>
          </div>

        </div>

      </div>
    </main>
  );
}