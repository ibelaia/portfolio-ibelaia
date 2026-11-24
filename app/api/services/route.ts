import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let schemaEnsured = false;

async function ensureServicesSchema() {
  if (schemaEnsured) return;
  try {
    await sql`
      ALTER TABLE services
      ALTER COLUMN tags TYPE TEXT USING tags::TEXT
    `;
  } catch {
    // Abaikan jika kolom tags sudah bertipe TEXT
  }

  try {
    await sql`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '01',
      ADD COLUMN IF NOT EXISTS icon_name TEXT DEFAULT 'Code2',
      ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS description_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS tags_id TEXT DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `;
    schemaEnsured = true;
  } catch (err) {
    console.warn('Warning ensureServicesSchema:', err);
  }
}

async function fetchHeaderSafely() {
  try {
    const headerRows = await sql`SELECT * FROM service_header LIMIT 1`;
    if (Array.isArray(headerRows) && headerRows.length > 0) {
      return headerRows[0];
    }
  } catch {
    // Abaikan jika tabel service_header tidak ada
  }

  try {
    const headerRowsAlt = await sql`SELECT * FROM services_header LIMIT 1`;
    if (Array.isArray(headerRowsAlt) && headerRowsAlt.length > 0) {
      return headerRowsAlt[0];
    }
  } catch {
    // Abaikan jika tabel services_header tidak ada
  }

  return null;
}

function normalizeTagsToArray(raw: any): string[] {
  if (Array.isArray(raw)) {
    return raw.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];

    // Jika format PG array literal seperti {FIGMA,WIREFRAME}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map((t) => t.replace(/^"|"$/g, '').trim())
        .filter(Boolean);
    }

    // Jika format JSON string seperti ["FIGMA","WIREFRAME"]
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return normalizeTagsToArray(parsed);
      }
    } catch {
      // Lanjut split koma
    }

    return trimmed
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function serializeTagsForDb(raw: any): string {
  return JSON.stringify(normalizeTagsToArray(raw));
}

function formatServiceRow(row: Record<string, any>) {
  const { icon: _ignoredIcon, price: _ignoredPrice, ...rest } = row;
  return {
    ...rest,
    id: String(row.id),
    title: row.title || '',
    title_id: row.title_id || '',
    description: row.description || '',
    description_id: row.description_id || '',
    badge: row.badge || '01',
    tags: normalizeTagsToArray(row.tags),
    tags_id: normalizeTagsToArray(row.tags_id),
    icon_name: row.icon_name || 'Code2',
  };
}

export async function GET() {
  try {
    await ensureServicesSchema();
    const rows = await sql`SELECT * FROM services ORDER BY created_at DESC`;
    const header = await fetchHeaderSafely();
    const formatted = Array.isArray(rows) ? rows.map(formatServiceRow) : [];

    return NextResponse.json(
      {
        success: true,
        header,
        data: formatted,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('API Error /services:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureServicesSchema();
    const body = await req.json();
    const {
      title,
      title_id,
      description,
      description_id,
      badge,
      tags,
      tags_id,
      icon_name,
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { success: false, error: 'Judul layanan wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const tagsSerialized = serializeTagsForDb(tags);
    const tagsIdSerialized = serializeTagsForDb(
      tags_id !== undefined && tags_id !== null ? tags_id : tags
    );
    const resolvedIconName = String(icon_name || body.icon || 'Code2');
    const resolvedBadge = String(badge || '01');

    const rows = await sql`
      INSERT INTO services (
        title,
        title_id,
        description,
        description_id,
        badge,
        tags,
        tags_id,
        icon_name,
        updated_at
      )
      VALUES (
        ${String(title).trim()},
        ${String(title_id || '').trim()},
        ${String(description || '')},
        ${String(description_id || '')},
        ${resolvedBadge},
        ${tagsSerialized},
        ${tagsIdSerialized},
        ${resolvedIconName},
        NOW()
      )
      RETURNING *
    `;

    const saved = rows[0] ? formatServiceRow(rows[0]) : null;

    return NextResponse.json(
      {
        success: true,
        data: saved,
        updatedAt: Date.now(),
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('API Error POST /services:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menambah data services',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureServicesSchema();
    const body = await req.json();
    const {
      id,
      title,
      title_id,
      description,
      description_id,
      badge,
      tags,
      tags_id,
      icon_name,
    } = body;

    if (!id || !title || !String(title).trim()) {
      return NextResponse.json(
        { success: false, error: 'ID dan judul layanan wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const tagsSerialized = serializeTagsForDb(tags);
    const tagsIdSerialized = serializeTagsForDb(
      tags_id !== undefined && tags_id !== null ? tags_id : tags
    );
    const resolvedIconName = String(icon_name || body.icon || 'Code2');
    const resolvedBadge = String(badge || '01');

    const rows = await sql`
      UPDATE services
      SET
        title = ${String(title).trim()},
        title_id = ${String(title_id || '').trim()},
        description = ${String(description || '')},
        description_id = ${String(description_id || '')},
        badge = ${resolvedBadge},
        tags = ${tagsSerialized},
        tags_id = ${tagsIdSerialized},
        icon_name = ${resolvedIconName},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    const updated = rows[0] ? formatServiceRow(rows[0]) : null;

    return NextResponse.json(
      {
        success: true,
        data: updated,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('API Error PUT /services:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal memperbarui data services',
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
      DELETE FROM services WHERE id = ${id}
    `;

    return NextResponse.json(
      {
        success: true,
        deletedId: id,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('API Error DELETE /services:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menghapus data services',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}