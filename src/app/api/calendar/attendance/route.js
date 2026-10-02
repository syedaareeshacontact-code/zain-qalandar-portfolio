import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import {
  getDateKeyInPakistan,
  getGoogleCalendarConnection,
  isDateKey,
  nextDateKey,
} from '@/lib/googleCalendar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS_OPTIONS = new Map([
  ['present', { label: 'Present', colorId: '10' }],
  ['late', { label: 'Late', colorId: '5' }],
  ['absent', { label: 'Absent', colorId: '11' }],
]);

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function cleanDate(value) {
  return value || getDateKeyInPakistan();
}

async function findCalendarEvent(calendar, eventId) {
  try {
    const result = await calendar.events.get({ calendarId: 'primary', eventId });
    return result.data;
  } catch (error) {
    if (error?.code === 404 || error?.response?.status === 404) return null;
    throw error;
  }
}

export async function GET(request) {
  const date = cleanDate(new URL(request.url).searchParams.get('date'));
  if (!isDateKey(date)) return jsonError('A valid attendance date is required.');

  try {
    const database = await getDatabase();
    const attendance = await database.collection('attendance').findOne({ date });
    return NextResponse.json({ data: { attendance: attendance || null } });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return jsonError('Attendance could not be loaded.', 500);
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body.');
  }

  const date = cleanDate(body.date);
  const status = STATUS_OPTIONS.get(body.status);
  if (!isDateKey(date)) return jsonError('A valid attendance date is required.');
  if (!status) return jsonError('Choose Present, Late, or Absent.');

  let connection;
  try {
    connection = getGoogleCalendarConnection(request);
  } catch (error) {
    console.error('Google Calendar connection error:', error);
    return jsonError('Google Calendar is not configured correctly.', 500);
  }

  if (!connection) return jsonError('Connect Google Calendar before marking attendance.', 401);

  // Google Calendar event IDs only allow lowercase a-v characters and digits.
  // Keep the date-based ID deterministic so repeated clicks update the same
  // attendance event instead of creating duplicates.
  const eventId = `attendance${date.replaceAll('-', '')}`;
  const event = {
    id: eventId,
    summary: `Attendance · ${status.label}`,
    description: 'Attendance synced from the Barakah dashboard.',
    start: { date },
    end: { date: nextDateKey(date) },
    colorId: status.colorId,
    transparency: 'transparent',
    extendedProperties: {
      private: {
        source: 'barakah-dashboard',
        type: 'attendance',
        date,
      },
    },
  };

  try {
    const existingEvent = await findCalendarEvent(connection.calendar, eventId);
    const calendarResponse = existingEvent
      ? await connection.calendar.events.update({ calendarId: 'primary', eventId, sendUpdates: 'none', requestBody: event })
      : await connection.calendar.events.insert({ calendarId: 'primary', sendUpdates: 'none', requestBody: event });

    const now = new Date();
    const database = await getDatabase();
    await database.collection('attendance').updateOne(
      { date },
      {
        $set: {
          date,
          status: body.status,
          googleEventId: eventId,
          googleEventLink: calendarResponse.data.htmlLink || null,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    return NextResponse.json({
      data: {
        attendance: {
          date,
          status: body.status,
          googleEventId: eventId,
          googleEventLink: calendarResponse.data.htmlLink || null,
          updatedAt: now,
        },
      },
    });
  } catch (error) {
    console.error('Attendance sync error:', error);
    const statusCode = error?.code === 401 || error?.response?.status === 401 ? 401 : 500;
    return jsonError(
      statusCode === 401
        ? 'Google Calendar connection expired. Please reconnect.'
        : 'Attendance could not be synced to Google Calendar.',
      statusCode,
    );
  }
}
