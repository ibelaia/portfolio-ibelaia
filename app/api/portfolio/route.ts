import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    // Mengambil data dari berbagai tabel Neon secara paralel
    const [general, home, projects, achievements] = await Promise.all([
      sql`SELECT * FROM general_settings LIMIT 1`,
      sql`SELECT * FROM home_settings LIMIT 1`,
      sql`SELECT * FROM projects`,
      sql`SELECT * FROM achievements`
    ]);

    return NextResponse.json({
      success: true,
      general: general[0] || {},
      home: home[0] || {},
      projects: projects || [],
      achievements: achievements || []
    }, { status: 200 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil data' }, { status: 500 });
  }
}