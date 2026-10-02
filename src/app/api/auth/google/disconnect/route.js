import { NextResponse } from 'next/server';
import { clearGoogleTokenCookie } from '@/lib/googleCalendar';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ data: { connected: false } });
  clearGoogleTokenCookie(response);
  return response;
}
