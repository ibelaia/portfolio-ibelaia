'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Code, 
  Briefcase, 
  Camera, 
  Send,
  ArrowUp
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';

export const Footer: React.FC = () => {
  const { t } = useApp();
  const [showTopBtn, setShowTopBtn] = useState(false);
  
  const [footerData, setFooterData] = useState({
    site_name: 'IbeLaia.Dev',
    footer_description: 'Building digital solutions with code, creativity, and purpose.',
    copyright_text: '2026 IbeLaia.Dev. All rights reserved.'
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchFooterSettings() {
      try {
        const { data, error } = await supabase
          .from('general_settings')
          .select('*')
          .eq('id', 'default')
          .maybeSingle();

        if (data && !error) {
          setFooterData({
            site_name: data.site_name || 'IbeLaia.Dev',
            footer_description: data.footer_description || 'Building digital solutions with code, creativity, and purpose.',
            copyright_text: data.copyright_text || '2026 IbeLaia.Dev. All rights reserved.'
          });
        }
      } catch (err) {
        console.warn('Error loading footer settings:', err);
      }
    }

    fetchFooterSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nameParts = footerData.site_name.split('.');
  const baseName = nameParts[0] || 'IbeLaia';
  const extension = nameParts[1] ? `.${nameParts[1]}` : '.Dev';

  return (
    <>
      <footer className="w-full bg-[#050711] border-t border-white/5 pt-6 pb-4 text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ================= KHUSUS MOBILE ================= */}
          <div className="flex flex-col gap-3.5 sm:hidden">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-base font-extrabold tracking-tight text-white">
                {baseName}<span className="text-cyan-400">{extension}</span>
              </Link>

              <div className="flex items-center gap-1.5">
                <a href="https://github.com/ibelaia" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors">
                  <Code size={13} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors">
                  <Briefcase size={13} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors">
                  <Camera size={13} />
                </a>
                <a href="mailto:contact@ibelaia.dev" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-slate-300 hover:text-cyan-400 transition-colors">
                  <Send size={13} />
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] font-mono text-slate-500">
              <p className="text-slate-400 font-sans leading-snug">
                {footerData.footer_description}
              </p>
              <p className="mt-1">
                &copy; {footerData.copyright_text}
              </p>
            </div>
          </div>

          {/* ================= KHUSUS DESKTOP ================= */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-8 pb-5">
            <div className="col-span-4 space-y-2">
              <Link href="/" className="text-lg font-extrabold tracking-tight text-white inline-block">
                {baseName}<span className="text-cyan-400">{extension}</span>
              </Link>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {footerData.footer_description}
              </p>
            </div>

            <div className="col-span-2 space-y-2">
              <h4 className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-200">
                {t('EXPLORE', 'JELAJAHI')}
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/about" className="hover:text-cyan-400 transition-colors">{t('About', 'Tentang')}</Link></li>
                <li><Link href="/projects" className="hover:text-cyan-400 transition-colors">{t('Projects', 'Proyek')}</Link></li>
                <li><Link href="/services" className="hover:text-cyan-400 transition-colors">{t('Services', 'Layanan')}</Link></li>
              </ul>
            </div>

            <div className="col-span-3 space-y-2">
              <h4 className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-200">
                {t('RESOURCES', 'SUMBER')}
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/achievements" className="hover:text-cyan-400 transition-colors">{t('Achievements', 'Prestasi')}</Link></li>
                <li><Link href="/certificates" className="hover:text-cyan-400 transition-colors">{t('Certificates', 'Sertifikat')}</Link></li>
                <li><span className="text-slate-600 cursor-not-allowed">Documentation</span></li>
              </ul>
            </div>

            <div className="col-span-3 space-y-2.5">
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-mono uppercase font-bold tracking-widest text-slate-200">
                  {t('CONNECT', 'HUBUNGI')}
                </h4>
                <ul className="space-y-1 text-xs">
                  <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">{t('Contact Me', 'Kontak Saya')}</Link></li>
                  <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Let&apos;s Talk</Link></li>
                </ul>
              </div>

              <div className="pt-1">
                <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase block mb-1.5">
                  FIND ME ON
                </span>
                <div className="flex items-center gap-1.5">
                  <a href="https://github.com/ibelaia" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:border-cyan-400 hover:text-white flex items-center justify-center transition-colors">
                    <Code size={13} />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:border-cyan-400 hover:text-white flex items-center justify-center transition-colors">
                    <Briefcase size={13} />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:border-cyan-400 hover:text-white flex items-center justify-center transition-colors">
                    <Camera size={13} />
                  </a>
                  <a href="mailto:contact@ibelaia.dev" className="w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:border-cyan-400 hover:text-white flex items-center justify-center transition-colors">
                    <Send size={13} />
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Status Bar Bawah */}
          <div className="hidden sm:flex pt-3 border-t border-white/5 items-center justify-between text-[11px]">
            <p className="text-slate-500 font-mono">
              &copy; {footerData.copyright_text}
            </p>

            <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
              <span className="flex items-center gap-1 hover:text-white transition-colors">
                <Code size={12} /> Code
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Send size={12} /> Live
              </span>
            </div>
          </div>

        </div>
      </footer>

      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-5 right-5 z-40 w-10 h-10 rounded-full bg-[#0c1328]/90 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <ArrowUp size={16} />
      </button>
    </>
  );
};

export default Footer;