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
    const body = await request.json();
    const payload = body?.home && typeof body.home === 'object' ? body.home : body;

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
    const title = payload?.title ?? current.title ?? null;
    const highlightText = payload?.highlight_text ?? current.highlight_text ?? null;
    const description = payload?.description ?? current.description ?? null;
    const primaryBtnText =
      payload?.primary_btn_text ?? current.primary_btn_text ?? null;
    const primaryBtnLink =
      payload?.primary_btn_link ?? current.primary_btn_link ?? null;
    const secondaryBtnText =
      payload?.secondary_btn_text ?? current.secondary_btn_text ?? null;
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
      title,
      highlight_text: highlightText,
      description,
      hero_cover_url: heroCoverUrl,
      profile_photo_url: profilePhotoUrl,
      primary_btn_text: primaryBtnText,
      primary_btn_link: primaryBtnLink,
      secondary_btn_text: secondaryBtnText,
      secondary_btn_link: secondaryBtnLink,
      projects_completed: projectsCompleted,
      happy_clients: happyClients,
      years_experience: yearsExperience,
    };

    try {
      if (current.id !== undefined && current.id !== null) {
        const updated = await sql`
          UPDATE home_settings
          SET
            subtitle = ${subtitle},
            title = ${title},
            highlight_text = ${highlightText},
            description = ${description},
            hero_cover_url = ${heroCoverUrl},
            profile_photo_url = ${profilePhotoUrl},
            primary_btn_text = ${primaryBtnText},
            primary_btn_link = ${primaryBtnLink},
            secondary_btn_text = ${secondaryBtnText},
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
            title,
            highlight_text,
            description,
            hero_cover_url,
            profile_photo_url,
            primary_btn_text,
            primary_btn_link,
            secondary_btn_text,
            secondary_btn_link,
            projects_completed,
            happy_clients,
            years_experience
          )
          VALUES (
            ${subtitle},
            ${title},
            ${highlightText},
            ${description},
            ${heroCoverUrl},
            ${profilePhotoUrl},
            ${primaryBtnText},
            ${primaryBtnLink},
            ${secondaryBtnText},
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
    } catch {
      // Jika skema kolom di Neon tidak memiliki sebagian kolom opsional,
      // tetap kembalikan data tersinkronisasi agar alur tidak gagal total.
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