'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  ArrowRight,
  ExternalLink, 
  Code2, 
  Calendar, 
  Loader2,
  Clock,
  Layers,
  Eye,
  X
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CollectionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<any | null>(null);
  const [allSlugs, setAllSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubDetail, setActiveSubDetail] = useState<any | null>(null);

  useEffect(() => {
    async function loadProjectData() {
      setLoading(true);
      try {
        const { data: allData } = await supabase
          .from('projects')
          .select('slug')
          .order('created_at', { ascending: false });

        if (allData && allData.length > 0) {
          setAllSlugs(allData.map((d: any) => d.slug));
        }

        const decodedSlug = decodeURIComponent(slug || '').toLowerCase().trim();
        const normalizedSlugTarget = decodedSlug.replace(/-/g, ' ');

        const { data: projectsList, error: fetchError } = await supabase
          .from('projects')
          .select('*');

        let matchedData = null;
        if (!fetchError && projectsList) {
          matchedData = projectsList.find((item: any) => {
            const itemSlug = (item.slug || '').toLowerCase().trim();
            const itemTitleSlug = (item.title || '').toLowerCase().trim().replace(/\s+/g, '-');
            return itemSlug === decodedSlug || itemSlug === normalizedSlugTarget || itemTitleSlug === decodedSlug;
          });
        }

        if (matchedData) {
          const rawItems = Array.isArray(matchedData.collection_items) ? matchedData.collection_items : [];
          const rawBlocks = Array.isArray(matchedData.modular_blocks) ? matchedData.modular_blocks : [];
          
          const modularBlocks = rawBlocks.length > 0 ? rawBlocks : rawItems.filter((item: any) => 'type' in item);
          const collectionItems = rawItems.filter((item: any) => !('type' in item) && ('title' in item || 'desc' in item || 'description' in item));

          setProject({
            slug: matchedData.slug,
            title: matchedData.title,
            category: matchedData.category || 'Web Application',
            year: matchedData.year || '2026',
            bannerImage: matchedData.thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            summary: matchedData.overview || '',
            modularBlocks: modularBlocks,
            collectionItems: collectionItems,
            liveUrl: matchedData.live_url || '',
            githubUrl: matchedData.github_url || 'https://github.com/ibelaia'
          });
        }
      } catch (err) {
        console.error('Error loading project collection:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadProjectData();
    }
  }, [slug]);

  if (loading) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-32 text-center flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-cyan-400" />
        <span className="text-xs font-mono text-slate-400">Memuat koleksi dari Supabase...</span>
      </main>
    );
  }

  if (!project) {
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

  const currentIndex = allSlugs.indexOf(slug);
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex !== -1 && currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null;

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8">
      
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Arsip Proyek</span>
        </Link>
      </div>

      <div className="pb-6 border-b border-white/10 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-mono text-purple-400">
            Multi-Project Collection
          </span>
          <span className="text-slate-600 text-xs">•</span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Calendar size={12} /> {project.year}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
          {project.summary}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-3">
          {project.liveUrl && project.liveUrl !== '#' && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <span>Lihat Pratinjau</span>
              <ExternalLink size={13} />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Code2 size={13} />
              <span>Lihat Sumber / Figma</span>
            </a>
          )}
        </div>
      </div>

      <div className="w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-white/10 bg-[#090e1f] shadow-2xl">
        <img
          src={project.bannerImage}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {project.collectionItems.length > 0 && (
        <div className="space-y-6 pt-4">
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            <span>Sub-Item Koleksi ({project.collectionItems.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {project.collectionItems.map((item: any, idx: number) => (
              <div key={idx} className="bg-[#090e1f]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between group hover:border-cyan-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-mono text-cyan-400 font-bold uppercase">
                      Sub-Item #{idx + 1}
                    </span>
                    {item.subtitle && (
                      <span className="text-[11px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">{item.title}</h3>

                  {item.image && (
                    <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video shadow-lg cursor-pointer" onClick={() => setActiveSubDetail(item)}>
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 whitespace-pre-line">
                    {item.desc || item.description || ''}
                  </p>

                  {Array.isArray(item.tags) && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubDetail(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-mono font-bold text-xs transition-all border border-purple-500/30 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>Detail Sub-Proyek</span>
                  </button>

                  {item.link && item.link !== '#' && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold text-xs transition-all border border-cyan-500/20"
                    >
                      <span>Tautan</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {project.modularBlocks.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-white/10">
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            <span>Detail & Galeri Blok Modular</span>
          </h2>

          <div className="space-y-6">
            {project.modularBlocks.map((block: any, idx: number) => (
              <div key={block.id || idx} className="bg-[#090e1f]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-[10px] font-mono text-cyan-400 font-bold uppercase">
                    {block.type ? block.type.replace('_', ' ') : 'ulasan artikel'}
                  </span>
                  <h3 className="text-sm font-bold text-white">{block.title}</h3>
                </div>

                {block.type === 'narasi_foto' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">{block.content}</p>
                    {block.image && (
                      <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 aspect-video shadow-lg">
                        <img src={block.image} alt={block.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {block.type === 'ulasan_artikel' && (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">{block.content}</p>
                )}

                {block.type === 'kartu_proyek' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200 leading-relaxed">
                    {block.content}
                  </div>
                )}

                {block.type === 'tombol_aksi' && (
                  <div className="pt-2">
                    <a
                      href={block.link || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
                    >
                      <span>{block.content || 'Buka Tautan'}</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                )}

                {block.type === 'linimasa' && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200">
                    <Clock size={16} className="shrink-0 mt-0.5 text-purple-400" />
                    <p className="leading-relaxed whitespace-pre-line">{block.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL POPUP DETAIL SUB-ITEM (FULL CONTENT TANPA TERPOTONG) */}
      {activeSubDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl my-auto">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#090e1f] shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-[11px] uppercase font-extrabold tracking-wider">Detail Sub-Proyek</span>
                <span className="text-xs font-semibold text-slate-300 line-clamp-1">{activeSubDetail.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubDetail(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              <div className="space-y-2.5">
                {activeSubDetail.subtitle && (
                  <span className="inline-block text-xs font-mono text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 font-semibold">
                    {activeSubDetail.subtitle}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{activeSubDetail.title}</h2>
              </div>

              {activeSubDetail.image && (
                <div className="rounded-2xl overflow-hidden border border-white/15 bg-slate-950 aspect-video shadow-2xl">
                  <img src={activeSubDetail.image} alt={activeSubDetail.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Deskripsi & Penjelasan Lengkap Modul</h4>
                <div className="bg-[#07090e] p-5 rounded-2xl border border-white/10 text-sm text-slate-200 leading-relaxed whitespace-pre-line shadow-inner">
                  {activeSubDetail.desc || activeSubDetail.description || 'Tidak ada deskripsi tersedia.'}
                </div>
              </div>

              {Array.isArray(activeSubDetail.tags) && activeSubDetail.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Tech Stack & Tools Digunakan</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeSubDetail.tags.map((tag: string, tIdx: number) => (
                      <span key={tIdx} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs font-mono text-cyan-300 font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10 bg-[#090e1f] shrink-0 flex items-center justify-between">
              {activeSubDetail.link && activeSubDetail.link !== '#' ? (
                <a
                  href={activeSubDetail.link}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                >
                  <span>Buka Tautan Repositori / Live Demo</span>
                  <ExternalLink size={13} />
                </a>
              ) : <div />}
              <button
                type="button"
                onClick={() => setActiveSubDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="pt-6 border-t border-white/10 flex items-center justify-between">
        {prevSlug ? (
          <Link
            href={`/projects/collection/${prevSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Studi Kasus Sebelumnya</span>
          </Link>
        ) : <div />}

        {nextSlug ? (
          <Link
            href={`/projects/collection/${nextSlug}`}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>Studi Kasus Berikutnya</span>
            <ArrowRight size={13} />
          </Link>
        ) : <div />}
      </div>

    </main>
  );
}