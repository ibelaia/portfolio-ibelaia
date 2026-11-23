import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file || typeof file === 'string') {
        return NextResponse.json(
          { success: false, error: 'Berkas file tidak ditemukan' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      const blobFile = file as File;
      if (blobFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Ukuran berkas maksimal 5MB' },
          { status: 400, headers: NO_STORE_HEADERS }
        );
      }

      const bytes = await blobFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const safeBaseName = path
        .basename(blobFile.name || 'upload')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${safeBaseName}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contact');

      try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), buffer);

        return NextResponse.json(
          {
            success: true,
            url: `/uploads/contact/${fileName}`,
            fileName,
            updatedAt: Date.now(),
          },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      } catch {
        // Fallback ke data URL apabila filesystem read-only (mis. serverless)
        const mimeType = blobFile.type || 'application/octet-stream';
        const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

        return NextResponse.json(
          {
            success: true,
            url: dataUrl,
            fileName: safeBaseName,
            updatedAt: Date.now(),
          },
          { status: 200, headers: NO_STORE_HEADERS }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: true,
        message: 'Upload endpoint siap digunakan',
        data: body,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal mengunggah file',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      status: 'API Upload is running',
      updatedAt: Date.now(),
    },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}