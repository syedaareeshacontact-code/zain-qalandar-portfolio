export const PRAYER_LOCATIONS = [
  { id: 'lahore', label: 'Lahore, Pakistan', city: 'Lahore', country: 'PK', timezone: 'Asia/Karachi', method: '1', school: '1' },
  { id: 'karachi', label: 'Karachi, Pakistan', city: 'Karachi', country: 'PK', timezone: 'Asia/Karachi', method: '1', school: '1' },
  { id: 'islamabad', label: 'Islamabad, Pakistan', city: 'Islamabad', country: 'PK', timezone: 'Asia/Karachi', method: '1', school: '1' },
  { id: 'makkah', label: 'Makkah, Saudi Arabia', city: 'Makkah', country: 'SA', timezone: 'Asia/Riyadh', method: '4', school: '0' },
  { id: 'cairo', label: 'Cairo, Egypt', city: 'Cairo', country: 'EG', timezone: 'Africa/Cairo', method: '5', school: '0' },
  { id: 'istanbul', label: 'Istanbul, Turkey', city: 'Istanbul', country: 'TR', timezone: 'Europe/Istanbul', method: '13', school: '0' },
  { id: 'london', label: 'London, UK', city: 'London', country: 'GB', timezone: 'Europe/London', method: '3', school: '0' },
  { id: 'new-york', label: 'New York, USA', city: 'New York', country: 'US', timezone: 'America/New_York', method: '2', school: '0' },
  { id: 'jakarta', label: 'Jakarta, Indonesia', city: 'Jakarta', country: 'ID', timezone: 'Asia/Jakarta', method: '20', school: '0' },
];

export const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
export const DEFAULT_PRAYER_LOCATION = PRAYER_LOCATIONS[0];

export function getPrayerLocation(id) {
  return PRAYER_LOCATIONS.find((location) => location.id === id) || DEFAULT_PRAYER_LOCATION;
}

export function getPrayerDateKey(location = DEFAULT_PRAYER_LOCATION, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: location.timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function shiftPrayerDate(dateKey, offset) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

// The API is requested in ISO 8601 so each prayer carries its actual timezone offset.
export function parsePrayerTime(value) {
  if (typeof value !== 'string' || !/T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(value)) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function formatPrayerTime(value, location = DEFAULT_PRAYER_LOCATION) {
  const timestamp = typeof value === 'number' ? value : parsePrayerTime(value);
  if (timestamp === null || !Number.isFinite(timestamp)) return '—';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: location.timezone, hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(timestamp);
}

export function formatPrayerCountdown(milliseconds) {
  const minutes = Math.max(0, Math.ceil(milliseconds / 60_000));
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function getHeroBlockIndex(timings, dateKey, now = Date.now()) {
  const starts = PRAYER_NAMES.map((name) => parsePrayerTime(timings?.[name]));
  if (starts.some((time) => time === null)) return -1;
  if (now < starts[0]) return 4;
  for (let index = starts.length - 1; index >= 0; index -= 1) {
    if (now >= starts[index]) return index;
  }
  return -1;
}

export function getActivePrayerBlockIndex(timings, dateKey, now = Date.now()) {
  const index = getHeroBlockIndex(timings, dateKey, now);
  return index === 4 ? -1 : index;
}

export function isOvernightReview(timings, dateKey, now = Date.now()) {
  return getHeroBlockIndex(timings, dateKey, now) === 4;
}

export function getPrayerIntervalProgress(timings, dateKey, { previousTimings, nextTimings } = {}, now = Date.now()) {
  const starts = PRAYER_NAMES.map((name) => parsePrayerTime(timings?.[name]));
  const beforeFajr = starts[0] !== null && now < starts[0];
  return PRAYER_NAMES.map((name, index) => {
    const start = index === 4 && beforeFajr ? parsePrayerTime(previousTimings?.Isha) : starts[index];
    const end = index === 4 ? (beforeFajr ? starts[0] : parsePrayerTime(nextTimings?.Fajr)) : starts[index + 1];
    if (start === null || end === null || end <= start) return null;
    const elapsed = Math.round(Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100)));
    return { elapsed, remaining: 100 - elapsed };
  });
}

export function getLivePrayerState(data, now = Date.now()) {
  if (!data?.timings || data.dateKey !== getPrayerDateKey(getPrayerLocation(data.locationId), new Date(now))) return null;
  const entries = PRAYER_NAMES.map((name) => ({ name, time: parsePrayerTime(data.timings[name]) }));
  const tomorrowFajr = parsePrayerTime(data.nextTimings?.Fajr);
  const sunrise = parsePrayerTime(data.timings.Sunrise);
  if (entries.some((entry) => entry.time === null) || tomorrowFajr === null || sunrise === null) return null;
  const next = entries.find((entry) => entry.time > now) || { name: 'Fajr', time: tomorrowFajr, tomorrow: true };
  const blockIndex = getHeroBlockIndex(data.timings, data.dateKey, now);
  const betweenPrayers = now >= sunrise && now < entries[1].time;
  return {
    blockIndex, next, sunrise, betweenPrayers,
    label: betweenPrayers ? 'Between prayers' : blockIndex === 4 ? 'Isha → Fajr' : `${PRAYER_NAMES[blockIndex]} time`,
    countdown: formatPrayerCountdown(next.time - now),
    progress: getPrayerIntervalProgress(data.timings, data.dateKey, data, now)[blockIndex],
  };
}

async function fetchPrayerDay(dateKey, location) {
  const [year, month, day] = dateKey.split('-');
  const params = new URLSearchParams({
    city: location.city, country: location.country, method: location.method,
    school: location.school, timezonestring: location.timezone, iso8601: 'true',
  });
  const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?${params}`, {
    next: { revalidate: 3600 }, signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error('Prayer times are temporarily unavailable.');
  const payload = await response.json();
  if (payload.code !== 200 || !payload.data?.timings) throw new Error('Prayer times are temporarily unavailable.');
  return payload.data;
}

export async function getPrayerRoutineData(location = DEFAULT_PRAYER_LOCATION) {
  const dateKey = getPrayerDateKey(location);
  const [today, previous, next] = await Promise.all([
    fetchPrayerDay(dateKey, location),
    fetchPrayerDay(shiftPrayerDate(dateKey, -1), location),
    fetchPrayerDay(shiftPrayerDate(dateKey, 1), location),
  ]);
  const timings = today.timings;
  const previousTimings = previous.timings;
  const nextTimings = next.timings;
  const progress = getPrayerIntervalProgress(timings, dateKey, { previousTimings, nextTimings });
  if (progress.some((segment) => !segment) || parsePrayerTime(timings.Sunrise) === null) {
    throw new Error('Prayer provider returned incomplete timings. Please retry.');
  }
  return {
    locationId: location.id, dateKey, timings, previousTimings, nextTimings,
    hijri: `${today.date.hijri.day} ${today.date.hijri.month.en} ${today.date.hijri.year} AH`,
    activeBlockIndex: getActivePrayerBlockIndex(timings, dateKey),
    heroBlockIndex: getHeroBlockIndex(timings, dateKey),
    overnightReview: isOvernightReview(timings, dateKey),
    durations: PRAYER_NAMES.slice(0, 4).map((name, index) => formatPrayerCountdown(
      parsePrayerTime(timings[PRAYER_NAMES[index + 1]]) - parsePrayerTime(timings[name]),
    )),
    progress,
  };
}
