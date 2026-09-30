'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Flag,
  FolderPlus,
  GripVertical,
  ListTodo,
  LoaderCircle,
  Plus,
  Repeat2,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNotification } from '@/context/notification-context';
import {
  createTask,
  createTaskList,
  deleteTask,
  deleteTaskList,
  fetchTaskWorkspace,
  isTaskWorkspaceStale,
  optimisticallyUpdateTask,
  replaceTasks,
  reorderTasks as persistTaskOrder,
  updateTask,
  updateTaskList,
} from '@/store/features/tasks/tasksSlice';

const SMART_VIEWS = [
  { id: 'all', label: 'My tasks', icon: ListTodo },
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'upcoming', label: 'Upcoming', icon: Clock3 },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'completed', label: 'Completed', icon: CheckCircle2 },
];

const LIST_COLORS = ['#72dfa1', '#78c9d1', '#f0ad7e', '#d6bdf0', '#f2d675', '#8bb5ff'];

const EMPTY_FORM = {
  title: '',
  notes: '',
  listId: '',
  dueDate: '',
  dueTime: '',
  priority: 'normal',
  repeat: 'none',
  starred: false,
  subtasks: [],
};

function todayValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60 * 1000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function dueLabel(dateValue) {
  if (!dateValue) return '';
  const today = todayValue();
  if (dateValue === today) return 'Today';
  if (dateValue === addDays(today, 1)) return 'Tomorrow';

  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(new Date(`${dateValue}T12:00:00`));
}

function repeatLabel(value) {
  return {
    daily: 'Daily',
    weekdays: 'Weekdays',
    weekly: 'Weekly',
    monthly: 'Monthly',
  }[value] || '';
}

function TaskListSkeleton() {
  return (
    <ul className="bk-task-items bk-task-items-skeleton" aria-label="Loading tasks">
      {[0, 1, 2].map((item) => <li className="bk-task-item" key={item}><span /><span /><div><i /><i /></div></li>)}
    </ul>
  );
}

