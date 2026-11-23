import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

function toStringArray(val: any): string[] {
  if (Array.isArray(val)) {
    return val.map((item) => String(item ?? '').trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim() !== '') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item ?? '').trim())
          .filter(Boolean);
      }
    } catch {
      // Gunakan pemisahan baris atau koma jika bukan JSON array
    }
    return val
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function toJsonbValue(val: any, fallback: any = []) {
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string' && val.trim() !== '') {
    try {
      const parsed = JSON.parse(val);
      return JSON.stringify(parsed);
    } catch {
      return JSON.stringify(
        val
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      );
    }
  }
  return JSON.stringify(fallback);
}

export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM projects
    `;
    return NextResponse.json(
      { success: true, data, updatedAt: Date.now() },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Terjadi kesalahan' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      category,
      status,
      type,
      overview,
      tags,
      thumbnail,
      live_url,
      github_url,
      role,
      client,
      year,
      problem,
      solution,
      deliverables,
      collection_items,
      is_featured,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Judul dan kategori wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const tagsJson = toJsonbValue(tags, []);
    const deliverablesArray = toStringArray(deliverables);
    const collectionJson = toJsonbValue(collection_items, []);

    const rows = await sql`
      INSERT INTO projects (
        title,
        slug,
        category,
        status,
        type,
        overview,
        tags,
        thumbnail,
        live_url,
        github_url,
        role,
        client,
        year,
        problem,
        solution,
        deliverables,
        collection_items,
        is_featured
      )
      VALUES (
        ${title},
        ${slug || ''},
        ${category},
        ${status || 'PUBLISHED'},
        ${type || 'single'},
        ${overview || ''},
        ${tagsJson}::jsonb,
        ${thumbnail || ''},
        ${live_url || ''},
        ${github_url || ''},
        ${role || ''},
        ${client || ''},
        ${year || ''},
        ${problem || ''},
        ${solution || ''},
        ${deliverablesArray}::text[],
        ${collectionJson}::jsonb,
        ${Boolean(is_featured)}
      )
      RETURNING *
    `;

    const saved = Array.isArray(rows) ? rows[0] ?? rows : rows;

    return NextResponse.json(
      {
        success: true,
        message: 'Proyek berhasil ditambahkan',
        data: saved,
        updatedAt: Date.now(),
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Terjadi kesalahan' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      slug,
      category,
      status,
      type,
      overview,
      tags,
      thumbnail,
      live_url,
      github_url,
      role,
      client,
      year,
      problem,
      solution,
      deliverables,
      collection_items,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID proyek wajib disertakan untuk update' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    if (!title || !category) {
      return NextResponse.json(
        { success: false, error: 'Judul dan kategori wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const tagsJson = toJsonbValue(tags, []);
    const deliverablesArray = toStringArray(deliverables);
    const collectionJson = toJsonbValue(collection_items, []);

    const rows = await sql`
      UPDATE projects
      SET
        title = ${title},
        slug = ${slug || ''},
        category = ${category},
        status = ${status || 'PUBLISHED'},
        type = ${type || 'single'},
        overview = ${overview || ''},
        tags = ${tagsJson}::jsonb,
        thumbnail = ${thumbnail || ''},
        live_url = ${live_url || ''},
        github_url = ${github_url || ''},
        role = ${role || ''},
        client = ${client || ''},
        year = ${year || ''},
        problem = ${problem || ''},
        solution = ${solution || ''},
        deliverables = ${deliverablesArray}::text[],
        collection_items = ${collectionJson}::jsonb
      WHERE id = ${String(id)}
      RETURNING *
    `;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan di database' },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Proyek berhasil diperbarui',
        data: rows[0],
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal memperbarui proyek' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Parameter id wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await sql`
      DELETE FROM projects
      WHERE id = ${id}
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Proyek berhasil dihapus',
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal menghapus proyek' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}