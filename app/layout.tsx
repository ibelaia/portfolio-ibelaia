import React from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Fungsi Dinamis untuk Menarik Metadata SEO dari Neon API
export async function generateMetadata(): Promise<Metadata> {
  let seoData = {
    meta_title: 'Ibe Laia | Software Engineer & Full-Stack Developer',
    meta_description: 'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions',
    keywords: 'Ibe Laia, Software Engineer, Full-Stack Developer',
    author_name: 'Ibe Laia',
    og_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  };

  try {
    const response = await fetch('https://ibelaia.dev/api/settings', { cache: 'no-store' }).catch(() => null);
    if (response && response.ok) {
      const json = await response.json();
      if (json.success && json.data) {
        seoData = {
          meta_title: json.data.meta_title || seoData.meta_title,
          meta_description: json.data.meta_description || seoData.meta_description,
          keywords: json.data.keywords || seoData.keywords,
          author_name: json.data.author_name || seoData.author_name,
          og_image: json.data.og_image || seoData.og_image,
        };
      }
    }
  } catch (err) {
    console.warn('Gagal memuat pengaturan SEO dari Neon API:', err);
  }

  return {
    title: seoData.meta_title,
    description: seoData.meta_description,
    keywords: seoData.keywords,
    authors: [{ name: seoData.author_name }],
    openGraph: {
      title: seoData.meta_title,
      description: seoData.meta_description,
      images: [{ url: seoData.og_image }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.meta_title,
      description: seoData.meta_description,
      images: [seoData.og_image],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let appearance: any = null;
  try {
    const response = await fetch('https://ibelaia.dev/api/settings', { cache: 'no-store' }).catch(() => null);
    if (response && response.ok) {
      const json = await response.json();
      if (json.success) {
        appearance = json.data;
      }
    }
  } catch (err) {
    console.warn('Gagal memuat pengaturan appearance dari Neon API:', err);
  }

  const themeMode = appearance?.theme_mode === 'light' ? 'light' : 'dark';
  const accentColor = appearance?.accent_color || 'cyan';
  const fontFamily = appearance?.font_family === 'font-mono' ? 'font-mono' : 'font-sans';

  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      className={`${inter.variable} ${jetbrainsMono.variable} ${themeMode} scroll-smooth`}
      data-accent={accentColor}
    >
      <body 
        suppressHydrationWarning 
        className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] ${fontFamily} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}