import test from 'node:test';
import assert from 'node:assert/strict';
import { getPrayerDateKey, getPrayerLocation, shiftPrayerDate, parsePrayerTime, getLivePrayerState, getHeroBlockIndex, getPrayerIntervalProgress, formatPrayerTime, formatPrayerCountdown } from '../src/lib/prayerTimes.js';

const data = {
  locationId: 'lahore', dateKey: '2026-10-06',
  timings: { Fajr: '2026-10-06T05:00:00+05:00', Sunrise: '2026-10-06T06:10:00+05:00', Dhuhr: '2026-10-06T12:00:00+05:00', Asr: '2026-10-06T16:00:00+05:00', Maghrib: '2026-10-06T18:00:00+05:00', Isha: '2026-10-06T19:30:00+05:00' },
  previousTimings: { Isha: '2026-10-05T19:30:00+05:00' },
  nextTimings: { Fajr: '2026-10-07T05:01:00+05:00' },
};
const at = (time) => Date.parse(`2026-10-06T${time}:00+05:00`);

test('all five prayer boundaries switch immediately, including tomorrow Fajr', () => {
  for (const [index, time] of ['05:00', '12:00', '16:00', '18:00', '19:30'].entries()) {
    const live = getLivePrayerState(data, at(time));
    assert.equal(live.blockIndex, index);
    assert.equal(live.next.name, ['Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Fajr'][index]);
    assert.ok(live.next.time > at(time));
  }
});

test('Fajr stops being current at sunrise, while the morning work block continues', () => {
  assert.equal(getLivePrayerState(data, at('06:09')).label, 'Fajr time');
  const live = getLivePrayerState(data, at('06:10'));
  assert.equal(live.label, 'Between prayers');
  assert.equal(live.blockIndex, 0);
  assert.equal(live.next.name, 'Dhuhr');
});

test('before Fajr uses the previous Isha, with finite overnight progress', () => {
  const live = getLivePrayerState(data, at('03:00'));
  assert.equal(live.label, 'Isha → Fajr');
  assert.equal(live.next.name, 'Fajr');
  assert.equal(live.next.tomorrow, undefined);
  assert.equal(live.countdown, '2h 0m');
  assert.ok(live.progress.elapsed > 0 && live.progress.elapsed < 100);
});

test('after Isha counts toward the next calendar day, using its own Fajr time', () => {
  const live = getLivePrayerState(data, at('23:00'));
  assert.equal(live.next.tomorrow, true);
  assert.equal(live.countdown, '6h 1m');
});

test('stale-day data and invalid timings never generate a live prayer status', () => {
  assert.equal(getLivePrayerState(data, Date.parse('2026-10-07T00:00:00+05:00')), null);
  assert.equal(getLivePrayerState({ ...data, timings: { ...data.timings, Sunrise: '' } }, at('06:00')), null);
  assert.equal(getHeroBlockIndex({ Fajr: 'invalid' }, data.dateKey, at('06:00')), -1);
  assert.equal(parsePrayerTime('05:00'), null);
  assert.equal(parsePrayerTime('not a date'), null);
  assert.equal(formatPrayerTime(null), '—');
});

test('timezone date keys cover Pakistan, overseas cities, DST, and year rollover', () => {
  const instant = new Date('2026-10-06T00:30:00Z');
  assert.equal(getPrayerDateKey(getPrayerLocation('lahore'), instant), '2026-10-06');
  assert.equal(getPrayerDateKey(getPrayerLocation('new-york'), instant), '2026-10-05');
  assert.equal(getPrayerDateKey(getPrayerLocation('london'), new Date('2026-03-29T23:30:00Z')), '2026-03-30');
  assert.equal(shiftPrayerDate('2026-12-31', 1), '2027-01-01');
  assert.equal(shiftPrayerDate('2026-01-01', -1), '2025-12-31');
});

test('progress clamps at both ends and handles missing overnight data', () => {
  const progress = getPrayerIntervalProgress(data.timings, data.dateKey, data, at('14:00'));
  assert.equal(progress[0].elapsed, 100);
  assert.equal(progress[1].elapsed, 50);
  assert.equal(progress[2].elapsed, 0);
  assert.equal(getPrayerIntervalProgress(data.timings, data.dateKey, {}, at('23:00'))[4], null);
  assert.equal(formatPrayerCountdown(-1), '0m');
  assert.equal(formatPrayerCountdown(1), '1m');
  assert.equal(formatPrayerTime('2026-10-06T12:00:00+05:00', getPrayerLocation('lahore')), '12:00 PM');
});
