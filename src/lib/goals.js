export const GOAL_DESCRIPTION_LIMIT = 12000;
export const GOAL_MILESTONE_LIMIT = 30;
export const GOAL_DRAFT_KEY = 'barakah.goals.drafts.v1';
export const GOAL_CATEGORIES = [
  { value: 'career', label: 'Career' }, { value: 'learning', label: 'Learning' },
  { value: 'personal', label: 'Personal' }, { value: 'wellbeing', label: 'Wellbeing' },
];
export const GOAL_PRIORITIES = [
  { value: 'high', label: 'High', weight: 3 }, { value: 'medium', label: 'Medium', weight: 2 }, { value: 'low', label: 'Low', weight: 1 },
];

export function goalToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Karachi', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function goalDaysLeft(targetDate, today = goalToday()) {
  if (!targetDate) return null;
  const difference = (Date.parse(`${targetDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000;
  return Number.isFinite(difference) ? Math.round(difference) : null;
}

export function formatGoalDate(value) {
  if (!value) return 'No target date';
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00Z`));
}

export function milestoneProgress(milestones) {
  return milestones.length ? Math.round(milestones.filter((item) => item.completed).length / milestones.length * 100) : 0;
}

export function goalForm(goal = {}) {
  return {
    title: goal.title || '', description: goal.description || '',
    descriptionFormat: goal.descriptionFormat || (goal.id ? 'plain' : 'markdown'),
    category: goal.category || 'career', priority: goal.priority || 'medium',
    targetDate: goal.targetDate || '', progress: goal.progress || 0,
    pinned: goal.pinned === true, milestones: (goal.milestones || []).map((item) => ({ ...item })), milestoneDraft: typeof goal.milestoneDraft === 'string' ? goal.milestoneDraft.slice(0, 180) : '',
  };
}

function validDate(value) {
  if (value === '' || value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Choose a valid target date.');
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Choose a valid target date.');
  return value;
}

export function validateGoalFields(body, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Provide a valid goal.');
  const result = {};
  const has = (field) => Object.hasOwn(body, field);
  if (!partial || has('title')) {
    if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 140) throw new Error('Add a title up to 140 characters.');
    result.title = body.title.trim();
  }
  if (!partial || has('description')) {
    if (typeof body.description !== 'string' || body.description.length > GOAL_DESCRIPTION_LIMIT) throw new Error(`Description must be ${GOAL_DESCRIPTION_LIMIT.toLocaleString('en')} characters or fewer.`);
    result.description = body.description.trim();
  }
  if (!partial || has('category')) {
    if (!GOAL_CATEGORIES.some((item) => item.value === body.category)) throw new Error('Choose a valid category.');
    result.category = body.category;
  }
  if (!partial || has('priority')) {
    if (!GOAL_PRIORITIES.some((item) => item.value === body.priority)) throw new Error('Choose a valid priority.');
    result.priority = body.priority;
  }
  if (!partial || has('targetDate')) result.targetDate = validDate(body.targetDate);
  if (!partial || has('progress')) {
    if (!Number.isInteger(body.progress) || body.progress < 0 || body.progress > 100) throw new Error('Progress must be a whole number from 0 to 100.');
    result.progress = body.progress;
  }
  if (!partial || has('descriptionFormat')) {
    const format = has('descriptionFormat') ? body.descriptionFormat : 'plain';
    if (!['plain', 'markdown'].includes(format)) throw new Error('Choose a valid description format.');
    result.descriptionFormat = format;
  }
  if (!partial || has('pinned')) {
    if (has('pinned') && typeof body.pinned !== 'boolean') throw new Error('Pin must be true or false.');
    result.pinned = body.pinned ?? false;
  }
  if (!partial || has('milestones')) {
    const milestones = has('milestones') ? body.milestones : [];
    if (!Array.isArray(milestones) || milestones.length > GOAL_MILESTONE_LIMIT) throw new Error(`Add up to ${GOAL_MILESTONE_LIMIT} milestones.`);
    const ids = new Set();
    result.milestones = milestones.map((item) => {
      if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9-]{1,64}$/.test(item.id) || ids.has(item.id)) throw new Error('Milestones need unique, valid IDs.');
      if (typeof item.title !== 'string' || !item.title.trim() || item.title.trim().length > 180) throw new Error('Give each milestone a title up to 180 characters.');
      if (typeof item.completed !== 'boolean') throw new Error('Choose a valid milestone status.');
      ids.add(item.id);
      return { id: item.id, title: item.title.trim(), completed: item.completed };
    });
  }
  if (partial && !Object.keys(result).length) throw new Error('No changes were provided.');
  return result;
}

