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
    // Mencoba melakukan kueri paling sederhana ke database
    const result = await sql`SELECT NOW() as current_time`;
    return NextResponse.json(
      {
        success: true,
        message: 'Koneksi database berhasil!',
        time: result[0].current_time,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        envCheck: process.env.DATABASE_URL
          ? 'DATABASE_URL terdeteksi'
          : 'DATABASE_URL KOSONG!',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}