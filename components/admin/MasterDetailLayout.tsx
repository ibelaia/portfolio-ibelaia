'use client';

import React from 'react';

interface MasterDetailLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function MasterDetailLayout({ children, title, description }: MasterDetailLayoutProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-white">{title}</h1>
        {description && <p className="text-slate-400 text-sm">{description}</p>}
      </div>
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
}