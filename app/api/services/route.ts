import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const data = await sql`SELECT * FROM services ORDER BY created_at DESC`;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('API Error /services:', error); // Cek ini di terminal
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}