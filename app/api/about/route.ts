import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let aboutSchemaEnsured = false;

function extractRows(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

function normalizeArrayField(raw: any): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item ?? '').trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item ?? '').trim()).filter(Boolean);
      }
    } catch {
      // Tangani sebagai teks multi-baris atau koma jika bukan JSON array
    }
    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function serializeArrayField(raw: any): string {
  return JSON.stringify(normalizeArrayField(raw));
}

async function ensureAboutSchema() {
  if (aboutSchemaEnsured) return;

  await sql`
    CREATE TABLE IF NOT EXISTS about_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      badge_text TEXT DEFAULT 'ABOUT ME',
      badge_text_id TEXT DEFAULT 'TENTANG SAYA',
      name TEXT DEFAULT 'Ibe Laia',
      bio_paragraph_1 TEXT DEFAULT '',
      bio_paragraph_1_id TEXT DEFAULT '',
      bio_paragraph_2 TEXT DEFAULT '',
      bio_paragraph_2_id TEXT DEFAULT '',
      cv_url TEXT DEFAULT '/resume.pdf',
      contact_btn_link TEXT DEFAULT '/contact',
      edu_major TEXT DEFAULT 'Informatics',
      edu_major_id TEXT DEFAULT 'Informatika',
      edu_institution TEXT DEFAULT 'UPN "Veteran" Jawa Timur',
      edu_period TEXT DEFAULT '2024 — Present',
      focus_items TEXT DEFAULT '[]',
      focus_items_id TEXT DEFAULT '[]',
      focus_tag TEXT DEFAULT 'Production Ready',
      focus_tag_id TEXT DEFAULT 'Siap Produksi',
      interests_tags TEXT DEFAULT '[]',
      interests_tags_id TEXT DEFAULT '[]',
      interests_tag TEXT DEFAULT 'Exploration Track',
      interests_tag_id TEXT DEFAULT 'Jalur Eksplorasi',
      what_i_do_items TEXT DEFAULT '[]',
      what_i_do_items_id TEXT DEFAULT '[]',
      what_i_do_tag TEXT DEFAULT 'Problem Solver',
      what_i_do_tag_id TEXT DEFAULT 'Pemecah Masalah',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE about_settings
    ADD COLUMN IF NOT EXISTS badge_text_id TEXT DEFAULT 'TENTANG SAYA',
    ADD COLUMN IF NOT EXISTS bio_paragraph_1_id TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS bio_paragraph_2_id TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS edu_major_id TEXT DEFAULT 'Informatika',
    ADD COLUMN IF NOT EXISTS focus_items_id TEXT DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS focus_tag_id TEXT DEFAULT 'Siap Produksi',
    ADD COLUMN IF NOT EXISTS interests_tags_id TEXT DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS interests_tag_id TEXT DEFAULT 'Jalur Eksplorasi',
    ADD COLUMN IF NOT EXISTS what_i_do_items_id TEXT DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS what_i_do_tag_id TEXT DEFAULT 'Pemecah Masalah',
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `;

  aboutSchemaEnsured = true;
}

