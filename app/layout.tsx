import React from 'react';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import sql from '@/lib/db';
import '@/app/globals.css';

export const dynamic = 'force-dynamic';

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

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

function parseBooleanSafely(raw: any, fallback: boolean): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw !== 0;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return fallback;
}

async function getAppearanceFromDb() {
  try {
    const rawRows: any = await sql`
      SELECT * FROM appearance_settings WHERE id = 'default' LIMIT 1
    `;
    const rows = extractRows(rawRows);
    const row = rows[0] || null;
    if (!row) return null;

    return {
      theme_mode: row.theme_mode || 'dark',
      accent_color: row.accent_color || 'cyan',
      border_radius: row.border_radius || 'rounded-2xl',
      font_family: row.font_family || 'font-sans',
      glassmorphism: parseBooleanSafely(row.glassmorphism, true),
    };
  } catch {
    return null;
  }
}

async function getSeoFromDb() {
  try {
    const rawRows: any = await sql`
      SELECT * FROM seo_settings WHERE id = 'default' LIMIT 1
    `;
    const rows = extractRows(rawRows);
    return rows[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  let seoData = {
    meta_title: 'Ibe Laia | Software Engineer & Full-Stack Developer',
    meta_description:
      'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions',
    keywords: 'Ibe Laia, Software Engineer, Full-Stack Developer',
    author_name: 'Ibe Laia',
    og_image:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  };

  try {
    const data = await getSeoFromDb();
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
    console.warn('Gagal memuat pengaturan SEO:', err);
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
  const appearance = await getAppearanceFromDb();

  const themeMode = appearance?.theme_mode === 'light' ? 'light' : 'dark';
  const accentColor = appearance?.accent_color || 'cyan';
  const borderRadius = appearance?.border_radius || 'rounded-2xl';
  const fontFamily =
    appearance?.font_family === 'font-mono' ? 'font-mono' : 'font-sans';
  const glassmorphism = appearance?.glassmorphism ?? true;

  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} ${themeMode} scroll-smooth`}
        data-accent={accentColor}
        data-radius={borderRadius}
        data-glass={glassmorphism ? 'true' : 'false'}
      >
        <body
          suppressHydrationWarning
          className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] ${fontFamily} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}