import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

const DEFAULT_GENERAL = {
  site_name: 'IbeLaia.Dev',
  site_tagline: 'Software Engineer & Full-Stack Developer',
  site_description: '',
  availability_status: 'Available for Hire',
  contact_email: 'ibelaia@example.com',
  location: 'Surabaya, Indonesia',
  github_url: '',
  linkedin_url: '',
  footer_description:
    'Building digital solutions with code, creativity, and purpose.',
  copyright_text: '2026 IbeLaia.Dev. All rights reserved.',
};

let generalSchemaReady = false;

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

async function ensureGeneralTable() {
  if (generalSchemaReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS general_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      site_name TEXT DEFAULT 'IbeLaia.Dev',
      site_tagline TEXT DEFAULT 'Software Engineer & Full-Stack Developer',
      site_description TEXT DEFAULT '',
      availability_status TEXT DEFAULT 'Available for Hire',
      contact_email TEXT DEFAULT 'ibelaia@example.com',
      location TEXT DEFAULT 'Surabaya, Indonesia',
      github_url TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      footer_description TEXT DEFAULT 'Building digital solutions with code, creativity, and purpose.',
      copyright_text TEXT DEFAULT '2026 IbeLaia.Dev. All rights reserved.',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE general_settings
    ADD COLUMN IF NOT EXISTS site_name TEXT DEFAULT 'IbeLaia.Dev',
    ADD COLUMN IF NOT EXISTS site_tagline TEXT DEFAULT 'Software Engineer & Full-Stack Developer',
    ADD COLUMN IF NOT EXISTS site_description TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'Available for Hire',
    ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT 'ibelaia@example.com',
    ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Surabaya, Indonesia',
    ADD COLUMN IF NOT EXISTS github_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS linkedin_url TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS footer_description TEXT DEFAULT 'Building digital solutions with code, creativity, and purpose.',
    ADD COLUMN IF NOT EXISTS copyright_text TEXT DEFAULT '2026 IbeLaia.Dev. All rights reserved.',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `;

  generalSchemaReady = true;
}

function normalizeGeneral(row: any) {
  return {
    site_name: String(row?.site_name ?? DEFAULT_GENERAL.site_name),
    site_tagline: String(row?.site_tagline ?? DEFAULT_GENERAL.site_tagline),
    site_description: String(
      row?.site_description ?? DEFAULT_GENERAL.site_description
    ),
    availability_status: String(
      row?.availability_status ?? DEFAULT_GENERAL.availability_status
    ),
    contact_email: String(row?.contact_email ?? DEFAULT_GENERAL.contact_email),
    location: String(row?.location ?? DEFAULT_GENERAL.location),
    github_url: String(row?.github_url ?? DEFAULT_GENERAL.github_url),
    linkedin_url: String(row?.linkedin_url ?? DEFAULT_GENERAL.linkedin_url),
    footer_description: String(
      row?.footer_description ?? DEFAULT_GENERAL.footer_description
    ),
    copyright_text: String(
      row?.copyright_text ?? DEFAULT_GENERAL.copyright_text
    ),
  };
}

export async function GET() {
  try {
    await ensureGeneralTable();
    const rawRows: any = await sql`SELECT * FROM general_settings LIMIT 1`;
    const rows = extractRows(rawRows);
    const data = normalizeGeneral(rows[0] || null);

    return NextResponse.json(
      {
        success: true,
        data,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal memuat pengaturan situs',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

async function upsertSettings(req: NextRequest) {
  try {
    await ensureGeneralTable();
    const body = await req.json();
    const rawExisting: any = await sql`SELECT * FROM general_settings LIMIT 1`;
    const existingRows = extractRows(rawExisting);
    const current = existingRows[0] || null;

    const siteName = String(
      body?.site_name ?? current?.site_name ?? DEFAULT_GENERAL.site_name
    ).trim();
    const siteTagline = String(
      body?.site_tagline ??
        current?.site_tagline ??
        DEFAULT_GENERAL.site_tagline
    ).trim();
    const siteDescription = String(
      body?.site_description ??
        current?.site_description ??
        DEFAULT_GENERAL.site_description
    ).trim();
    const availabilityStatus = String(
      body?.availability_status ??
        current?.availability_status ??
        DEFAULT_GENERAL.availability_status
    ).trim();
    const contactEmail = String(
      body?.contact_email ??
        current?.contact_email ??
        DEFAULT_GENERAL.contact_email
    ).trim();
    const location = String(
      body?.location ?? current?.location ?? DEFAULT_GENERAL.location
    ).trim();
    const githubUrl = String(
      body?.github_url ?? current?.github_url ?? DEFAULT_GENERAL.github_url
    ).trim();
    const linkedinUrl = String(
      body?.linkedin_url ??
        current?.linkedin_url ??
        DEFAULT_GENERAL.linkedin_url
    ).trim();
    const footerDescription = String(
      body?.footer_description ??
        current?.footer_description ??
        DEFAULT_GENERAL.footer_description
    ).trim();
    const copyrightText = String(
      body?.copyright_text ??
        current?.copyright_text ??
        DEFAULT_GENERAL.copyright_text
    ).trim();

    if (current && current.id !== undefined && current.id !== null) {
      const rawUpdated: any = await sql`
        UPDATE general_settings
        SET
          site_name = ${siteName},
          site_tagline = ${siteTagline},
          site_description = ${siteDescription},
          availability_status = ${availabilityStatus},
          contact_email = ${contactEmail},
          location = ${location},
          github_url = ${githubUrl},
          linkedin_url = ${linkedinUrl},
          footer_description = ${footerDescription},
          copyright_text = ${copyrightText},
          updated_at = NOW()
        WHERE id::text = ${String(current.id)}
        RETURNING *
      `;
      const updatedRows = extractRows(rawUpdated);
      const normalized = normalizeGeneral(
        updatedRows[0] || {
          ...current,
          site_name: siteName,
          site_tagline: siteTagline,
          site_description: siteDescription,
          availability_status: availabilityStatus,
          contact_email: contactEmail,
          location,
          github_url: githubUrl,
          linkedin_url: linkedinUrl,
          footer_description: footerDescription,
          copyright_text: copyrightText,
        }
      );

      return NextResponse.json(
        {
          success: true,
          data: normalized,
          updatedAt: Date.now(),
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const rawInserted: any = await sql`
      INSERT INTO general_settings (
        id,
        site_name,
        site_tagline,
        site_description,
        availability_status,
        contact_email,
        location,
        github_url,
        linkedin_url,
        footer_description,
        copyright_text,
        updated_at
      )
      VALUES (
        'default',
        ${siteName},
        ${siteTagline},
        ${siteDescription},
        ${availabilityStatus},
        ${contactEmail},
        ${location},
        ${githubUrl},
        ${linkedinUrl},
        ${footerDescription},
        ${copyrightText},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        site_name = EXCLUDED.site_name,
        site_tagline = EXCLUDED.site_tagline,
        site_description = EXCLUDED.site_description,
        availability_status = EXCLUDED.availability_status,
        contact_email = EXCLUDED.contact_email,
        location = EXCLUDED.location,
        github_url = EXCLUDED.github_url,
        linkedin_url = EXCLUDED.linkedin_url,
        footer_description = EXCLUDED.footer_description,
        copyright_text = EXCLUDED.copyright_text,
        updated_at = NOW()
      RETURNING *
    `;

    const insertedRows = extractRows(rawInserted);
    const normalized = normalizeGeneral(
      insertedRows[0] || {
        site_name: siteName,
        site_tagline: siteTagline,
        site_description: siteDescription,
        availability_status: availabilityStatus,
        contact_email: contactEmail,
        location,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        footer_description: footerDescription,
        copyright_text: copyrightText,
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: normalized,
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