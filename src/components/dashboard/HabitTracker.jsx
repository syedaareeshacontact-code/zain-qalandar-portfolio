'use client';

import { useState } from 'react';
import { Check, Flame, Leaf, Plus, Trash2, X } from 'lucide-react';
import { habitStreak, shiftDate } from '@/lib/dashboard';

export default function HabitTracker({ workspace, updateWorkspace, today, ready }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const completed = workspace.habitLog[today] || [];
  const total = workspace.habits.length;
  const done = workspace.habits.filter((habit) => completed.includes(habit.id)).length;
  const days = Array.from({ length: 7 }, (_, index) => shiftDate(today, index - 6));

  function toggle(id) {
    updateWorkspace((current) => {
      const day = current.habitLog[today] || [];
      return { ...current, habitLog: { ...current.habitLog, [today]: day.includes(id) ? day.filter((item) => item !== id) : [...day, id] } };
    });
  }

  function addHabit(event) {
    event.preventDefault();
    if (!title.trim()) return;
    const habit = { id: crypto.randomUUID(), title: title.trim(), target: 1 };
    updateWorkspace((current) => ({ ...current, habits: [...current.habits, habit] }));
    setTitle(''); setAdding(false);
  }

  return (
    <article className="bk-widget bk-habits-widget" aria-labelledby="habits-widget-title">
      <div className="bk-widget-head"><div><span className="bk-section-kicker"><Leaf size={12} />CONSISTENCY OVER INTENSITY</span><h3 id="habits-widget-title">Little daily rituals</h3></div><span className="bk-count-badge">{done}/{total}</span></div>
      <div className="bk-habit-progress" role="progressbar" aria-label="Daily habits completed" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total || 1}><span style={{ width: `${total ? done / total * 100 : 0}%` }} /></div>
      <div className="bk-habit-list">{workspace.habits.map((habit) => {
        const checked = completed.includes(habit.id);
        const streak = habitStreak(habit.id, workspace.habitLog, today);
        return <div className={`bk-habit-row${checked ? ' is-done' : ''}`} key={habit.id}><button className="bk-habit-toggle" type="button" aria-pressed={checked} disabled={!ready} onClick={() => toggle(habit.id)}><span className="bk-check-box">{checked && <Check size={13} />}</span><span><strong>{habit.title}</strong><small>{streak ? <><Flame size={11} />{streak} day streak</> : 'A fresh chance today'}</small></span></button><div className="bk-habit-history" aria-label="Last seven days">{days.map((date) => <span key={date} className={workspace.habitLog[date]?.includes(habit.id) ? ' is-complete' : ''} title={`${date}: ${workspace.habitLog[date]?.includes(habit.id) ? 'Done' : 'Not done'}`} />)}</div><button className="bk-widget-icon-btn bk-delete-habit" type="button" aria-label={`Remove habit ${habit.title}`} disabled={!ready} onClick={() => updateWorkspace((current) => ({ ...current, habits: current.habits.filter((item) => item.id !== habit.id) }))}><Trash2 size={13} /></button></div>;
      })}</div>
      {!total && <p className="bk-empty-copy">Make space for something small you want to do each day.</p>}
      {adding ? <form className="bk-habit-add" onSubmit={addHabit}><label className="sr-only" htmlFor="new-habit">Habit name</label><input id="new-habit" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={70} placeholder="e.g. Read 10 pages" autoFocus required /><button className="bk-widget-icon-btn" type="submit" aria-label="Save habit" disabled={!title.trim()}><Check size={16} /></button><button className="bk-widget-icon-btn" type="button" aria-label="Cancel adding habit" onClick={() => setAdding(false)}><X size={16} /></button></form> : <button className="bk-text-action" type="button" onClick={() => setAdding(true)} disabled={!ready || total >= 12}><Plus size={14} />{total >= 12 ? '12 habits maximum' : 'Add a habit'}</button>}
      <p className="bk-widget-footnote">{total && done === total ? 'Alhamdulillah. You showed up for every little ritual.' : 'The dots tell your story over the last seven days.'}</p>
    </article>
  );
}
