'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  ArrowUpRight, 
  FolderArchive 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface SubProject {
  id: string;
  slug: string;
  title: string;
  desc: string;
  image: string;
  tags: string[];
}

interface CollectionDetail {
  slug: string;
  title: string;
  badge: string;
  desc: { en: string; id: string };
  projects: SubProject[];
}

const collectionsDatabase: Record<string, CollectionDetail> = {
  'uiux-design': {
    slug: 'uiux-design',
    title: 'UI/UX Design Projects',
    badge: 'COLLECTION / UI/UX',
    desc: {
      en: 'A dedicated showcase of product interfaces, mobile wireframes, user research experiments, and high-fidelity prototypes engineered with Figma.',
      id: 'Koleksi khusus antarmuka produk digital, wireframe aplikasi mobile, riset pengguna, dan prototipe interaktif berkualitas tinggi yang dirancang dengan Figma.'
    },
    projects: [
      {
        id: 'ui-01',
        slug: 'food-delivery-app-interface',
        title: 'Food Delivery App Interface',
        desc: 'Comprehensive mobile application design featuring real-time driver geo-tracking, dietary filtering, and rapid cart checkout.',
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80',
        tags: ['Figma', 'Prototyping', 'Design System', 'Mobile UI']
      },
      {
        id: 'ui-02',
        slug: 'jawatrip-mobile-travel-platform',
        title: 'JawaTrip Mobile Travel Platform',
        desc: 'End-to-end interactive itinerary planner and ticket booking application engineered with rich micro-interactions.',
        image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
        tags: ['Figma', 'User Journey', 'Design Token', 'Mobile App']
      }
    ]
  }
};

export default function CollectionPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { t, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const collection = collectionsDatabase[slug];

  if (!collection) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Koleksi Tidak Ditemukan</h1>
        <p className="text-sm text-slate-400 mb-6">Koleksi proyek yang Anda cari tidak tersedia.</p>
        <Link
          href="/projects"
          className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Kembali ke Semua Proyek
        </Link>
      </main>
    );
  }

  const isIndo = language === 'ID';

  const filtered = collection.projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tags.some((tg) => tg.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Tombol Kembali ke Arsip Utama */}
      <div className="mb-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('Back to All Projects', 'Kembali ke Semua Proyek')}</span>
        </Link>
      </div>

      {/* Header Koleksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 mb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-300 mb-2">
            <FolderArchive size={12} />
            <span>{collection.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {collection.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            {isIndo ? collection.desc.id : collection.desc.en}
          </p>
        </div>

        {/* Search Bar Koleksi */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search in this collection...', 'Cari di koleksi ini...')}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
        </div>
      </div>

      {/* Daftar Kartu Proyek di dalam Koleksi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            className="bg-[#090e1f]/90 border border-white/10 hover:border-cyan-400/40 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1"
          >
            <Link href={`/projects/${proj.slug}`} className="block">
              <div className="relative w-full h-44 bg-slate-950 overflow-hidden border-b border-white/10">
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-sm sm:text-base font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
                    {proj.title}
                  </h2>
                  <ArrowUpRight size={15} className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 mt-0.5" />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed min-h-[44px] line-clamp-3">
                  {proj.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-white/5">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>

            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] text-slate-500">Case Study</span>
              <Link
                href={`/projects/${proj.slug}`}
                className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>{t('View Detail', 'Lihat Detail')}</span>
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}