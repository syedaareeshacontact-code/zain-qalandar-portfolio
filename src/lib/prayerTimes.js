const PRAYER_LOCATIONS = [
  {
    label: 'Lahore, Pakistan',
    city: 'Lahore', country: 'PK', timezone: 'Asia/Karachi',
    method: '1', school: '1',
  },
  {
    label: 'Makkah, Saudi Arabia',
    city: 'Makkah', country: 'SA', timezone: 'Asia/Riyadh',
    method: '4', school: '0',
  },
  {
    label: 'Cairo, Egypt',
    city: 'Cairo', country: 'EG', timezone: 'Africa/Cairo',
    method: '5', school: '0',
  },
  {
    label: 'Istanbul, Turkey',
    city: 'Istanbul', country: 'TR', timezone: 'Europe/Istanbul',
    method: '13', school: '0',
  },
  {
    label: 'London, UK',
    city: 'London', country: 'GB', timezone: 'Europe/London',
    method: '3', school: '0',
  },
  {
    label: 'New York, USA',
    city: 'New York', country: 'US', timezone: 'America/New_York',
    method: '2', school: '0',
  },
  {
    label: 'Jakarta, Indonesia',
    city: 'Jakarta', country: 'ID', timezone: 'Asia/Jakarta',
    method: '20', school: '0',
  },
];

// Change the number from 0 to 6 to switch the city:
const PRAYER_LOCATION = PRAYER_LOCATIONS[0];

function getDatePartsInTimezone() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: PRAYER_LOCATION.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date()).reduce((parts, part) => {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
    return parts;
  }, {});
}

function getDateKey(dayOffset = 0) {
  const { year, month, day } = getDatePartsInTimezone();
  const date = new Date(Date.UTC(year, month - 1, day + dayOffset));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function shiftDateKey(dateKey, dayOffset) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + dayOffset));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function getPrayerDateKey() {
  return getDateKey();
}

function toApiDate(dateKey) {
  const [year, month, day] = dateKey.split('-');
  return `${day}-${month}-${year}`;
}

async function fetchPrayerDay(dateKey) {
  const params = new URLSearchParams({
    city: PRAYER_LOCATION.city,
    country: PRAYER_LOCATION.country,
    method: PRAYER_LOCATION.method,
    school: PRAYER_LOCATION.school,
    timezonestring: PRAYER_LOCATION.timezone,
    iso8601: 'true',
  });
  const response = await fetch(
    `https://api.aladhan.com/v1/timingsByCity/${toApiDate(dateKey)}?${params}`,
  );

  if (!response.ok) throw new Error(`Prayer API responded with ${response.status}`);

  const payload = await response.json();
  if (payload.code !== 200 || !payload.data?.timings) throw new Error('Prayer API returned no timings');
  return payload.data.timings;
}

function parsePrayerTime(value, dateKey) {
  if (typeof value !== 'string') return null;
  if (value.includes('T')) return new Date(value);

  const time = value.match(/\d{1,2}:\d{2}/)?.[0];
  return time ? new Date(`${dateKey}T${time.padStart(5, '0')}:00+05:00`) : null;
}