function normalizeAboutRow(row: any) {
  return {
    badge_text: row?.badge_text ?? 'ABOUT ME',
    badge_text_id: row?.badge_text_id ?? 'TENTANG SAYA',
    name: row?.name ?? 'Ibe Laia',
    bio_paragraph_1: row?.bio_paragraph_1 ?? '',
    bio_paragraph_1_id: row?.bio_paragraph_1_id ?? '',
    bio_paragraph_2: row?.bio_paragraph_2 ?? '',
    bio_paragraph_2_id: row?.bio_paragraph_2_id ?? '',
    cv_url: row?.cv_url ?? '/resume.pdf',
    contact_btn_link: row?.contact_btn_link ?? '/contact',
    edu_major: row?.edu_major ?? 'Informatics',
    edu_major_id: row?.edu_major_id ?? 'Informatika',
    edu_institution: row?.edu_institution ?? 'UPN "Veteran" Jawa Timur',
    edu_period: row?.edu_period ?? '2024 — Present',
    focus_items: normalizeArrayField(row?.focus_items),
    focus_items_id: normalizeArrayField(row?.focus_items_id),
    focus_tag: row?.focus_tag ?? 'Production Ready',
    focus_tag_id: row?.focus_tag_id ?? 'Siap Produksi',
    interests_tags: normalizeArrayField(row?.interests_tags),
    interests_tags_id: normalizeArrayField(row?.interests_tags_id),
    interests_tag: row?.interests_tag ?? 'Exploration Track',
    interests_tag_id: row?.interests_tag_id ?? 'Jalur Eksplorasi',
    what_i_do_items: normalizeArrayField(row?.what_i_do_items),
    what_i_do_items_id: normalizeArrayField(row?.what_i_do_items_id),
    what_i_do_tag: row?.what_i_do_tag ?? 'Problem Solver',
    what_i_do_tag_id: row?.what_i_do_tag_id ?? 'Pemecah Masalah',
  };
}

