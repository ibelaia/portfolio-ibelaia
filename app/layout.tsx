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
      theme_mode:
        row.theme_mode === 'light' || row.theme_mode === 'system'
          ? row.theme_mode
          : 'dark',
      accent_color:
        row.accent_color === 'purple' ||
        row.accent_color === 'emerald' ||
        row.accent_color === 'rose' ||
        row.accent_color === 'amber'
          ? row.accent_color
          : 'cyan',
      border_radius:
        row.border_radius === 'rounded-xl' ||
        row.border_radius === 'rounded-3xl'
          ? row.border_radius
          : 'rounded-2xl',
      font_family: row.font_family === 'font-mono' ? 'font-mono' : 'font-sans',
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

  const themeMode =
    appearance?.theme_mode === 'light' || appearance?.theme_mode === 'system'
      ? appearance.theme_mode
      : 'dark';
  const initialThemeClass = themeMode === 'light' ? 'light' : 'dark';
  const accentColor = appearance?.accent_color || 'cyan';
  const borderRadius = appearance?.border_radius || 'rounded-2xl';
  const fontFamily =
    appearance?.font_family === 'font-mono' ? 'font-mono' : 'font-sans';
  const glassmorphism = appearance?.glassmorphism ?? true;

  const syncScript = `
    (function() {
      try {
        var channelName = 'portfolio-sync-appearance';
        function applySettings(cfg) {
          if (!cfg) return;
          var root = document.documentElement;
          var body = document.body;
          var mode = cfg.theme_mode || 'dark';
          var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          var resolved = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode;

          root.classList.remove('dark', 'light');
          root.classList.add(resolved);
          root.setAttribute('data-theme', resolved);
          root.setAttribute('data-theme-mode', mode);
          if (cfg.accent_color) root.setAttribute('data-accent', cfg.accent_color);
          if (cfg.border_radius) root.setAttribute('data-radius', cfg.border_radius);
          if (cfg.font_family) root.setAttribute('data-font', cfg.font_family);
          root.setAttribute('data-glass', cfg.glassmorphism ? 'true' : 'false');

          if (body && cfg.font_family) {
            body.classList.remove('font-sans', 'font-mono');
            body.classList.add(cfg.font_family);
          }
        }

        if (window.matchMedia) {
          var mq = window.matchMedia('(prefers-color-scheme: dark)');
          var onSystemChange = function() {
            var currentMode = document.documentElement.getAttribute('data-theme-mode');
            if (currentMode === 'system') {
              applySettings({
                theme_mode: 'system',
                accent_color: document.documentElement.getAttribute('data-accent'),
                border_radius: document.documentElement.getAttribute('data-radius'),
                font_family: document.documentElement.getAttribute('data-font'),
                glassmorphism: document.documentElement.getAttribute('data-glass') === 'true'
              });
            }
          };
          if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
          else if (mq.addListener) mq.addListener(onSystemChange);
        }

        window.addEventListener(channelName, function(ev) {
          if (ev && ev.detail && ev.detail.data) applySettings(ev.detail.data);
        });

        window.addEventListener('storage', function(ev) {
          if (ev && ev.key === channelName && ev.newValue) {
            try {
              var parsed = JSON.parse(ev.newValue);
              if (parsed && parsed.data) applySettings(parsed.data);
            } catch (e) {}
          }
        });

        if ('BroadcastChannel' in window) {
          var bc = new BroadcastChannel(channelName);
          bc.onmessage = function(ev) {
            if (ev && ev.data && ev.data.data) applySettings(ev.data.data);
          };
        }
      } catch (e) {}
    })();
  `;

  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} ${initialThemeClass} scroll-smooth`}
        data-theme={initialThemeClass}
        data-theme-mode={themeMode}
        data-accent={accentColor}
        data-radius={borderRadius}
        data-font={fontFamily}
        data-glass={glassmorphism ? 'true' : 'false'}
      >
        <body
          suppressHydrationWarning
          className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] ${fontFamily} antialiased`}
        >
          {children}
          <script
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: syncScript }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}