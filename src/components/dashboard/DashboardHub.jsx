'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpRight, BarChart3, Check, ChevronLeft, ChevronRight, Feather, LayoutGrid, ListTodo, LoaderCircle, Plus, RefreshCw, SlidersHorizontal, Smile, Sparkles, Star, Sunrise, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { usePrayer } from '@/context/prayer-context';
import { useNotification } from '@/context/notification-context';
import { createTask, fetchTaskWorkspace, isTaskWorkspaceStale, updateTask } from '@/store/features/tasks/tasksSlice';
import { WIDGETS, WORKSPACE_TIMEZONE, weeklyMomentum, workspaceDate } from '@/lib/dashboard';
import useDashboardStorage from '@/hooks/useDashboardStorage';
import FocusTimer from './FocusTimer';
import HabitTracker from './HabitTracker';

function PriorityTasks({ today, tasks, status, error, lastFetchedAt, onRetry }) {
  const dispatch = useAppDispatch();
  const notice = useNotification();
  const [filter, setFilter] = useState('today');
  const [pendingIds, setPendingIds] = useState([]);
  const rows = tasks.filter((task) => !task.completed && (filter === 'all' || (filter === 'starred' ? task.starred : task.dueDate && task.dueDate <= today))).sort((a, b) => Number(b.starred) - Number(a.starred) || Number(b.priority === 'high') - Number(a.priority === 'high') || (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));

  async function completeTask(task) {
    setPendingIds((current) => [...current, task.id]);
    try { await dispatch(updateTask({ id: task.id, updates: { completed: true } })).unwrap(); notice.success(`Completed: ${task.title}`); }
    catch (failure) { notice.error(failure.message || 'Task could not be completed. Please try again.'); }
    finally { setPendingIds((current) => current.filter((id) => id !== task.id)); }
  }

  return (
    <article className="bk-widget bk-priorities-widget" aria-labelledby="priorities-widget-title">
      <div className="bk-widget-head"><div><span className="bk-section-kicker"><ListTodo size={12} />MAKE THE NEXT STEP CLEAR</span><h3 id="priorities-widget-title">Your next few things</h3></div><Link className="bk-widget-icon-btn" href="/dashboard/tasks" aria-label="Open task board"><ArrowUpRight size={16} /></Link></div>
      <div className="bk-segmented" aria-label="Filter priority tasks">{[['today', 'Today'], ['starred', 'Starred'], ['all', 'All pending']].map(([id, label]) => <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>)}</div>
      {!lastFetchedAt && status !== 'succeeded' ? <div className="bk-widget-empty" role="status">{status === 'failed' ? <><ListTodo size={26} /><strong>Tasks need a moment</strong><p>{error || 'Your task list could not be loaded.'}</p><button type="button" className="bk-small-action" onClick={onRetry}><RefreshCw size={13} />Retry</button></> : <><LoaderCircle size={24} className="bk-spin" /><p>Gathering your next steps…</p></>}</div> : <>
        <div className="bk-priority-rows">{rows.slice(0, 5).map((task) => <div className="bk-priority-row" key={task.id}><button type="button" className="bk-check-box" aria-label={`Complete task: ${task.title}`} disabled={pendingIds.includes(task.id)} onClick={() => void completeTask(task)}>{pendingIds.includes(task.id) ? <LoaderCircle className="bk-spin" size={12} /> : <Check size={12} />}</button><span><strong>{task.title}</strong><small>{task.dueDate && task.dueDate < today ? <span className="bk-overdue">Overdue · {task.dueDate}</span> : task.dueDate === today ? `Today${task.dueTime ? ` · ${task.dueTime}` : ''}` : task.dueDate || 'No deadline'}{task.priority === 'high' && ' · High priority'}</small></span>{task.starred && <Star size={13} className="bk-task-star" aria-label="Starred task" />}</div>)}</div>
        {!rows.length && <div className="bk-widget-empty"><Sparkles size={25} /><strong>{filter === 'starred' ? 'A little clarity goes a long way' : filter === 'today' ? 'Room for a meaningful day' : 'Everything is up to date'}</strong><p>{filter === 'starred' ? 'Star a task on your task board to keep it close.' : 'Capture your next step below, or enjoy a little breathing room.'}</p></div>}
        <div className="bk-widget-bottom"><span>{rows.length} pending{filter === 'today' ? ' today or overdue' : ''}</span><Link href="/dashboard/tasks">Open task board<ArrowUpRight size={12} /></Link></div>
        {status === 'failed' && <p className="bk-widget-footnote" role="status">Showing saved task data. <button type="button" onClick={onRetry}>Retry refresh</button></p>}
      </>}
    </article>
  );
}

