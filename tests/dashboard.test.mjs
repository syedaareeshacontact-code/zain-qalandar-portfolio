import test from 'node:test';
import assert from 'node:assert/strict';
import { completeFocusSession, defaultDashboard, freshTimer, getTimerRemaining, habitStreak, restoreDashboard, shiftDate, weeklyMomentum, workspaceDate } from '../src/lib/dashboard.js';

test('workspace dates follow Karachi midnight, independent of the host timezone', () => {
  assert.equal(workspaceDate('2026-10-07T18:59:59Z'), '2026-10-07');
  assert.equal(workspaceDate('2026-10-07T19:00:00Z'), '2026-10-08');
  assert.equal(shiftDate('2026-01-01', -1), '2025-12-31');
});

test('a running timer uses wall time, survives a reload, and clamps at zero', () => {
  const now = Date.parse('2026-10-07T10:00:00Z');
  const timer = { ...freshTimer(), endAt: now + 1500_000, id: 'session-1' };
  const reloaded = restoreDashboard({ ...defaultDashboard(), timer }).timer;
  assert.equal(getTimerRemaining(reloaded, now + 120_000), 1380);
  assert.equal(getTimerRemaining(reloaded, now + 1600_000), 0);
  const paused = { ...reloaded, remaining: 1380, endAt: null };
  assert.equal(getTimerRemaining(paused, now + 100_000_000), 1380);
});

test('completed focus is credited to its scheduled day, once, after returning later', () => {
  const endAt = Date.parse('2026-10-07T18:59:00Z');
  const state = { ...defaultDashboard(), timer: { ...freshTimer(), endAt, id: 'session-1', taskId: 'task-1' } };
  const completed = completeFocusSession(state, endAt + 24 * 3600_000);
  assert.deepEqual(completed.sessions, [{ id: 'session-1', date: '2026-10-07', minutes: 25, taskId: 'task-1' }]);
  assert.equal(completed.timer.endAt, null);
  assert.equal(completed.timer.remaining, 1500);
  assert.equal(completed.timer.taskId, 'task-1');
  assert.equal(completeFocusSession(completed, endAt + 25 * 3600_000), completed);
  assert.equal(completeFocusSession({ ...state, sessions: completed.sessions }, endAt + 1).sessions.length, 1);
});

test('unfinished, paused, and break timers do not inflate focused minutes', () => {
  const endAt = Date.now() + 1000;
  const unfinished = { ...defaultDashboard(), timer: { ...freshTimer(), endAt, id: 'session-2' } };
  assert.equal(completeFocusSession(unfinished, endAt - 1), unfinished);
  const paused = { ...unfinished, timer: { ...unfinished.timer, endAt: null } };
  assert.equal(completeFocusSession(paused, endAt + 1000), paused);
  const rest = { ...defaultDashboard(), timer: { ...freshTimer('break'), endAt, id: 'break-1' } };
  const completed = completeFocusSession(rest, endAt + 1);
  assert.equal(completed.sessions.length, 0);
  assert.equal(completed.timer.remaining, 300);
});

test('habit streaks preserve yesterday until today is complete and stop at a gap', () => {
  const log = { '2026-10-07': ['read'], '2026-10-06': ['read', 'walk'], '2026-10-05': ['read', 'walk'], '2026-10-03': ['read'] };
  assert.equal(habitStreak('read', log, '2026-10-07'), 3);
  assert.equal(habitStreak('walk', log, '2026-10-07'), 2);
  assert.equal(habitStreak('walk', log, '2026-10-08'), 0);
  assert.equal(habitStreak('new', log, '2026-10-07'), 0);
});

test('weekly momentum groups actual completion dates and focus history in the workspace calendar', () => {
  const tasks = [
    { completed: true, completedAt: '2026-10-06T19:30:00Z' },
    { completed: true, completedAt: '2026-10-07T18:30:00Z' },
    { completed: false, completedAt: '2026-10-07T18:30:00Z' },
    { completed: true, completedAt: 'invalid' },
  ];
  const days = weeklyMomentum(tasks, [{ date: '2026-10-07', minutes: 25 }, { date: '2026-10-07', minutes: 50 }], '2026-10-07');
  assert.equal(days[0].date, '2026-10-05');
  assert.deepEqual(days[2], { date: '2026-10-07', label: 'Wed', tasks: 2, minutes: 75 });
  assert.equal(days.reduce((sum, day) => sum + day.tasks, 0), 2);
  assert.equal(weeklyMomentum([], [], '2026-10-11')[0].date, '2026-10-05');
  assert.equal(weeklyMomentum([], [], '2026-10-07', -1)[0].date, '2026-09-28');
});

test('restoration tolerates malformed storage and removes invalid preferences and records', () => {
  assert.deepEqual(restoreDashboard(null), defaultDashboard());
  const restored = restoreDashboard({
    timer: { mode: 'focus', remaining: -2, endAt: 'bad', id: null },
    habits: [{ id: 'read', title: 'Read' }, { title: null }],
    habitLog: { '2026-10-07': ['read', 'read', 'deleted'], invalid: ['read'] },
    sessions: [{ id: 'bad', date: 'oops', minutes: 25 }, { id: 'too-long', date: '2026-10-07', minutes: 500 }],
    reflections: { '2026-10-07': { text: 'Grateful', mood: 'invalid' }, invalid: { text: 'Ignored' } },
    hiddenWidgets: ['focus', 'focus', 'invalid'],
  });
  assert.deepEqual(restored.habitLog, { '2026-10-07': ['read'] });
  assert.equal(restored.timer.remaining, 0);
  assert.equal(restored.timer.endAt, null);
  assert.deepEqual(restored.sessions, []);
  assert.deepEqual(restored.reflections, { '2026-10-07': { text: 'Grateful', mood: 'calm' } });
  assert.deepEqual(restored.hiddenWidgets, ['focus']);
  assert.equal(restoreDashboard({ timer: { mode: 'focus', endAt: -1e50, id: 'invalid-date' } }).timer.endAt, null);
});

test('history stays bounded and removing every habit remains a valid saved preference', () => {
  const history = Array.from({ length: 1100 }, (_, id) => ({ id: String(id), date: '2026-10-07', minutes: 25 }));
  const restored = restoreDashboard({ ...defaultDashboard(), habits: [], sessions: history });
  assert.equal(restored.sessions.length, 1000);
  assert.equal(restored.sessions[0].id, '100');
  assert.deepEqual(restored.habits, []);
});
