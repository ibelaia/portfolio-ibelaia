import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM services
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, icon, price } = body;

    if (!title) {
      return NextResponse.json({ error: 'Judul layanan wajib diisi' }, { status: 400 });
    }

    const data = await sql`
      INSERT INTO services (title, description, icon, price)
      VALUES (${title}, ${description || ''}, ${icon || ''}, ${price || ''})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Layanan berhasil ditambahkan', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}