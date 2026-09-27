import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{ name, email, message }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'Pesan berhasil dikirim' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'API Contact is running' }, { status: 200 });
}