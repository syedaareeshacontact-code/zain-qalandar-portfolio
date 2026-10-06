'use client';

import { Clock3, MapPin, RefreshCw } from 'lucide-react';
import { usePrayer } from '@/context/prayer-context';
import { PRAYER_LOCATIONS, PRAYER_NAMES, formatPrayerTime } from '@/lib/prayerTimes';
import { PRAYER_MOMENTS } from '@/data/barakahContent';

export default function PrayerNow({ compact = false }) {
  const { data, status, live, location, now, changeLocation, retry } = usePrayer();
  const moment = live ? PRAYER_MOMENTS[live.blockIndex] : null;
  const loading = status === 'idle' || status === 'loading';
  // Before dawn, the active Isha belongs to yesterday, not tonight's schedule.
  const currentScheduleIndex = live && !live.betweenPrayers && !(live.next.name === 'Fajr' && !live.next.tomorrow) ? live.blockIndex : -1;
  const clock = now ? new Intl.DateTimeFormat('en-US', { timeZone: location.timezone, hour: 'numeric', minute: '2-digit', hour12: true }).format(now) : '—';
  return (
    <section className={`bk-prayer-now${compact ? ' is-compact' : ''}`} aria-label="Live prayer times" aria-busy={!live && loading}>
      <div className="bk-prayer-now-head">
        <span className="bk-section-kicker"><span className="bk-live-dot" />YOUR PRAYER RHYTHM</span>
        <label className="bk-location-select"><MapPin size={13} aria-hidden="true" /><span className="sr-only">Prayer city</span><select aria-label="Prayer city" value={location.id} onChange={(event) => changeLocation(event.target.value)}>{PRAYER_LOCATIONS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      </div>
      {live ? <>
        <div className="bk-prayer-now-body">
          <div><span className="bk-prayer-now-label">RIGHT NOW</span><h2>{live.label}</h2><p>{moment.title}</p></div>
          <div className="bk-next-prayer"><Clock3 size={18} aria-hidden="true" /><div><span>{live.next.name}{live.next.tomorrow ? ' tomorrow' : ''} in</span><strong>{live.countdown}</strong><small>{formatPrayerTime(live.next.time, location)}</small></div></div>
        </div>
        <ol className="bk-prayer-times-list" aria-label="Today's prayer schedule">
          {PRAYER_NAMES.map((name, index) => <li key={name} className={currentScheduleIndex === index ? 'is-current' : ''}><span>{name}{currentScheduleIndex === index && <span className="bk-live-dot" />}</span><strong>{formatPrayerTime(data.timings[name], location)}</strong></li>)}
        </ol>
        <div className="bk-prayer-now-footer"><span>{data.hijri}</span><span>{clock} · {location.timezone}</span></div>
        {status === 'failed' && <p className="bk-prayer-status" role="status">Refresh failed; showing today&apos;s last loaded timings. <button type="button" onClick={retry}>Retry</button></p>}
      </> : <div className="bk-prayer-empty" role="status"><Clock3 size={22} aria-hidden="true" /><div><strong>{loading ? 'Finding today’s prayer times…' : 'Prayer times are unavailable'}</strong><p>{loading ? `Loading the schedule for ${location.city}.` : 'Check your connection and try again.'}</p></div>{!loading && <button type="button" className="bk-small-action" onClick={retry}><RefreshCw size={14} />Retry</button>}</div>}
      <p className="bk-prayer-source">Times by <a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer">AlAdhan</a> · {location.school === '1' ? 'Hanafi Asr' : 'Standard Asr'} · Sunrise {data ? formatPrayerTime(data.timings.Sunrise, location) : '—'}</p>
    </section>
  );
}