export function resolveGoalProgress(updates, existing = {}) {
  const milestones = updates.milestones ?? existing.milestones ?? [];
  if (milestones.length) {
    if (Object.hasOwn(updates, 'progress') && !Object.hasOwn(updates, 'milestones')) throw new Error('Update the milestones to change this goal’s progress.');
    return milestoneProgress(milestones);
  }
  return updates.progress ?? existing.progress ?? 0;
}

export function serializeGoal(goal) {
  return {
    id: goal._id.toString(), title: goal.title, description: goal.description || '',
    descriptionFormat: goal.descriptionFormat === 'markdown' ? 'markdown' : 'plain',
    category: goal.category, priority: goal.priority, targetDate: goal.targetDate || null,
    progress: goal.progress, pinned: goal.pinned === true, milestones: goal.milestones || [],
    createdAt: goal.createdAt, updatedAt: goal.updatedAt,
    completedAt: goal.completedAt || null, deletedAt: goal.deletedAt || null,
  };
}

export function selectGoals(goals, { filter = 'active', query = '', category = 'all', priority = 'all', sort = 'due', today = goalToday() } = {}) {
  const search = query.trim().toLowerCase();
  const weights = { high: 3, medium: 2, low: 1 };
  const dateValue = (value) => value ? new Date(value).getTime() : 0;
  return goals.filter((goal) => {
    if (filter === 'trash') { if (!goal.deletedAt) return false; }
    else {
      if (goal.deletedAt) return false;
      if (filter === 'active' && goal.progress === 100) return false;
      if (filter === 'completed' && goal.progress !== 100) return false;
      if (filter === 'pinned' && !goal.pinned) return false;
      if (filter === 'overdue' && (goal.progress === 100 || goalDaysLeft(goal.targetDate, today) === null || goalDaysLeft(goal.targetDate, today) >= 0)) return false;
    }
    if (category !== 'all' && goal.category !== category) return false;
    if (priority !== 'all' && goal.priority !== priority) return false;
    return !search || `${goal.title} ${goal.description} ${goal.category} ${(goal.milestones || []).map((item) => item.title).join(' ')}`.toLowerCase().includes(search);
  }).sort((a, b) => {
    if (filter === 'trash') return dateValue(b.deletedAt) - dateValue(a.deletedAt);
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    if ((a.progress === 100) !== (b.progress === 100)) return a.progress === 100 ? 1 : -1;
    if (sort === 'priority' && weights[a.priority] !== weights[b.priority]) return weights[b.priority] - weights[a.priority];
    if (sort === 'progress' && a.progress !== b.progress) return b.progress - a.progress;
    if (sort === 'due') {
      if (a.targetDate && b.targetDate && a.targetDate !== b.targetDate) return a.targetDate.localeCompare(b.targetDate);
      if (Boolean(a.targetDate) !== Boolean(b.targetDate)) return a.targetDate ? -1 : 1;
    }
    return dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt);
  });
}

export function safeGoalLink(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

export function formatGoalSelection(text, start, end, type) {
  const wrappers = { bold: '**', italic: '*', strike: '~~', code: '`' };
  if (wrappers[type]) {
    const marker = wrappers[type];
    const selected = text.slice(start, end) || 'text';
    return { text: text.slice(0, start) + marker + selected + marker + text.slice(end), start: start + marker.length, end: start + marker.length + selected.length };
  }
  const lineStart = start === 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
  const nextBreak = text.indexOf('\n', end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const selected = text.slice(lineStart, lineEnd) || 'text';
  const block = selected.split('\n').map((line, index) => `${type === 'heading' ? '### ' : type === 'quote' ? '> ' : type === 'numbered' ? `${index + 1}. ` : '- '}${line}`).join('\n');
  return { text: text.slice(0, lineStart) + block + text.slice(lineEnd), start: lineStart, end: lineStart + block.length };
}
