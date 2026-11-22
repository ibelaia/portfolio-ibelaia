import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const sql = neon(process.env.DATABASE_URL!);

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    void request;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID proyek tidak valid' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    await sql`DELETE FROM projects WHERE id = ${id}`;

    return NextResponse.json(
      {
        success: true,
        message: 'Proyek berhasil dihapus',
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}