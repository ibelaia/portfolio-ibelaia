import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`SELECT * FROM certificates ORDER BY created_at DESC`;
    return NextResponse.json({
      success: true,
      data: data || []
    }, { status: 200 });
  } catch (err: any) {
    console.error('API Error /certificates:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Gagal mengambil data certificates'
    }, { status: 500 });
  }
}