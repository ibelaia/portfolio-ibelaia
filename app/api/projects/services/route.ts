import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('services')
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
    const { title, description, icon, price } = body;

    if (!title) {
      return NextResponse.json({ error: 'Judul layanan wajib diisi' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('services')
      .insert([{ title, description, icon, price }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Layanan berhasil ditambahkan', data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}