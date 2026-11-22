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
    const data = await sql`SELECT * FROM certificates ORDER BY created_at DESC`;
    return NextResponse.json(
      {
        success: true,
        data: data || [],
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    console.error('API Error /certificates:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal mengambil data certificates',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, issuer, date, credential_url } = body;

    if (!title || !issuer) {
      return NextResponse.json(
        { success: false, error: 'Judul dan penerbit wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rows = await sql`
      INSERT INTO certificates (title, issuer, date, credential_url)
      VALUES (${title}, ${issuer}, ${date || ''}, ${credential_url || ''})
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
    console.error('API Error POST /certificates:', err);
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
    const body = await req.json();
    const { id, title, issuer, date, credential_url } = body;

    if (!id || !title || !issuer) {
      return NextResponse.json(
        { success: false, error: 'ID, judul, dan penerbit wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rows = await sql`
      UPDATE certificates
      SET
        title = ${title},
        issuer = ${issuer},
        date = ${date || ''},
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
    console.error('API Error PUT /certificates:', err);
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
    console.error('API Error DELETE /certificates:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menghapus data certificates',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}