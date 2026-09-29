import { Check, Clock3, Crown, Moon, MoonStar, Sun, Sunrise, Sunset } from 'lucide-react';

const BLOCKS = [
  {
    id: '01',
    range: 'Fajr → Dhuhr',
    slot: 'Morning Block',
    title: 'Deep Work / Priority 1',
    description: 'Focus on your most important work. High energy, minimal distractions.',
    time: '5:00 AM – 12:00 PM',
    tone: 'fajr',
    icon: Sunrise,
    points: ['Deep focus', 'High value work', 'Personal growth', 'Build what matters'],
  },
  {
    id: '02',
    range: 'Dhuhr → Asr',
    slot: 'Midday Block',
    title: 'Light Work / Priority 2',
    description: 'Handle routine work, meetings, and manageable tasks.',
    time: '12:00 PM – 4:00 PM',
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
    time: '4:00 PM – 6:00 PM',
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
    time: '6:00 PM – 8:00 PM',
    tone: 'maghrib',
    icon: Moon,
    points: ['Review your day', 'Reflect & be grateful', 'Update tasks', 'Learn and improve'],
  },
  {
    id: '05',
    range: 'Isha → 10 PM',
    slot: 'Night Block',
    title: 'Planning & Decisions',
    description: 'Plan for tomorrow, make decisions, and set your direction.',
    time: '8:00 PM – 10:00 PM',
    tone: 'isha',
    icon: MoonStar,
    points: ['Plan tomorrow', 'Make decisions', 'Set priorities', 'End the day with clarity'],
  },
];

export default function PrayerRoutine() {
  return (
    <div className="bk-prayer">
      <section className="bk-prayer-hero" aria-labelledby="prayer-routine-title">
        <div className="bk-prayer-heading">
          <h1 id="prayer-routine-title">Prayer Routine</h1>
          <p>Prayer-based daily work structure</p>
        </div>
        <blockquote className="bk-quote">
          <p>“And establish prayer<br />and do not be among the forgetful.”</p>
          <cite>— &nbsp; Quran 2:43</cite>
        </blockquote>
      </section>

      <ol className="bk-timeline">
        {BLOCKS.map((block) => {
          const Icon = block.icon;
          return (
            <li className={`bk-row bk-row-${block.tone}`} key={block.id}>
              <div className="bk-step">
                <span className="bk-step-num">{block.id}</span>
                <Icon className="bk-step-icon" size={40} strokeWidth={1.7} aria-hidden="true" />
                <div className="bk-step-copy">
                  <strong>{block.range}</strong>
                  <small>{block.slot}</small>
                </div>
              </div>

              <article className={`bk-banner bk-banner-${block.tone}`}>
                {block.id === '01' && <span className="bk-banner-badge"><Crown size={17} fill="currentColor" aria-hidden="true" /> Most Important</span>}
                <div className="bk-banner-copy">
                  <span className="bk-mini-icon"><Icon size={39} strokeWidth={1.7} aria-hidden="true" /></span>
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
                  <div><small>Approx. Time</small><strong>{block.time}</strong></div>
                </div>
                <ul>
                  {block.points.map((point) => <li key={point}><Check size={16} strokeWidth={2.5} aria-hidden="true" />{point}</li>)}
                </ul>
              </aside>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
