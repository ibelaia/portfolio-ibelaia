'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Code2, 
  Palette, 
  Database, 
  Cpu, 
  User, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ServiceItem {
  id: string;
  title: string;
  titleUpper: string;
  desc: string;
  tags: string[];
  icon: React.ReactNode;
  watermark: string;
}

export default function ServicesPage() {
  const { t } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [header, setHeader] = useState({
    badge_text: 'MY SERVICES',
    title: 'My Services',
    subtitle: 'Things I can build, design, and contribute to.'
  });

  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function fetchServicesData() {
      try {
        const { data: headerData } = await supabase
          .from('services_header')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (headerData) {
          setHeader({
            badge_text: headerData.badge_text || 'MY SERVICES',
            title: headerData.title || 'My Services',
            subtitle: headerData.subtitle || 'Things I can build, design, and contribute to.'
          });
        }

        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (servicesData && servicesData.length > 0) {
          const mapped = servicesData.map((item: any, idx: number) => {
            const numStr = item.badge || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`);
            const upperTitle = (item.title || '').toUpperCase();
            
            let iconElement = <Code2 size={18} className="text-accent" />;
            let water = '{ }';
            if (upperTitle.includes('UI') || upperTitle.includes('DESIGN')) {
              iconElement = <Palette size={18} className="text-emerald-400" />;
              water = 'UI';
            } else if (upperTitle.includes('DATABASE') || upperTitle.includes('BACKEND')) {
              iconElement = <Database size={18} className="text-purple-400" />;
              water = 'SQL';
            } else if (upperTitle.includes('WEB3') || upperTitle.includes('BLOCKCHAIN')) {
              iconElement = <Cpu size={18} className="text-amber-400" />;
              water = 'ETH';
            }

            return {
              id: numStr,
              title: item.title,
              titleUpper: upperTitle,
              desc: item.description,
              tags: Array.isArray(item.tags) ? item.tags : [],
              icon: iconElement,
              watermark: water
            };
          });
          setServices(mapped);
        }
      } catch (err) {
        console.warn('Error fetching public services:', err);
      }
    }

    fetchServicesData();
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : services.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < services.length - 1 ? prev + 1 : 0));
  };

  const handleMobileScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, offsetWidth } = scrollRef.current;
      const index = Math.round(scrollLeft / (offsetWidth * 0.75));
      setActiveIndex(Math.min(index, services.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.78;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  if (services.length === 0) return null;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* DESKTOP HEADER */}
      <div className="hidden md:flex items-end justify-between mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{header.badge_text}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-[var(--text-main)] tracking-tight">
            {header.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            {header.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrev} aria-label="Previous service" className="w-9 h-9 rounded-full border border-[var(--card-border)] bg-transparent hover:border-accent hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-all cursor-pointer">
            <ArrowLeft size={15} />
          </button>
          <button onClick={handleNext} aria-label="Next service" className="w-9 h-9 rounded-full border border-[var(--card-border)] bg-transparent hover:border-accent hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-all cursor-pointer">
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="block md:hidden text-center my-4">
        <h1 className="text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
          {header.title}
        </h1>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs mx-auto">
          {header.subtitle}
        </p>
      </div>

      {/* DESKTOP CARDS GRID */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((item, index) => {
            const isSelected = activeIndex === index;

            return (
              <div
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between min-h-[280px] ${
                  isSelected
                    ? 'bg-[var(--card-bg)] border-accent shadow-lg ring-1 ring-accent/30'
                    : 'bg-[var(--card-bg)] opacity-80 border-[var(--card-border)] hover:opacity-100 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-[var(--card-border)] flex items-center justify-center">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      {item.id}
                    </span>
                  </div>

                  <h2 className="text-xs font-mono font-bold tracking-wider text-[var(--text-main)] mb-2 leading-snug">
                    {item.titleUpper}
                  </h2>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--card-border)] flex flex-wrap gap-1 mt-4">
                  {Array.isArray(item.tags) && item.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[9px] font-mono text-[var(--text-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE CARDS CAROUSEL */}
      <div className="block md:hidden">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[30px] p-5 backdrop-blur-xl shadow-2xl relative transition-colors duration-250">
          
          <div className="flex justify-end mb-3">
            <Link
              href="/services/all"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium transition-all shadow-md active:scale-95"
            >
              <User size={12} className="text-accent" />
              <span>{t('View all', 'Lihat semua')}</span>
              <ArrowRight size={12} className="text-accent" />
            </Link>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="w-20 h-[1px] bg-[var(--card-border)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-2" />
            <div className="w-20 h-[1px] bg-[var(--card-border)]" />
          </div>

          <div
            ref={scrollRef}
            onScroll={handleMobileScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 px-1"
          >
            {services.map((item, index) => {
              const isSelected = activeIndex === index;

              return (
                <div
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`snap-start shrink-0 w-[82%] rounded-3xl p-5 relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[320px] ${
                    isSelected
                      ? 'bg-[var(--card-bg)] border-2 border-accent shadow-xl'
                      : 'bg-[var(--card-bg)] border border-[var(--card-border)] opacity-55'
                  }`}
                >
                  <span className="absolute -right-2 top-8 text-7xl font-mono font-black text-[var(--text-main)]/[0.04] select-none pointer-events-none">
                    {item.watermark}
                  </span>

                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-[var(--card-border)] flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs font-mono tracking-wider text-[var(--text-muted)]">
                        {item.id} <span className="text-slate-600">/ {services.length < 10 ? `0${services.length}` : services.length}</span>
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[var(--text-main)] tracking-tight mb-2.5">
                      {item.title}
                    </h2>

                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-[var(--card-border)] flex flex-wrap gap-1.5 mt-5">
                    {Array.isArray(item.tags) && item.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-black/20 border border-[var(--card-border)] text-[9px] font-mono text-[var(--text-muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

    </main>
  );
}