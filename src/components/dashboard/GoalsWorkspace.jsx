'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock3, Download, FileText, LayoutGrid, List, LoaderCircle, Pin, Plus, RefreshCw, Search, ShieldCheck, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { useNotification } from '@/context/notification-context';
import { apiRequest } from '@/store/apiClient';
import { GOAL_CATEGORIES, GOAL_DESCRIPTION_LIMIT, GOAL_DRAFT_KEY, GOAL_PRIORITIES, goalDaysLeft, goalForm, goalToday, selectGoals, validateGoalFields } from '@/lib/goals';
import GoalCard from './goals/GoalCard';
import GoalDialog from './goals/GoalDialog';
import GoalEditor from './goals/GoalEditor';

const VIEW_KEY = 'barakah.goals.view.v1';

function loadDrafts(raw) {
  try {
    const parsed = JSON.parse(raw || '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([key, draft]) => {
      if (key !== 'new' && !/^[a-f\d]{24}$/i.test(key)) return false;
      if (!draft?.form || typeof draft.form.title !== 'string' || typeof draft.form.description !== 'string' || draft.form.description.length > GOAL_DESCRIPTION_LIMIT || !Number.isFinite(Date.parse(draft.savedAt))) return false;
      try { validateGoalFields({ ...draft.form, title: draft.form.title.trim() || 'Draft' }); return true; } catch { return false; }
    }).slice(-20));
  } catch { return {}; }
}

