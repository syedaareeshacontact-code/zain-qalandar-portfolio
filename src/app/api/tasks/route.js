import { randomUUID } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRIORITIES = new Set(['low', 'normal', 'high']);
const REPEAT_OPTIONS = new Set(['none', 'daily', 'weekdays', 'weekly', 'monthly']);

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function cleanDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function cleanTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null;
}

function cleanSubtasks(value) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 30).flatMap((subtask) => {
    const title = typeof subtask.title === 'string' ? subtask.title.trim().slice(0, 140) : '';
    if (!title) return [];
    return [{
      id: typeof subtask.id === 'string' && subtask.id ? subtask.id : randomUUID(),
      title,
      completed: Boolean(subtask.completed),
    }];
  });
}

function serializeTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    notes: task.notes || '',
    listId: task.listId,
    dueDate: task.dueDate || null,
    dueTime: task.dueTime || null,
    priority: task.priority || 'normal',
    repeat: task.repeat || 'none',
    starred: Boolean(task.starred),
    completed: Boolean(task.completed),
    subtasks: task.subtasks || [],
    order: task.order || 0,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt || null,
  };
}

function nextRepeatDate(dueDate, repeat) {
  if (!dueDate || repeat === 'none') return null;

  const date = new Date(`${dueDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;

  if (repeat === 'daily') date.setUTCDate(date.getUTCDate() + 1);
  if (repeat === 'weekly') date.setUTCDate(date.getUTCDate() + 7);
  if (repeat === 'monthly') date.setUTCMonth(date.getUTCMonth() + 1);
  if (repeat === 'weekdays') {
    do date.setUTCDate(date.getUTCDate() + 1);
    while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  }

  return date.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const database = await getDatabase();
    const tasks = await database.collection('tasks').find({}).sort({ completed: 1, order: 1, createdAt: -1 }).limit(500).toArray();
    return NextResponse.json({ data: tasks.map(serializeTask) });
  } catch (error) {
    console.error('Tasks GET error:', error);
    return jsonError('Tasks could not be loaded.', 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim().slice(0, 180) : '';
    if (!title) return jsonError('Task title is required.');
    if (!ObjectId.isValid(body.listId)) return jsonError('Choose a valid task list.');

    const now = new Date();
    const task = {
      title,
      notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 3000) : '',
      listId: body.listId,
      dueDate: cleanDate(body.dueDate),
      dueTime: cleanTime(body.dueTime),
      priority: PRIORITIES.has(body.priority) ? body.priority : 'normal',
      repeat: REPEAT_OPTIONS.has(body.repeat) ? body.repeat : 'none',
      starred: Boolean(body.starred),
      completed: false,
      subtasks: cleanSubtasks(body.subtasks),
      order: Number.isFinite(body.order) ? body.order : Date.now(),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    };

    const database = await getDatabase();
    const listExists = await database.collection('taskLists').findOne({ _id: new ObjectId(body.listId) });
    if (!listExists) return jsonError('Task list not found.', 404);

    const { insertedId } = await database.collection('tasks').insertOne(task);
    return NextResponse.json({ data: { task: serializeTask({ _id: insertedId, ...task }) } }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return jsonError('The task could not be created.', 500);
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!ObjectId.isValid(body.id)) return jsonError('Invalid task.');

    const database = await getDatabase();
    const collection = database.collection('tasks');
    const id = new ObjectId(body.id);
    const existing = await collection.findOne({ _id: id });
    if (!existing) return jsonError('Task not found.', 404);

    const updates = { updatedAt: new Date() };
    if (typeof body.title === 'string') {
      const title = body.title.trim().slice(0, 180);
      if (!title) return jsonError('Task title is required.');
      updates.title = title;
    }
    if (typeof body.notes === 'string') updates.notes = body.notes.trim().slice(0, 3000);
    if (typeof body.listId === 'string' && ObjectId.isValid(body.listId)) updates.listId = body.listId;
    if ('dueDate' in body) updates.dueDate = cleanDate(body.dueDate);
    if ('dueTime' in body) updates.dueTime = cleanTime(body.dueTime);
    if (PRIORITIES.has(body.priority)) updates.priority = body.priority;
    if (REPEAT_OPTIONS.has(body.repeat)) updates.repeat = body.repeat;
    if (typeof body.starred === 'boolean') updates.starred = body.starred;
    if (Array.isArray(body.subtasks)) updates.subtasks = cleanSubtasks(body.subtasks);
    if (Number.isFinite(body.order)) updates.order = body.order;
    if (typeof body.completed === 'boolean') {
      updates.completed = body.completed;
      updates.completedAt = body.completed ? new Date() : null;
    }

    await collection.updateOne({ _id: id }, { $set: updates });
    const updatedTask = await collection.findOne({ _id: id });
    let recurringTask = null;

    if (!existing.completed && updatedTask.completed && updatedTask.repeat !== 'none') {
      const dueDate = nextRepeatDate(updatedTask.dueDate, updatedTask.repeat);
      if (dueDate) {
        const now = new Date();
        const nextTask = {
          ...updatedTask,
          _id: new ObjectId(),
          dueDate,
          completed: false,
          completedAt: null,
          subtasks: (updatedTask.subtasks || []).map((subtask) => ({ ...subtask, id: randomUUID(), completed: false })),
          order: Date.now(),
          createdAt: now,
          updatedAt: now,
        };
        await collection.insertOne(nextTask);
        recurringTask = serializeTask(nextTask);
      }
    }

    return NextResponse.json({ data: { task: serializeTask(updatedTask), recurringTask } });
  } catch (error) {
    console.error('Tasks PATCH error:', error);
    return jsonError('The task could not be updated.', 500);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idValue = searchParams.get('id');
    if (!ObjectId.isValid(idValue)) return jsonError('Invalid task.');

    const database = await getDatabase();
    const result = await database.collection('tasks').deleteOne({ _id: new ObjectId(idValue) });
    if (!result.deletedCount) return jsonError('Task not found.', 404);

    return NextResponse.json({ data: { deletedId: idValue } });
  } catch (error) {
    console.error('Tasks DELETE error:', error);
    return jsonError('The task could not be deleted.', 500);
  }
}
