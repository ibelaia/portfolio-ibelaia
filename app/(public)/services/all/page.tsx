'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Code2, 
  Palette, 
  Database, 
  Cpu, 
  Layers 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  icon: React.ReactNode;
}

export default function AllServicesPage() {
  const { t } = useApp();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllServices() {
      try {
        const { data } = await supabase
          .from('services')
          .select('*')
          .order('created_at', { ascending: true });

        if (data && data.length > 0) {
          const mapped = data.map((item: any, idx: number) => {
            const numStr = item.badge || (idx < 9 ? `0${idx + 1}` : `${idx + 1}`);
            const upperTitle = (item.title || '').toUpperCase();
            
            // Pemilihan ikon otomatis sesuai judul
            let iconElement = <Code2 size={20} className="text-cyan-400" />;
            if (upperTitle.includes('UI') || upperTitle.includes('DESIGN')) {
              iconElement = <Palette size={20} className="text-emerald-400" />;
            } else if (upperTitle.includes('DATABASE') || upperTitle.includes('BACKEND')) {
              iconElement = <Database size={20} className="text-purple-400" />;
            } else if (upperTitle.includes('WEB3') || upperTitle.includes('BLOCKCHAIN')) {
              iconElement = <Cpu size={20} className="text-amber-400" />;
            }

            return {
              id: numStr,
              title: item.title,
              desc: item.description,
              tags: Array.isArray(item.tags) ? item.tags : [],
              icon: iconElement
            };
          });
          setServices(mapped);
        }
      } catch (err) {
        console.warn('Error fetching all services:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllServices();
  }, []);

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Tombol Kembali ke Halaman Layanan */}
      <div className="mb-4">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>{t('Back to Services', 'Kembali ke Layanan')}</span>
        </Link>
      </div>

      {/* Header Halaman Lengkap */}
      <div className="mb-6 pb-5 border-b border-white/10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-mono text-cyan-400 mb-2">
          <Layers size={13} />
          <span>{t('ALL SERVICES', 'SEMUA LAYANAN')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('All Professional Services', 'Seluruh Layanan Profesional')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          {t(
            'Comprehensive breakdown of engineering, design, and architecture capabilities.',
            'Rincian lengkap kapabilitas rekayasa perangkat lunak, desain antarmuka, dan sistem arsitektur.'
          )}
        </p>
      </div>

      {/* Grid Semua Layanan (Vertical Stack di Mobile, 2 Kolom di Tablet/Desktop) */}
      {loading ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">
          {t('Loading services...', 'Memuat layanan...')}
        </div>
      ) : services.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-slate-500">
          {t('No services found.', 'Tidak ada layanan ditemukan.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-[#090e1f]/90 border border-white/10 rounded-2xl p-5 backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {service.icon}
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-bold">
                    {service.id}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white mb-2">
                  {service.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                  {service.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </main>
  );
}