import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (id) {
      const data = await sql`
        SELECT * FROM messages WHERE id = ${id}
      `;
      return NextResponse.json(
        { success: true, data: data[0] || null, updatedAt: Date.now() },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const messages = await sql`
      SELECT * FROM messages ORDER BY created_at DESC
    `;
    return NextResponse.json(
      { success: true, messages, updatedAt: Date.now() },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Gagal memuat pesan masuk',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const fullMessage = subject ? `[Subjek: ${subject}]\n\n${message}` : message;

    const result = await sql`
      INSERT INTO messages (name, email, message)
      VALUES (${name}, ${email}, ${fullMessage})
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Pesan berhasil dikirim',
        data: result[0],
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Terjadi kesalahan',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID pesan tidak ditemukan' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await sql`
      DELETE FROM messages WHERE id = ${id}
    `;

    return NextResponse.json(
      {
        success: true,
        message: 'Pesan berhasil dihapus',
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Gagal menghapus pesan',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}