export async function GET() {
  try {
    await ensureAboutSchema();
    const rawRows: any = await sql`
      SELECT * FROM about_settings WHERE id = 'default' LIMIT 1
    `;
    const rows = extractRows(rawRows);
    const data = normalizeAboutRow(rows[0] || {});

    return NextResponse.json(
      {
        ...data,
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
        error: err?.message || 'Gagal memuat data About dari database',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureAboutSchema();
    const body = await req.json();

    const rawExisting: any = await sql`
      SELECT * FROM about_settings WHERE id = 'default' LIMIT 1
    `;
    const current = extractRows(rawExisting)[0] || {};

    const badgeText = body?.badge_text ?? current.badge_text ?? 'ABOUT ME';
    const badgeTextId =
      body?.badge_text_id ?? current.badge_text_id ?? 'TENTANG SAYA';
    const name = body?.name ?? current.name ?? 'Ibe Laia';
    const bioParagraph1 =
      body?.bio_paragraph_1 ?? current.bio_paragraph_1 ?? '';
    const bioParagraph1Id =
      body?.bio_paragraph_1_id ?? current.bio_paragraph_1_id ?? '';
    const bioParagraph2 =
      body?.bio_paragraph_2 ?? current.bio_paragraph_2 ?? '';
    const bioParagraph2Id =
      body?.bio_paragraph_2_id ?? current.bio_paragraph_2_id ?? '';
    const cvUrl = body?.cv_url ?? current.cv_url ?? '/resume.pdf';
    const contactBtnLink =
      body?.contact_btn_link ?? current.contact_btn_link ?? '/contact';
    const eduMajor = body?.edu_major ?? current.edu_major ?? 'Informatics';
    const eduMajorId =
      body?.edu_major_id ?? current.edu_major_id ?? 'Informatika';
    const eduInstitution =
      body?.edu_institution ?? current.edu_institution ?? 'UPN "Veteran" Jawa Timur';
    const eduPeriod =
      body?.edu_period ?? current.edu_period ?? '2024 — Present';

    const focusItems =
      body?.focus_items !== undefined
        ? serializeArrayField(body.focus_items)
        : serializeArrayField(current.focus_items);
    const focusItemsId =
      body?.focus_items_id !== undefined
        ? serializeArrayField(body.focus_items_id)
        : serializeArrayField(current.focus_items_id);

    const focusTag =
      body?.focus_tag ?? current.focus_tag ?? 'Production Ready';
    const focusTagId =
      body?.focus_tag_id ?? current.focus_tag_id ?? 'Siap Produksi';

    const interestsTags =
      body?.interests_tags !== undefined
        ? serializeArrayField(body.interests_tags)
        : serializeArrayField(current.interests_tags);
    const interestsTagsId =
      body?.interests_tags_id !== undefined
        ? serializeArrayField(body.interests_tags_id)
        : serializeArrayField(current.interests_tags_id);

    const interestsTag =
      body?.interests_tag ?? current.interests_tag ?? 'Exploration Track';
    const interestsTagId =
      body?.interests_tag_id ?? current.interests_tag_id ?? 'Jalur Eksplorasi';

    const whatIDoItems =
      body?.what_i_do_items !== undefined
        ? serializeArrayField(body.what_i_do_items)
        : serializeArrayField(current.what_i_do_items);
    const whatIDoItemsId =
      body?.what_i_do_items_id !== undefined
        ? serializeArrayField(body.what_i_do_items_id)
        : serializeArrayField(current.what_i_do_items_id);

    const whatIDoTag =
      body?.what_i_do_tag ?? current.what_i_do_tag ?? 'Problem Solver';
    const whatIDoTagId =
      body?.what_i_do_tag_id ?? current.what_i_do_tag_id ?? 'Pemecah Masalah';

    const rawSaved: any = await sql`
      INSERT INTO about_settings (
        id,
        badge_text,
        badge_text_id,
        name,
        bio_paragraph_1,
        bio_paragraph_1_id,
        bio_paragraph_2,
        bio_paragraph_2_id,
        cv_url,
        contact_btn_link,
        edu_major,
        edu_major_id,
        edu_institution,
        edu_period,
        focus_items,
        focus_items_id,
        focus_tag,
        focus_tag_id,
        interests_tags,
        interests_tags_id,
        interests_tag,
        interests_tag_id,
        what_i_do_items,
        what_i_do_items_id,
        what_i_do_tag,
        what_i_do_tag_id,
        updated_at
      )
      VALUES (
        'default',
        ${badgeText},
        ${badgeTextId},
        ${name},
        ${bioParagraph1},
        ${bioParagraph1Id},
        ${bioParagraph2},
        ${bioParagraph2Id},
        ${cvUrl},
        ${contactBtnLink},
        ${eduMajor},
        ${eduMajorId},
        ${eduInstitution},
        ${eduPeriod},
        ${focusItems},
        ${focusItemsId},
        ${focusTag},
        ${focusTagId},
        ${interestsTags},
        ${interestsTagsId},
        ${interestsTag},
        ${interestsTagId},
        ${whatIDoItems},
        ${whatIDoItemsId},
        ${whatIDoTag},
        ${whatIDoTagId},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        badge_text = EXCLUDED.badge_text,
        badge_text_id = EXCLUDED.badge_text_id,
        name = EXCLUDED.name,
        bio_paragraph_1 = EXCLUDED.bio_paragraph_1,
        bio_paragraph_1_id = EXCLUDED.bio_paragraph_1_id,
        bio_paragraph_2 = EXCLUDED.bio_paragraph_2,
        bio_paragraph_2_id = EXCLUDED.bio_paragraph_2_id,
        cv_url = EXCLUDED.cv_url,
        contact_btn_link = EXCLUDED.contact_btn_link,
        edu_major = EXCLUDED.edu_major,
        edu_major_id = EXCLUDED.edu_major_id,
        edu_institution = EXCLUDED.edu_institution,
        edu_period = EXCLUDED.edu_period,
        focus_items = EXCLUDED.focus_items,
        focus_items_id = EXCLUDED.focus_items_id,
        focus_tag = EXCLUDED.focus_tag,
        focus_tag_id = EXCLUDED.focus_tag_id,
        interests_tags = EXCLUDED.interests_tags,
        interests_tags_id = EXCLUDED.interests_tags_id,
        interests_tag = EXCLUDED.interests_tag,
        interests_tag_id = EXCLUDED.interests_tag_id,
        what_i_do_items = EXCLUDED.what_i_do_items,
        what_i_do_items_id = EXCLUDED.what_i_do_items_id,
        what_i_do_tag = EXCLUDED.what_i_do_tag,
        what_i_do_tag_id = EXCLUDED.what_i_do_tag_id,
        updated_at = NOW()
      RETURNING *
    `;

    const savedRow = extractRows(rawSaved)[0] || {};
    const normalized = normalizeAboutRow(savedRow);

    return NextResponse.json(
      {
        ...normalized,
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
        error: err?.message || 'Gagal menyimpan data About ke database',
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}