function WeeklyMomentum({ today, tasks, sessions, tasksAvailable, onRetry, tasksStatus }) {
  const [metric, setMetric] = useState('minutes');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const days = weeklyMomentum(tasks, sessions, today, offset);
  const total = days.reduce((sum, day) => sum + day[metric], 0);
  const max = Math.max(...days.map((day) => day[metric]), 1);
  const selectedDay = days.find((day) => day.date === selected);
  const range = (date) => new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));

  return (
    <article className="bk-widget bk-momentum-widget" aria-labelledby="momentum-widget-title">
      <div className="bk-widget-head"><div><span className="bk-section-kicker"><BarChart3 size={12} />PROGRESS YOU CAN FEEL</span><h3 id="momentum-widget-title">Weekly momentum</h3></div><div className="bk-week-navigation"><button className="bk-widget-icon-btn" type="button" aria-label="Previous week" disabled={offset <= -51} onClick={() => { setOffset((value) => value - 1); setSelected(null); }}><ChevronLeft size={15} /></button><button type="button" className="bk-week-label" onClick={() => { setOffset(0); setSelected(null); }} title="Return to this week">{offset === 0 ? 'This week' : `${range(days[0].date)} – ${range(days[6].date)}`}</button><button className="bk-widget-icon-btn" type="button" aria-label="Next week" disabled={offset === 0} onClick={() => { setOffset((value) => value + 1); setSelected(null); }}><ChevronRight size={15} /></button></div></div>
      <div className="bk-momentum-summary"><div><strong>{metric === 'tasks' && !tasksAvailable ? '—' : total}<small>{metric === 'minutes' ? 'min' : 'done'}</small></strong><span>{metric === 'minutes' ? 'Completed focus sessions' : 'Tasks completed this week'}</span></div><div className="bk-segmented bk-metric-tabs"><button type="button" aria-pressed={metric === 'minutes'} onClick={() => { setMetric('minutes'); setSelected(null); }}>Focus</button><button type="button" aria-pressed={metric === 'tasks'} onClick={() => { setMetric('tasks'); setSelected(null); }}>Tasks</button></div></div>
      {metric === 'tasks' && !tasksAvailable ? <div className="bk-widget-empty" role="status"><p>{tasksStatus === 'failed' ? 'Task progress could not be loaded.' : 'Loading task progress…'}</p>{tasksStatus === 'failed' && <button className="bk-small-action" type="button" onClick={onRetry}>Retry</button>}</div> : <div className="bk-momentum-chart" aria-label={`Weekly ${metric === 'minutes' ? 'focus minutes' : 'completed tasks'} chart`}>{days.map((day) => <button className={`bk-chart-column${day.date === today ? ' is-today' : ''}${day.date === selected ? ' is-selected' : ''}`} type="button" key={day.date} aria-pressed={day.date === selected} aria-label={`${day.label} ${day.date}: ${day[metric]} ${metric === 'minutes' ? 'focus minutes' : 'tasks completed'}`} onClick={() => setSelected(day.date)}><span className="bk-chart-value">{day[metric] || '·'}</span><span className="bk-chart-track"><i style={{ height: `${day[metric] / max * 100}%` }} /></span><span>{day.label}</span><small>{Number(day.date.slice(-2))}</small></button>)}</div>}
      <p className="bk-widget-footnote" role="status">{selectedDay ? `${range(selectedDay.date)} · ${selectedDay.minutes} focused minutes · ${tasksAvailable ? `${selectedDay.tasks} completed tasks` : 'Task progress unavailable'}` : total ? 'Every small step counts. Select a day to see the details.' : 'Your story starts with one completed session or task.'}</p>
    </article>
  );
}

