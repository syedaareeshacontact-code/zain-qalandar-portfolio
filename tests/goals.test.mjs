import test from 'node:test';
import assert from 'node:assert/strict';
import { formatGoalDate, formatGoalSelection, GOAL_DESCRIPTION_LIMIT, goalDaysLeft, goalForm, goalToday, milestoneProgress, resolveGoalProgress, safeGoalLink, selectGoals, serializeGoal, validateGoalFields } from '../src/lib/goals.js';

const base = { title: 'Learn a new skill', description: 'A thoughtful plan.', category: 'learning', priority: 'medium', targetDate: '', progress: 0 };
const step = (id, completed = false) => ({ id, title: `Step ${id}`, completed });

test('legacy goals preserve literal descriptions and receive safe defaults without migration', () => {
  const goal = serializeGoal({ _id: { toString: () => 'old-goal' }, ...base, description: 'Keep **these literal symbols**\nand this line.' });
  assert.equal(goal.descriptionFormat, 'plain');
  assert.equal(goal.pinned, false);
  assert.equal(goal.deletedAt, null);
  assert.deepEqual(goal.milestones, []);
  assert.equal(goalForm(goal).description, goal.description);
  assert.equal(goalForm(goal).descriptionFormat, 'plain');
  assert.equal(goalForm().descriptionFormat, 'markdown');
  assert.equal(goalForm({ milestoneDraft: {} }).milestoneDraft, '');
});

test('formatted descriptions allow detailed plans while enforcing the server limit', () => {
  const value = validateGoalFields({ ...base, description: 'x'.repeat(GOAL_DESCRIPTION_LIMIT), descriptionFormat: 'markdown', pinned: true });
  assert.equal(value.description.length, GOAL_DESCRIPTION_LIMIT);
  assert.equal(value.pinned, true);
  assert.throws(() => validateGoalFields({ ...base, description: 'x'.repeat(GOAL_DESCRIPTION_LIMIT + 1) }));
});

test('rejects malformed fields, invalid dates, duplicate milestones, and database operators', () => {
  for (const patch of [{ pinned: 'true' }, { descriptionFormat: 'html' }, { descriptionFormat: null }, { milestones: null }, { milestones: [step('a'), step('a')] }, { milestones: [{ ...step('a'), id: { $ne: null } }] }, { milestones: [{ ...step('a'), completed: 'false' }] }, { milestones: [step('a'), { ...step('b'), title: ' ' }] }, { targetDate: '2026-02-29' }, { targetDate: '2026-04-31' }, { progress: 50.5 }, { title: { $gt: '' } }]) {
    assert.throws(() => validateGoalFields(patch, true));
  }
  assert.throws(() => validateGoalFields({ ...base, milestones: Array.from({ length: 31 }, (_, index) => step(String(index))) }));
  assert.equal(validateGoalFields({ targetDate: '2024-02-29' }, true).targetDate, '2024-02-29');
  assert.deepEqual(validateGoalFields({ pinned: false, _id: 'fake', deletedAt: 'forged' }, true), { pinned: false });
});

test('milestone completion controls progress and rejects unrelated manual overrides', () => {
  const milestones = [step('a', true), step('b'), step('c')];
  assert.equal(milestoneProgress(milestones), 33);
  assert.equal(resolveGoalProgress({ milestones, progress: 100 }), 33);
  assert.equal(resolveGoalProgress({ pinned: true }, { milestones, progress: 33 }), 33);
  assert.throws(() => resolveGoalProgress({ progress: 100 }, { milestones, progress: 33 }));
  assert.equal(resolveGoalProgress({ milestones: [], progress: 60 }, { milestones, progress: 33 }), 60);
});

test('deadlines use Karachi calendar dates independently of server timezone', () => {
  assert.equal(goalToday(new Date('2026-10-07T20:00:00Z')), '2026-10-08');
  assert.equal(goalDaysLeft('2026-10-09', '2026-10-08'), 1);
  assert.equal(goalDaysLeft('2026-10-07', '2026-10-08'), -1);
  assert.equal(goalDaysLeft(null), null);
  assert.equal(formatGoalDate('2026-10-08'), '8 Oct 2026');
});

test('pins stay above due dates and priorities, and Trash never leaks into live filters', () => {
  const goals = [
    { ...base, id: 'urgent', priority: 'high', targetDate: '2026-10-01', updatedAt: '2026-10-01' },
    { ...base, id: 'pinned', pinned: true, targetDate: '2026-12-01', updatedAt: '2026-10-01' },
    { ...base, id: 'trash', pinned: true, deletedAt: '2026-10-08', updatedAt: '2026-10-08' },
    { ...base, id: 'complete', progress: 100, targetDate: '2026-10-01', updatedAt: '2026-10-01' },
  ];
  for (const sort of ['due', 'priority', 'updated', 'progress']) assert.deepEqual(selectGoals(goals, { sort }).map((goal) => goal.id), ['pinned', 'urgent']);
  assert.deepEqual(selectGoals(goals, { filter: 'trash' }).map((goal) => goal.id), ['trash']);
  assert.deepEqual(selectGoals(goals, { filter: 'overdue', today: '2026-10-08' }).map((goal) => goal.id), ['urgent']);
  assert.equal(selectGoals(goals, { filter: 'all' }).length, 3);
  assert.deepEqual(selectGoals(goals, { filter: 'pinned' }).map((goal) => goal.id), ['pinned']);
});

test('search includes milestone text and combines category and priority filters', () => {
  const goals = [{ ...base, id: 'a', priority: 'high', milestones: [{ ...step('a'), title: 'Publish portfolio' }] }, { ...base, id: 'b', category: 'career', priority: 'low' }];
  assert.deepEqual(selectGoals(goals, { query: 'PORTFOLIO', category: 'learning', priority: 'high' }).map((goal) => goal.id), ['a']);
  assert.equal(selectGoals(goals, { query: 'portfolio', priority: 'low' }).length, 0);
});

test('formatting preserves surrounding text and applies lists to selected lines', () => {
  assert.deepEqual(formatGoalSelection('A clear plan', 2, 7, 'bold'), { text: 'A **clear** plan', start: 4, end: 9 });
  assert.equal(formatGoalSelection('First\nSecond\nThird', 7, 12, 'bullet').text, 'First\n- Second\nThird');
  assert.equal(formatGoalSelection('First\nSecond', 0, 12, 'numbered').text, '1. First\n2. Second');
  assert.equal(formatGoalSelection('', 0, 0, 'heading').text, '### text');
});

test('description links reject executable URLs, embedded credentials, and relative destinations', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'vbscript:test', '/relative', '//example.com', 'https://user:secret@example.com']) assert.equal(safeGoalLink(url), '');
  assert.equal(safeGoalLink('https://example.com'), 'https://example.com/');
  assert.equal(safeGoalLink('mailto:hello@example.com'), 'mailto:hello@example.com');
});
