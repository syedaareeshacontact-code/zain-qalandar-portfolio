import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LISTS = [
  { name: 'My Tasks', color: '#72dfa1', order: 1000 },
  { name: 'Deep Work', color: '#78c9d1', order: 2000 },
  { name: 'Personal', color: '#f0ad7e', order: 3000 },
];

const ALLOWED_COLORS = new Set(['#72dfa1', '#78c9d1', '#f0ad7e', '#d6bdf0', '#f2d675', '#8bb5ff']);

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function serializeList(list) {
  return {
    id: list._id.toString(),
    name: list.name,
    color: list.color,
    order: list.order,
    createdAt: list.createdAt,
  };
}

async function ensureDefaultLists(database) {
  const collection = database.collection('taskLists');
  const count = await collection.countDocuments();

  if (count === 0) {
    const now = new Date();
    await collection.insertMany(DEFAULT_LISTS.map((list) => ({ ...list, createdAt: now, updatedAt: now })));
  }
}

export async function GET() {
  try {
    const database = await getDatabase();
    await ensureDefaultLists(database);
    const lists = await database.collection('taskLists').find({}).sort({ order: 1, createdAt: 1 }).toArray();
    return NextResponse.json({ data: lists.map(serializeList) });
  } catch (error) {
    console.error('Task list GET error:', error);
    return jsonError('Task lists could not be loaded.', 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 60) : '';

    if (!name) return jsonError('List name is required.');

    const database = await getDatabase();
    await ensureDefaultLists(database);
    const now = new Date();
    const taskList = {
      name,
      color: ALLOWED_COLORS.has(body.color) ? body.color : '#72dfa1',
      order: Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await database.collection('taskLists').insertOne(taskList);

    return NextResponse.json({ data: serializeList({ _id: insertedId, ...taskList }) }, { status: 201 });
  } catch (error) {
    console.error('Task list POST error:', error);
    return jsonError('The task list could not be created.', 500);
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!ObjectId.isValid(body.id)) return jsonError('Invalid task list.');

    const updates = { updatedAt: new Date() };
    if (typeof body.name === 'string') {
      const name = body.name.trim().slice(0, 60);
      if (!name) return jsonError('List name is required.');
      updates.name = name;
    }
    if (ALLOWED_COLORS.has(body.color)) updates.color = body.color;

    const database = await getDatabase();
    const id = new ObjectId(body.id);
    const result = await database.collection('taskLists').updateOne({ _id: id }, { $set: updates });
    if (!result.matchedCount) return jsonError('Task list not found.', 404);

    const updatedList = await database.collection('taskLists').findOne({ _id: id });
    return NextResponse.json({ data: serializeList(updatedList) });
  } catch (error) {
    console.error('Task list PATCH error:', error);
    return jsonError('The task list could not be updated.', 500);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const idValue = searchParams.get('id');
    if (!ObjectId.isValid(idValue)) return jsonError('Invalid task list.');

    const database = await getDatabase();
    const collection = database.collection('taskLists');
    const count = await collection.countDocuments();
    if (count <= 1) return jsonError('Keep at least one task list.');

    const id = new ObjectId(idValue);
    const fallback = await collection.findOne({ _id: { $ne: id } }, { sort: { order: 1 } });
    if (!fallback) return jsonError('A fallback task list was not found.', 409);

    const result = await collection.deleteOne({ _id: id });
    if (!result.deletedCount) return jsonError('Task list not found.', 404);

    await database.collection('tasks').updateMany(
      { listId: idValue },
      { $set: { listId: fallback._id.toString(), updatedAt: new Date() } },
    );

    return NextResponse.json({ data: { deletedId: idValue, fallbackListId: fallback._id.toString() } });
  } catch (error) {
    console.error('Task list DELETE error:', error);
    return jsonError('The task list could not be deleted.', 500);
  }
}