export default function TaskWorkspace() {
  const dispatch = useAppDispatch();
  const { success: notifySuccess, error: notifyError } = useNotification();
  const { tasks, lists, status, lastFetchedAt } = useAppSelector((state) => state.tasks);
  const [view, setView] = useState('all');
  const [activeListId, setActiveListId] = useState('all');
  const [search, setSearch] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [isQuickSaving, setIsQuickSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState('');
  const [taskForm, setTaskForm] = useState(EMPTY_FORM);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [confirmDeleteTask, setConfirmDeleteTask] = useState(false);
  const [isListEditorOpen, setIsListEditorOpen] = useState(false);
  const [editingListId, setEditingListId] = useState('');
  const [listName, setListName] = useState('');
  const [listColor, setListColor] = useState(LIST_COLORS[0]);
  const [confirmDeleteList, setConfirmDeleteList] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState('');
  const isInitialLoading = !lastFetchedAt && (status === 'idle' || status === 'loading');
  const isRefreshing = Boolean(lastFetchedAt && status === 'loading');

  useEffect(() => {
    if (!isTaskWorkspaceStale({ status, lastFetchedAt })) return;
    void dispatch(fetchTaskWorkspace()).unwrap().catch((loadError) => {
      notifyError(loadError instanceof Error ? loadError.message : 'Tasks could not be loaded.');
    });
  }, [dispatch, lastFetchedAt, notifyError, status]);

  useEffect(() => {
    if (!isEditorOpen && !isListEditorOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || isSaving) return;
      setIsEditorOpen(false);
      setIsListEditorOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isEditorOpen, isListEditorOpen, isSaving]);

  const listMap = useMemo(() => new Map(lists.map((list) => [list.id, list])), [lists]);
  const today = todayValue();

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks
      .filter((task) => activeListId === 'all' || task.listId === activeListId)
      .filter((task) => {
        if (view === 'completed') return task.completed;
        if (task.completed) return false;
        if (view === 'today') return task.dueDate === today;
        if (view === 'upcoming') return Boolean(task.dueDate && task.dueDate > today);
        if (view === 'starred') return task.starred;
        return true;
      })
      .filter((task) => {
        if (!query) return true;
        return [task.title, task.notes, ...task.subtasks.map((subtask) => subtask.title)]
          .some((value) => value?.toLowerCase().includes(query));
      })
      .sort((first, second) => first.order - second.order);
  }, [activeListId, search, tasks, today, view]);

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const todayCount = tasks.filter((task) => !task.completed && task.dueDate === today).length;
  const completedCount = tasks.filter((task) => task.completed).length;
  const completionPercent = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const selectedView = SMART_VIEWS.find((item) => item.id === view) || SMART_VIEWS[0];
  const activeList = listMap.get(activeListId);

  const defaultListId = () => (activeListId !== 'all' ? activeListId : lists[0]?.id || '');

  const openNewTask = () => {
    setEditingTaskId('');
    setConfirmDeleteTask(false);
    setSubtaskTitle('');
    setTaskForm({
      ...EMPTY_FORM,
      listId: defaultListId(),
      dueDate: view === 'today' ? today : '',
      starred: view === 'starred',
    });
    setIsEditorOpen(true);
  };

  const openTask = (task) => {
    setEditingTaskId(task.id);
    setConfirmDeleteTask(false);
    setSubtaskTitle('');
    setTaskForm({
      title: task.title,
      notes: task.notes,
      listId: task.listId,
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      priority: task.priority,
      repeat: task.repeat,
      starred: task.starred,
      subtasks: task.subtasks,
    });
    setIsEditorOpen(true);
  };

  const createQuickTask = async (event) => {
    event.preventDefault();
    const title = quickTitle.trim();
    const listId = defaultListId();
    if (!title || !listId || isQuickSaving) return;

    setIsQuickSaving(true);

    try {
      await dispatch(createTask({ title, listId, dueDate: view === 'today' ? today : null, starred: view === 'starred' })).unwrap();
      setQuickTitle('');
      notifySuccess('Task added to your list.');
    } catch (saveError) {
      notifyError(saveError instanceof Error ? saveError.message : 'Task could not be created.');
    } finally {
      setIsQuickSaving(false);
    }
  };

  const saveTask = async (event) => {
    event.preventDefault();
    if (!taskForm.title.trim() || !taskForm.listId || isSaving) return;

    setIsSaving(true);

    try {
      const updates = {
        ...taskForm,
        dueDate: taskForm.dueDate || null,
        dueTime: taskForm.dueTime || null,
      };

      if (editingTaskId) {
        await dispatch(updateTask({ id: editingTaskId, updates })).unwrap();
      } else {
        await dispatch(createTask(updates)).unwrap();
      }
      setIsEditorOpen(false);
      notifySuccess(editingTaskId ? 'Task updated.' : 'Task created.');
    } catch (saveError) {
      notifyError(saveError instanceof Error ? saveError.message : 'Task could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const patchTask = async (task, updates) => {
    const previousTasks = tasks;
    setBusyTaskId(task.id);
    dispatch(optimisticallyUpdateTask({ id: task.id, updates }));

    try {
      await dispatch(updateTask({ id: task.id, updates })).unwrap();
      if (Object.prototype.hasOwnProperty.call(updates, 'completed')) {
        notifySuccess(updates.completed ? 'Task completed.' : 'Task reopened.');
      } else if (Object.prototype.hasOwnProperty.call(updates, 'starred')) {
        notifySuccess(updates.starred ? 'Task added to Starred.' : 'Task removed from Starred.');
      } else if (Object.prototype.hasOwnProperty.call(updates, 'subtasks')) {
        notifySuccess('Subtask updated.');
      } else {
        notifySuccess('Task updated.');
      }
    } catch (updateError) {
      dispatch(replaceTasks(previousTasks));
      notifyError(updateError instanceof Error ? updateError.message : 'Task could not be updated.');
    } finally {
      setBusyTaskId('');
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTaskId || isSaving) return;
    if (!confirmDeleteTask) {
      setConfirmDeleteTask(true);
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(deleteTask(editingTaskId)).unwrap();
      setIsEditorOpen(false);
      notifySuccess('Task deleted.');
    } catch (deleteError) {
      notifyError(deleteError instanceof Error ? deleteError.message : 'Task could not be deleted.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSubtask = () => {
    const title = subtaskTitle.trim();
    if (!title) return;
    setTaskForm((current) => ({
      ...current,
      subtasks: [...current.subtasks, { id: crypto.randomUUID(), title, completed: false }],
    }));
    setSubtaskTitle('');
  };

  const toggleSubtask = (task, subtaskId) => {
    const subtasks = task.subtasks.map((subtask) => (
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    ));
    void patchTask(task, { subtasks });
  };

  const openListEditor = (list) => {
    setEditingListId(list?.id || '');
    setListName(list?.name || '');
    setListColor(list?.color || LIST_COLORS[0]);
    setConfirmDeleteList(false);
    setIsListEditorOpen(true);
  };

  const saveList = async (event) => {
    event.preventDefault();
    if (!listName.trim() || isSaving) return;

    setIsSaving(true);

    try {
      const updates = { name: listName, color: listColor };
      const savedList = editingListId
        ? await dispatch(updateTaskList({ id: editingListId, updates })).unwrap()
        : await dispatch(createTaskList(updates)).unwrap();
      if (!editingListId) setActiveListId(savedList.id);
      setIsListEditorOpen(false);
      notifySuccess(editingListId ? 'Task list updated.' : 'Task list created.');
    } catch (saveError) {
      notifyError(saveError instanceof Error ? saveError.message : 'Task list could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteList = async () => {
    if (!editingListId || isSaving) return;
    if (!confirmDeleteList) {
      setConfirmDeleteList(true);
      return;
    }

    setIsSaving(true);
    try {
      const data = await dispatch(deleteTaskList(editingListId)).unwrap();
      if (activeListId === editingListId) setActiveListId(data.fallbackListId);
      setIsListEditorOpen(false);
      notifySuccess('Task list deleted. Its tasks were kept safe.');
    } catch (deleteError) {
      notifyError(deleteError instanceof Error ? deleteError.message : 'Task list could not be deleted.');
    } finally {
      setIsSaving(false);
    }
  };

  const reorderTasks = async (targetId) => {
    if (!draggedTaskId || draggedTaskId === targetId) return;
    const reordered = [...visibleTasks];
    const fromIndex = reordered.findIndex((task) => task.id === draggedTaskId);
    const targetIndex = reordered.findIndex((task) => task.id === targetId);
    if (fromIndex < 0 || targetIndex < 0) return;

    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const orderMap = new Map(reordered.map((task, index) => [task.id, (index + 1) * 1000]));
    const previousTasks = tasks;
    const orderedTasks = reordered.map((task, index) => ({ id: task.id, order: (index + 1) * 1000 }));
    dispatch(replaceTasks(tasks.map((task) => (
      orderMap.has(task.id) ? { ...task, order: orderMap.get(task.id) } : task
    ))));
    setDraggedTaskId('');

    try {
      await dispatch(persistTaskOrder(orderedTasks)).unwrap();
      notifySuccess('Task order saved.');
    } catch (reorderError) {
      dispatch(replaceTasks(previousTasks));
      notifyError(reorderError instanceof Error ? reorderError.message : 'Task order could not be saved.');
    }
  };

  return (
    <section className="bk-task-app" aria-label="Task manager">
      <div className="bk-task-layout">
        <aside className="bk-task-rail" aria-label="Task filters and lists">
          <p className="bk-task-rail-label">Overview</p>
          <nav className="bk-task-smart-views">
            {SMART_VIEWS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>
                <Icon size={16} />
                <span>{label}</span>
                {id === 'today' && todayCount > 0 && <em>{todayCount}</em>}
              </button>
            ))}
          </nav>

          <div className="bk-task-lists-head">
            <p className="bk-task-rail-label">Lists</p>
            <button type="button" aria-label="Create task list" onClick={() => openListEditor(null)}><FolderPlus size={16} /></button>
          </div>
          <div className="bk-task-custom-lists">
            <button type="button" className={activeListId === 'all' ? 'is-active' : ''} onClick={() => setActiveListId('all')}>
              <span className="bk-task-list-dot is-all" />All lists
              <em>{tasks.length}</em>
            </button>
            {lists.map((list) => (
              <div className="bk-task-list-row" key={list.id}>
                <button type="button" className={activeListId === list.id ? 'is-active' : ''} onClick={() => setActiveListId(list.id)}>
                  <span className="bk-task-list-dot" style={{ background: list.color }} />
                  <span>{list.name}</span>
                  <em>{tasks.filter((task) => task.listId === list.id && !task.completed).length}</em>
                </button>
                <button className="bk-task-list-edit" type="button" aria-label={`Edit ${list.name}`} onClick={() => openListEditor(list)}><Edit3 size={13} /></button>
              </div>
            ))}
          </div>

          <div className="bk-task-progress">
            <div><span>Overall progress</span><strong>{completionPercent}%</strong></div>
            <span><i style={{ width: `${completionPercent}%` }} /></span>
            <small>{completedCount} completed · {pendingCount} open</small>
          </div>
        </aside>

        <div className="bk-task-main">
          <header className="bk-task-main-head">
            <div>
              <p>{activeList ? activeList.name : 'All lists'}</p>
              <h2>{selectedView.label}</h2>
            </div>
            <button className="bk-task-new-button" type="button" aria-label="New task" onClick={openNewTask} disabled={!lists.length}>
              <Plus size={18} /> <span>New task</span>
            </button>
          </header>

          <div className="bk-task-tools">
            <label className="bk-task-search">
              <Search size={15} />
              <span className="sr-only">Search tasks</span>
              <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks…" />
            </label>
            <span>{isRefreshing ? 'Refreshing…' : `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'}`}</span>
          </div>

          <form className="bk-task-quick-add" onSubmit={createQuickTask}>
            <Plus size={18} />
            <input value={quickTitle} onChange={(event) => setQuickTitle(event.target.value)} placeholder="Add a task and press Enter" disabled={!lists.length || isQuickSaving} />
            {isQuickSaving && <LoaderCircle size={16} className="bk-spin" />}
          </form>

          {isInitialLoading ? (
            <TaskListSkeleton />
          ) : visibleTasks.length === 0 ? (
            <div className="bk-task-state">
              <span className="bk-task-state-icon"><CheckCircle2 size={25} /></span>
              <strong>{search ? 'No matching tasks' : 'You are clear here'}</strong>
              <p>{search ? 'Try a different search phrase.' : 'Add a task when something deserves your attention.'}</p>
            </div>
          ) : (
            <ul className="bk-task-items">
              {visibleTasks.map((task) => {
                const list = listMap.get(task.listId);
                const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length;
                const overdue = !task.completed && task.dueDate && task.dueDate < today;

                return (
                  <li
                    className={`bk-task-item${task.completed ? ' is-completed' : ''}${draggedTaskId === task.id ? ' is-dragging' : ''}`}
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTaskId(task.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => void reorderTasks(task.id)}
                    onDragEnd={() => setDraggedTaskId('')}
                  >
                    <span className="bk-task-drag" aria-hidden="true"><GripVertical size={16} /></span>
                    <button className="bk-task-check" type="button" aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => void patchTask(task, { completed: !task.completed })} disabled={busyTaskId === task.id}>
                      {task.completed && <Check size={15} />}
                    </button>
                    <div className="bk-task-item-content">
                      <button className="bk-task-item-title" type="button" onClick={() => openTask(task)}>{task.title}</button>
                      {task.notes && <p>{task.notes}</p>}
                      <div className="bk-task-meta">
                        {list && <span><i style={{ background: list.color }} />{list.name}</span>}
                        {task.dueDate && <span className={overdue ? 'is-overdue' : ''}><CalendarDays size={12} />{overdue ? 'Overdue · ' : ''}{dueLabel(task.dueDate)}{task.dueTime ? ` · ${task.dueTime}` : ''}</span>}
                        {task.priority !== 'normal' && <span className={`is-priority-${task.priority}`}><Flag size={12} />{task.priority}</span>}
                        {task.repeat !== 'none' && <span><Repeat2 size={12} />{repeatLabel(task.repeat)}</span>}
                        {task.subtasks.length > 0 && <span>{completedSubtasks}/{task.subtasks.length} subtasks</span>}
                      </div>

                      {task.subtasks.length > 0 && (
                        <div className="bk-task-subtasks">
                          {task.subtasks.map((subtask) => (
                            <button type="button" key={subtask.id} className={subtask.completed ? 'is-completed' : ''} onClick={() => toggleSubtask(task, subtask.id)}>
                              <span>{subtask.completed && <Check size={10} />}</span>{subtask.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className={`bk-task-star${task.starred ? ' is-active' : ''}`} type="button" aria-label={task.starred ? `Unstar ${task.title}` : `Star ${task.title}`} onClick={() => void patchTask(task, { starred: !task.starred })}>
                      <Star size={17} fill={task.starred ? 'currentColor' : 'none'} />
                    </button>
                    <button className="bk-task-edit" type="button" aria-label={`Edit ${task.title}`} onClick={() => openTask(task)}><Edit3 size={15} /></button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {isEditorOpen && (
        <div className="bk-task-modal-layer" role="presentation" onMouseDown={() => !isSaving && setIsEditorOpen(false)}>
          <form className="bk-task-editor" onSubmit={saveTask} role="dialog" aria-modal="true" aria-labelledby="task-editor-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="bk-task-editor-head">
              <div>
                <p>{editingTaskId ? 'Task details' : 'New task'}</p>
                <h2 id="task-editor-title">{editingTaskId ? 'Refine your task' : 'Capture what matters'}</h2>
              </div>
              <button type="button" aria-label="Close task editor" onClick={() => setIsEditorOpen(false)} disabled={isSaving}><X size={19} /></button>
            </div>

            <label className="bk-task-field bk-task-title-field">
              <span>Title</span>
              <input autoFocus value={taskForm.title} onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))} placeholder="What needs to be done?" maxLength={180} />
            </label>

            <label className="bk-task-field">
              <span>Notes</span>
              <textarea value={taskForm.notes} onChange={(event) => setTaskForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Add details, context, or a link…" rows={3} maxLength={3000} />
            </label>

            <div className="bk-task-form-grid">
              <label className="bk-task-field"><span>List</span><select value={taskForm.listId} onChange={(event) => setTaskForm((current) => ({ ...current, listId: event.target.value }))}>{lists.map((list) => <option value={list.id} key={list.id}>{list.name}</option>)}</select></label>
              <label className="bk-task-field"><span>Priority</span><select value={taskForm.priority} onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option></select></label>
              <label className="bk-task-field"><span>Due date</span><input type="date" value={taskForm.dueDate} onChange={(event) => setTaskForm((current) => ({ ...current, dueDate: event.target.value }))} /></label>
              <label className="bk-task-field"><span>Time</span><input type="time" value={taskForm.dueTime} onChange={(event) => setTaskForm((current) => ({ ...current, dueTime: event.target.value }))} /></label>
              <label className="bk-task-field"><span>Repeat</span><select value={taskForm.repeat} onChange={(event) => setTaskForm((current) => ({ ...current, repeat: event.target.value }))}><option value="none">Does not repeat</option><option value="daily">Daily</option><option value="weekdays">Weekdays</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
              <label className="bk-task-star-field"><input type="checkbox" checked={taskForm.starred} onChange={(event) => setTaskForm((current) => ({ ...current, starred: event.target.checked }))} /><Star size={16} fill={taskForm.starred ? 'currentColor' : 'none'} /><span>Mark important</span></label>
            </div>

            <div className="bk-task-subtask-editor">
              <div><span>Subtasks</span><small>{taskForm.subtasks.length}/30</small></div>
              {taskForm.subtasks.map((subtask) => (
                <div key={subtask.id}>
                  <button type="button" className={subtask.completed ? 'is-completed' : ''} onClick={() => setTaskForm((current) => ({ ...current, subtasks: current.subtasks.map((item) => item.id === subtask.id ? { ...item, completed: !item.completed } : item) }))}><Check size={11} /></button>
                  <input value={subtask.title} onChange={(event) => setTaskForm((current) => ({ ...current, subtasks: current.subtasks.map((item) => item.id === subtask.id ? { ...item, title: event.target.value } : item) }))} />
                  <button type="button" aria-label={`Remove ${subtask.title}`} onClick={() => setTaskForm((current) => ({ ...current, subtasks: current.subtasks.filter((item) => item.id !== subtask.id) }))}><X size={14} /></button>
                </div>
              ))}
              <div className="bk-task-add-subtask">
                <Plus size={15} />
                <input value={subtaskTitle} onChange={(event) => setSubtaskTitle(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addSubtask(); } }} placeholder="Add a subtask" />
                <button type="button" onClick={addSubtask} disabled={!subtaskTitle.trim()}>Add</button>
              </div>
            </div>

            <div className="bk-task-editor-actions">
              {editingTaskId && <button className={`bk-task-delete-button${confirmDeleteTask ? ' is-confirming' : ''}`} type="button" onClick={() => void handleDeleteTask()} disabled={isSaving}><Trash2 size={15} />{confirmDeleteTask ? 'Confirm delete' : 'Delete'}</button>}
              <button className="bk-task-cancel-button" type="button" onClick={() => setIsEditorOpen(false)} disabled={isSaving}>Cancel</button>
              <button className="bk-task-save-button" type="submit" disabled={!taskForm.title.trim() || !taskForm.listId || isSaving}>{isSaving && <LoaderCircle size={15} className="bk-spin" />}{editingTaskId ? 'Save changes' : 'Create task'}</button>
            </div>
          </form>
        </div>
      )}

      {isListEditorOpen && (
        <div className="bk-task-modal-layer" role="presentation" onMouseDown={() => !isSaving && setIsListEditorOpen(false)}>
          <form className="bk-task-list-editor" onSubmit={saveList} role="dialog" aria-modal="true" aria-labelledby="list-editor-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="bk-task-list-editor-close" type="button" aria-label="Close list editor" onClick={() => setIsListEditorOpen(false)}><X size={18} /></button>
            <p>{editingListId ? 'Edit list' : 'New list'}</p>
            <h2 id="list-editor-title">{editingListId ? 'Make this list yours' : 'Create a focused space'}</h2>
            <label className="bk-task-field"><span>List name</span><input autoFocus value={listName} onChange={(event) => setListName(event.target.value)} placeholder="e.g. Client work" maxLength={60} /></label>
            <div className="bk-task-color-picker" aria-label="List color">
              {LIST_COLORS.map((color) => <button key={color} type="button" className={listColor === color ? 'is-active' : ''} style={{ '--task-list-color': color }} onClick={() => setListColor(color)} aria-label={`Use ${color}`} />)}
            </div>
            <div className="bk-task-editor-actions">
              {editingListId && <button className={`bk-task-delete-button${confirmDeleteList ? ' is-confirming' : ''}`} type="button" onClick={() => void deleteList()} disabled={isSaving}><Trash2 size={15} />{confirmDeleteList ? 'Confirm delete' : 'Delete list'}</button>}
              <button className="bk-task-save-button" type="submit" disabled={!listName.trim() || isSaving}>{isSaving && <LoaderCircle size={15} className="bk-spin" />}{editingListId ? 'Save list' : 'Create list'}</button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