export default function GoalsWorkspace() {
  const trashTitleId = useId();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filter, setFilter] = useState('active');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [priority, setPriority] = useState('all');
  const [sort, setSort] = useState('due');
  const [view, setView] = useState('grid');
  const [today, setToday] = useState(goalToday);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [saveConflict, setSaveConflict] = useState(false);
  const [trashTarget, setTrashTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [draftKey, setDraftKey] = useState('new');
  const [restoredDraft, setRestoredDraft] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const draftRef = useRef({});
  const mutationRef = useRef(false);
  const loadRequest = useRef(0);

  const loadGoals = useCallback(async () => {
    const sequence = ++loadRequest.current;
    setLoading(true); setLoadError('');
    try {
      const data = await apiRequest('/api/goals?view=workspace', { cache: 'no-store' });
      if (sequence === loadRequest.current) setGoals(data);
    }
    catch (error) { if (sequence === loadRequest.current) { const message = error instanceof Error ? error.message : 'Goals could not be loaded.'; setLoadError(message); notifyError(message); } }
    finally { if (sequence === loadRequest.current) setLoading(false); }
  }, [notifyError]);

  useEffect(() => { void loadGoals(); return () => { loadRequest.current += 1; }; }, [loadGoals]);
  useEffect(() => {
    try {
      const stored = loadDrafts(localStorage.getItem(GOAL_DRAFT_KEY));
      draftRef.current = stored; setDrafts(stored);
      const savedView = localStorage.getItem(VIEW_KEY);
      if (['grid', 'list'].includes(savedView)) setView(savedView);
    } catch { setStorageAvailable(false); }
    const refreshDate = () => setToday(goalToday());
    const interval = window.setInterval(refreshDate, 60000);
    window.addEventListener('focus', refreshDate);
    return () => { window.clearInterval(interval); window.removeEventListener('focus', refreshDate); };
  }, []);

  const persistDrafts = (next) => {
    next = Object.fromEntries(Object.entries(next).sort((a, b) => Date.parse(b[1].savedAt) - Date.parse(a[1].savedAt)).slice(0, 20));
    draftRef.current = next; setDrafts(next);
    try { localStorage.setItem(GOAL_DRAFT_KEY, JSON.stringify(next)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  };
  const removeDraft = (key) => { const next = { ...draftRef.current }; delete next[key]; persistDrafts(next); };
  const changeForm = (next) => {
    setForm(next);
    persistDrafts({ ...draftRef.current, [draftKey]: { form: next, goalId: editingGoal?.id || null, baseUpdatedAt: editingGoal?.updatedAt || null, savedAt: new Date().toISOString() } });
  };
  const closeForm = () => { if (!mutationRef.current) { setForm(null); setEditingGoal(null); setFormError(''); } };
  const openEditor = (goal = null, key = goal?.id || 'new') => {
    const draft = draftRef.current[key];
    setDraftKey(key); setRestoredDraft(Boolean(draft));
    setEditingGoal(goal ? { ...goal, updatedAt: draft?.baseUpdatedAt || goal.updatedAt } : null);
    setForm(draft ? goalForm({ ...draft.form, id: goal?.id }) : goalForm(goal || {}));
    setFormError(''); setSaveConflict(false);
  };

  const liveGoals = useMemo(() => goals.filter((goal) => !goal.deletedAt), [goals]);
  const counts = useMemo(() => ({
    active: liveGoals.filter((goal) => goal.progress < 100).length,
    completed: liveGoals.filter((goal) => goal.progress === 100).length,
    pinned: liveGoals.filter((goal) => goal.pinned).length,
    overdue: liveGoals.filter((goal) => goal.progress < 100 && goalDaysLeft(goal.targetDate, today) !== null && goalDaysLeft(goal.targetDate, today) < 0).length,
    due: liveGoals.filter((goal) => { const days = goalDaysLeft(goal.targetDate, today); return goal.progress < 100 && days !== null && days >= 0 && days <= 7; }).length,
    trash: goals.length - liveGoals.length,
    average: liveGoals.length ? Math.round(liveGoals.reduce((total, goal) => total + goal.progress, 0) / liveGoals.length) : 0,
  }), [goals.length, liveGoals, today]);
  const visibleGoals = useMemo(() => selectGoals(goals, { filter, query, category, priority, sort, today }), [goals, filter, query, category, priority, sort, today]);
  const draftEntries = Object.entries(drafts).sort((a, b) => Date.parse(b[1].savedAt) - Date.parse(a[1].savedAt));
  const latestDraft = draftEntries[0];
  const filtered = Boolean(query || category !== 'all' || priority !== 'all');
  const resetFilters = () => { setQuery(''); setCategory('all'); setPriority('all'); };

  const beginMutation = (id) => {
    if (mutationRef.current) return false;
    mutationRef.current = true; setBusyId(id); return true;
  };
  const endMutation = () => { mutationRef.current = false; setBusyId(null); };
  const replaceGoal = (saved) => setGoals((current) => current.map((item) => item.id === saved.id ? saved : item));
  const patchGoal = async (goal, updates, message) => {
    if (!beginMutation(goal.id)) return;
    try {
      const saved = await apiRequest('/api/goals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: goal.id, expectedUpdatedAt: goal.updatedAt, ...updates }) });
      replaceGoal(saved); notifySuccess(message);
    } catch (error) { notifyError(error instanceof Error ? error.message : 'The goal could not be updated.'); }
    finally { endMutation(); }
  };
  const updateProgress = (goal, progress) => {
    const milestones = goal.milestones || [];
    let updates = { progress };
    if (milestones.length) {
      const lastCompleted = milestones.findLastIndex((item) => item.completed);
      updates = { milestones: milestones.map((item, index) => ({ ...item, completed: progress === 100 ? true : index === lastCompleted ? false : item.completed })) };
    }
    void patchGoal(goal, updates, progress === 100 ? 'Goal completed. Well done!' : progress < goal.progress ? 'Goal reopened.' : 'Progress updated.');
  };
  const saveGoal = async (submitted, asNew = false) => {
    try { validateGoalFields(submitted); } catch (error) { setFormError(error.message); return; }
    const isEdit = Boolean(editingGoal) && !asNew;
    if (!beginMutation(isEdit ? editingGoal.id : 'create')) return;
    setFormError(''); setSaveConflict(false);
    try {
      const saved = await apiRequest('/api/goals', { method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...submitted, ...(isEdit ? { id: editingGoal.id, expectedUpdatedAt: editingGoal.updatedAt } : {}) }) });
      setGoals((current) => isEdit ? current.map((goal) => goal.id === saved.id ? saved : goal) : [saved, ...current]);
      removeDraft(draftKey); setForm(null); setEditingGoal(null); resetFilters(); setFilter(saved.progress === 100 ? 'completed' : 'active');
      notifySuccess(isEdit ? 'Goal updated.' : 'Goal created. Let’s make it happen.');
    } catch (error) { const message = error instanceof Error ? error.message : 'The goal could not be saved.'; setFormError(message); setSaveConflict(message.includes('changed in another window')); notifyError(message); }
    finally { endMutation(); }
  };
  const moveToTrash = async () => {
    if (!trashTarget || !beginMutation(trashTarget.id)) return;
    try {
      const params = new URLSearchParams({ id: trashTarget.id, expectedUpdatedAt: trashTarget.updatedAt });
      const saved = await apiRequest(`/api/goals?${params}`, { method: 'DELETE' });
      replaceGoal(saved); setTrashTarget(null); notifySuccess('Goal moved to Trash. You can restore it anytime.');
    } catch (error) { notifyError(error instanceof Error ? error.message : 'The goal could not be moved to Trash.'); }
    finally { endMutation(); }
  };
  const restoreGoal = async (goal) => {
    await patchGoal(goal, { action: 'restore' }, 'Goal restored with all its details.');
  };
  const exportGoals = () => {
    const file = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), goals }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `barakah-goals-${goalToday()}.json`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notifySuccess('Goals exported, including items in Trash. Keep the file somewhere safe.');
  };
  const changeView = (next) => { setView(next); try { localStorage.setItem(VIEW_KEY, next); } catch { /* The view still works without storage. */ } };
  const switchFilter = (next) => { setFilter(next); resetFilters(); };
  const tabs = [{ value: 'active', label: 'Active', count: counts.active }, { value: 'pinned', label: 'Pinned', count: counts.pinned, icon: Pin }, { value: 'all', label: 'All', count: liveGoals.length }, ...(counts.overdue || filter === 'overdue' ? [{ value: 'overdue', label: 'Overdue', count: counts.overdue, icon: Clock3 }] : []), { value: 'completed', label: 'Completed', count: counts.completed }, { value: 'trash', label: 'Trash', count: counts.trash, icon: Trash2 }];

  return <div className="bk-goals-workspace">
    <header className="bk-goals-heading"><div><p className="bk-goals-eyebrow">Small steps. Meaningful change.</p><h2>Give your ambitions a direction.</h2><p>Keep what matters in focus, and turn your next step into progress.</p></div><div className="bk-goals-heading-actions"><button type="button" className="bk-goals-secondary" onClick={exportGoals} disabled={loading || Boolean(loadError) || !goals.length}><Download size={16} /> Export</button><button type="button" className="bk-goals-primary" onClick={() => openEditor()} disabled={loading || Boolean(busyId)}><Plus size={17} /> New goal</button></div></header>
    <div className="bk-goals-summary" aria-label="Goals overview">
      <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><Target size={19} /></span><span>Active goals</span><strong>{loading ? '—' : counts.active}</strong><small>Ideas becoming reality</small></div>
      <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><CheckCircle2 size={19} /></span><span>Completed</span><strong>{loading ? '—' : counts.completed}</strong><small>Celebrate every finish</small></div>
      <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><Clock3 size={19} /></span><span>Due this week</span><strong>{loading ? '—' : counts.due}</strong><small>{counts.overdue ? `${counts.overdue} overdue ${counts.overdue === 1 ? 'goal needs' : 'goals need'} attention` : 'Focus for the next 7 days'}</small></div>
      <div className="bk-goals-stat"><span className="bk-goals-stat-icon"><TrendingUp size={19} /></span><span>Overall progress</span><strong>{loading ? '—' : counts.average}<em>%</em></strong><small>Every step counts</small></div>
    </div>
    {latestDraft && <div className="bk-goal-draft-banner"><FileText size={19} /><span><strong>{latestDraft[1].form.title || 'An unfinished goal'}</strong><small>{draftEntries.length > 1 ? `${draftEntries.length} drafts saved on this device` : 'Your unsaved draft is ready when you are'}</small></span><button type="button" onClick={() => openEditor(liveGoals.find((goal) => goal.id === latestDraft[1].goalId) || null, latestDraft[0])} disabled={loading || Boolean(busyId)}>Resume draft</button><button type="button" className="bk-goal-icon-action" aria-label="Discard latest saved draft" onClick={() => removeDraft(latestDraft[0])} disabled={Boolean(busyId)}><X size={15} /></button></div>}
    {counts.overdue > 0 && filter !== 'trash' && <div className="bk-goal-attention"><Clock3 size={16} /><span>{counts.overdue} {counts.overdue === 1 ? 'goal is' : 'goals are'} past the target date. A small next step can get things moving.</span><button type="button" onClick={() => switchFilter('overdue')}>Review overdue</button></div>}
    <div className="bk-goals-list-head"><div><p className="bk-goals-eyebrow">{filter === 'trash' ? 'A second chance' : 'Your personal roadmap'}</p><h2>{filter === 'trash' ? 'Trash' : filter === 'pinned' ? 'Pinned goals' : filter === 'overdue' ? 'Needs attention' : 'Your goals'}<span>{visibleGoals.length}</span></h2></div><div className="bk-goals-view-controls"><button type="button" className="bk-goal-icon-action" title="Refresh goals" aria-label="Refresh goals" onClick={() => void loadGoals()} disabled={loading || Boolean(busyId)}><RefreshCw size={16} className={loading ? 'bk-spin' : ''} /></button><div className="bk-goal-view-toggle" role="group" aria-label="Goals layout"><button type="button" title="Grid view" aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => changeView('grid')}><LayoutGrid size={16} /></button><button type="button" title="List view" aria-label="List view" aria-pressed={view === 'list'} onClick={() => changeView('list')}><List size={17} /></button></div></div></div>
    <div className="bk-goals-filters" role="group" aria-label="Filter goals">{tabs.map(({ value, label, count, icon: Icon }) => <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? 'is-active' : ''} onClick={() => switchFilter(value)}>{Icon && <Icon size={13} />}{label}<span>{count}</span></button>)}</div>
    <div className="bk-goals-controls"><label className="bk-goals-search"><Search size={17} /><span className="sr-only">Search goals and milestones</span><input type="search" placeholder="Search goals, plans, and milestones…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="bk-goal-filter-select"><span className="sr-only">Category filter</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{GOAL_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label className="bk-goal-filter-select"><span className="sr-only">Priority filter</span><select value={priority} onChange={(event) => setPriority(event.target.value)}><option value="all">All priorities</option>{GOAL_PRIORITIES.map((item) => <option key={item.value} value={item.value}>{item.label} priority</option>)}</select></label><label className="bk-goal-filter-select"><span className="sr-only">Sort goals</span><select value={sort} onChange={(event) => setSort(event.target.value)} disabled={filter === 'trash'}><option value="due">Target date</option><option value="priority">Priority first</option><option value="updated">Recently updated</option><option value="progress">Most progress</option></select></label></div>
    {filter === 'trash' && <p className="bk-goal-trash-note"><ShieldCheck size={16} /> Goals in Trash keep their descriptions, milestones, pins, and progress. Restore them whenever you need.</p>}
    {filtered && <div className="bk-goal-results"><span>{visibleGoals.length} matching {visibleGoals.length === 1 ? 'goal' : 'goals'}</span><button type="button" onClick={resetFilters}>Clear filters <X size={12} /></button></div>}
    {loading ? <div className="bk-goals-state" role="status"><LoaderCircle className="bk-spin" size={23} /><p>Loading your roadmap…</p></div> : loadError ? <div className="bk-goals-state is-error" role="alert"><p>{loadError}</p><button type="button" onClick={() => void loadGoals()}>Try again</button></div> : visibleGoals.length ?
      <div className={`bk-goals-grid${view === 'list' ? ' is-list' : ''}`}>{visibleGoals.map((goal) => <GoalCard key={goal.id} goal={goal} today={today} busy={Boolean(busyId)} onEdit={openEditor} onTrash={setTrashTarget} onPatch={patchGoal} onProgress={updateProgress} onRestore={restoreGoal} />)}</div> :
      <div className="bk-goals-state"><span>{filter === 'trash' ? <ShieldCheck size={27} /> : filter === 'pinned' ? <Pin size={27} /> : <Target size={27} />}</span><h3>{filtered ? 'No goals match these filters' : filter === 'trash' ? 'Your Trash is empty' : filter === 'pinned' ? 'Keep your big priorities close' : filter === 'completed' ? 'Your first finish is ahead' : filter === 'overdue' ? 'You’re all caught up' : 'Make space for what matters'}</h3><p>{filtered ? 'Try another search or clear the filters.' : filter === 'trash' ? 'Removed goals will appear here, ready to restore.' : filter === 'pinned' ? 'Use the pin on any goal card to keep it at the top.' : filter === 'completed' ? 'Completed goals will live here as a reminder of your progress.' : filter === 'overdue' ? 'No active goals are past their target date.' : 'Create a goal and give yourself a clear next step.'}</p>{filtered ? <button type="button" onClick={resetFilters}>Clear filters</button> : filter === 'active' || filter === 'all' ? <button type="button" onClick={() => openEditor()}><Plus size={16} /> Create a goal</button> : null}</div>}
    <p className="bk-goals-footer"><Pin size={13} /> Pinned goals stay on top.<span>·</span><ShieldCheck size={13} /> Removed goals are kept in Trash.</p>
    {form && <GoalEditor value={form} editing={Boolean(editingGoal)} busy={Boolean(busyId)} error={formError} saveConflict={saveConflict} storageAvailable={storageAvailable} restoredDraft={restoredDraft} onChange={changeForm} onSave={saveGoal} onClose={closeForm} onDiscard={() => { if (!mutationRef.current) { removeDraft(draftKey); closeForm(); } }} />}
    {trashTarget && <GoalDialog titleId={trashTitleId} onClose={() => { if (!mutationRef.current) setTrashTarget(null); }} busy={Boolean(busyId)} alert className="bk-goals-delete-dialog"><span className="bk-goals-dialog-symbol is-danger"><Trash2 size={22} /></span><p className="bk-goals-eyebrow">Keep a way back</p><h2 id={trashTitleId}>Move this goal to Trash?</h2><p className="bk-goals-dialog-copy">“{trashTarget.title}” will be kept with all its details. You can restore it from the Trash tab anytime.</p><div className="bk-goals-dialog-actions"><button data-autofocus type="button" className="bk-goals-secondary" onClick={() => setTrashTarget(null)} disabled={Boolean(busyId)}>Keep goal</button><button type="button" className="bk-goals-delete-button" onClick={() => void moveToTrash()} disabled={Boolean(busyId)}>{busyId ? <LoaderCircle className="bk-spin" size={16} /> : <Trash2 size={16} />}Move to Trash</button></div></GoalDialog>}
  </div>;
}
