import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let appearanceSchemaReady = false;

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

async function ensureAppearanceTable() {
  if (appearanceSchemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS appearance_settings (
      id TEXT PRIMARY KEY,
      theme_mode TEXT NOT NULL DEFAULT 'dark',
      accent_color TEXT NOT NULL DEFAULT 'cyan',
      border_radius TEXT NOT NULL DEFAULT 'rounded-2xl',
      font_family TEXT NOT NULL DEFAULT 'font-sans',
      glassmorphism BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  appearanceSchemaReady = true;
}

function normalizeAppearance(row: any) {
  return {
    theme_mode: row?.theme_mode || 'dark',
    accent_color: row?.accent_color || 'cyan',
    border_radius: row?.border_radius || 'rounded-2xl',
    font_family: row?.font_family || 'font-sans',
    glassmorphism: parseBooleanSafely(row?.glassmorphism, true),
  };
}

export async function GET() {
  try {
    await ensureAppearanceTable();
    const rawRows: any = await sql`
      SELECT * FROM appearance_settings WHERE id = 'default' LIMIT 1
    `;
    const rows = extractRows(rawRows);
    const data = normalizeAppearance(rows[0] || null);

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
        error: err?.message || 'Gagal memuat pengaturan tampilan',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureAppearanceTable();
    const body = await request.json();

    const allowedThemes = new Set(['dark', 'light', 'system']);
    const allowedAccents = new Set([
      'cyan',
      'purple',
      'emerald',
      'rose',
      'amber',
    ]);
    const allowedRadii = new Set(['rounded-xl', 'rounded-2xl', 'rounded-3xl']);
    const allowedFonts = new Set(['font-sans', 'font-mono']);

    const themeMode = allowedThemes.has(body?.theme_mode)
      ? body.theme_mode
      : 'dark';
    const accentColor = allowedAccents.has(body?.accent_color)
      ? body.accent_color
      : 'cyan';
    const borderRadius = allowedRadii.has(body?.border_radius)
      ? body.border_radius
      : 'rounded-2xl';
    const fontFamily = allowedFonts.has(body?.font_family)
      ? body.font_family
      : 'font-sans';
    const glassmorphism = parseBooleanSafely(body?.glassmorphism, true);

    const rawSaved: any = await sql`
      INSERT INTO appearance_settings (
        id,
        theme_mode,
        accent_color,
        border_radius,
        font_family,
        glassmorphism,
        updated_at
      )
      VALUES (
        'default',
        ${themeMode},
        ${accentColor},
        ${borderRadius},
        ${fontFamily},
        ${glassmorphism},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        theme_mode = EXCLUDED.theme_mode,
        accent_color = EXCLUDED.accent_color,
        border_radius = EXCLUDED.border_radius,
        font_family = EXCLUDED.font_family,
        glassmorphism = EXCLUDED.glassmorphism,
        updated_at = NOW()
      RETURNING *
    `;

    const savedRows = extractRows(rawSaved);
    const normalized = normalizeAppearance(savedRows[0] || {
      theme_mode: themeMode,
      accent_color: accentColor,
      border_radius: borderRadius,
      font_family: fontFamily,
      glassmorphism,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pengaturan tampilan berhasil disimpan.',
        data: normalized,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menyimpan pengaturan tampilan',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}