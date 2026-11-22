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
    const data = await sql`SELECT * FROM services ORDER BY created_at DESC`;
    return NextResponse.json(
      { success: true, data, updatedAt: Date.now() },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('API Error /services:', error); // Cek ini di terminal
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, icon, price } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Judul layanan wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rows = await sql`
      INSERT INTO services (title, description, icon, price)
      VALUES (${title}, ${description || ''}, ${icon || ''}, ${price || ''})
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
  } catch (error: any) {
    console.error('API Error POST /services:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal menambah data services' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, description, icon, price } = body;

    if (!id || !title) {
      return NextResponse.json(
        { success: false, error: 'ID dan judul layanan wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const rows = await sql`
      UPDATE services
      SET
        title = ${title},
        description = ${description || ''},
        icon = ${icon || ''},
        price = ${price || ''}
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
  } catch (error: any) {
    console.error('API Error PUT /services:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memperbarui data services' },
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
      { success: false, error: error.message || 'Gagal menghapus data services' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}