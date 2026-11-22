import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

let aboutRuntimeState: Record<string, any> = {
  name: 'Ibe Laia',
  title: 'Informatics Student & Full-Stack Developer',
  bio: 'Building full-stack web applications, UI/UX systems, and scalable digital solutions.',
  experience_years: '2026 - Present',
  avatar_url: '',
  education: {
    major: 'Informatics',
    university: 'UPN "Veteran" Jawa Timur',
    period: '2026 - Present',
  },
  currentFocus: ['Web Architecture', 'Scalable APIs', 'UI/UX Systems'],
  interests: ['Full Stack', 'System Design', 'AI'],
  whatIDo: ['Full-Stack Systems', 'Interface Design', 'Workflow Automation'],
};

export async function GET() {
  return NextResponse.json(
    {
      ...aboutRuntimeState,
      success: true,
      data: aboutRuntimeState,
      updatedAt: Date.now(),
    },
    { headers: NO_STORE_HEADERS }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    aboutRuntimeState = {
      ...aboutRuntimeState,
      ...body,
      name: body?.name ?? aboutRuntimeState.name,
      title: body?.title ?? aboutRuntimeState.title,
      bio: body?.bio ?? aboutRuntimeState.bio,
      experience_years:
        body?.experience_years ?? aboutRuntimeState.experience_years,
      avatar_url: body?.avatar_url ?? aboutRuntimeState.avatar_url,
      education: body?.education ?? aboutRuntimeState.education,
      currentFocus: body?.currentFocus ?? aboutRuntimeState.currentFocus,
      interests: body?.interests ?? aboutRuntimeState.interests,
      whatIDo: body?.whatIDo ?? aboutRuntimeState.whatIDo,
    };

    return NextResponse.json(
      {
        ...aboutRuntimeState,
        success: true,
        data: aboutRuntimeState,
        updatedAt: Date.now(),
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal memproses permintaan About',
      },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }
}