function QuickCapture({ today, lists, ready, taskStatus }) {
  const dispatch = useAppDispatch();
  const notice = useNotification();
  const [title, setTitle] = useState('');
  const [listId, setListId] = useState('');
  const [dueToday, setDueToday] = useState(false);
  const [priority, setPriority] = useState('normal');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);
  const effectiveList = lists.some((list) => list.id === listId) ? listId : lists[0]?.id || '';

  async function capture(event) {
    event.preventDefault();
    if (!title.trim() || !effectiveList || saving) return;
    setSaving(true);
    try { await dispatch(createTask({ title: title.trim(), listId: effectiveList, dueDate: dueToday ? today : null, priority })).unwrap(); setTitle(''); notice.success('Your next step is on the task board.'); inputRef.current?.focus(); }
    catch (failure) { notice.error(failure.message || 'Task could not be saved. Your draft is still here.'); }
    finally { setSaving(false); }
  }

  return (
    <article className="bk-widget bk-capture-widget" aria-labelledby="capture-widget-title">
      <div className="bk-widget-head"><div><span className="bk-section-kicker"><Plus size={12} />LESS ON YOUR MIND</span><h3 id="capture-widget-title">Catch the next idea</h3></div><span className="bk-widget-symbol"><Feather size={18} /></span></div>
      <p className="bk-widget-description">A small task, a new idea, a thing to remember. Give it a place.</p>
      <form className="bk-capture-form" onSubmit={capture}><label htmlFor="capture-task-title">What&apos;s your next step?</label><input ref={inputRef} id="capture-task-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={180} placeholder="e.g. Finish the project proposal" disabled={saving} required /><div className="bk-capture-fields"><label>Task list<select aria-label="Task list" value={effectiveList} onChange={(event) => setListId(event.target.value)} disabled={!lists.length || saving}>{!lists.length && <option value="">No list available</option>}{lists.map((list) => <option value={list.id} key={list.id}>{list.name}</option>)}</select></label><label>Priority<select aria-label="Task priority" value={priority} disabled={saving} onChange={(event) => setPriority(event.target.value)}><option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></label></div><div className="bk-capture-submit"><label className="bk-capture-today"><input type="checkbox" checked={dueToday} disabled={saving} onChange={(event) => setDueToday(event.target.checked)} />Due today</label><button className="bk-primary-action" type="submit" disabled={!ready || saving || !title.trim() || !effectiveList}>{saving ? <LoaderCircle size={14} className="bk-spin" /> : <Plus size={14} />}{saving ? 'Saving…' : 'Add task'}</button></div></form>
      {!lists.length && <p className="bk-widget-footnote">{taskStatus === 'failed' ? 'Tasks are unavailable. Retry from the priority card.' : taskStatus === 'succeeded' ? <Link href="/dashboard/tasks">Create a task list to start capturing ideas.</Link> : 'Loading your task lists…'}</p>}
      <div className="bk-capture-links"><Link href="/dashboard/notes">Open notes<ArrowUpRight size={12} /></Link><Link href="/dashboard/goals">Set a goal<ArrowUpRight size={12} /></Link></div>
    </article>
  );
}

