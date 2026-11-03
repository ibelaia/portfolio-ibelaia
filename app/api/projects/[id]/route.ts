import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID proyek tidak valid' }, { status: 400 });
    }

    await sql`DELETE FROM projects WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: 'Proyek berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}