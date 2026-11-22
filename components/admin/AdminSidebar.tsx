'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Award,
  FileText,
  User,
  MessageSquare,
  Briefcase,
  Settings,
  LogOut,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [syncTick, setSyncTick] = useState(0);

  useEffect(() => {
    void syncTick;
    let channel: BroadcastChannel | null = null;

    const handleSyncSignal = () => {
      setSyncTick((prev) => prev + 1);
    };

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      channel = new BroadcastChannel('portfolio-admin-sync');
      channel.onmessage = handleSyncSignal;
    }

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('portfolio')) {
        handleSyncSignal();
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [syncTick]);

  const menuItems = [
    { name: 'Dashboard', href: '/manage/dashboard', icon: LayoutDashboard },
    { name: 'Proyek Utama', href: '/manage/projects', icon: Briefcase },
    { name: 'Pencapaian', href: '/manage/achievements', icon: Award },
    { name: 'Sertifikat', href: '/manage/certificates', icon: FileText },
    { name: 'Profil About', href: '/manage/home/about', icon: User },
    { name: 'Pesan Masuk', href: '/manage/messages', icon: MessageSquare },
    { name: 'Layanan', href: '/manage/services', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-white/10 flex flex-col justify-between hidden md:flex min-h-screen p-4">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-xl font-extrabold text-white tracking-wider">
            Admin Panel
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Portfolio Management
          </p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  isActive
                    ? {
                        backgroundColor:
                          'color-mix(in srgb, var(--accent, #06b6d4) 14%, transparent)',
                        color: 'var(--accent, #22d3ee)',
                        borderColor:
                          'color-mix(in srgb, var(--accent, #06b6d4) 28%, transparent)',
                      }
                    : undefined
                }
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={18} />
          <span>Keluar / Beranda</span>
        </Link>
      </div>
    </aside>
  );
}