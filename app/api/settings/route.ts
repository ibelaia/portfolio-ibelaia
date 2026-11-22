import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export async function GET() {
  try {
    const settings = await sql`SELECT * FROM general_settings LIMIT 1`;
    return NextResponse.json(
      {
        success: true,
        data: settings[0] || {},
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Gagal memuat pengaturan situs',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

async function upsertSettings(req: NextRequest) {
  try {
    const body = await req.json();
    const existing = await sql`SELECT * FROM general_settings LIMIT 1`;

    if (existing.length > 0) {
      const currentId = existing[0].id;
      const siteName = body.site_name ?? existing[0].site_name ?? '';
      const siteTagline = body.site_tagline ?? existing[0].site_tagline ?? '';
      const siteDescription =
        body.site_description ?? existing[0].site_description ?? '';
      const contactEmail = body.contact_email ?? existing[0].contact_email ?? '';
      const location = body.location ?? existing[0].location ?? '';

      const updated = await sql`
        UPDATE general_settings
        SET
          site_name = ${siteName},
          site_tagline = ${siteTagline},
          site_description = ${siteDescription},
          contact_email = ${contactEmail},
          location = ${location}
        WHERE id = ${currentId}
        RETURNING *
      `;

      return NextResponse.json(
        {
          success: true,
          data: updated[0] || { ...existing[0], ...body },
          updatedAt: Date.now(),
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const inserted = await sql`
      INSERT INTO general_settings (site_name, site_tagline, site_description, contact_email, location)
      VALUES (
        ${body.site_name || ''},
        ${body.site_tagline || ''},
        ${body.site_description || ''},
        ${body.contact_email || ''},
        ${body.location || ''}
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        data: inserted[0] || body,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menyimpan pengaturan situs',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  return upsertSettings(req);
}

export async function PUT(req: NextRequest) {
  return upsertSettings(req);
}