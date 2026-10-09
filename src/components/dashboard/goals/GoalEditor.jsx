'use client';

import { useId, useState } from 'react';
import { Check, FileCheck2, ListChecks, LoaderCircle, Pin, Plus, Target, Trash2 } from 'lucide-react';
import { GOAL_CATEGORIES, GOAL_MILESTONE_LIMIT, GOAL_PRIORITIES, milestoneProgress } from '@/lib/goals';
import GoalDescriptionEditor from './GoalDescriptionEditor';
import GoalDialog from './GoalDialog';

export default function GoalEditor({ value, editing, busy, error, saveConflict, storageAvailable, restoredDraft, onChange, onSave, onClose, onDiscard }) {
  const titleId = useId();
  const newStep = value.milestoneDraft || '';
  const [stepError, setStepError] = useState('');
  const milestones = value.milestones;
  const progress = milestones.length ? milestoneProgress(milestones) : value.progress;
  const changeMilestones = (next) => onChange({ ...value, milestones: next, progress: next.length ? milestoneProgress(next) : progress });
  const pendingMilestone = () => ({ id: crypto.randomUUID(), title: newStep.trim(), completed: false });
  const addStep = () => {
    if (!newStep.trim()) return;
    if (milestones.length >= GOAL_MILESTONE_LIMIT) { setStepError(`You can add up to ${GOAL_MILESTONE_LIMIT} milestones.`); return; }
    const next = [...milestones, pendingMilestone()];
    onChange({ ...value, milestones: next, progress: milestoneProgress(next), milestoneDraft: '' });
    setStepError('');
  };
  const submit = (event, asNew = false) => {
    event?.preventDefault();
    if (newStep.trim()) {
      if (milestones.length >= GOAL_MILESTONE_LIMIT) { setStepError(`You can add up to ${GOAL_MILESTONE_LIMIT} milestones.`); return; }
      const next = [...milestones, pendingMilestone()];
      const nextValue = { ...value, milestones: next, progress: milestoneProgress(next), milestoneDraft: '' };
      onChange(nextValue); onSave(nextValue, asNew);
    } else onSave(value, asNew);
  };

  return <GoalDialog titleId={titleId} onClose={onClose} busy={busy} className="bk-goals-editor-dialog">
    <div className="bk-goal-dialog-heading"><span className="bk-goals-dialog-symbol"><Target size={23} /></span><div><p className="bk-goals-eyebrow">{editing ? 'Make room for progress' : 'A new direction'}</p><h2 id={titleId}>{editing ? 'Edit your goal' : 'Create a goal'}</h2></div></div>
    <p className="bk-goals-dialog-copy">A clear target. A thoughtful plan. One step at a time.</p>
    {restoredDraft && <p className="bk-goal-draft-restored"><FileCheck2 size={14} /> Your unsaved draft has been restored.</p>}
    <form onSubmit={submit}>
      <label className="bk-goals-field"><span>Goal title <b>*</b></span><input data-autofocus required maxLength={140} placeholder="e.g. Launch the project I believe in" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} disabled={busy} /></label>
      <GoalDescriptionEditor value={value.description} format={value.descriptionFormat} onChange={(description, descriptionFormat) => onChange({ ...value, description, descriptionFormat })} disabled={busy} />
      <div className="bk-goals-form-row"><label className="bk-goals-field"><span>Category</span><select value={value.category} onChange={(event) => onChange({ ...value, category: event.target.value })} disabled={busy}>{GOAL_CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label className="bk-goals-field"><span>Target date <small>optional</small></span><input type="date" value={value.targetDate} onChange={(event) => onChange({ ...value, targetDate: event.target.value })} disabled={busy} /></label></div>
      <fieldset className="bk-goals-field bk-goal-priority-field"><legend>Priority</legend><div className="bk-goal-priority-options">{GOAL_PRIORITIES.map((item) => <label key={item.value} className={`priority-${item.value}${value.priority === item.value ? ' is-selected' : ''}`}><input type="radio" name="goal-priority" value={item.value} checked={value.priority === item.value} onChange={() => onChange({ ...value, priority: item.value })} disabled={busy} /><span className="bk-goal-priority-dot" />{item.label}{value.priority === item.value && <Check size={14} />}</label>)}</div></fieldset>
      <label className="bk-goal-pin-option"><span><Pin size={17} /><span><strong>Pin this goal</strong><small>Keep it at the top of your workspace.</small></span></span><input type="checkbox" checked={value.pinned} onChange={(event) => onChange({ ...value, pinned: event.target.checked })} disabled={busy} /></label>
      <div className="bk-goal-milestone-editor"><div className="bk-goal-milestones-head"><span><ListChecks size={17} />Milestones <small>optional</small></span><strong>{milestones.length}/{GOAL_MILESTONE_LIMIT}</strong></div><p>Break the goal into small steps. Progress updates as you check them off.</p>
        {milestones.map((item, index) => <div className="bk-goal-step-edit" key={item.id}><input type="checkbox" aria-label={`Complete milestone ${index + 1}`} checked={item.completed} disabled={busy} onChange={() => changeMilestones(milestones.map((step) => step.id === item.id ? { ...step, completed: !step.completed } : step))} /><input type="text" maxLength={180} required aria-label={`Milestone ${index + 1} title`} value={item.title} onChange={(event) => changeMilestones(milestones.map((step) => step.id === item.id ? { ...step, title: event.target.value } : step))} disabled={busy} /><button type="button" className="bk-goal-icon-action is-danger" title="Remove milestone" aria-label={`Remove milestone ${index + 1}`} onClick={() => changeMilestones(milestones.filter((step) => step.id !== item.id))} disabled={busy}><Trash2 size={14} /></button></div>)}
        {milestones.length < GOAL_MILESTONE_LIMIT && <div className="bk-goal-add-step"><input type="text" maxLength={180} aria-label="New milestone" placeholder="Add your next small step…" value={newStep} onChange={(event) => onChange({ ...value, milestoneDraft: event.target.value })} disabled={busy} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addStep(); } }} /><button type="button" className="bk-goal-action" onClick={addStep} disabled={busy || !newStep.trim()}><Plus size={15} /> Add</button></div>}
        {stepError && <p className="bk-goals-form-error" role="alert">{stepError}</p>}
      </div>
      <label className="bk-goals-field bk-goals-range-field"><span>{milestones.length ? 'Milestone progress' : 'Progress'}<strong>{progress}%</strong></span><input type="range" min="0" max="100" step="1" value={progress} onChange={(event) => onChange({ ...value, progress: Number(event.target.value) })} disabled={busy || milestones.length > 0} /><small>{milestones.length ? 'Calculated from your completed milestones.' : 'Move the slider to reflect how far you have come.'}</small></label>
      {error && <p className="bk-goals-form-error" role="alert">{error}</p>}
      {saveConflict && <div className="bk-goal-save-conflict"><p>Keep both versions by saving your draft as a new goal.</p><button type="button" className="bk-goal-action" disabled={busy} onClick={() => submit(null, true)}><Plus size={14} />Save draft as new goal</button></div>}
      <div className={`bk-goal-draft-status${storageAvailable ? '' : ' is-warning'}`}><FileCheck2 size={13} />{storageAvailable ? 'Draft saved on this device as you write.' : 'Draft saving is unavailable. Save your goal before leaving.'}</div>
      <div className="bk-goals-dialog-actions"><button type="button" className="bk-goal-discard" onClick={onDiscard} disabled={busy}>Discard draft</button><span className="bk-goal-action-spacer" /><button type="button" className="bk-goals-secondary" onClick={onClose} disabled={busy}>Close</button><button type="submit" className="bk-goals-primary" disabled={busy}>{busy ? <LoaderCircle className="bk-spin" size={16} /> : <Check size={16} />}{editing ? 'Save changes' : 'Create goal'}</button></div>
    </form>
  </GoalDialog>;
}
