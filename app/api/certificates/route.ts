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

async function ensureCertificatesSchema() {
  if (schemaEnsured) return;
  try {
    await sql`
      ALTER TABLE certificates
      ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT 'Web Development',
      ADD COLUMN IF NOT EXISTS badge_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS issuer TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS description_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS date_str TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS date_str_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '/placeholder.svg',
      ADD COLUMN IF NOT EXISTS credential_url TEXT DEFAULT ''
    `;
    schemaEnsured = true;
  } catch (err) {
    console.warn('Warning ensureCertificatesSchema:', err);
  }
}

async function ensureHeaderSchema() {
  if (headerSchemaEnsured) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS certificates_header (
        id TEXT PRIMARY KEY,
        badge_text TEXT DEFAULT 'VERIFIED CREDENTIALS & LICENSES',
        badge_text_id TEXT DEFAULT 'KREDENSIAL & LISENSI TERVERIFIKASI',
        title TEXT DEFAULT 'All Certificates',
        title_id TEXT DEFAULT 'Semua Sertifikat',
        subtitle TEXT DEFAULT '',
        subtitle_id TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      ALTER TABLE certificates_header
      ADD COLUMN IF NOT EXISTS badge_text_id TEXT DEFAULT 'KREDENSIAL & LISENSI TERVERIFIKASI',
      ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT 'Semua Sertifikat',
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
    await ensureCertificatesSchema();
    await ensureHeaderSchema();

    let headerRow: any = null;
    try {
      const headerRows = await sql`
        SELECT * FROM certificates_header WHERE id = 'default' LIMIT 1
      `;
      headerRow = headerRows[0] || null;
    } catch {
      headerRow = null;
    }

    const data = await sql`
      SELECT * FROM certificates
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
          'Terjadi kesalahan saat mengambil data certificates',
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
        INSERT INTO certificates_header (
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

    await ensureCertificatesSchema();

    const title = String(body.title || '').trim();
    const issuer = String(body.issuer || '').trim();

    if (!title || !issuer) {
      return NextResponse.json(
        { success: false, error: 'Judul dan penerbit wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const badge = String(body.badge || 'Web Development').trim();
    const badgeId = String(body.badge_id || '').trim();
    const titleId = String(body.title_id || '').trim();
    const description = String(body.description || '').trim();
    const descriptionId = String(body.description_id || '').trim();
    const dateStr = String(body.date_str || body.date || '').trim();
    const dateStrId = String(body.date_str_id || '').trim();
    const imageUrl = String(body.image_url || '/placeholder.svg').trim();
    const credentialUrl = String(body.credential_url || '').trim();
    const skills = normalizeArrayField(body.skills);
    const skillsId = normalizeArrayField(body.skills_id);

    let rows: any[] = [];
    try {
      rows = await sql`
        INSERT INTO certificates (
          badge,
          badge_id,
          title,
          title_id,
          issuer,
          description,
          description_id,
          skills,
          skills_id,
          date_str,
          date_str_id,
          image_url,
          credential_url
        )
        VALUES (
          ${badge},
          ${badgeId},
          ${title},
          ${titleId},
          ${issuer},
          ${description},
          ${descriptionId},
          ${skills},
          ${skillsId},
          ${dateStr},
          ${dateStrId},
          ${imageUrl},
          ${credentialUrl}
        )
        RETURNING *
      `;
    } catch {
      rows = await sql`
        INSERT INTO certificates (
          badge,
          badge_id,
          title,
          title_id,
          issuer,
          description,
          description_id,
          date_str,
          date_str_id,
          image_url,
          credential_url
        )
        VALUES (
          ${badge},
          ${badgeId},
          ${title},
          ${titleId},
          ${issuer},
          ${description},
          ${descriptionId},
          ${dateStr},
          ${dateStrId},
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
        error: err?.message || 'Gagal menambah data certificates',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureCertificatesSchema();
    const body = await req.json();

    const id = body.id;
    const title = String(body.title || '').trim();
    const issuer = String(body.issuer || '').trim();

    if (!id || !title || !issuer) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID, judul, dan penerbit wajib diisi',
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const badge = String(body.badge || 'Web Development').trim();
    const badgeId = String(body.badge_id || '').trim();
    const titleId = String(body.title_id || '').trim();
    const description = String(body.description || '').trim();
    const descriptionId = String(body.description_id || '').trim();
    const dateStr = String(body.date_str || body.date || '').trim();
    const dateStrId = String(body.date_str_id || '').trim();
    const imageUrl = String(body.image_url || '/placeholder.svg').trim();
    const credentialUrl = String(body.credential_url || '').trim();
    const skills = normalizeArrayField(body.skills);
    const skillsId = normalizeArrayField(body.skills_id);

    let rows: any[] = [];
    try {
      rows = await sql`
        UPDATE certificates
        SET
          badge = ${badge},
          badge_id = ${badgeId},
          title = ${title},
          title_id = ${titleId},
          issuer = ${issuer},
          description = ${description},
          description_id = ${descriptionId},
          skills = ${skills},
          skills_id = ${skillsId},
          date_str = ${dateStr},
          date_str_id = ${dateStrId},
          image_url = ${imageUrl},
          credential_url = ${credentialUrl}
        WHERE id = ${id}
        RETURNING *
      `;
    } catch {
      rows = await sql`
        UPDATE certificates
        SET
          badge = ${badge},
          badge_id = ${badgeId},
          title = ${title},
          title_id = ${titleId},
          issuer = ${issuer},
          description = ${description},
          description_id = ${descriptionId},
          date_str = ${dateStr},
          date_str_id = ${dateStrId},
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
        error: err?.message || 'Gagal memperbarui data certificates',
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
      DELETE FROM certificates WHERE id = ${id}
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
        error: err?.message || 'Gagal menghapus data certificates',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}