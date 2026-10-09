'use client';

import { useId, useState } from 'react';
import { CalendarDays, Check, CheckCircle2, ChevronDown, ChevronUp, Clock3, Flag, ListChecks, Pencil, Pin, PinOff, RotateCcw, Target, Trash2, TrendingUp } from 'lucide-react';
import { formatGoalDate, GOAL_CATEGORIES, goalDaysLeft } from '@/lib/goals';
import GoalDescription from './GoalDescription';

export default function GoalCard({ goal, busy, today, onEdit, onTrash, onPatch, onProgress, onRestore }) {
  const descriptionId = useId();
  const [expanded, setExpanded] = useState(false);
  const [allSteps, setAllSteps] = useState(false);
  const completed = goal.progress === 100;
  const deleted = Boolean(goal.deletedAt);
  const daysLeft = goalDaysLeft(goal.targetDate, today);
  const overdue = !completed && daysLeft !== null && daysLeft < 0;
  const category = GOAL_CATEGORIES.find((item) => item.value === goal.category)?.label || 'Personal';
  const longDescription = goal.description.length > 320 || goal.description.split('\n').length > 4;
  const milestones = goal.milestones || [];
  const done = milestones.filter((item) => item.completed).length;
  const status = deleted ? 'In Trash' : completed ? 'Completed' : overdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : daysLeft !== null && daysLeft <= 7 ? `${daysLeft}d left` : 'In progress';

  return <article className={`bk-goal-card priority-${goal.priority}${goal.pinned && !deleted ? ' is-pinned' : ''}${completed ? ' is-complete' : ''}${deleted ? ' is-trashed' : ''}`}>
    <div className="bk-goal-card-top"><span className="bk-goal-category">{category}</span><div className="bk-goal-top-actions">
      {goal.pinned && !deleted && <span className="bk-goal-pin-label"><Pin size={11} /> Pinned</span>}
      {!deleted && <button type="button" className={`bk-goal-pin-button${goal.pinned ? ' is-active' : ''}`} aria-pressed={goal.pinned} aria-label={`${goal.pinned ? 'Unpin' : 'Pin'} ${goal.title}`} title={goal.pinned ? 'Unpin goal' : 'Pin to top'} disabled={busy} onClick={() => onPatch(goal, { pinned: !goal.pinned }, goal.pinned ? 'Goal unpinned.' : 'Goal pinned to the top.')}>
        {goal.pinned ? <PinOff size={17} /> : <Pin size={17} />}
      </button>}
    </div></div>
    <div className="bk-goal-card-title"><h3>{goal.title}</h3><span className="bk-goal-priority"><Flag size={12} />{goal.priority} priority</span></div>
    <div id={descriptionId} className={`bk-goal-description${longDescription && !expanded ? ' is-collapsed' : ''}`}><GoalDescription text={goal.description} format={goal.descriptionFormat} compact={longDescription && !expanded} /></div>
    {longDescription && <button type="button" className="bk-goal-read-more" aria-expanded={expanded} aria-controls={descriptionId} onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'Read full description'}{expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>}
    <div className="bk-goal-meta"><span><CalendarDays size={14} />{formatGoalDate(goal.targetDate)}</span><span className={`bk-goal-status${overdue && !deleted ? ' is-overdue' : completed && !deleted ? ' is-complete' : ''}`}>
      {deleted ? <Trash2 size={13} /> : completed ? <CheckCircle2 size={13} /> : overdue || daysLeft === 0 ? <Clock3 size={13} /> : <Target size={13} />}{status}
    </span></div>
    {milestones.length > 0 && <div className="bk-goal-milestones"><div className="bk-goal-milestones-head"><span><ListChecks size={14} /> Milestones</span><strong>{done}/{milestones.length}</strong></div>
      {(allSteps ? milestones : milestones.slice(0, 3)).map((item) => <label key={item.id} className={`bk-goal-step${item.completed ? ' is-done' : ''}`}><input type="checkbox" checked={item.completed} disabled={busy || deleted} onChange={() => onPatch(goal, { milestones: milestones.map((step) => step.id === item.id ? { ...step, completed: !step.completed } : step) }, 'Milestone updated.')} /><span>{item.title}</span></label>)}
      {milestones.length > 3 && <button type="button" className="bk-goal-read-more" aria-expanded={allSteps} onClick={() => setAllSteps(!allSteps)}>{allSteps ? 'Show fewer steps' : `Show ${milestones.length - 3} more steps`}{allSteps ? <ChevronUp size={13} /> : <ChevronDown size={13} />}</button>}
    </div>}
    <div className="bk-goal-card-bottom"><div className="bk-goal-progress-head"><span>{milestones.length ? `${done} of ${milestones.length} milestones complete` : 'Your progress'}</span><strong>{goal.progress}<small>%</small></strong></div>
      <div className="bk-goal-progress-track" role="progressbar" aria-label={`${goal.title} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={goal.progress}><span style={{ width: `${goal.progress}%` }} /></div>
      <div className="bk-goal-card-actions">{deleted ? <>
        <span className="bk-goal-trash-date">Removed {new Intl.DateTimeFormat('en', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short' }).format(new Date(goal.deletedAt))}</span><span className="bk-goal-action-spacer" /><button type="button" className="bk-goal-action is-primary" onClick={() => onRestore(goal)} disabled={busy}><RotateCcw size={14} /> Restore</button>
      </> : <>
        {completed ? <button type="button" className="bk-goal-action" onClick={() => onProgress(goal, 90)} disabled={busy}><RotateCcw size={14} /> Reopen</button> : <>
          {!milestones.length && <button type="button" className="bk-goal-action" onClick={() => onProgress(goal, Math.min(goal.progress + 10, 100))} disabled={busy}><TrendingUp size={14} /> +10%</button>}
          <button type="button" className="bk-goal-action is-primary" onClick={() => onProgress(goal, 100)} disabled={busy}><Check size={14} />{milestones.length ? 'Complete all' : 'Complete'}</button>
        </>}
        <span className="bk-goal-action-spacer" /><button type="button" className="bk-goal-icon-action" aria-label={`Edit ${goal.title}`} title="Edit goal" onClick={() => onEdit(goal)} disabled={busy}><Pencil size={15} /></button>
        <button type="button" className="bk-goal-icon-action is-danger" aria-label={`Move ${goal.title} to Trash`} title="Move to Trash" onClick={() => onTrash(goal)} disabled={busy}><Trash2 size={15} /></button>
      </>}</div>
    </div>
  </article>;
}
