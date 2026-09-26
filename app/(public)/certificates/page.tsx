'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Award, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  X,
  Maximize2,
  Loader2
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

interface CertificateItem {
  id: string;
  badge: string;
  title: string;
  issuer: string;
  description: string;
  skills: string[];
  date_str: string;
  image_url: string;
  credential_url: string;
}

export default function CertificatesPage() {
  const { t, language } = useApp();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [headerData, setHeaderData] = useState({
    badge_text: 'VERIFIED CREDENTIALS & LICENSES',
    title: 'All Certificates',
    subtitle: 'A verified index of technical certifications, developer accreditations, and coursework completed from recognized institutions.'
  });
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);

  useEffect(() => {
    async function loadPublicData() {
      try {
        // Ambil Header dari Supabase
        const { data: hData } = await supabase
          .from('certificates_header')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (hData) {
          setHeaderData({
            badge_text: hData.badge_text || 'VERIFIED CREDENTIALS & LICENSES',
            title: hData.title || 'All Certificates',
            subtitle: hData.subtitle || 'A verified index of technical certifications, developer accreditations, and coursework completed from recognized institutions.'
          });
        }

        // Ambil Daftar Sertifikat dari Supabase
        const { data: cData } = await supabase
          .from('certificates')
          .select('*')
          .order('created_at', { ascending: false });

        if (cData) {
          setCertificates(cData);
        }
      } catch (err) {
        console.warn('Error fetching public certificates:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPublicData();
  }, []);

  const filterTabs = [
    { key: 'ALL', label: t('All Certificates', 'Semua Sertifikat') },
    { key: 'Web Development', label: 'Web Development' },
    { key: 'Python & Automation', label: 'Python & Automation' },
    { key: 'Programming & CS', label: 'Programming & CS' },
  ];

  const filteredData = certificates.filter((item) => {
    const matchesCategory = activeFilter === 'ALL' || item.badge?.toLowerCase() === activeFilter.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.issuer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.skills && item.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <main className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="text-xs font-mono text-[var(--text-muted)]">Memuat sertifikat resmi...</span>
      </main>
    );
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Back Button */}
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--text-muted)] hover:text-accent transition-colors group"
        >
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
          <span>{t('Back to Home', 'Kembali ke Beranda')}</span>
        </Link>
      </div>

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--card-border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent mb-2">
            <Sparkles size={13} />
            <span>{headerData.badge_text}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] tracking-tight">
            {headerData.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl">
            {headerData.subtitle}
          </p>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search certification or skill...', 'Cari sertifikat atau skill...')}
            className="w-full pl-9 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-accent transition-colors shadow-inner"
          />
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 mb-2 scrollbar-none">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-accent text-slate-950 font-bold shadow-md shadow-accent/20'
                : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Kartu Sertifikat */}
      {filteredData.length === 0 ? (
        <div className="py-20 text-center text-xs font-mono text-[var(--text-muted)]">
          Belum ada sertifikat yang ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredData.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-accent/40 rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1"
            >
              {/* Bagian Atas Kartu */}
              <div 
                onClick={() => setSelectedCert(item)}
                className="cursor-pointer"
              >
                <div className="relative w-full h-44 bg-slate-950 overflow-hidden border-b border-[var(--card-border)]">
                  <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-accent flex items-center gap-1">
                    <Award size={11} /> {item.badge}
                  </span>
                  <img
                    src={item.image_url || '/placeholder.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white gap-1.5 backdrop-blur-[2px]">
                    <Maximize2 size={13} />
                    <span>{t('Click for Details', 'Klik untuk Detail')}</span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] mb-1.5">
                    <span className="truncate max-w-[160px]">{item.issuer}</span>
                    <span>{item.date_str}</span>
                  </div>

                  <h2 className="text-sm sm:text-base font-bold text-[var(--text-main)] tracking-tight group-hover:text-accent transition-colors mb-2">
                    {item.title}
                  </h2>

                  <p className="text-xs text-[var(--text-muted)] leading-relaxed min-h-[44px] line-clamp-3">
                    {item.description}
                  </p>

                  {/* Badge Keahlian */}
                  <div className="flex flex-wrap gap-1.5 pt-4 mt-2 border-t border-[var(--card-border)]">
                    {item.skills && item.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded bg-white/5 border border-[var(--card-border)] text-[10px] font-mono text-[var(--text-muted)]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tombol Bagian Bawah Kartu */}
              <div className="px-5 py-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs font-mono">
                <span className="text-[11px] text-[var(--text-muted)]">ID: {item.id.slice(0, 8)}...</span>
                
                <button
                  onClick={() => setSelectedCert(item)}
                  className="inline-flex items-center gap-1 text-accent hover:opacity-85 font-semibold transition-colors cursor-pointer"
                >
                  <span>{t('Verify Credential', 'Verifikasi Sertifikat')}</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal Saat Kartu Ditekan */}
      {selectedCert && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedCert(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="px-5 py-4 bg-[var(--bg-primary)] border-b border-[var(--card-border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[10px] font-mono text-accent">
                  {selectedCert.badge}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">ID: {selectedCert.id}</span>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Isi Konten Modal */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              <div className="w-full h-52 sm:h-64 rounded-xl overflow-hidden border border-[var(--card-border)] bg-slate-950">
                <img
                  src={selectedCert.image_url || '/placeholder.svg'}
                  alt={selectedCert.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight mb-2">
                  {selectedCert.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <Building2 size={13} className="text-accent" />
                    {selectedCert.issuer}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-accent" />
                    {selectedCert.date_str}
                  </span>
                </div>
              </div>

              <div className="bg-white/5 border border-[var(--card-border)] rounded-xl p-4">
                <h3 className="text-xs font-mono uppercase text-[var(--text-muted)] mb-1.5">
                  {t('CURRICULUM & PROFICIENCY BREAKDOWN', 'RINCIAN KURIKULUM & KOMPETENSI')}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                  {selectedCert.description}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase text-[var(--text-muted)] mb-2.5">
                  {t('VERIFIED SKILLS', 'KEAHLIAN TERVERIFIKASI')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCert.skills && selectedCert.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-xs text-[var(--text-main)]">
                      <CheckCircle2 size={14} className="text-accent shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedCert.credential_url && selectedCert.credential_url !== '#' && (
                <div className="pt-3">
                  <a
                    href={selectedCert.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-accent hover:opacity-90 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
                  >
                    <span>{t('Verify Official Credential on Issuer Website', 'Verifikasi Kredensial di Situs Resmi')}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </main>
  );
}