'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Trophy, 
  Award, 
  GraduationCap, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  Maximize2,
  X
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface AchievementItem {
  id: string;
  category: 'COMPETITION' | 'HACKATHON' | 'ACADEMIC' | 'AWARDS';
  badge: { en: string; id: string };
  badgeColor: string;
  organizer: string;
  date: { en: string; id: string };
  location: string;
  title: { en: string; id: string };
  desc: { en: string; id: string };
  highlights: { en: string; id: string }[];
  image: string;
  imageCaption: { en: string; id: string };
  verifyUrl?: string;
  verifyLabel?: { en: string; id: string };
}

export default function AchievementsPage() {
  const { t, language } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'COMPETITION' | 'HACKATHON' | 'ACADEMIC'>('ALL');
  const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string; title: string } | null>(null);

  const [header, setHeader] = useState({
    badge_text: 'HONORS & RECOGNITION',
    title: 'Honors & Milestones',
    subtitle: 'A timeline of competitive awards, hackathon recognitions, and academic milestones achieved throughout my software engineering journey.'
  });

  const [achievementsData, setAchievementsData] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const isIndo = language === 'ID';

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const { data: headerData } = await supabase
          .from('achievements_header')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (headerData) {
          setHeader({
            badge_text: headerData.badge_text || 'HONORS & RECOGNITION',
            title: headerData.title || 'Honors & Milestones',
            subtitle: headerData.subtitle || 'A timeline of competitive awards, hackathon recognitions, and academic milestones achieved throughout my software engineering journey.'
          });
        }

        const { data: dbData } = await supabase
          .from('achievements')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbData && dbData.length > 0) {
          const mapped: AchievementItem[] = dbData.map((item: any) => {
            let cat: 'COMPETITION' | 'HACKATHON' | 'ACADEMIC' | 'AWARDS' = 'COMPETITION';
            let color = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
            
            const badgeLower = (item.badge || '').toLowerCase();
            if (badgeLower.includes('hackathon')) {
              cat = 'HACKATHON';
              color = 'text-accent border-accent/30 bg-accent/10';
            } else if (badgeLower.includes('academic') || badgeLower.includes('akademik')) {
              cat = 'ACADEMIC';
              color = 'text-purple-400 border-purple-500/30 bg-purple-500/10';
            } else if (badgeLower.includes('award') || badgeLower.includes('finalist')) {
              cat = 'AWARDS';
              color = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
            }

            const highlightsArr = Array.isArray(item.highlights) 
              ? item.highlights.map((h: string) => ({ en: h, id: h })) 
              : [];

            return {
              id: item.id,
              category: cat,
              badge: { en: item.badge, id: item.badge },
              badgeColor: color,
              organizer: item.location || 'Surabaya, Jawa Timur',
              date: { en: item.date_str || '2026', id: item.date_str || '2026' },
              location: item.location || 'Indonesia',
              title: { en: item.title, id: item.title },
              desc: { en: item.description, id: item.description },
              highlights: highlightsArr,
              image: item.image_url || '/placeholder.svg',
              imageCaption: { 
                en: 'Documentation photo of achievement recognition.', 
                id: 'Dokumentasi foto penghargaan.' 
              },
              verifyUrl: item.credential_url || '',
              verifyLabel: { en: 'Verify Credential', id: 'Verifikasi Sertifikat' }
            };
          });

          setAchievementsData(mapped);
        }
      } catch (err) {
        console.warn('Error fetching achievements:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAchievements();
  }, []);

  const filterTabs = [
    { key: 'ALL', label: t('All Milestones', 'Semua Milestone') },
    { key: 'COMPETITION', label: t('Competitions', 'Kompetisi') },
    { key: 'HACKATHON', label: 'Hackathon' },
    { key: 'ACADEMIC', label: t('Academic', 'Akademik') },
  ];

  const filteredItems = achievementsData.filter(
    (item) => filter === 'ALL' || item.category === filter
  );

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Tombol Back to Home */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('Back to Home', 'Kembali ke Beranda')}</span>
        </Link>
      </div>

      {/* Header Halaman */}
      <div className="pb-5 mb-4 border-b border-[var(--card-border)]">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-2">
          <Sparkles size={13} />
          <span>{header.badge_text}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          {header.title}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
          {header.subtitle}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-3 mb-6 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-accent text-slate-950 font-bold shadow-md shadow-accent/20'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline List Container */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[var(--text-muted)]">Memuat achievements...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-[var(--text-muted)] border border-dashed border-[var(--card-border)] rounded-2xl">
          Belum ada achievement tercatat di database.
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l border-[var(--card-border)] space-y-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative group">
              
              {/* Titik Penanda Timeline */}
              <span className="absolute -left-[31px] sm:-left-[39px] top-6 w-3.5 h-3.5 rounded-full bg-[var(--bg-primary)] border-2 border-accent group-hover:scale-125 transition-transform" />

              {/* Kartu Pencapaian */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-accent/30 rounded-2xl p-5 sm:p-6 backdrop-blur-xl transition-all duration-300">
                
                {/* Header Kartu: Badge & Meta Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-[var(--card-border)] text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-mono font-medium flex items-center gap-1.5 ${item.badgeColor}`}>
                      {item.category === 'COMPETITION' && <Trophy size={12} />}
                      {item.category === 'HACKATHON' && <Award size={12} />}
                      {item.category === 'ACADEMIC' && <GraduationCap size={12} />}
                      <span>{isIndo ? item.badge.id : item.badge.en}</span>
                    </span>
                    <span className="text-[var(--text-muted)] font-mono text-[11px] hidden sm:inline">
                      {item.organizer}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[var(--text-muted)] font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {isIndo ? item.date.id : item.date.en}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {item.location}
                    </span>
                  </div>
                </div>

                {/* Konten Utama: Teks Deskripsi & Thumbnail Dokumentasi */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Kolom Teks (7 Kolom) */}
                  <div className="lg:col-span-7 space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] tracking-tight">
                      {isIndo ? item.title.id : item.title.en}
                    </h2>

                    <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                      {isIndo ? item.desc.id : item.desc.en}
                    </p>

                    {/* Highlights Bullet */}
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider block">
                          {t('KEY HIGHLIGHTS & OUTPUT:', 'POIN KUNCI & LUARAN:')}
                        </span>
                        {item.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                            <CheckCircle2 size={14} className="text-accent shrink-0 mt-0.5" />
                            <span>{isIndo ? h.id : h.en}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tombol Tautan Verifikasi / Bukti */}
                    {item.verifyUrl && (
                      <div className="pt-3">
                        <a
                          href={item.verifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:opacity-80 transition-colors"
                        >
                          <span>
                            {item.verifyLabel
                              ? isIndo ? item.verifyLabel.id : item.verifyLabel.en
                              : t('Verify Credential', 'Verifikasi Sertifikat')}
                          </span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Kolom Foto Dokumentasi dengan Preview Klik (5 Kolom) */}
                  <div className="lg:col-span-5">
                    <div
                      onClick={() =>
                        setSelectedImage({
                          src: item.image,
                          caption: isIndo ? item.imageCaption.id : item.imageCaption.en,
                          title: isIndo ? item.title.id : item.title.en,
                        })
                      }
                      className="group/img relative h-48 sm:h-52 w-full rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-950 cursor-pointer shadow-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.title.en}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90 group-hover/img:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs font-mono text-white backdrop-blur-[2px]">
                        <Maximize2 size={14} />
                        <span>{t('Click to Expand', 'Klik untuk Perbesar')}</span>
                      </div>
                    </div>
                    <span className="block text-[11px] text-[var(--text-muted)] font-mono mt-1.5 text-right">
                      {t('Documentation Photo', 'Foto Dokumentasi')}
                    </span>
                  </div>

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal Saat Foto Diklik */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-4 py-3 bg-[var(--bg-primary)] border-b border-[var(--card-border)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-main)] truncate max-w-md">
                {selectedImage.title}
              </span>
              <button
                onClick={() => setSelectedImage(null)}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Gambar Besar */}
            <div className="max-h-[70vh] w-full overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-h-[70vh] w-full object-contain"
              />
            </div>

            {/* Keterangan Gambar */}
            <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {selectedImage.caption}
              </p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}