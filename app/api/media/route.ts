import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
]);

let mediaSchemaReady = false;

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

async function ensureMediaTable() {
  if (mediaSchemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS media_assets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL DEFAULT '',
      mime_type TEXT NOT NULL DEFAULT 'image/png',
      size_bytes BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE media_assets
    ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS url TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS mime_type TEXT NOT NULL DEFAULT 'image/png',
    ADD COLUMN IF NOT EXISTS size_bytes BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()
  `;

  mediaSchemaReady = true;
}

function normalizeMediaItem(row: any, idx = 0) {
  return {
    id:
      row?.id !== undefined && row?.id !== null
        ? String(row.id)
        : `media-${idx}`,
    name: String(row?.name || 'untitled'),
    url: String(row?.url || ''),
    mime_type: String(row?.mime_type || 'image/png'),
    size_bytes: Number(row?.size_bytes || 0),
    created_at: row?.created_at
      ? String(row.created_at)
      : new Date().toISOString(),
  };
}

export async function GET() {
  try {
    await ensureMediaTable();
    const rawRows: any = await sql`
      SELECT * FROM media_assets ORDER BY id DESC
    `;
    const rows = extractRows(rawRows);
    const items = rows.map((row, idx) => normalizeMediaItem(row, idx));

    return NextResponse.json(
      {
        success: true,
        items,
        media: items,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal memuat galeri media',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureMediaTable();
    const contentType = request.headers.get('content-type') || '';

    let name = '';
    let url = '';
    let mimeType = 'image/png';
    let sizeBytes = 0;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const fileEntry = formData.get('file');

      if (!fileEntry || !(fileEntry instanceof File)) {
        return NextResponse.json(
          { success: false, error: 'Berkas gambar tidak ditemukan.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      if (fileEntry.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            error: 'Ukuran berkas maksimal 2 MB agar performa tetap optimal.',
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      mimeType = fileEntry.type || 'image/png';
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Format berkas tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG.',
          },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      name = String(formData.get('name') || fileEntry.name || 'image').trim();
      sizeBytes = fileEntry.size || 0;

      const arrayBuffer = await fileEntry.arrayBuffer();
      const base64String = Buffer.from(arrayBuffer).toString('base64');
      url = `data:${mimeType};base64,${base64String}`;
    } else {
      const body = await request.json();
      name = String(body?.name || '').trim();
      url = String(body?.url || '').trim();
      mimeType = String(body?.mime_type || 'image/png').trim();
      sizeBytes = Number(body?.size_bytes || 0);

      if (!url) {
        return NextResponse.json(
          { success: false, error: 'URL atau data gambar wajib diisi.' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }
      if (!name) {
        name = 'media-asset';
      }
    }

    const rawInserted: any = await sql`
      INSERT INTO media_assets (name, url, mime_type, size_bytes, created_at)
      VALUES (${name}, ${url}, ${mimeType}, ${sizeBytes}, NOW())
      RETURNING *
    `;
    const insertedRows = extractRows(rawInserted);
    const saved = insertedRows[0]
      ? normalizeMediaItem(insertedRows[0], 0)
      : {
          id: String(Date.now()),
          name,
          url,
          mime_type: mimeType,
          size_bytes: sizeBytes,
          created_at: new Date().toISOString(),
        };

    return NextResponse.json(
      {
        success: true,
        message: 'Gambar berhasil diunggah ke Media Library.',
        item: saved,
        data: saved,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal mengunggah gambar.',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureMediaTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID aset media tidak ditemukan.' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await sql`
      DELETE FROM media_assets WHERE id::text = ${id}
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Aset media berhasil dihapus.',
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menghapus aset media.',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}