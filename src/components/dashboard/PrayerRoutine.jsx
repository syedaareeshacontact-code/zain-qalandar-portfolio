'use client';

import { useEffect, useState } from 'react';
import { Check, Clock3, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import DashboardHero from '@/components/dashboard/DashboardHero';
import {
  getActivePrayerBlockIndex,
  getHeroBlockIndex,
  getPrayerIntervalProgress,
  getPrayerDateKey,
  getPrayerRoutineData,
  isOvernightReview,
} from '@/lib/prayerTimes';

const HERO_IMAGES = [
  '/images/barakah/hero/01-fajr-to-dhuhr.webp',
  '/images/barakah/hero/02-dhuhr-to-asr.webp',
  '/images/barakah/hero/03-asr-to-maghrib.webp',
  '/images/barakah/hero/04-maghrib-to-isha.webp',
  '/images/barakah/hero/05-isha-to-10pm.webp',
];

const BLOCKS = [
  {
    id: '01',
    range: 'Fajr → Dhuhr',
    slot: 'Morning Block',
    title: 'Deep Work ',
    description: 'Focus on your most important work. High energy, minimal distractions.',
    time: '—',
    timeLabel: 'Deep focus window',
    tone: 'fajr',
    icon: Sunrise,
    points: ['Deep focus', 'High value work', 'Personal growth', 'Build what matters'],
  },
  {
    id: '02',
    range: 'Dhuhr → Asr',
    slot: 'Midday Block',
    title: 'Light Work ',
    description: 'Handle routine work, meetings, and manageable tasks.',
    time: '—',
    timeLabel: 'Routine work window',
    tone: 'dhuhr',
    icon: Sun,
    points: ['Routine tasks', 'Meetings & communication', 'Admin work', 'Steady progress'],
  },
  {
    id: '03',
    range: 'Asr → Maghrib',
    slot: 'Restful Block',
    title: 'No Work',
    description: 'Take a break, recharge, spend time with family, and focus on worship.',
    time: '—',
    timeLabel: 'Rest & worship window',
    tone: 'asr',
    icon: Sunset,
    points: ['Rest & recharge', 'Family time', 'Worship and reflection', 'Prepare for the evening'],
  },
  {
    id: '04',
    range: 'Maghrib → Isha',
    slot: 'Evening Block',
    title: 'Review',
    description: 'Look back at your day. Reflect, be grateful, and check your progress.',
    time: '—',
    timeLabel: 'Review & reflection window',
    tone: 'maghrib',
    icon: Moon,
    points: ['Review your day', 'Reflect & be grateful', 'Update tasks', 'Learn and improve'],
  },
];

export default function PrayerRoutine() {
  const [prayerData, setPrayerData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadPrayerData = async () => {
      const data = await getPrayerRoutineData();
      if (isMounted && data) setPrayerData(data);
    };
    const updateCurrentBlock = () => {
      setPrayerData((current) => {
        if (!current) return current;
        if (current.dateKey !== getPrayerDateKey()) {
          loadPrayerData();
          return current;
        }
        return {
          ...current,
          activeBlockIndex: getActivePrayerBlockIndex(current.timings, current.dateKey),
          heroBlockIndex: getHeroBlockIndex(current.timings, current.dateKey),
          overnightReview: isOvernightReview(current.timings, current.dateKey),
          progress: getPrayerIntervalProgress(current.timings, current.dateKey, {
            previousTimings: current.previousTimings,
            nextTimings: current.nextTimings,
          }),
        };
      });
    };

    loadPrayerData();
    const timer = window.setInterval(updateCurrentBlock, 60_000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const blocks = BLOCKS.map((block, index) => ({
    ...block,
    time: prayerData?.durations[index] ?? block.time,
  }));
  const heroImage = HERO_IMAGES[prayerData?.heroBlockIndex >= 0 ? prayerData.heroBlockIndex : 0];
  const overnightProgress = prayerData?.progress[4];
  const isOvernight = Boolean(prayerData?.overnightReview && overnightProgress);

  return (
    <div className="bk-prayer">
      <DashboardHero
        title="Prayer Routine"
        subtitle="Prayer-based daily work structure"
        image={heroImage}
      />

      <ol className="bk-timeline">
        {blocks.map((block, index) => {
          const Icon = block.icon;
          const isCurrent = prayerData?.activeBlockIndex === index;
          const focusClass = isCurrent ? ' is-current' : '';
          const progress = prayerData?.progress[index];
          return (
            <li className={`bk-row bk-row-${block.tone}${focusClass}`} key={block.id} style={{ '--bk-progress': `${progress?.elapsed ?? 0}%` }}>
              <span className="bk-progress-track" aria-hidden="true"><span className="bk-progress-fill" /></span>
              <div className="bk-step">
                <span className="bk-step-num">{block.id}</span>
                <Icon className="bk-step-icon" size={40} strokeWidth={1.7} aria-hidden="true" />
                <div className="bk-step-copy">
                  <strong>{block.range}</strong>
                  <small>{block.slot}</small>
                  {isCurrent && progress && (
                    <span className="bk-progress-stats" aria-label={`${progress.elapsed}% elapsed, ${progress.remaining}% remaining`}>
                      <span>{progress.elapsed}% elapsed</span>
                      <span>{progress.remaining}% left</span>
                    </span>
                  )}
                </div>
              </div>

              <article className={`bk-banner bk-banner-${block.tone}${focusClass}`} aria-label={isCurrent ? `Current prayer window: ${block.range}` : undefined}>
                <div className="bk-banner-copy">
                  <div className="bk-banner-text">
                    <p className="bk-banner-kicker">{block.id} &nbsp;{block.range}</p>
                    <h2>{block.title}</h2>
                    <p>{block.description}</p>
                  </div>
                </div>
              </article>

              <aside className="bk-meta" aria-label={`${block.range} details`}>
                <div className="bk-meta-time">
                  <Clock3 size={21} strokeWidth={1.8} aria-hidden="true" />
                  <div><small>{block.timeLabel}</small><strong>{block.time}</strong></div>
                </div>
                <ul>
                  {block.points.map((point) => <li key={point}><Check size={16} strokeWidth={2.5} aria-hidden="true" />{point}</li>)}
                </ul>
              </aside>
            </li>
          );
        })}
        <li className={`bk-timeline-end${isOvernight ? ' is-current' : ''}`} style={{ '--bk-progress': `${overnightProgress?.elapsed ?? 0}%` }} aria-label="Isha to Fajr overnight interval">
          <span className="bk-step-num">05</span>
          <div className="bk-timeline-end-copy">
            <span>Isha → Fajr</span>
            {isOvernight && (
              <span className="bk-progress-stats" aria-label={`${overnightProgress.elapsed}% elapsed, ${overnightProgress.remaining}% remaining`}>
                <span>{overnightProgress.elapsed}% elapsed</span>
                <span>{overnightProgress.remaining}% left</span>
              </span>
            )}
          </div>
        </li>
      </ol>
    </div>
  );
}
