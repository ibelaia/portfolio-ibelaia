import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Handler dasar untuk upload endpoint
    return NextResponse.json(
      { success: true, message: 'Upload endpoint siap digunakan' },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengunggah file' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'API Upload is running' }, { status: 200 });
}