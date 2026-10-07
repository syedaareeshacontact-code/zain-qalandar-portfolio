export const DASHBOARD_STORAGE_KEY = 'barakah.workspace.v1';
export const WORKSPACE_TIMEZONE = 'Asia/Karachi';
export const FOCUS_MODES = { focus: { label: 'Focus', minutes: 25 }, deep: { label: 'Deep work', minutes: 50 }, break: { label: 'Break', minutes: 5 } };
export const WIDGETS = [
  { id: 'focus', label: 'Focus timer' },
  { id: 'priorities', label: 'Priority tasks' },
  { id: 'momentum', label: 'Weekly momentum' },
  { id: 'habits', label: 'Daily habits' },
  { id: 'capture', label: 'Quick capture' },
  { id: 'reflection', label: 'Daily reflection' },
];

export function workspaceDate(value = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: WORKSPACE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function shiftDate(date, days) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function freshTimer(mode = 'focus') {
  const duration = (FOCUS_MODES[mode] || FOCUS_MODES.focus).minutes * 60;
  return { mode: FOCUS_MODES[mode] ? mode : 'focus', duration, remaining: duration, endAt: null, id: null, taskId: '' };
}

export function getTimerRemaining(timer, now = Date.now()) {
  return timer.endAt ? Math.max(0, Math.ceil((timer.endAt - now) / 1000)) : timer.remaining;
}

export function defaultDashboard() {
  return {
    timer: freshTimer(), sessions: [],
    habits: [{ id: 'read', title: 'Read a little', target: 1 }, { id: 'walk', title: 'Move & recharge', target: 1 }, { id: 'dhikr', title: 'Make time for dhikr', target: 1 }],
    habitLog: {}, reflections: {}, hiddenWidgets: [],
  };
}

// Only accept the fields and bounded values this workspace can render safely.
export function restoreDashboard(value) {
  const fallback = defaultDashboard();
  if (!value || typeof value !== 'object') return fallback;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  const habits = Array.isArray(value.habits) ? value.habits.filter((habit) => typeof habit?.id === 'string' && typeof habit.title === 'string' && habit.title.trim()).slice(0, 12).map((habit) => ({ id: habit.id.slice(0, 100), title: habit.title.slice(0, 70), target: 1 })) : fallback.habits;
  const ids = new Set(habits.map((habit) => habit.id));
  const habitLog = Object.fromEntries(Object.entries(value.habitLog || {}).filter(([date, completed]) => datePattern.test(date) && Array.isArray(completed)).sort(([a], [b]) => b.localeCompare(a)).slice(0, 365).map(([date, completed]) => [date, [...new Set(completed.filter((id) => ids.has(id)))]]));
  const reflections = Object.fromEntries(Object.entries(value.reflections || {}).filter(([date, entry]) => datePattern.test(date) && entry && typeof entry.text === 'string').sort(([a], [b]) => b.localeCompare(a)).slice(0, 365).map(([date, entry]) => [date, { text: entry.text.slice(0, 1200), mood: ['calm', 'energized', 'tired'].includes(entry.mood) ? entry.mood : 'calm' }]));
  const sessions = Array.isArray(value.sessions) ? value.sessions.filter((session) => typeof session?.id === 'string' && datePattern.test(session.date) && Number.isFinite(session.minutes) && session.minutes > 0 && session.minutes <= 50).slice(-1000) : [];
  let timer = fallback.timer;
  if (value.timer && FOCUS_MODES[value.timer.mode]) {
    const base = freshTimer(value.timer.mode);
    const saved = value.timer;
    timer = {
      ...base,
      remaining: Number.isFinite(saved.remaining) ? Math.max(0, Math.min(base.duration, saved.remaining)) : base.duration,
      endAt: Number.isFinite(saved.endAt) && Number.isFinite(new Date(saved.endAt).getTime()) && typeof saved.id === 'string' ? saved.endAt : null,
      id: typeof saved.id === 'string' ? saved.id : null,
      taskId: typeof saved.taskId === 'string' ? saved.taskId : '',
    };
  }
  return { timer, habits, habitLog, reflections, sessions, hiddenWidgets: Array.isArray(value.hiddenWidgets) ? [...new Set(value.hiddenWidgets.filter((id) => WIDGETS.some((widget) => widget.id === id)))] : [] };
}

export function completeFocusSession(state, now = Date.now()) {
  const timer = state.timer;
  if (!timer.endAt || !timer.id || getTimerRemaining(timer, now) > 0) return state;
  const session = { id: timer.id, date: workspaceDate(timer.endAt), minutes: timer.duration / 60, taskId: timer.taskId };
  const sessions = timer.mode !== 'break' && !state.sessions.some((item) => item.id === session.id) ? [...state.sessions, session].slice(-1000) : state.sessions;
  return { ...state, sessions, timer: { ...freshTimer(timer.mode), taskId: timer.taskId } };
}

export function habitStreak(habitId, log, today) {
  let day = log[today]?.includes(habitId) ? today : shiftDate(today, -1);
  let count = 0;
  while (count < 365 && log[day]?.includes(habitId)) { count += 1; day = shiftDate(day, -1); }
  return count;
}

export function weeklyMomentum(tasks, sessions, today, offset = 0) {
  const mondayOffset = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const start = shiftDate(today, -mondayOffset + offset * 7);
  const completions = new Map();
  for (const task of tasks) {
    if (!task.completed || !task.completedAt || !Number.isFinite(new Date(task.completedAt).getTime())) continue;
    const day = workspaceDate(task.completedAt);
    completions.set(day, (completions.get(day) || 0) + 1);
  }
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDate(start, index);
    return { date, label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index], tasks: completions.get(date) || 0, minutes: sessions.filter((session) => session.date === date).reduce((sum, session) => sum + session.minutes, 0) };
  });
}
