'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import {
  CalendarDays, Check, CheckCircle2, Clock3, Flag, LoaderCircle,
  Pencil, Plus, RotateCcw, Search, Target, Trash2, TrendingUp, X,
} from 'lucide-react';
import { useNotification } from '@/context/notification-context';
import { apiRequest } from '@/store/apiClient';

const CATEGORIES = [
  { value: 'career', label: 'Career' },
  { value: 'learning', label: 'Learning' },
  { value: 'personal', label: 'Personal' },
  { value: 'wellbeing', label: 'Wellbeing' },
];

const EMPTY_FORM = { title: '', description: '', category: 'career', priority: 'medium', targetDate: '', progress: 0 };

function formatDate(dateValue) {
  if (!dateValue) return 'No target date';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(`${dateValue}T12:00:00`));
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function daysUntil(dateValue) {
  if (!dateValue) return null;
  const target = new Date(`${dateValue}T12:00:00`);
  const today = new Date(`${todayKey()}T12:00:00`);
  return Math.round((target - today) / 86_400_000);
}

function GoalCard({ goal, busy, onEdit, onDelete, onProgress }) {
  const completed = goal.progress === 100;
  const daysLeft = daysUntil(goal.targetDate);
  const overdue = !completed && daysLeft !== null && daysLeft < 0;
  const category = CATEGORIES.find((item) => item.value === goal.category)?.label || 'Personal';

  return (
    <article className={`bk-goal-card${completed ? ' is-complete' : ''}`}>
      <div className="bk-goal-card-top">
        <span className={`bk-goal-category is-${goal.category}`}>{category}</span>
        <span className={`bk-goal-status${completed ? ' is-complete' : overdue ? ' is-overdue' : ''}`}>
          {completed ? <CheckCircle2 size={14} /> : overdue ? <Clock3 size={14} /> : <Target size={14} />}
          {completed ? 'Completed' : overdue ? 'Overdue' : 'In progress'}
        </span>
      </div>

      <h3>{goal.title}</h3>
      <p className="bk-goal-description">{goal.description || 'No description added yet.'}</p>

      <div className="bk-goal-meta">
        <span className={overdue ? 'is-overdue' : ''}><CalendarDays size={15} /> {formatDate(goal.targetDate)}</span>
        <span><Flag size={15} /> {goal.priority} priority</span>
      </div>

      <div className="bk-goal-progress-head"><span>Progress</span><strong>{goal.progress}%</strong></div>
      <div className="bk-goal-progress-track" role="progressbar" aria-label={`${goal.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={goal.progress}>
        <span style={{ width: `${goal.progress}%` }} />
      </div>

      <div className="bk-goal-card-actions">
        {completed ? (
          <button type="button" className="bk-goal-action" onClick={() => onProgress(goal, 90)} disabled={busy}>
            <RotateCcw size={15} /> Reopen
          </button>
        ) : (
          <>
            <button type="button" className="bk-goal-action" onClick={() => onProgress(goal, Math.min(goal.progress + 10, 100))} disabled={busy}>
              <TrendingUp size={15} /> +10%
            </button>
            <button type="button" className="bk-goal-action" onClick={() => onProgress(goal, 100)} disabled={busy}>
              <Check size={15} /> Complete
            </button>
          </>
        )}
        <span className="bk-goal-action-spacer" />
        <button type="button" className="bk-goal-icon-action" aria-label={`Edit ${goal.title}`} title="Edit goal" onClick={() => onEdit(goal)} disabled={busy}><Pencil size={16} /></button>
        <button type="button" className="bk-goal-icon-action is-danger" aria-label={`Delete ${goal.title}`} title="Delete goal" onClick={() => onDelete(goal)} disabled={busy}><Trash2 size={16} /></button>
      </div>
    </article>
  );
}

export default function GoalsWorkspace() {
  const formTitleId = useId();
  const deleteTitleId = useId();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('active');
  const [query, setQuery] = useState('');
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const loadGoals = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await apiRequest('/api/goals', { cache: 'no-store' });
      setGoals(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Goals could not be loaded.';
      setLoadError(message);
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadGoals(); }, []); // Initial collection load.

  useEffect(() => {
    if (!form && !deleteTarget) return undefined;
    const onEscape = (event) => {
      if (event.key !== 'Escape' || busyId) return;
      setForm(null);
      setDeleteTarget(null);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [busyId, deleteTarget, form]);

  const activeCount = goals.filter((goal) => goal.progress < 100).length;
  const completedCount = goals.length - activeCount;
  const dueSoonCount = goals.filter((goal) => {
    const days = daysUntil(goal.targetDate);
    return goal.progress < 100 && days !== null && days >= 0 && days <= 7;
  }).length;
  const averageProgress = goals.length ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length) : 0;

  const visibleGoals = useMemo(() => {
    const search = query.trim().toLowerCase();
    return goals
      .filter((goal) => filter === 'all' || (filter === 'completed' ? goal.progress === 100 : goal.progress < 100))
      .filter((goal) => !search || `${goal.title} ${goal.description} ${goal.category}`.toLowerCase().includes(search))
      .sort((a, b) => {
        if (a.progress === 100 && b.progress !== 100) return 1;
        if (b.progress === 100 && a.progress !== 100) return -1;
        if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
        if (a.targetDate) return -1;
        if (b.targetDate) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [filter, goals, query]);

  const openCreate = () => {
    setEditingGoal(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    setForm({ title: goal.title, description: goal.description, category: goal.category, priority: goal.priority, targetDate: goal.targetDate || '', progress: goal.progress });
    setFormError('');
  };

  const saveGoal = async (event) => {
    event.preventDefault();
    if (!form || busyId) return;
    if (!form.title.trim()) {
      setFormError('Give this goal a title.');
      return;
    }

    setBusyId(editingGoal?.id || 'create');
    setFormError('');
    try {
      const saved = await apiRequest('/api/goals', {
        method: editingGoal ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, progress: Number(form.progress), ...(editingGoal ? { id: editingGoal.id } : {}) }),
      });
      setGoals((current) => editingGoal ? current.map((goal) => goal.id === saved.id ? saved : goal) : [saved, ...current]);
      setForm(null);
      setEditingGoal(null);
      notifySuccess(editingGoal ? 'Goal updated.' : 'Goal created. You are ready to make progress.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The goal could not be saved.';
      setFormError(message);
      notifyError(message);
    } finally {
      setBusyId(null);
    }
  };

  const updateProgress = async (goal, progress) => {
    if (busyId) return;
    setBusyId(goal.id);
    try {
      const saved = await apiRequest('/api/goals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goal.id, progress }),
      });
      setGoals((current) => current.map((item) => item.id === saved.id ? saved : item));
      notifySuccess(progress === 100 ? 'Goal completed. Well done!' : progress < goal.progress ? 'Goal reopened.' : 'Progress updated.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'Progress could not be updated.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteGoal = async () => {
    if (!deleteTarget || busyId) return;
    setBusyId(deleteTarget.id);
    try {
      await apiRequest(`/api/goals?id=${encodeURIComponent(deleteTarget.id)}`, { method: 'DELETE' });
      setGoals((current) => current.filter((goal) => goal.id !== deleteTarget.id));
      setDeleteTarget(null);
      notifySuccess('Goal deleted.');
    } catch (error) {
      notifyError(error instanceof Error ? error.message : 'The goal could not be deleted.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="bk-goals-workspace">
      <header className="bk-goals-heading">
        <div><p className="bk-goals-eyebrow">Your direction</p><h2>Goals that move you forward</h2><p>Set a clear target, track the work, and keep your progress in sight.</p></div>
        <button type="button" className="bk-goals-primary" onClick={openCreate}><Plus size={18} /> New goal</button>
      </header>

      <div className="bk-goals-summary" aria-label="Goals overview">
        <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><Target size={19} /></span><span>Active goals</span><strong>{activeCount}</strong><small>In motion right now</small></div>
        <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><CheckCircle2 size={19} /></span><span>Completed</span><strong>{completedCount}</strong><small>Targets reached</small></div>
        <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><Clock3 size={19} /></span><span>Due this week</span><strong>{dueSoonCount}</strong><small>Focus for the next 7 days</small></div>
        <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><TrendingUp size={19} /></span><span>Overall progress</span><strong>{averageProgress}<em>%</em></strong><small>Across all goals</small></div>
      </div>

      <div className="bk-goals-list-head">
        <div><p className="bk-goals-eyebrow">The big picture</p><h2>Your goals <span>{goals.length}</span></h2></div>
        <div className="bk-goals-controls">
          <label className="bk-goals-search"><Search size={17} /><span className="sr-only">Search goals</span><input type="search" placeholder="Search goals" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="bk-goals-filters" aria-label="Filter goals">
            {['active', 'all', 'completed'].map((value) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
          </div>
        </div>
      </div>

      {loading ? <div className="bk-goals-state" role="status"><LoaderCircle className="bk-spin" size={22} /><p>Loading goals…</p></div>
        : loadError ? <div className="bk-goals-state is-error" role="alert"><p>{loadError}</p><button type="button" onClick={() => void loadGoals()}>Try again</button></div>
          : visibleGoals.length ? <div className="bk-goals-grid">{visibleGoals.map((goal) => <GoalCard key={goal.id} goal={goal} busy={Boolean(busyId)} onEdit={openEdit} onDelete={setDeleteTarget} onProgress={updateProgress} />)}</div>
            : <div className="bk-goals-state"><span><Target size={26} /></span><h3>{goals.length ? 'No goals match this view' : 'Your next chapter starts here'}</h3><p>{goals.length ? 'Try another filter or search.' : 'Create a goal, give it a target date, and watch your progress grow.'}</p>{!goals.length && <button type="button" onClick={openCreate}><Plus size={16} /> Create your first goal</button>}</div>}

      {form && <div className="bk-goals-dialog-layer" role="presentation" onMouseDown={() => !busyId && setForm(null)}>
        <section className="bk-goals-dialog" role="dialog" aria-modal="true" aria-labelledby={formTitleId} onMouseDown={(event) => event.stopPropagation()}>
          <button type="button" className="bk-goals-dialog-close" aria-label="Close goal form" onClick={() => setForm(null)} disabled={Boolean(busyId)}><X size={19} /></button>
          <span className="bk-goals-dialog-symbol"><Target size={22} /></span>
          <p className="bk-goals-eyebrow">{editingGoal ? 'Keep it current' : 'A new direction'}</p>
          <h2 id={formTitleId}>{editingGoal ? 'Edit goal' : 'Create a goal'}</h2>
          <p className="bk-goals-dialog-copy">Give this goal a clear name and a way to measure progress.</p>
          <form onSubmit={saveGoal}>
            <label className="bk-goals-field"><span>Goal title <b>*</b></span><input required maxLength={140} autoFocus placeholder="e.g. Publish my portfolio" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} disabled={Boolean(busyId)} /></label>
            <label className="bk-goals-field"><span>Description</span><textarea maxLength={1000} rows={3} placeholder="What does success look like?" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} disabled={Boolean(busyId)} /></label>
            <div className="bk-goals-form-row">
              <label className="bk-goals-field"><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} disabled={Boolean(busyId)}>{CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label className="bk-goals-field"><span>Priority</span><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} disabled={Boolean(busyId)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
            </div>
            <label className="bk-goals-field"><span>Target date <small>optional</small></span><input type="date" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} disabled={Boolean(busyId)} /></label>
            <label className="bk-goals-field bk-goals-range-field"><span>Progress <strong>{form.progress}%</strong></span><input type="range" min="0" max="100" step="5" value={form.progress} onChange={(event) => setForm({ ...form, progress: Number(event.target.value) })} disabled={Boolean(busyId)} /></label>
            {formError && <p className="bk-goals-form-error" role="alert">{formError}</p>}
            <div className="bk-goals-dialog-actions"><button type="button" className="bk-goals-secondary" onClick={() => setForm(null)} disabled={Boolean(busyId)}>Cancel</button><button type="submit" className="bk-goals-primary" disabled={Boolean(busyId)}>{busyId ? <LoaderCircle className="bk-spin" size={17} /> : <Check size={17} />}{editingGoal ? 'Save changes' : 'Create goal'}</button></div>
          </form>
        </section>
      </div>}

      {deleteTarget && <div className="bk-goals-dialog-layer" role="presentation" onMouseDown={() => !busyId && setDeleteTarget(null)}>
        <section className="bk-goals-dialog bk-goals-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby={deleteTitleId} onMouseDown={(event) => event.stopPropagation()}>
          <span className="bk-goals-dialog-symbol is-danger"><Trash2 size={22} /></span>
          <p className="bk-goals-eyebrow">Remove goal</p>
          <h2 id={deleteTitleId}>Delete this goal?</h2>
          <p className="bk-goals-dialog-copy">“{deleteTarget.title}” and its progress will be permanently removed.</p>
          <div className="bk-goals-dialog-actions"><button type="button" className="bk-goals-secondary" onClick={() => setDeleteTarget(null)} disabled={Boolean(busyId)}>Keep goal</button><button type="button" className="bk-goals-delete-button" onClick={() => void deleteGoal()} disabled={Boolean(busyId)}>{busyId ? <LoaderCircle className="bk-spin" size={17} /> : <Trash2 size={17} />}Delete goal</button></div>
        </section>
      </div>}
    </div>
  );
}
