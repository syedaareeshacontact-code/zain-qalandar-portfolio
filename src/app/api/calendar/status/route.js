import { NextResponse } from 'next/server';
import { clearGoogleTokenCookie, getGoogleCalendarConnection } from '@/lib/googleCalendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  let connection;
  try {
    connection = getGoogleCalendarConnection(request);
  } catch (error) {
    console.error('Google Calendar configuration error:', error);
    return NextResponse.json({ message: 'Google Calendar is not configured correctly.' }, { status: 500 });
  }

  if (!connection) return NextResponse.json({ data: { connected: false } });

  try {
    // `calendar.events` is intentionally the only OAuth scope requested by
    // this app. `calendars.get()` requires a broader calendar/calendar.readonly
    // scope, so it would fail even after a successful OAuth consent flow.
    // Listing events validates the same connection using the scope we already
    // have and does not require another permission prompt.
    await connection.calendar.events.list({
      calendarId: 'primary',
      maxResults: 1,
      showDeleted: false,
    });
    return NextResponse.json({
      data: {
        connected: true,
        calendarName: 'Primary calendar',
      },
    });
  } catch (error) {
    console.error('Google Calendar status error:', error);
    const response = NextResponse.json({ message: 'Google Calendar connection expired. Please reconnect.' }, { status: 401 });
    clearGoogleTokenCookie(response);
    return response;
  }
}
