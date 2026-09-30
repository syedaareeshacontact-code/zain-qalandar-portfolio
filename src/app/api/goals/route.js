import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CATEGORIES = new Set(['career', 'learning', 'personal', 'wellbeing']);
const PRIORITIES = new Set(['low', 'medium', 'high']);

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function validDate(value) {
  if (value === '' || value === null) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

function validProgress(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;
}

function serializeGoal(goal) {
  return {
    id: goal._id.toString(),
    title: goal.title,
    description: goal.description || '',
    category: goal.category,
    priority: goal.priority,
    targetDate: goal.targetDate || null,
    progress: goal.progress,
    createdAt: goal.createdAt,
    updatedAt: goal.updatedAt,
    completedAt: goal.completedAt || null,
  };
}

export async function GET() {
  try {
    const database = await getDatabase();
    const goals = await database.collection('goals').find({}).sort({ createdAt: -1, _id: -1 }).limit(500).toArray();
    return NextResponse.json({ data: goals.map(serializeGoal) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Goals GET error:', error);
    return jsonError('Goals could not be loaded.', 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > 140) return jsonError('Add a title up to 140 characters.');
    if (typeof body.description !== 'string' || body.description.length > 1000) return jsonError('Description must be 1000 characters or fewer.');
    if (!CATEGORIES.has(body.category)) return jsonError('Choose a valid category.');
    if (!PRIORITIES.has(body.priority)) return jsonError('Choose a valid priority.');
    const targetDate = validDate(body.targetDate);
    if (targetDate === undefined) return jsonError('Choose a valid target date.');
    if (!validProgress(body.progress)) return jsonError('Progress must be a whole number from 0 to 100.');

    const now = new Date();
    const goal = {
      title,
      description: body.description.trim(),
      category: body.category,
      priority: body.priority,
      targetDate,
      progress: body.progress,
      createdAt: now,
      updatedAt: now,
      completedAt: body.progress === 100 ? now : null,
    };
    const database = await getDatabase();
    const { insertedId } = await database.collection('goals').insertOne(goal);
    return NextResponse.json({ data: serializeGoal({ _id: insertedId, ...goal }) }, { status: 201 });
  } catch (error) {
    console.error('Goals POST error:', error);
    return jsonError('The goal could not be created.', 500);
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!ObjectId.isValid(body.id)) return jsonError('Invalid goal.');
    const updates = {};
    if ('title' in body) {
      if (typeof body.title !== 'string' || !body.title.trim() || body.title.trim().length > 140) return jsonError('Add a title up to 140 characters.');
      updates.title = body.title.trim();
    }
    if ('description' in body) {
      if (typeof body.description !== 'string' || body.description.length > 1000) return jsonError('Description must be 1000 characters or fewer.');
      updates.description = body.description.trim();
    }
    if ('category' in body) {
      if (!CATEGORIES.has(body.category)) return jsonError('Choose a valid category.');
      updates.category = body.category;
    }
    if ('priority' in body) {
      if (!PRIORITIES.has(body.priority)) return jsonError('Choose a valid priority.');
      updates.priority = body.priority;
    }
    if ('targetDate' in body) {
      const targetDate = validDate(body.targetDate);
      if (targetDate === undefined) return jsonError('Choose a valid target date.');
      updates.targetDate = targetDate;
    }
    if ('progress' in body) {
      if (!validProgress(body.progress)) return jsonError('Progress must be a whole number from 0 to 100.');
      updates.progress = body.progress;
    }
    if (Object.keys(updates).length === 0) return jsonError('No changes were provided.');

    const database = await getDatabase();
    const collection = database.collection('goals');
    const id = new ObjectId(body.id);
    const existing = await collection.findOne({ _id: id });
    if (!existing) return jsonError('Goal not found.', 404);

    const progress = updates.progress ?? existing.progress;
    if (progress === 100 && existing.progress !== 100) updates.completedAt = new Date();
    if (progress < 100 && existing.progress === 100) updates.completedAt = null;
    updates.updatedAt = new Date();
    await collection.updateOne({ _id: id }, { $set: updates });
    const updatedGoal = await collection.findOne({ _id: id });
    return NextResponse.json({ data: serializeGoal(updatedGoal) });
  } catch (error) {
    console.error('Goals PATCH error:', error);
    return jsonError('The goal could not be updated.', 500);
  }
}

export async function DELETE(request) {
  try {
    const idValue = new URL(request.url).searchParams.get('id');
    if (!ObjectId.isValid(idValue)) return jsonError('Invalid goal.');
    const database = await getDatabase();
    const result = await database.collection('goals').deleteOne({ _id: new ObjectId(idValue) });
    if (!result.deletedCount) return jsonError('Goal not found.', 404);
    return NextResponse.json({ data: { deletedId: idValue } });
  } catch (error) {
    console.error('Goals DELETE error:', error);
    return jsonError('The goal could not be deleted.', 500);
  }
}
