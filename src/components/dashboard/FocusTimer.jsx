'use client';

import { useEffect, useRef, useState } from 'react';
import { Coffee, Maximize2, Minimize2, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { FOCUS_MODES, completeFocusSession, freshTimer, getTimerRemaining } from '@/lib/dashboard';

export default function FocusTimer({ timer, tasks, updateWorkspace, ready, todayMinutes }) {
  const [now, setNow] = useState(null);
  const [immersive, setImmersive] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const rootRef = useRef(null);
  const running = Boolean(timer.endAt);
  const remaining = getTimerRemaining(timer, now || Date.now());
  const elapsed = 1 - remaining / timer.duration;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    if (!running) return;
    const interval = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [running]);

  useEffect(() => {
    if (!ready || !running || remaining > 0) return;
    updateWorkspace((current) => completeFocusSession(current));
    setAnnouncement(timer.mode === 'break' ? 'Break complete. Ready for a fresh start?' : 'Session complete. Your focused time has been saved.');
  }, [ready, running, remaining, updateWorkspace, timer.mode]);

  useEffect(() => {
    if (!immersive) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = 'hidden';
    rootRef.current?.querySelector('button')?.focus();
    const close = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setImmersive(false); }
      if (event.key === 'Tab') {
        const controls = [...(rootRef.current?.querySelectorAll('button:not(:disabled), select:not(:disabled)') || [])];
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', close, true);
    return () => { document.body.style.overflow = previous; document.removeEventListener('keydown', close, true); previousFocus?.focus(); };
  }, [immersive]);

  function changeMode(mode) {
    if (running) return;
    updateWorkspace((current) => ({ ...current, timer: { ...freshTimer(mode), taskId: current.timer.taskId } }));
    setAnnouncement('');
  }

  function toggleTimer() {
    const time = Date.now();
    setNow(time);
    setAnnouncement('');
    updateWorkspace((current) => {
      let left = getTimerRemaining(current.timer, time);
      if (current.timer.endAt && left === 0) return completeFocusSession(current, time);
      if (left === 0) left = current.timer.duration;
      return { ...current, timer: { ...current.timer, id: current.timer.id || crypto.randomUUID(), remaining: left, endAt: current.timer.endAt ? null : time + left * 1000 } };
    });
  }

  const pending = tasks.filter((task) => !task.completed);
  const selectedTask = tasks.find((task) => task.id === timer.taskId);
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
  const seconds = String(remaining % 60).padStart(2, '0');

  return (
    <article ref={rootRef} className={`bk-widget bk-focus-widget${immersive ? ' is-immersive' : ''}`} role={immersive ? 'dialog' : undefined} aria-modal={immersive ? true : undefined} aria-labelledby="focus-widget-title">
      <div className="bk-widget-head"><div><span className="bk-section-kicker"><Timer size={12} />ONE THING AT A TIME</span><h3 id="focus-widget-title">A little room to focus</h3></div><button className="bk-widget-icon-btn" type="button" aria-label={immersive ? 'Exit focus view' : 'Enter focus view'} aria-pressed={immersive} onClick={() => setImmersive((value) => !value)}>{immersive ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button></div>
      <div className="bk-segmented" aria-label="Timer duration">{Object.entries(FOCUS_MODES).map(([id, mode]) => <button type="button" key={id} aria-pressed={timer.mode === id} disabled={!ready || running} onClick={() => changeMode(id)}>{id === 'break' && <Coffee size={12} />}{mode.label}<small>{mode.minutes}m</small></button>)}</div>
      <div className={`bk-timer-face${running ? ' is-running' : ''}`}>
        <svg viewBox="0 0 180 180" aria-hidden="true"><circle className="bk-timer-track" cx="90" cy="90" r="80" /><circle className="bk-timer-progress" cx="90" cy="90" r="80" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - elapsed * 100} /></svg>
        <div><span className="bk-timer-time" role="timer" aria-label={`${minutes} minutes ${seconds} seconds remaining`}>{minutes}<i>:</i>{seconds}</span><small>{running ? 'Stay with this moment' : remaining < timer.duration ? 'Paused. Take your time.' : timer.mode === 'break' ? 'Breathe. Rest. Return.' : 'Small steps, meaningful work'}</small></div>
      </div>
      <label className="bk-focus-task"><span className="sr-only">Choose a focus task</span><select aria-label="Choose a focus task" value={timer.taskId} disabled={!ready || running} onChange={(event) => { const taskId = event.target.value; updateWorkspace((current) => ({ ...current, timer: { ...current.timer, taskId } })); }}><option value="">An open focus session</option>{pending.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}{selectedTask?.completed && <option value={selectedTask.id}>{selectedTask.title} · completed</option>}</select></label>
      <div className="bk-timer-actions"><button className="bk-primary-action" type="button" onClick={toggleTimer} disabled={!ready}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? 'Pause' : remaining < timer.duration ? 'Resume session' : timer.mode === 'break' ? 'Start break' : 'Start focus'}</button><button className="bk-widget-icon-btn" type="button" aria-label="Reset timer" disabled={!ready} onClick={() => { updateWorkspace((current) => ({ ...current, timer: { ...freshTimer(current.timer.mode), taskId: current.timer.taskId } })); setAnnouncement('Timer reset.'); }}><RotateCcw size={17} /></button></div>
      <p className="bk-widget-footnote" role="status">{announcement || `${todayMinutes} focused minutes today · Timer continues when you leave this page`}</p>
    </article>
  );
}
