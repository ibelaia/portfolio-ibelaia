import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const settings = await sql`SELECT * FROM general_settings LIMIT 1`;
    return NextResponse.json({
      success: true,
      data: settings[0] || {}
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Gagal memuat pengaturan situs'
    }, { status: 500 });
  }
}