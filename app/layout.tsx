import React from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import '@/app/globals.css';
import { createClient } from '@supabase/supabase-js';

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

// Klien Supabase aman dengan fallback
const supabaseUrl = 'https://zuvlslccrtalsbaukqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dmx2c2xjY3J0YWxzYmF1a3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTI1MTMsImV4cCI6MjEwNDg2ODUxM30.bFjEgfzgxAL8aXrVlxzrR0bTaMcCxCMGoVQk1XiSXvo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function generateMetadata(): Promise<Metadata> {
  let seoData = {
    meta_title: 'Ibe Laia | Software Engineer & Full-Stack Developer',
    meta_description: 'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions',
    keywords: 'Ibe Laia, Software Engineer, Full-Stack Developer',
    author_name: 'Ibe Laia',
    og_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  };

  try {
    const { data } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (data) {
      seoData = {
        meta_title: data.meta_title || seoData.meta_title,
        meta_description: data.meta_description || seoData.meta_description,
        keywords: data.keywords || seoData.keywords,
        author_name: data.author_name || seoData.author_name,
        og_image: data.og_image || seoData.og_image,
      };
    }
  } catch (err) {
    console.warn('Menggunakan default SEO (offline mode)');
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
  let appearance = null;
  try {
    const { data } = await supabase
      .from('appearance_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();
    appearance = data;
  } catch (err) {
    console.warn('Menggunakan default appearance (offline mode)');
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