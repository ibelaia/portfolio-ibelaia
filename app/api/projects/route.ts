import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

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
      { error: err.message || 'Terjadi kesalahan' },
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
      type,
      overview,
      thumbnail,
      live_url,
      github_url,
      is_featured,
    } = body;

    if (!title || !category) {
      return NextResponse.json(
        { error: 'Judul dan kategori wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = await sql`
      INSERT INTO projects (title, slug, category, type, overview, thumbnail, live_url, github_url, is_featured)
      VALUES (${title}, ${slug || ''}, ${category}, ${type || 'single'}, ${overview || ''}, ${thumbnail || ''}, ${live_url || ''}, ${github_url || ''}, ${Boolean(is_featured)})
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Proyek berhasil ditambahkan',
        data,
        updatedAt: Date.now(),
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}