function DailyReflection({ today, entry, updateWorkspace, ready }) {
  const [text, setText] = useState(entry?.text || '');
  const [mood, setMood] = useState(entry?.mood || 'calm');
  const [saved, setSaved] = useState(false);
  const moods = [['calm', 'Calm'], ['energized', 'Energized'], ['tired', 'Tired']];

  return (
    <article className="bk-widget bk-reflection-widget" aria-labelledby="reflection-widget-title"><div className="bk-widget-head"><div><span className="bk-section-kicker"><Sunrise size={12} />CLOSE WITH GRATITUDE</span><h3 id="reflection-widget-title">A moment for yourself</h3></div><span className="bk-widget-symbol"><Smile size={18} /></span></div><p className="bk-widget-description">What went well today? What would you like to carry into tomorrow?</p><form onSubmit={(event) => { event.preventDefault(); const reflection = { text: text.trim(), mood }; updateWorkspace((current) => ({ ...current, reflections: { ...current.reflections, [today]: reflection } })); setSaved(true); }}><div className="bk-reflection-moods" aria-label="How are you feeling?">{moods.map(([id, label]) => <button type="button" key={id} aria-pressed={mood === id} disabled={!ready} onClick={() => { setMood(id); setSaved(false); }}><span aria-hidden="true">{id === 'calm' ? '◡' : id === 'energized' ? '✧' : '☾'}</span>{label}</button>)}</div><label className="sr-only" htmlFor="daily-reflection">Your daily reflection</label><textarea id="daily-reflection" value={text} onChange={(event) => { setText(event.target.value); setSaved(false); }} maxLength={1200} rows={4} placeholder="Today, I’m grateful for…" disabled={!ready} /><div className="bk-reflection-bottom"><span role="status">{saved ? 'Saved in this browser' : entry ? 'Your reflection for today' : 'A few words are enough'} · {text.length}/1200</span><button className="bk-small-action" type="submit" disabled={!ready || !text.trim()}><Check size={14} />{saved ? 'Saved' : 'Save reflection'}</button></div></form></article>
  );
}

