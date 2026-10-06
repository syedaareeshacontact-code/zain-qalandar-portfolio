'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { ArrowUpRight, Check, CheckCircle2, Clock3, FileText, ListTodo, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import DashboardHero from '@/components/dashboard/DashboardHero';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePrayer } from '@/context/prayer-context';
import PrayerNow from './PrayerNow';
import DailyIntention from './DailyIntention';
import { fetchTaskWorkspace, isTaskWorkspaceStale } from '@/store/features/tasks/tasksSlice';
import { fetchUploads, getUploadScopeKey, isUploadScopeStale } from '@/store/features/uploads/uploadsSlice';
import { getPrayerDateKey } from '@/lib/prayerTimes';

const EMPTY_UPLOADS = [];

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
  const dispatch = useAppDispatch();
  const { data: prayerData, now } = usePrayer();
  const taskDateKey = now ? getPrayerDateKey(undefined, new Date(now)) : null;
  const { tasks, status: tasksStatus, lastFetchedAt: tasksLastFetchedAt } = useAppSelector((state) => state.tasks);
  const noteUploadScope = useAppSelector((state) => state.uploads.scopes?.[getUploadScopeKey('notes', 'pdf')]);
  const noteUploads = noteUploadScope?.items || EMPTY_UPLOADS;
  const uploadsStatus = noteUploadScope?.status || 'idle';

  useEffect(() => {
    if (isTaskWorkspaceStale({ status: tasksStatus, lastFetchedAt: tasksLastFetchedAt })) void dispatch(fetchTaskWorkspace());
    if (noteUploadScope?.status !== 'loading' && noteUploadScope?.status !== 'failed' && isUploadScopeStale(noteUploadScope)) void dispatch(fetchUploads({ category: 'notes', kind: 'pdf' }));
  }, [dispatch, noteUploadScope, tasksLastFetchedAt, tasksStatus]);

  const blocks = BLOCKS.map((block, index) => ({
    ...block,
    time: prayerData?.durations[index] ?? block.time,
  }));
  const heroImage = HERO_IMAGES[prayerData?.heroBlockIndex >= 0 ? prayerData.heroBlockIndex : 0];
  const overnightProgress = prayerData?.progress[4];
  const isOvernight = Boolean(prayerData?.overnightReview && overnightProgress);
  const glance = useMemo(() => {
    const today = taskDateKey;
    const recentThreshold = new Date();
    recentThreshold.setDate(recentThreshold.getDate() - 7);

    return {
      pendingToday: tasks.filter((task) => !task.completed && task.dueDate === today).length,
      completedToday: tasks.filter((task) => task.completed && task.completedAt && (
        new Date(task.completedAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }) === today
      )).length,
      totalPdfs: noteUploads.length,
      recentNotes: noteUploads.filter((upload) => new Date(upload.createdAt) >= recentThreshold).length,
    };
  }, [noteUploads, tasks, taskDateKey]);
  const tasksLoading = !tasksLastFetchedAt && (tasksStatus === 'idle' || tasksStatus === 'loading');
  const notesLoading = !noteUploadScope?.hasLoaded && (uploadsStatus === 'idle' || uploadsStatus === 'loading');
  const glanceCards = [
    {
      label: 'Pending today',
      description: 'Tasks still to do',
      value: tasksLoading ? '—' : glance.pendingToday,
      icon: ListTodo,
      href: '/dashboard/tasks',
    },
    {
      label: 'Completed today',
      description: 'Tasks finished today',
      value: tasksLoading ? '—' : glance.completedToday,
      icon: CheckCircle2,
      href: '/dashboard/tasks',
    },
    {
      label: 'Total PDFs',
      description: 'Saved in your notes',
      value: notesLoading ? '—' : glance.totalPdfs,
      icon: FileText,
      href: '/dashboard/notes',
    },
    {
      label: 'Recent notes',
      description: 'Uploaded in last 7 days',
      value: notesLoading ? '—' : glance.recentNotes,
      icon: Clock3,
      href: '/dashboard/notes',
    },
  ];

  return (
    <div className="bk-prayer">
      <DashboardHero
        title="Prayer Routine"
        subtitle="Prayer-based daily work structure"
        image={heroImage}
      />

      <PrayerNow />
      <DailyIntention />

      <section className="bk-dashboard-glance" aria-labelledby="today-at-a-glance">
        <div className="bk-dashboard-glance-head">
          <div>
            <span>YOUR DAY</span>
            <h2 id="today-at-a-glance">Today at a glance</h2>
          </div>
          <Link className="bk-glance-all-link" href="/dashboard/tasks">View tasks <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <div className="bk-glance-grid">
          {glanceCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link className="bk-glance-card" href={card.href} key={card.label}>
                <span className="bk-glance-icon"><Icon size={20} strokeWidth={1.9} aria-hidden="true" /></span>
                <span className="bk-glance-copy">
                  <strong>{card.value}</strong>
                  <span>{card.label}</span>
                  <small>{card.description}</small>
                </span>
                <ArrowUpRight className="bk-glance-arrow" size={17} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

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

              <article className={`bk-banner bk-banner-${block.tone}${focusClass}`} aria-label={isCurrent ? `Current routine window: ${block.range}` : undefined}>
                {isCurrent && <span className="bk-banner-badge"><span className="bk-live-dot" />Current block</span>}
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
