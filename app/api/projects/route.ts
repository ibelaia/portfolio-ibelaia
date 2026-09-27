import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

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

    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, category, description, image_url, live_url, github_url, is_featured }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Proyek berhasil ditambahkan', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}