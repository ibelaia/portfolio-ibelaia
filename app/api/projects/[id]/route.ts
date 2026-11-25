import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
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

    const rows: any = await sql`
      SELECT * FROM projects WHERE id = ${id} LIMIT 1
    `;
    const list = Array.isArray(rows) ? rows : rows?.rows || [];

    if (!list.length) {
      return NextResponse.json(
        { success: false, error: 'Proyek tidak ditemukan' },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: list[0], updatedAt: Date.now() },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error fetching project by id:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID proyek tidak valid' },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const body = await request.json();
    const existingRows: any = await sql`
      SELECT * FROM projects WHERE id = ${id} LIMIT 1
    `;
    const existingList = Array.isArray(existingRows)
      ? existingRows
      : existingRows?.rows || [];
    const existing = existingList[0] || {};

    const isFeatured =
      typeof body?.is_featured === 'boolean'
        ? body.is_featured
        : typeof body?.featured === 'boolean'
          ? body.featured
          : Boolean(existing.is_featured);

    const updatedRows: any = await sql`
      UPDATE projects
      SET is_featured = ${isFeatured}
      WHERE id = ${id}
      RETURNING *
    `;
    const updatedList = Array.isArray(updatedRows)
      ? updatedRows
      : updatedRows?.rows || [];

    return NextResponse.json(
      {
        success: true,
        message: 'Status proyek berhasil diperbarui',
        data: updatedList[0] || { id, is_featured: isFeatured },
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error: any) {
    console.error('Error updating project by id:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

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