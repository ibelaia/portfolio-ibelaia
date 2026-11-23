import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let schemaEnsured = false;
let headerSchemaEnsured = false;

async function ensureAchievementsSchema() {
  if (schemaEnsured) return;
  try {
    await sql`
      ALTER TABLE achievements
      ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'Competitions',
      ADD COLUMN IF NOT EXISTS badge_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS description_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS date_str TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS date_str_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS location_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '/placeholder.svg'
    `;
    schemaEnsured = true;
  } catch (err) {
    console.warn('Warning ensureAchievementsSchema:', err);
  }
}

async function ensureHeaderSchema() {
  if (headerSchemaEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS achievements_header (
        id TEXT PRIMARY KEY,
        badge_text TEXT DEFAULT 'HONORS & RECOGNITION',
        badge_text_id TEXT DEFAULT 'PENGHARGAAN & PENCAPAIAN',
        title TEXT DEFAULT 'Honors & Milestones',
        title_id TEXT DEFAULT 'Penghargaan & Pencapaian',
        subtitle TEXT DEFAULT '',
        subtitle_id TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      ALTER TABLE achievements_header
      ADD COLUMN IF NOT EXISTS badge_text_id TEXT DEFAULT 'PENGHARGAAN & PENCAPAIAN',
      ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT 'Penghargaan & Pencapaian',
      ADD COLUMN IF NOT EXISTS subtitle_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `;
    headerSchemaEnsured = true;
  } catch (err) {
    console.warn('Warning ensureHeaderSchema:', err);
  }
}

function normalizeArrayField(raw: any): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item ?? '').trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((item) => item.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeArrayField(parsed);
      }
    } catch {
      // Lanjut split koma
    }
    return trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET() {
  try {
    await ensureAchievementsSchema();
    await ensureHeaderSchema();

    let headerRow: any = null;
    try {
      const headerRows = await sql`
        SELECT * FROM achievements_header WHERE id = 'default' LIMIT 1
      `;
      headerRow = headerRows[0] || null;
    } catch {
      headerRow = null;
    }

    const data = await sql`
      SELECT * FROM achievements
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      {
        success: true,
        header: headerRow,
        data: data,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          err?.message ||
          'terjadi kesalahan saat mengambil data achievements',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.target === 'header') {
      await ensureHeaderSchema();

      const badgeText = String(body.badge_text || '').trim();
      const badgeTextId = String(body.badge_text_id || '').trim();
      const headerTitle = String(body.title || '').trim();
      const headerTitleId = String(body.title_id || '').trim();
      const subtitle = String(body.subtitle || '').trim();
      const subtitleId = String(body.subtitle_id || '').trim();

      const headerRows = await sql`
        INSERT INTO achievements_header (
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
          ${headerTitle},
          ${headerTitleId},
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

      return NextResponse.json(
        {
          success: true,
          data: headerRows[0] || body,
          updatedAt: Date.now(),
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    await ensureAchievementsSchema();

    const title = String(body.title || '').trim();
    const issuerOrBadge = String(
      body.badge || body.issuer || 'Competitions'
    ).trim();

    if (!title || !issuerOrBadge) {
      return NextResponse.json(
        { success: false, error: 'Judul dan kategori/badge wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const titleId = String(body.title_id || '').trim();
    const badgeId = String(body.badge_id || '').trim();
    const description = String(body.description || '').trim();
    const descriptionId = String(body.description_id || '').trim();
    const dateStr = String(body.date_str || body.date || '').trim();
    const dateStrId = String(body.date_str_id || '').trim();
    const location = String(body.location || '').trim();
    const locationId = String(body.location_id || '').trim();
    const imageUrl = String(body.image_url || '/placeholder.svg').trim();
    const credentialUrl = String(body.credential_url || '').trim();
    const highlights = normalizeArrayField(body.highlights);
    const highlightsId = normalizeArrayField(body.highlights_id);

    let rows: any[] = [];
    try {
      rows = await sql`
        INSERT INTO achievements (
          badge,
          badge_id,
          title,
          title_id,
          description,
          description_id,
          highlights,
          highlights_id,
          date_str,
          date_str_id,
          location,
          location_id,
          image_url,
          credential_url
        )
        VALUES (
          ${issuerOrBadge},
          ${badgeId},
          ${title},
          ${titleId},
          ${description},
          ${descriptionId},
          ${highlights},
          ${highlightsId},
          ${dateStr},
          ${dateStrId},
          ${location},
          ${locationId},
          ${imageUrl},
          ${credentialUrl}
        )
        RETURNING *
      `;
    } catch {
      rows = await sql`
        INSERT INTO achievements (
          badge,
          badge_id,
          title,
          title_id,
          description,
          description_id,
          date_str,
          date_str_id,
          location,
          location_id,
          image_url,
          credential_url
        )
        VALUES (
          ${issuerOrBadge},
          ${badgeId},
          ${title},
          ${titleId},
          ${description},
          ${descriptionId},
          ${dateStr},
          ${dateStrId},
          ${location},
          ${locationId},
          ${imageUrl},
          ${credentialUrl}
        )
        RETURNING *
      `;
    }

    return NextResponse.json(
      {
        success: true,
        data: rows[0] || null,
        updatedAt: Date.now(),
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menambah data achievements',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureAchievementsSchema();
    const body = await req.json();

    const id = body.id;
    const title = String(body.title || '').trim();
    const issuerOrBadge = String(
      body.badge || body.issuer || 'Competitions'
    ).trim();

    if (!id || !title || !issuerOrBadge) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID, judul, dan kategori/badge wajib diisi',
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const titleId = String(body.title_id || '').trim();
    const badgeId = String(body.badge_id || '').trim();
    const description = String(body.description || '').trim();
    const descriptionId = String(body.description_id || '').trim();
    const dateStr = String(body.date_str || body.date || '').trim();
    const dateStrId = String(body.date_str_id || '').trim();
    const location = String(body.location || '').trim();
    const locationId = String(body.location_id || '').trim();
    const imageUrl = String(body.image_url || '/placeholder.svg').trim();
    const credentialUrl = String(body.credential_url || '').trim();
    const highlights = normalizeArrayField(body.highlights);
    const highlightsId = normalizeArrayField(body.highlights_id);

    let rows: any[] = [];
    try {
      rows = await sql`
        UPDATE achievements
        SET
          badge = ${issuerOrBadge},
          badge_id = ${badgeId},
          title = ${title},
          title_id = ${titleId},
          description = ${description},
          description_id = ${descriptionId},
          highlights = ${highlights},
          highlights_id = ${highlightsId},
          date_str = ${dateStr},
          date_str_id = ${dateStrId},
          location = ${location},
          location_id = ${locationId},
          image_url = ${imageUrl},
          credential_url = ${credentialUrl}
        WHERE id = ${id}
        RETURNING *
      `;
    } catch {
      rows = await sql`
        UPDATE achievements
        SET
          badge = ${issuerOrBadge},
          badge_id = ${badgeId},
          title = ${title},
          title_id = ${titleId},
          description = ${description},
          description_id = ${descriptionId},
          date_str = ${dateStr},
          date_str_id = ${dateStrId},
          location = ${location},
          location_id = ${locationId},
          image_url = ${imageUrl},
          credential_url = ${credentialUrl}
        WHERE id = ${id}
        RETURNING *
      `;
    }

    return NextResponse.json(
      {
        success: true,
        data: rows[0] || null,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal memperbarui data achievements',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id wajib disertakan' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await sql`
      DELETE FROM achievements WHERE id = ${id}
    `;

    return NextResponse.json(
      {
        success: true,
        deletedId: id,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menghapus data achievements',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}