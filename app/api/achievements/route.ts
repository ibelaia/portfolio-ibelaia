import { NextResponse } from 'next/server';
import sql from '@/lib/db';

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

    return NextResponse.json({
      success: true,
      header: headerRows[0] || null,
      data: data,
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'terjadi kesalahan saat mengambil data achievements',
    }, { status: 500 });
  }
}