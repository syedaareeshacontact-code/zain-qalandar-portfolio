import { NextResponse } from 'next/server';
import {
  createGoogleOAuthClient,
  decryptGoogleTokens,
  encryptGoogleTokens,
  cookieOptions,
  GOOGLE_STATE_COOKIE,
  GOOGLE_TOKEN_COOKIE,
} from '@/lib/googleCalendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function dashboardRedirect(request, reason) {
  const url = new URL('/dashboard', request.url);
  if (reason) url.searchParams.set('google', reason);
  return url;
}

function getFailureReason(error) {
  if (error?.message?.includes('JWT_SECRET')) return 'missing_jwt_secret';
  if (error?.message?.includes('Google Calendar environment variables')) return 'missing_google_config';
  return 'error';
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const returnedError = requestUrl.searchParams.get('error');
  const savedState = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;

  if (returnedError) {
    return NextResponse.redirect(dashboardRedirect(request, 'denied'));
  }

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(dashboardRedirect(request, 'invalid_state'));
  }

  try {
    const client = createGoogleOAuthClient();
    const { tokens } = await client.getToken(code);
    const previousTokens = decryptGoogleTokens(request.cookies.get(GOOGLE_TOKEN_COOKIE)?.value);
    const refreshToken = tokens.refresh_token || previousTokens?.refresh_token;

    if (!refreshToken) {
      return NextResponse.redirect(dashboardRedirect(request, 'missing_refresh_token'));
    }

    const response = NextResponse.redirect(dashboardRedirect(request, 'connected'));
    response.cookies.set(
      GOOGLE_TOKEN_COOKIE,
      encryptGoogleTokens({ refresh_token: refreshToken }),
      cookieOptions(60 * 60 * 24 * 365),
    );
    response.cookies.set(GOOGLE_STATE_COOKIE, '', cookieOptions(0));
    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.redirect(dashboardRedirect(request, getFailureReason(error)));
  }
}
