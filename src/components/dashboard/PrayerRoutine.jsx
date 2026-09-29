const BLOCKS = [
  {
    id: '01',
    range: 'Fajr → Dhuhr',
    slot: 'Morning Block',
    title: 'Deep Work / Priority 1',
    description: 'Focus on your most important work. High energy, minimal distractions.',
    time: '5:00 AM – 12:00 PM',
    badge: 'Most Important',
    tone: 'fajr',
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
    points: ['Plan tomorrow', 'Make decisions', 'Set priorities', 'End the day with clarity'],
  },
];

function BlockIcon({ tone }) {
  if (tone === 'fajr') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="14" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 5v2M5 14H3M21 14h-2M6.2 8.2 4.8 6.8M17.8 8.2l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (tone === 'dhuhr') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (tone === 'asr') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 16c2.5-3 5-4.5 8-4.5S17.5 13 20 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M4 19h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (tone === 'maghrib') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 14.5A6 6 0 0 1 9.5 6 6.2 6.2 0 1 0 18 14.6c-.9.2-1.9.2-3-.1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 14.5A6 6 0 0 1 9.5 6 6.2 6.2 0 1 0 18 14.6c-.9.2-1.9.2-3-.1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M18 6.2v2M19.5 7.2h-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Scene({ tone }) {
  return (
    <div className={`bk-scene bk-scene-${tone}`} aria-hidden="true">
      {tone === 'fajr' && (
        <svg viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="fajrSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d7eee8" />
              <stop offset="55%" stopColor="#b7ddd4" />
              <stop offset="100%" stopColor="#8ec4b8" />
            </linearGradient>
          </defs>
          <rect width="640" height="220" fill="url(#fajrSky)" />
          <circle cx="470" cy="78" r="34" fill="#f3f7e8" opacity=".85" />
          <path d="M0 168c70-38 140-58 220-40 70 16 110 8 170-18 70-30 140-18 250 22v88H0V168Z" fill="#6ea89c" />
          <path d="M0 186c90-28 170-22 250 4 90 30 150 8 230-16 70-20 110-8 160 10v36H0v-34Z" fill="#4f8f86" />
        </svg>
      )}
      {tone === 'dhuhr' && (
        <svg viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="dhuhrSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d7ecfb" />
              <stop offset="100%" stopColor="#9fd0f0" />
            </linearGradient>
          </defs>
          <rect width="640" height="220" fill="url(#dhuhrSky)" />
          <circle cx="92" cy="52" r="26" fill="#fff6c8" />
          <path d="M430 128c28-42 78-42 106 0v72H430v-72Z" fill="#e8f4fb" />
          <rect x="468" y="150" width="30" height="50" rx="4" fill="#c5dff0" />
          <path d="M390 150h186v50H390z" fill="#d7ebf7" />
          <circle cx="483" cy="92" r="8" fill="#e8f4fb" />
          <rect x="476" y="100" width="14" height="28" fill="#d4e8f5" />
          <path d="M0 188h640v32H0z" fill="#8fc0de" />
        </svg>
      )}
      {tone === 'asr' && (
        <svg viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="asrSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde6c8" />
              <stop offset="50%" stopColor="#f7c48a" />
              <stop offset="100%" stopColor="#e89b63" />
            </linearGradient>
          </defs>
          <rect width="640" height="220" fill="url(#asrSky)" />
          <circle cx="520" cy="70" r="32" fill="#fff1c2" />
          <path d="M0 170h640v50H0z" fill="#e7b57a" />
          <path d="M430 170c8-48 28-86 44-86s36 38 44 86" fill="#6b4b32" />
          <path d="M500 170c10-58 34-108 54-108 20 0 44 50 54 108" fill="#5a3d29" />
          <path d="M560 170c6-36 20-64 32-64s26 28 32 64" fill="#6b4b32" />
          <rect x="468" y="150" width="8" height="28" fill="#4a3222" />
          <rect x="546" y="148" width="10" height="30" fill="#3f2b1d" />
        </svg>
      )}
      {tone === 'maghrib' && (
        <svg viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="maghribSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c9b7e8" />
              <stop offset="55%" stopColor="#8b74c8" />
              <stop offset="100%" stopColor="#3d2f6e" />
            </linearGradient>
          </defs>
          <rect width="640" height="220" fill="url(#maghribSky)" />
          <circle cx="86" cy="48" r="16" fill="#f4e9ff" opacity=".8" />
          <path d="M400 128c36-54 100-54 136 0v72H400v-72Z" fill="#2b234d" />
          <rect x="448" y="150" width="40" height="50" rx="5" fill="#1c1736" />
          <rect x="360" y="168" width="230" height="40" fill="#241c44" />
          <circle cx="468" cy="92" r="7" fill="#2b234d" />
        </svg>
      )}
      {tone === 'isha' && (
        <svg viewBox="0 0 640 220" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="ishaSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1b2744" />
              <stop offset="100%" stopColor="#0b1020" />
            </linearGradient>
          </defs>
          <rect width="640" height="220" fill="url(#ishaSky)" />
          <path d="M70 0h500c0 90-80 150-250 150S70 90 70 0Z" fill="#10182c" />
          <circle cx="140" cy="150" r="18" fill="#f0c36a" />
          <circle cx="220" cy="158" r="14" fill="#e7b152" />
          <circle cx="300" cy="146" r="20" fill="#f6d27a" />
          <circle cx="390" cy="156" r="15" fill="#e8b45a" />
          <circle cx="470" cy="148" r="18" fill="#f0c36a" />
          <path d="M140 150v40M220 158v32M300 146v44M390 156v34M470 148v42" stroke="#c9963e" strokeWidth="3" />
        </svg>
      )}
    </div>
  );
}

export default function PrayerRoutine() {
  return (
    <div className="bk-prayer">
      <section className="bk-prayer-hero">
        <div>
          <h1>Prayer Routine</h1>
          <p>Prayer-based daily work structure</p>
        </div>
        <blockquote className="bk-quote">
          <div>
            <p>“And establish prayer and do not be among the forgetful.”</p>
            <cite>— Quran 2:43</cite>
          </div>
          <div className="bk-quote-art" aria-hidden="true">
            <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="quoteSky" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f6d7b0" />
                  <stop offset="55%" stopColor="#e7a56a" />
                  <stop offset="100%" stopColor="#c97b4a" />
                </linearGradient>
              </defs>
              <rect width="280" height="120" fill="url(#quoteSky)" />
              <circle cx="210" cy="38" r="16" fill="#ffe7b8" />
              <path d="M150 78c18-28 50-28 68 0v42h-68V78Z" fill="#7a4a32" />
              <rect x="174" y="90" width="20" height="30" fill="#5c3424" />
              <path d="M120 100h150v20H120z" fill="#6b3f2c" />
            </svg>
          </div>
        </blockquote>
      </section>

      <ol className="bk-timeline">
        {BLOCKS.map((block) => (
          <li className={`bk-row bk-row-${block.tone}`} key={block.id}>
            <div className="bk-step">
              <span className="bk-step-num">{block.id}</span>
              <span className={`bk-step-icon bk-icon-${block.tone}`}>
                <BlockIcon tone={block.tone} />
              </span>
              <div className="bk-step-copy">
                <strong>{block.range}</strong>
                <small>{block.slot}</small>
              </div>
            </div>

            <article className={`bk-banner bk-banner-${block.tone}`}>
              <Scene tone={block.tone} />
              {block.badge && <em className="bk-banner-badge">{block.badge}</em>}
              <div className="bk-banner-copy">
                <div className="bk-banner-kicker">
                  <span className={`bk-mini-icon bk-icon-${block.tone}`}><BlockIcon tone={block.tone} /></span>
                  <span>{block.id} {block.range}</span>
                </div>
                <h2>{block.title}</h2>
                <p>{block.description}</p>
              </div>
            </article>

            <aside className="bk-meta">
              <p className="bk-meta-time">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M12 8v5l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                <span>
                  <small>Approx. Time</small>
                  <strong>{block.time}</strong>
                </span>
              </p>
              <ul>
                {block.points.map((point) => (
                  <li key={point}>
                    <span aria-hidden="true">✓</span>
                    {point}
                  </li>
                ))}
              </ul>
            </aside>
          </li>
        ))}
      </ol>
    </div>
  );
}
