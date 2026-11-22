import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    // Ambil header achievements
    const headerRows = await sql`
      SELECT * FROM achievements_header WHERE id = 'default'
    `;

    // Ambil daftar achievements
    const data = await sql`
      SELECT * FROM achievements
      ORDER BY created_at DESC
    `;

    return NextResponse.json(
      {
        success: true,
        header: headerRows[0] || null,
        data: data,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'terjadi kesalahan saat mengambil data achievements',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, issuer, date, description, credential_url } = body;

    if (!title || !issuer) {
      return NextResponse.json(
        { success: false, error: 'Judul dan penerbit wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rows = await sql`
      INSERT INTO achievements (title, issuer, date, description, credential_url)
      VALUES (${title}, ${issuer}, ${date || ''}, ${description || ''}, ${credential_url || ''})
      RETURNING *
    `;

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
    const body = await req.json();
    const { id, title, issuer, date, description, credential_url } = body;

    if (!id || !title || !issuer) {
      return NextResponse.json(
        { success: false, error: 'ID, judul, dan penerbit wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rows = await sql`
      UPDATE achievements
      SET
        title = ${title},
        issuer = ${issuer},
        date = ${date || ''},
        description = ${description || ''},
        credential_url = ${credential_url || ''}
      WHERE id = ${id}
      RETURNING *
    `;

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