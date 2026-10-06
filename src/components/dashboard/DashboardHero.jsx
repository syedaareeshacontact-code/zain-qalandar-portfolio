'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, RefreshCw, Sparkles } from 'lucide-react';
import { usePrayer } from '@/context/prayer-context';
import { AYAT, HERO_CONTENT, PRAYER_MOMENTS, getDailySeed } from '@/data/barakahContent';

export default function DashboardHero({ title, subtitle, image }) {
  const { live, dateKey, now, location } = usePrayer();
  const [reminderOffset, setReminderOffset] = useState(0);
  const titleId = `${title.toLowerCase().replaceAll(' ', '-')}-title`;
  const isPrayer = title === 'Prayer Routine';
  const config = HERO_CONTENT[title];
  const moment = live ? PRAYER_MOMENTS[live.blockIndex] : null;
  const pool = isPrayer ? PRAYER_MOMENTS.map((item) => item.ayah) : config?.ayat || ['prayer', 'peace'];
  const seed = isPrayer && moment ? live.blockIndex : getDailySeed(dateKey);
  const ayah = AYAT[pool[(seed + reminderOffset) % pool.length]];
  const hour = now ? Number(new Intl.DateTimeFormat('en-US', { timeZone: location.timezone, hour: 'numeric', hourCycle: 'h23' }).format(now)) : null;
  const greeting = hour === null ? 'Your prayer-led day' : hour < 5 || hour >= 21 ? 'A quiet night, Zain' : hour < 12 ? 'A peaceful morning, Zain' : hour < 17 ? 'A purposeful afternoon, Zain' : 'A restful evening, Zain';
  const dynamicSubtitle = isPrayer ? moment?.title : config?.messages[getDailySeed(dateKey) % config.messages.length];

  return (
    <section className="bk-dashboard-hero bk-dynamic-hero" style={{ '--bk-hero-image': `url('${image}')` }} aria-labelledby={titleId}>
      <div className="bk-dashboard-hero-heading">
        <span className="bk-hero-kicker"><Sparkles size={13} aria-hidden="true" />{isPrayer ? greeting : config?.kicker || 'WITH BARAKAH'}</span>
        <h1 id={titleId}>{title}</h1>
        <p>{dynamicSubtitle || subtitle}</p>
        <div className="bk-hero-footnote">
          {isPrayer && moment ? <Link href={moment.href}>{moment.action}<ArrowUpRight size={14} aria-hidden="true" /></Link> : <span>{isPrayer ? 'Make space for prayer, focus, and rest.' : subtitle}</span>}
          {isPrayer && moment && <span className="bk-hero-window"><span className="bk-live-dot" />{moment.label}</span>}
        </div>
      </div>
      <blockquote className="bk-quote bk-reminder">
        <div className="bk-reminder-head"><span>A MOMENT OF REMEMBRANCE</span><button type="button" aria-label="Show another ayah" title="Another reminder" onClick={() => setReminderOffset((value) => value + 1)}><RefreshCw size={13} aria-hidden="true" /></button></div>
        <div key={ayah.reference} className="bk-reminder-content" aria-live="polite">
          <p className="bk-reminder-arabic" lang="ar" dir="rtl">{ayah.arabic}</p>
          <p className="bk-reminder-translation" lang="ur" dir="rtl">{ayah.text}</p>
          <cite><a href={`https://quran.com/${ayah.reference.replace(':', '/')}`} target="_blank" rel="noopener noreferrer">Quran {ayah.reference}<ArrowUpRight size={11} aria-hidden="true" /></a><small lang="ur" dir="rtl">اردو ترجمہ</small></cite>
        </div>
      </blockquote>
    </section>
  );
}
