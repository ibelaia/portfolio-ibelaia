import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zuvlslccrtalsbaukqi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1dmx2c2xjY3J0YWxzYmF1a3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyOTI1MTMsImV4cCI6MjEwNDg2ODUxM30.bFjEgfzgxAL8aXrVlxzrR0bTaMcCxCMGoVQk1XiSXvo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Ambil data umum, proyek, dan pencapaian dari Supabase
    const { data: general } = await supabase.from('general_settings').select('*');
    const { data: home } = await supabase.from('home_settings').select('*');
    const { data: projects } = await supabase.from('projects').select('*');
    const { data: achievements } = await supabase.from('achievements').select('*');

    return NextResponse.json({
      general: general || [],
      home: home || [],
      projects: projects || [],
      achievements: achievements || [],
    });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}