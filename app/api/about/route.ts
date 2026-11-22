import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Ibe Laia',
    education: {
      major: 'Informatics',
      university: 'UPN "Veteran" Jawa Timur',
      period: '2026 - Present',
    },
    currentFocus: ['Web Architecture', 'Scalable APIs', 'UI/UX Systems'],
    interests: ['Full Stack', 'System Design', 'AI'],
    whatIDo: ['Full-Stack Systems', 'Interface Design', 'Workflow Automation'],
  });
}