export default function DashboardHub() {
  const dispatch = useAppDispatch();
  const { now } = usePrayer();
  const { tasks, lists, status, error, lastFetchedAt } = useAppSelector((state) => state.tasks);
  const { workspace, updateWorkspace, ready, storageError } = useDashboardStorage();
  const [customizing, setCustomizing] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const today = now ? workspaceDate(now) : null;
  const todayMinutes = workspace.sessions.filter((session) => session.date === today).reduce((sum, session) => sum + session.minutes, 0);
  const completedToday = tasks.filter((task) => task.completed && task.completedAt && workspaceDate(task.completedAt) === today).length;
  const doneHabits = workspace.habits.filter((habit) => workspace.habitLog[today]?.includes(habit.id)).length;
  const tasksAvailable = Boolean(lastFetchedAt || status === 'succeeded');
  const retry = () => void dispatch(fetchTaskWorkspace());

  useEffect(() => {
    if (isTaskWorkspaceStale({ status, lastFetchedAt })) void dispatch(fetchTaskWorkspace());
    const refresh = () => {
      if (!document.hidden && isTaskWorkspaceStale({ status, lastFetchedAt })) void dispatch(fetchTaskWorkspace());
    };
    const interval = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [dispatch, status, lastFetchedAt]);

  function exportDay() {
    const completed = tasks.filter((task) => task.completed && task.completedAt && workspaceDate(task.completedAt) === today);
    const reflection = workspace.reflections[today];
    const summary = [
      `BARAKAH · DAILY REVIEW`, today, '', `Focus: ${todayMinutes} minutes (${workspace.sessions.filter((session) => session.date === today).length} sessions)`,
      tasksAvailable ? `Completed tasks: ${completed.length}${status === 'failed' ? ' (last loaded data)' : ''}` : 'Completed tasks: unavailable', ...completed.map((task) => `  ✓ ${task.title}`), '',
      `Daily habits: ${doneHabits}/${workspace.habits.length}`, ...workspace.habits.map((habit) => `  ${workspace.habitLog[today]?.includes(habit.id) ? '✓' : '○'} ${habit.title}`), '',
      `Reflection${reflection ? ` (${reflection.mood})` : ''}:`, reflection?.text || 'No reflection saved yet.', '', `Workspace calendar: ${WORKSPACE_TIMEZONE}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `barakah-${today}.txt`; document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportMessage('Your daily review has been downloaded.');
  }

  if (!today) return <section className="bk-workspace-loading" aria-label="Your workspace" aria-busy="true"><LayoutGrid size={20} /><span>Preparing your workspace…</span></section>;

  const hidden = (id) => workspace.hiddenWidgets.includes(id);
  return (
    <section className="bk-hub" aria-labelledby="workspace-hub-title">
      <div className="bk-hub-heading"><div><span className="bk-section-kicker"><span className="bk-live-dot" />YOUR PERSONAL WORKSPACE</span><h2 id="workspace-hub-title">Make room for what matters<span>.</span></h2><p>Focus, build little habits, and notice how far you&apos;ve come.</p></div><div className="bk-hub-actions"><button className="bk-small-action" type="button" disabled={!ready} onClick={exportDay}><ArrowDownToLine size={14} />Daily review</button><button className="bk-small-action" type="button" aria-expanded={customizing} aria-controls="workspace-customization" disabled={!ready} onClick={() => setCustomizing((value) => !value)}>{customizing ? <X size={14} /> : <SlidersHorizontal size={14} />}Customize</button></div></div>
      {customizing && <div className="bk-customize-panel" id="workspace-customization"><div><strong>Your space, your way</strong><p>Choose the widgets you want to see.</p></div><div className="bk-widget-options">{WIDGETS.map((widget) => <label key={widget.id}><input type="checkbox" checked={!hidden(widget.id)} onChange={() => updateWorkspace((current) => ({ ...current, hiddenWidgets: current.hiddenWidgets.includes(widget.id) ? current.hiddenWidgets.filter((id) => id !== widget.id) : [...current.hiddenWidgets, widget.id] }))} />{widget.label}</label>)}</div><button className="bk-text-action" type="button" onClick={() => updateWorkspace((current) => ({ ...current, hiddenWidgets: [] }))}><RefreshCw size={12} />Show all</button></div>}
      <div className="bk-day-pulse"><span><span className="bk-live-dot" />{todayMinutes} <small>focus min</small></span><span><Check size={13} />{tasksAvailable ? completedToday : '—'} <small>tasks done</small></span><span><Sparkles size={13} />{doneHabits}/{workspace.habits.length} <small>daily habits</small></span><small>Small steps add up.</small></div>
      <div className="bk-widget-grid">
        <div className="bk-widget-slot bk-slot-focus" hidden={hidden('focus')}><FocusTimer timer={workspace.timer} tasks={tasks} updateWorkspace={updateWorkspace} ready={ready} todayMinutes={todayMinutes} /></div>
        <div className="bk-widget-slot bk-slot-priorities" hidden={hidden('priorities')}><PriorityTasks today={today} tasks={tasks} status={status} error={error} lastFetchedAt={lastFetchedAt} onRetry={retry} /></div>
        <div className="bk-widget-slot bk-slot-momentum" hidden={hidden('momentum')}><WeeklyMomentum today={today} tasks={tasks} sessions={workspace.sessions} tasksAvailable={tasksAvailable} onRetry={retry} tasksStatus={status} /></div>
        <div className="bk-widget-slot bk-slot-habits" hidden={hidden('habits')}><HabitTracker workspace={workspace} updateWorkspace={updateWorkspace} today={today} ready={ready} /></div>
        <div className="bk-widget-slot bk-slot-capture" hidden={hidden('capture')}><QuickCapture today={today} lists={lists} ready={ready} taskStatus={status} /></div>
        <div className="bk-widget-slot bk-slot-reflection" hidden={hidden('reflection')}><DailyReflection key={`${today}:${ready}`} today={today} entry={workspace.reflections[today]} updateWorkspace={updateWorkspace} ready={ready} /></div>
      </div>
      {workspace.hiddenWidgets.length === WIDGETS.length && <div className="bk-widget-empty"><LayoutGrid size={25} /><strong>A little breathing room</strong><button type="button" className="bk-small-action" onClick={() => setCustomizing(true)}>Choose your widgets</button></div>}
      <p className={`bk-hub-storage-note${storageError ? ' is-error' : ''}`} role="status">{storageError ? 'Browser storage is unavailable. Habits, focus, reflections, and layout will only last for this visit.' : exportMessage || 'Habits, focus sessions, reflections, and layout are saved in this browser. Tasks sync with your workspace.'}</p>
    </section>
  );
}