function formatTime(value, dateKey) {
  const date = parsePrayerTime(value, dateKey);
  if (!date || Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat('en-US', {
    timeZone: PRAYER_LOCATION.timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function getMinutesInLahore(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PRAYER_LOCATION.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date).reduce((result, part) => {
    if (part.type === 'hour' || part.type === 'minute') result[part.type] = Number(part.value);
    return result;
  }, {});

  return (parts.hour * 60) + parts.minute;
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return [
    hours ? `${hours}h` : null,
    remainingMinutes ? `${remainingMinutes}min` : null,
  ].filter(Boolean).join(' ') || '0min';
}

function getPrayerGap(start, end, dateKey) {
  const startDate = parsePrayerTime(start, dateKey);
  const endDate = parsePrayerTime(end, dateKey);
  if (!startDate || !endDate || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null;

  return formatDuration(Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60_000)));
}

function getIntervalProgress(start, end, now) {
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;

  const elapsed = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  return { elapsed, remaining: 100 - elapsed };
}

export function getPrayerIntervalProgress(timings, dateKey, { previousTimings, nextTimings } = {}) {
  const now = Date.now();
  const intervals = [
    ['Fajr', 'Dhuhr'],
    ['Dhuhr', 'Asr'],
    ['Asr', 'Maghrib'],
    ['Maghrib', 'Isha'],
  ];

  const progress = intervals.map(([from, to]) => {
    const start = parsePrayerTime(timings[from], dateKey)?.getTime();
    const end = parsePrayerTime(timings[to], dateKey)?.getTime();
    return getIntervalProgress(start, end, now);
  });

  const todayFajr = parsePrayerTime(timings.Fajr, dateKey)?.getTime();
  const beforeFajr = Number.isFinite(todayFajr) && now < todayFajr;
  const overnightStart = beforeFajr
    ? parsePrayerTime(previousTimings?.Isha, shiftDateKey(dateKey, -1))?.getTime()
    : parsePrayerTime(timings.Isha, dateKey)?.getTime();
  const overnightEnd = beforeFajr
    ? todayFajr
    : parsePrayerTime(nextTimings?.Fajr, shiftDateKey(dateKey, 1))?.getTime();

  progress.push(getIntervalProgress(overnightStart, overnightEnd, now));
  return progress;
}

export function getActivePrayerBlockIndex(timings, dateKey) {
  const starts = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib'].map((prayer) => {
    const date = parsePrayerTime(timings[prayer], dateKey);
    return date && !Number.isNaN(date.getTime()) ? getMinutesInLahore(date) : null;
  });
  const ends = ['Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
    const date = parsePrayerTime(timings[prayer], dateKey);
    return date && !Number.isNaN(date.getTime()) ? getMinutesInLahore(date) : null;
  });

  if (starts.some((time) => time === null) || ends.some((time) => time === null)) return -1;

  const now = getMinutesInLahore(new Date());
  return starts.findIndex((start, index) => now >= start && now < ends[index]);
}

export function getHeroBlockIndex(timings, dateKey) {
  const starts = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
    const date = parsePrayerTime(timings[prayer], dateKey);
    return date && !Number.isNaN(date.getTime()) ? getMinutesInLahore(date) : null;
  });
  const ends = ['Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((prayer) => {
    const date = parsePrayerTime(timings[prayer], dateKey);
    return date && !Number.isNaN(date.getTime()) ? getMinutesInLahore(date) : null;
  });
  ends.push(22 * 60);

  if (starts.some((time) => time === null) || ends.some((time) => time === null)) return -1;

  const now = getMinutesInLahore(new Date());
  if (now < starts[0] || now >= starts[4]) return 4;
  return starts.findIndex((start, index) => now >= start && now < ends[index]);
}

export function isOvernightReview(timings, dateKey) {
  const fajr = parsePrayerTime(timings.Fajr, dateKey);
  const isha = parsePrayerTime(timings.Isha, dateKey);
  if (!fajr || !isha || Number.isNaN(fajr.getTime()) || Number.isNaN(isha.getTime())) return false;

  const now = getMinutesInLahore(new Date());
  return now < getMinutesInLahore(fajr) || now >= getMinutesInLahore(isha);
}

export async function getPrayerRoutineData() {
  const today = getDateKey();

  try {
    const [todayTimings, previousTimings, nextTimings] = await Promise.all([
      fetchPrayerDay(today),
      fetchPrayerDay(getDateKey(-1)),
      fetchPrayerDay(getDateKey(1)),
    ]);

    const prayerTimes = {
      Fajr: formatTime(todayTimings.Fajr, today),
      Dhuhr: formatTime(todayTimings.Dhuhr, today),
      Asr: formatTime(todayTimings.Asr, today),
      Maghrib: formatTime(todayTimings.Maghrib, today),
      Isha: formatTime(todayTimings.Isha, today),
    };

    if (Object.values(prayerTimes).some((time) => !time)) throw new Error('Prayer API returned an incomplete day');

    const durations = [
      getPrayerGap(todayTimings.Fajr, todayTimings.Dhuhr, today),
      getPrayerGap(todayTimings.Dhuhr, todayTimings.Asr, today),
      getPrayerGap(todayTimings.Asr, todayTimings.Maghrib, today),
      getPrayerGap(todayTimings.Maghrib, todayTimings.Isha, today),
    ];

    if (durations.some((duration) => !duration)) throw new Error('Prayer API returned incomplete prayer gaps');

    const progress = getPrayerIntervalProgress(todayTimings, today, { previousTimings, nextTimings });
    if (progress.some((segment) => !segment)) throw new Error('Prayer API returned incomplete prayer intervals');

    return {
      dateKey: today,
      timings: todayTimings,
      previousTimings,
      nextTimings,
      activeBlockIndex: getActivePrayerBlockIndex(todayTimings, today),
      heroBlockIndex: getHeroBlockIndex(todayTimings, today),
      overnightReview: isOvernightReview(todayTimings, today),
      durations,
      progress,
    };
  } catch {
    return null;
  }
}
