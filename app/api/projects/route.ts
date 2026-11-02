import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`
      SELECT * FROM projects 
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
    const { title, category, description, image_url, live_url, github_url, is_featured } = body;

    if (!title || !category) {
      return NextResponse.json({ error: 'Judul dan kategori wajib diisi' }, { status: 400 });
    }

    const data = await sql`
      INSERT INTO projects (title, category, description, image_url, live_url, github_url, is_featured)
      VALUES (${title}, ${category}, ${description}, ${image_url}, ${live_url}, ${github_url}, ${is_featured})
      RETURNING *
    `;

    return NextResponse.json({ success: true, message: 'Proyek berhasil ditambahkan', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}