import { NextResponse } from 'next/server';
import { DEFAULT_PRAYER_LOCATION, PRAYER_LOCATIONS, getPrayerRoutineData } from '@/lib/prayerTimes';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('city') || DEFAULT_PRAYER_LOCATION.id;
  const location = PRAYER_LOCATIONS.find((item) => item.id === id);
  if (!location) return NextResponse.json({ message: 'Choose a supported city.' }, { status: 400 });
  try {
    return NextResponse.json({ data: await getPrayerRoutineData(location) });
  } catch {
    return NextResponse.json({ message: 'Prayer times could not be loaded. Please retry.' }, { status: 503 });
  }
}
