import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Mencoba melakukan kueri paling sederhana ke database
    const result = await sql`SELECT NOW() as current_time`;
    return NextResponse.json({ 
      success: true, 
      message: "Koneksi database berhasil!", 
      time: result[0].current_time 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      envCheck: process.env.DATABASE_URL ? "DATABASE_URL terdeteksi" : "DATABASE_URL KOSONG!"
    }, { status: 500 });
  }
}