import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  createGoogleOAuthClient,
  cookieOptions,
  GOOGLE_CALENDAR_SCOPE,
  GOOGLE_STATE_COOKIE,
} from '@/lib/googleCalendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function errorResponse(message) {
  return NextResponse.json({ message }, { status: 500 });
}

export async function GET() {
  try {
    const state = randomBytes(32).toString('hex');
    const client = createGoogleOAuthClient();
    const authorizationUrl = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [GOOGLE_CALENDAR_SCOPE],
      state,
    });

    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set(GOOGLE_STATE_COOKIE, state, cookieOptions(10 * 60));
    return response;
  } catch (error) {
    console.error('Google OAuth start error:', error);
    return errorResponse('Google Calendar is not configured correctly.');
  }
}
