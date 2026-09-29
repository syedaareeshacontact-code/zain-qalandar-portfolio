const PRAYER_LOCATION = {
  city: 'Lahore',
  country: 'Pakistan',
  timezone: 'Asia/Karachi',
  method: '1',
  school: '1',
};

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

export async function getPrayerRoutineData() {
  const today = getDateKey();

  try {
    const todayTimings = await fetchPrayerDay(today);

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

    return {
      dateKey: today,
      timings: todayTimings,
      activeBlockIndex: getActivePrayerBlockIndex(todayTimings, today),
      durations,
    };
  } catch {
    return null;
  }
}
