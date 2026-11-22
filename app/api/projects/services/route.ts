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
      SELECT * FROM services
      ORDER BY created_at DESC
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
    const { title, description, icon, price } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Judul layanan wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = await sql`
      INSERT INTO services (title, description, icon, price)
      VALUES (${title}, ${description || ''}, ${icon || ''}, ${price || ''})
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Layanan berhasil ditambahkan',
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