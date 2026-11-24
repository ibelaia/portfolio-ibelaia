import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let contactSchemaEnsured = false;

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

async function ensureContactTables() {
  if (!contactSchemaEnsured) {
    await sql`
      CREATE TABLE IF NOT EXISTS contact_content (
        id TEXT PRIMARY KEY DEFAULT 'default',
        badge_text TEXT DEFAULT 'GET IN TOUCH',
        badge_text_id TEXT DEFAULT 'HUBUNGI SAYA',
        email TEXT DEFAULT 'hello@ibelaia.dev',
        title TEXT DEFAULT 'Let''s Build Something Meaningful.',
        title_id TEXT DEFAULT 'Mari Membangun Sesuatu yang Bermakna.',
        subtitle TEXT DEFAULT '',
        subtitle_id TEXT DEFAULT '',
        phone TEXT DEFAULT '+62 812 3015 6692',
        location TEXT DEFAULT 'Surabaya, Indonesia',
        location_id TEXT DEFAULT 'Surabaya, Indonesia',
        response_time TEXT DEFAULT '< 24 Business Hours',
        response_time_id TEXT DEFAULT '< 24 Jam Kerja',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE contact_content
      ADD COLUMN IF NOT EXISTS badge_text_id TEXT DEFAULT 'HUBUNGI SAYA',
      ADD COLUMN IF NOT EXISTS title_id TEXT DEFAULT 'Mari Membangun Sesuatu yang Bermakna.',
      ADD COLUMN IF NOT EXISTS subtitle_id TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS location_id TEXT DEFAULT 'Surabaya, Indonesia',
      ADD COLUMN IF NOT EXISTS response_time_id TEXT DEFAULT '< 24 Jam Kerja',
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `;

    try {
      await sql`
        ALTER TABLE contact_content
        ALTER COLUMN badge_text DROP NOT NULL,
        ALTER COLUMN title DROP NOT NULL,
        ALTER COLUMN subtitle DROP NOT NULL,
        ALTER COLUMN email DROP NOT NULL,
        ALTER COLUMN phone DROP NOT NULL,
        ALTER COLUMN location DROP NOT NULL,
        ALTER COLUMN response_time DROP NOT NULL
      `;
    } catch {
      // Abaikan jika kolom sudah nullable
    }

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        name TEXT DEFAULT '',
        nama TEXT DEFAULT '',
        email TEXT DEFAULT '',
        subject TEXT DEFAULT '',
        subjek TEXT DEFAULT '',
        message TEXT DEFAULT '',
        pesan TEXT DEFAULT '',
        ip_address TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS name TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS nama TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS subjek TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS message TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS pesan TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS ip_address TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
    `;

    try {
      await sql`
        ALTER TABLE messages
        ALTER COLUMN name DROP NOT NULL,
        ALTER COLUMN nama DROP NOT NULL,
        ALTER COLUMN email DROP NOT NULL,
        ALTER COLUMN subject DROP NOT NULL,
        ALTER COLUMN subjek DROP NOT NULL,
        ALTER COLUMN message DROP NOT NULL,
        ALTER COLUMN pesan DROP NOT NULL
      `;
    } catch {
      // Abaikan jika kolom sudah nullable
    }

    contactSchemaEnsured = true;
  }

  const rawCols: any = await sql`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages'
  `;

  return extractRows(rawCols)
    .map((c: any) => String(c?.column_name || ''))
    .filter(Boolean);
}

function normalizeMessage(row: any, idx: number) {
  const idVal =
    row?.id !== undefined && row?.id !== null
      ? String(row.id)
      : row?.message_id !== undefined && row?.message_id !== null
        ? String(row.message_id)
        : `row-${idx}`;

  return {
    id: idVal,
    name: String(
      row?.name || row?.nama || row?.full_name || row?.sender_name || 'Pengunjung'
    ),
    email: String(row?.email || row?.sender_email || ''),
    subject: String(row?.subject || row?.subjek || ''),
    message: String(row?.message || row?.pesan || row?.body || ''),
    created_at: row?.created_at
      ? String(row.created_at)
      : row?.createdAt
        ? String(row.createdAt)
        : new Date().toISOString(),
  };
}

export async function GET(request: Request) {
  try {
    const colNames = await ensureContactTables();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    let contentRow: any = null;
    try {
      const rawContent: any = await sql`
        SELECT * FROM contact_content WHERE id = 'default' LIMIT 1
      `;
      const contentRows = extractRows(rawContent);
      contentRow = contentRows[0] || null;
    } catch {
      contentRow = null;
    }

    const rawAll: any = await sql`SELECT * FROM messages`;
    const allRows = extractRows(rawAll);
    const sortedRows = [...allRows].reverse();
    const messages = sortedRows.map((row, idx) => normalizeMessage(row, idx));

    const debugInfo = {
      dbConnected: true,
      table: 'public.messages',
      columns: colNames,
      rowsCount: messages.length,
      checkedAt: new Date().toISOString(),
    };

    if (id) {
      const found = messages.find((m) => m.id === id) || null;
      return NextResponse.json(
        {
          success: true,
          content: contentRow,
          data: found,
          messages,
          debug: debugInfo,
          updatedAt: Date.now(),
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        content: contentRow,
        messages,
        debug: debugInfo,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal memuat pesan masuk',
        debug: {
          dbConnected: false,
          error: err?.message || String(err),
        },
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const colNames = await ensureContactTables();
    const body = await request.json();

    // Simpan pengaturan halaman Contact dari dashboard admin
    if (body?.target === 'content') {
      const badgeText = String(body.badge_text || 'GET IN TOUCH').trim();
      const badgeTextId = String(body.badge_text_id || 'HUBUNGI SAYA').trim();
      const email = String(body.email || '').trim();
      const title = String(body.title || '').trim();
      const titleId = String(body.title_id || '').trim();
      const subtitle = String(body.subtitle || '').trim();
      const subtitleId = String(body.subtitle_id || '').trim();
      const phone = String(body.phone || '').trim();
      const location = String(body.location || '').trim();
      const locationId = String(body.location_id || '').trim();
      const responseTime = String(body.response_time || '').trim();
      const responseTimeId = String(body.response_time_id || '').trim();

      const rawSaved: any = await sql`
        INSERT INTO contact_content (
          id,
          badge_text,
          badge_text_id,
          email,
          title,
          title_id,
          subtitle,
          subtitle_id,
          phone,
          location,
          location_id,
          response_time,
          response_time_id,
          updated_at
        )
        VALUES (
          'default',
          ${badgeText},
          ${badgeTextId},
          ${email},
          ${title},
          ${titleId},
          ${subtitle},
          ${subtitleId},
          ${phone},
          ${location},
          ${locationId},
          ${responseTime},
          ${responseTimeId},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          badge_text = EXCLUDED.badge_text,
          badge_text_id = EXCLUDED.badge_text_id,
          email = EXCLUDED.email,
          title = EXCLUDED.title,
          title_id = EXCLUDED.title_id,
          subtitle = EXCLUDED.subtitle,
          subtitle_id = EXCLUDED.subtitle_id,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          location_id = EXCLUDED.location_id,
          response_time = EXCLUDED.response_time,
          response_time_id = EXCLUDED.response_time_id,
          updated_at = NOW()
        RETURNING *
      `;

      const savedRows = extractRows(rawSaved);

      return NextResponse.json(
        {
          success: true,
          message: 'Informasi kontak berhasil disimpan',
          content: savedRows[0] || body,
          updatedAt: Date.now(),
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    // Kirim pesan baru dari pengunjung ke tabel messages
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Semua field wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rawInserted: any = await sql`
      INSERT INTO messages (
        name,
        nama,
        email,
        subject,
        subjek,
        message,
        pesan,
        ip_address,
        created_at
      )
      VALUES (
        ${name},
        ${name},
        ${email},
        ${subject},
        ${subject},
        ${message},
        ${message},
        ${''},
        NOW()
      )
      RETURNING *
    `;

    const insertedRows = extractRows(rawInserted);
    if (insertedRows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSERT ke public.messages tidak mengembalikan baris.',
          debug: {
            dbConnected: true,
            table: 'public.messages',
            columns: colNames,
          },
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    const rawAllAfter: any = await sql`SELECT * FROM messages`;
    const allAfterRows = extractRows(rawAllAfter);

    return NextResponse.json(
      {
        success: true,
        message: 'Pesan berhasil dikirim',
        data: normalizeMessage(insertedRows[0], 0),
        debug: {
          dbConnected: true,
          table: 'public.messages',
          columns: colNames,
          rowsCountAfterInsert: allAfterRows.length,
        },
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Terjadi kesalahan saat menyimpan pesan',
        debug: {
          dbConnected: false,
          error: err?.message || String(err),
        },
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureContactTables();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesan tidak ditemukan' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await sql`
      DELETE FROM messages WHERE id::text = ${id}
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Pesan berhasil dihapus',
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menghapus pesan',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}