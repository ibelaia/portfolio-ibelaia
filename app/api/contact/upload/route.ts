import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function POST(request: Request) {
  try {
    void request;
    // Handler dasar untuk upload endpoint
    return NextResponse.json(
      {
        success: true,
        message: 'Upload endpoint siap digunakan',
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal mengunggah file' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'API Upload is running',
      updatedAt: Date.now(),
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}