'use client';

import { useEffect, useState } from 'react';
import { Check, Feather, Pencil, Plus } from 'lucide-react';
import { usePrayer } from '@/context/prayer-context';

const STORAGE_KEY = 'barakah.intention.v1';

export default function DailyIntention() {
  const { dateKey } = usePrayer();
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    if (!dateKey) return;
    let intention = null;
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (value?.date === dateKey && typeof value.text === 'string') intention = value;
    } catch { /* A fresh intention is safe if storage is unavailable. */ }
    setSaved(intention);
    setDraft(intention?.text || '');
    setEditing(false);
    setStorageError(false);
  }, [dateKey]);

  function saveIntention(event) {
    event.preventDefault();
    if (!draft.trim() || !dateKey) return;
    const value = { date: dateKey, text: draft.trim(), completed: false };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); setStorageError(false); } catch { setStorageError(true); }
    setSaved(value);
    setEditing(false);
  }

  function toggleCompleted() {
    const value = { ...saved, completed: !saved.completed };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); setStorageError(false); } catch { setStorageError(true); }
    setSaved(value);
  }

  return (
    <section className={`bk-intention${saved?.completed ? ' is-complete' : ''}`} aria-labelledby="daily-intention-title">
      <div className="bk-intention-heading"><span className="bk-intention-icon"><Feather size={19} aria-hidden="true" /></span><div><span className="bk-section-kicker">BEGIN WITH NIYYAH</span><h2 id="daily-intention-title">One intention for today</h2></div></div>
      {editing ? <form onSubmit={saveIntention} className="bk-intention-form"><label htmlFor="daily-intention" className="sr-only">Today&apos;s intention</label><input id="daily-intention" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={180} placeholder="Today, I want to…" autoFocus required /><button type="submit" disabled={!draft.trim() || !dateKey}>Save</button><button type="button" onClick={() => { setDraft(saved?.text || ''); setEditing(false); }}>Cancel</button></form>
        : saved ? <div className="bk-intention-value"><button type="button" className="bk-intention-check" aria-label={saved.completed ? 'Mark intention incomplete' : 'Mark intention complete'} aria-pressed={saved.completed} onClick={toggleCompleted}>{saved.completed && <Check size={14} />}</button><p>{saved.text}<small>{saved.completed ? 'Alhamdulillah. A meaningful step taken.' : 'A little clarity for the day ahead.'}</small></p><button className="bk-icon-btn" type="button" aria-label="Edit today's intention" onClick={() => setEditing(true)}><Pencil size={15} /></button></div>
          : <div className="bk-intention-placeholder"><p>What is one thing you want to bring to this day?</p><button type="button" disabled={!dateKey} className="bk-small-action" onClick={() => setEditing(true)}><Plus size={14} />Set intention</button></div>}
      <span className="bk-intention-note" role="status">{storageError ? 'Kept for this visit. Browser storage is unavailable.' : saved ? 'Saved on this browser · A fresh start each day' : 'A small intention can give your whole day direction.'}</span>
    </section>
  );
}
