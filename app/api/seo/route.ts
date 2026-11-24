import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const DEFAULT_SEO = {
  meta_title: 'Ibe Laia | Software Engineer & Full-Stack Developer',
  meta_description:
    'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions berbasis di Surabaya, Indonesia.',
  keywords:
    'Ibe Laia, Software Engineer, Full-Stack Developer, Portofolio IT',
  og_image:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
  author_name: 'Ibe Laia',
};

let seoSchemaReady = false;

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

async function ensureSeoTable() {
  if (seoSchemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS seo_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      meta_title TEXT DEFAULT 'Ibe Laia | Software Engineer & Full-Stack Developer',
      meta_description TEXT DEFAULT 'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions berbasis di Surabaya, Indonesia.',
      keywords TEXT DEFAULT 'Ibe Laia, Software Engineer, Full-Stack Developer, Portofolio IT',
      og_image TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      author_name TEXT DEFAULT 'Ibe Laia',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE seo_settings
    ADD COLUMN IF NOT EXISTS meta_title TEXT DEFAULT 'Ibe Laia | Software Engineer & Full-Stack Developer',
    ADD COLUMN IF NOT EXISTS meta_description TEXT DEFAULT 'Portfolio modern karya Ibe Laia - Software Engineering & Digital Solutions berbasis di Surabaya, Indonesia.',
    ADD COLUMN IF NOT EXISTS keywords TEXT DEFAULT 'Ibe Laia, Software Engineer, Full-Stack Developer, Portofolio IT',
    ADD COLUMN IF NOT EXISTS og_image TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Ibe Laia',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `;

  seoSchemaReady = true;
}

function normalizeSeo(row: any) {
  return {
    meta_title: String(row?.meta_title ?? DEFAULT_SEO.meta_title),
    meta_description: String(
      row?.meta_description ?? DEFAULT_SEO.meta_description
    ),
    keywords: String(row?.keywords ?? DEFAULT_SEO.keywords),
    og_image: String(row?.og_image ?? DEFAULT_SEO.og_image),
    author_name: String(row?.author_name ?? DEFAULT_SEO.author_name),
  };
}

export async function GET() {
  try {
    await ensureSeoTable();
    const rawRows: any = await sql`
      SELECT * FROM seo_settings WHERE id = 'default' LIMIT 1
    `;
    const rows = extractRows(rawRows);
    const data = normalizeSeo(rows[0] || null);

    return NextResponse.json(
      {
        success: true,
        data,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal memuat pengaturan SEO',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeoTable();
    const body = await request.json();

    const metaTitle = String(body?.meta_title ?? DEFAULT_SEO.meta_title).trim();
    const metaDescription = String(
      body?.meta_description ?? DEFAULT_SEO.meta_description
    ).trim();
    const keywords = String(body?.keywords ?? DEFAULT_SEO.keywords).trim();
    const ogImage = String(body?.og_image ?? DEFAULT_SEO.og_image).trim();
    const authorName = String(
      body?.author_name ?? DEFAULT_SEO.author_name
    ).trim();

    const rawSaved: any = await sql`
      INSERT INTO seo_settings (
        id,
        meta_title,
        meta_description,
        keywords,
        og_image,
        author_name,
        updated_at
      )
      VALUES (
        'default',
        ${metaTitle},
        ${metaDescription},
        ${keywords},
        ${ogImage},
        ${authorName},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        meta_title = EXCLUDED.meta_title,
        meta_description = EXCLUDED.meta_description,
        keywords = EXCLUDED.keywords,
        og_image = EXCLUDED.og_image,
        author_name = EXCLUDED.author_name,
        updated_at = NOW()
      RETURNING *
    `;

    const savedRows = extractRows(rawSaved);
    const normalized = normalizeSeo(
      savedRows[0] || {
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords,
        og_image: ogImage,
        author_name: authorName,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Pengaturan SEO berhasil disimpan ke Neon.',
        data: normalized,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menyimpan pengaturan SEO',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}