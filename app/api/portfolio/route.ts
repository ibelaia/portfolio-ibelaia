import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let homeColumnsEnsured = false;

async function ensureHomeBilingualColumns() {
  if (homeColumnsEnsured) return;

  await sql`
    ALTER TABLE home_settings
    ADD COLUMN IF NOT EXISTS subtitle_id TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS highlight_text_id TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS description_id TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS primary_btn_text TEXT DEFAULT 'Explore My Work',
    ADD COLUMN IF NOT EXISTS primary_btn_text_id TEXT DEFAULT 'Jelajahi Karya Saya',
    ADD COLUMN IF NOT EXISTS primary_btn_link TEXT DEFAULT '/projects',
    ADD COLUMN IF NOT EXISTS secondary_btn_text TEXT DEFAULT 'Contact Me',
    ADD COLUMN IF NOT EXISTS secondary_btn_text_id TEXT DEFAULT 'Hubungi Saya',
    ADD COLUMN IF NOT EXISTS secondary_btn_link TEXT DEFAULT '/contact'
  `;

  homeColumnsEnsured = true;
}

export async function GET() {
  try {
    await ensureHomeBilingualColumns();

    // Mengambil data dari berbagai tabel Neon secara paralel
    const [general, home, projects, achievements] = await Promise.all([
      sql`SELECT * FROM general_settings LIMIT 1`,
      sql`SELECT * FROM home_settings LIMIT 1`,
      sql`SELECT * FROM projects`,
      sql`SELECT * FROM achievements`,
    ]);

    return NextResponse.json(
      {
        success: true,
        general: general[0] || {},
        home: home[0] || {},
        projects: projects || [],
        achievements: achievements || [],
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Gagal mengambil data' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

async function upsertHomeSettings(request: NextRequest) {
  try {
    await ensureHomeBilingualColumns();

    const body = await request.json();
    const payload =
      body?.home && typeof body.home === 'object' ? body.home : body;

    const existingRows = await sql`SELECT * FROM home_settings LIMIT 1`;
    const current = (existingRows[0] || {}) as Record<string, any>;

    const profilePhotoUrl =
      payload?.profile_photo_url ??
      payload?.avatar_url ??
      current.profile_photo_url ??
      current.avatar_url ??
      null;

    const heroCoverUrl =
      payload?.hero_cover_url ?? current.hero_cover_url ?? null;

    const subtitle = payload?.subtitle ?? current.subtitle ?? null;
    const subtitleId = payload?.subtitle_id ?? current.subtitle_id ?? '';
    const title = payload?.title ?? current.title ?? null;
    const highlightText =
      payload?.highlight_text ?? current.highlight_text ?? null;
    const highlightTextId =
      payload?.highlight_text_id ?? current.highlight_text_id ?? '';
    const description = payload?.description ?? current.description ?? null;
    const descriptionId =
      payload?.description_id ?? current.description_id ?? '';
    const primaryBtnText =
      payload?.primary_btn_text ?? current.primary_btn_text ?? null;
    const primaryBtnTextId =
      payload?.primary_btn_text_id ?? current.primary_btn_text_id ?? '';
    const primaryBtnLink =
      payload?.primary_btn_link ?? current.primary_btn_link ?? null;
    const secondaryBtnText =
      payload?.secondary_btn_text ?? current.secondary_btn_text ?? null;
    const secondaryBtnTextId =
      payload?.secondary_btn_text_id ?? current.secondary_btn_text_id ?? '';
    const secondaryBtnLink =
      payload?.secondary_btn_link ?? current.secondary_btn_link ?? null;

    const projectsCompleted =
      payload?.projects_completed !== undefined
        ? Number(payload.projects_completed) || 0
        : Number(current.projects_completed) || 0;
    const happyClients =
      payload?.happy_clients !== undefined
        ? Number(payload.happy_clients) || 0
        : Number(current.happy_clients) || 0;
    const yearsExperience =
      payload?.years_experience !== undefined
        ? Number(payload.years_experience) || 0
        : Number(current.years_experience) || 0;

    let savedRow: Record<string, any> = {
      ...current,
      subtitle,
      subtitle_id: subtitleId,
      title,
      highlight_text: highlightText,
      highlight_text_id: highlightTextId,
      description,
      description_id: descriptionId,
      hero_cover_url: heroCoverUrl,
      profile_photo_url: profilePhotoUrl,
      primary_btn_text: primaryBtnText,
      primary_btn_text_id: primaryBtnTextId,
      primary_btn_link: primaryBtnLink,
      secondary_btn_text: secondaryBtnText,
      secondary_btn_text_id: secondaryBtnTextId,
      secondary_btn_link: secondaryBtnLink,
      projects_completed: projectsCompleted,
      happy_clients: happyClients,
      years_experience: yearsExperience,
    };

    if (current.id !== undefined && current.id !== null) {
      const updated = await sql`
        UPDATE home_settings
        SET
          subtitle = ${subtitle},
          subtitle_id = ${subtitleId},
          title = ${title},
          highlight_text = ${highlightText},
          highlight_text_id = ${highlightTextId},
          description = ${description},
          description_id = ${descriptionId},
          hero_cover_url = ${heroCoverUrl},
          profile_photo_url = ${profilePhotoUrl},
          primary_btn_text = ${primaryBtnText},
          primary_btn_text_id = ${primaryBtnTextId},
          primary_btn_link = ${primaryBtnLink},
          secondary_btn_text = ${secondaryBtnText},
          secondary_btn_text_id = ${secondaryBtnTextId},
          secondary_btn_link = ${secondaryBtnLink},
          projects_completed = ${projectsCompleted},
          happy_clients = ${happyClients},
          years_experience = ${yearsExperience}
        WHERE id = ${current.id}
        RETURNING *
      `;
      if (updated[0]) {
        savedRow = updated[0];
      }
    } else {
      const inserted = await sql`
        INSERT INTO home_settings (
          subtitle,
          subtitle_id,
          title,
          highlight_text,
          highlight_text_id,
          description,
          description_id,
          hero_cover_url,
          profile_photo_url,
          primary_btn_text,
          primary_btn_text_id,
          primary_btn_link,
          secondary_btn_text,
          secondary_btn_text_id,
          secondary_btn_link,
          projects_completed,
          happy_clients,
          years_experience
        )
        VALUES (
          ${subtitle},
          ${subtitleId},
          ${title},
          ${highlightText},
          ${highlightTextId},
          ${description},
          ${descriptionId},
          ${heroCoverUrl},
          ${profilePhotoUrl},
          ${primaryBtnText},
          ${primaryBtnTextId},
          ${primaryBtnLink},
          ${secondaryBtnText},
          ${secondaryBtnTextId},
          ${secondaryBtnLink},
          ${projectsCompleted},
          ${happyClients},
          ${yearsExperience}
        )
        RETURNING *
      `;
      if (inserted[0]) {
        savedRow = inserted[0];
      }
    }

    return NextResponse.json(
      {
        success: true,
        home: savedRow,
        data: savedRow,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Gagal menyimpan data home' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  return upsertHomeSettings(request);
}

export async function PUT(request: NextRequest) {
  return upsertHomeSettings(request);
}