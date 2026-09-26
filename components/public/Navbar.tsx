'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { 
  Home, 
  Info, 
  Wrench, 
  FolderGit2, 
  Award, 
  FileCheck2, 
  Mail, 
  X, 
  Menu,
  LogIn,
  Globe,
  FileText,
  ArrowUpRight
} from 'lucide-react';

interface NavbarProps {
  siteName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ siteName: initialSiteName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [siteName, setSiteName] = useState(initialSiteName || 'IbeLaia.Dev');
  const pathname = usePathname();
  const { language, setLanguage, t } = useApp();

  const personalSiteUrl = process.env.NEXT_PUBLIC_PERSONAL_SITE_URL || 'http://localhost:8000';

  useEffect(() => {
    async function fetchSiteName() {
      try {
        const { data, error } = await supabase
          .from('general_settings')
          .select('site_name')
          .eq('id', 'default')
          .maybeSingle();

        if (data && !error && data.site_name) {
          setSiteName(data.site_name);
        }
      } catch (err) {
        console.warn('Error loading navbar site name:', err);
      }
    }

    fetchSiteName();
  }, []);

  const navItems = [
    { name: t('Home', 'Beranda'), href: '/', icon: <Home size={16} /> },
    { name: t('About', 'Tentang'), href: '/about', icon: <Info size={16} /> },
    { name: t('Services', 'Layanan'), href: '/services', icon: <Wrench size={16} /> },
    { name: t('Projects', 'Proyek'), href: '/projects', icon: <FolderGit2 size={16} /> },
    { name: t('Achievements', 'Prestasi'), href: '/achievements', icon: <Award size={16} /> },
    { name: t('Certificates', 'Sertifikat'), href: '/certificates', icon: <FileCheck2 size={16} /> },
    { name: t('Contact', 'Kontak'), href: '/contact', icon: <Mail size={16} /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#050711]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-base sm:text-lg font-extrabold tracking-tight text-white">
            {siteName.includes('.') ? (
              <>
                {siteName.split('.')[0]}
                <span className="text-cyan-400">.{siteName.split('.')[1]}</span>
              </>
            ) : (
              siteName
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative h-full flex items-center text-xs font-medium transition-colors ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Sisi Kanan: Personal Site & Menu Button */}
          <div className="flex items-center gap-2.5">
            <a
              href={personalSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 hover:text-white transition-all"
            >
              <Globe size={13} className="text-cyan-400" />
              <span>Personal Site</span>
              <ArrowUpRight size={12} className="text-slate-400" />
            </a>

            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              aria-label="Buka Menu"
            >
              <span>Menu</span>
              <Menu size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Samping Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-72 max-w-xs h-full bg-[#080c19] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <span className="text-sm font-bold text-white tracking-wide">
                  {t('Navigation', 'Navigasi')}
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Menu Links */}
              <nav className="py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
                    </Link>
                  );
                })}

                {/* Tautan Personal Site di Menu Mobile */}
                <a
                  href={personalSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-cyan-400" />
                    <span>Personal Site</span>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-400" />
                </a>
              </nav>
            </div>

            {/* Kontrol Bawah Drawer */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <Globe size={13} className="text-cyan-400" />
                    <span className="text-[10px] uppercase font-mono font-bold">{language}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <button
                      onClick={() => setLanguage('ID')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        language === 'ID' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      ID
                    </button>
                    <span className="text-slate-600">/</span>
                    <button
                      onClick={() => setLanguage('EN')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        language === 'EN' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <a
                  href="/assets/resume.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  <span className="text-[11px] font-medium">{t('Resume', 'Resume')}</span>
                  <FileText size={13} className="text-purple-400" />
                </a>
              </div>

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all"
              >
                <LogIn size={14} className="text-purple-400" />
                <span>{t('Admin Login', 'Masuk Admin')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;