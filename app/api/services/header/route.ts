import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let headerSchemaEnsured = false;

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

async function ensureHeaderSchema() {
  if (headerSchemaEnsured) return;

  await sql`
    CREATE TABLE IF NOT EXISTS services_header (
      id TEXT PRIMARY KEY DEFAULT 'default',
      badge_text TEXT DEFAULT 'MY SERVICES',
      badge_text_id TEXT DEFAULT 'LAYANAN SAYA',
      title TEXT DEFAULT 'My Services',
      title_id TEXT DEFAULT 'Layanan Saya',
      subtitle TEXT DEFAULT 'Things I can build, design, and contribute to.',
      subtitle_id TEXT DEFAULT 'Hal yang dapat saya bangun, rancang, dan kontribusikan.',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE services_header
    ADD COLUMN IF NOT EXISTS badge_text_id TEXT DEFAULT 'LAYANAN SAYA',
    ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT 'Layanan Saya',
    ADD COLUMN IF NOT EXISTS subtitle_id TEXT DEFAULT 'Hal yang dapat saya bangun, rancang, dan kontribusikan.',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `;

  headerSchemaEnsured = true;
}

function normalizeHeaderRow(row: any) {
  return {
    badge_text: row?.badge_text ?? 'MY SERVICES',
    badge_text_id: row?.badge_text_id ?? 'LAYANAN SAYA',
    title: row?.title ?? 'My Services',
    title_id: row?.title_id ?? 'Layanan Saya',
    subtitle:
      row?.subtitle ?? 'Things I can build, design, and contribute to.',
    subtitle_id:
      row?.subtitle_id ??
      'Hal yang dapat saya bangun, rancang, dan kontribusikan.',
  };
}

export async function GET() {
  try {
    await ensureHeaderSchema();
    const rawRows: any = await sql`
      SELECT * FROM services_header WHERE id = 'default' LIMIT 1
    `;
    const rows = extractRows(rawRows);
    const data = normalizeHeaderRow(rows[0] || {});

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
        error: err?.message || 'Gagal memuat header Services',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureHeaderSchema();
    const body = await req.json();

    const rawExisting: any = await sql`
      SELECT * FROM services_header WHERE id = 'default' LIMIT 1
    `;
    const current = extractRows(rawExisting)[0] || {};

    const badgeText =
      body?.badge_text ?? current.badge_text ?? 'MY SERVICES';
    const badgeTextId =
      body?.badge_text_id ?? current.badge_text_id ?? 'LAYANAN SAYA';
    const title = body?.title ?? current.title ?? 'My Services';
    const titleId = body?.title_id ?? current.title_id ?? 'Layanan Saya';
    const subtitle =
      body?.subtitle ??
      current.subtitle ??
      'Things I can build, design, and contribute to.';
    const subtitleId =
      body?.subtitle_id ??
      current.subtitle_id ??
      'Hal yang dapat saya bangun, rancang, dan kontribusikan.';

    const rawSaved: any = await sql`
      INSERT INTO services_header (
        id,
        badge_text,
        badge_text_id,
        title,
        title_id,
        subtitle,
        subtitle_id,
        updated_at
      )
      VALUES (
        'default',
        ${badgeText},
        ${badgeTextId},
        ${title},
        ${titleId},
        ${subtitle},
        ${subtitleId},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        badge_text = EXCLUDED.badge_text,
        badge_text_id = EXCLUDED.badge_text_id,
        title = EXCLUDED.title,
        title_id = EXCLUDED.title_id,
        subtitle = EXCLUDED.subtitle,
        subtitle_id = EXCLUDED.subtitle_id,
        updated_at = NOW()
      RETURNING *
    `;

    const saved = normalizeHeaderRow(extractRows(rawSaved)[0] || {});

    return NextResponse.json(
      {
        success: true,
        data: saved,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menyimpan header Services ke Neon',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}