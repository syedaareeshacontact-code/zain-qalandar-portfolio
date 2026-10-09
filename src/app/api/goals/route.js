import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { resolveGoalProgress, serializeGoal, validateGoalFields } from '@/lib/goals';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function validId(id) { return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id); }
function nextTimestamp(existing) {
  return new Date(Math.max(Date.now(), (new Date(existing.updatedAt).getTime() || 0) + 1));
}
function versionMatches(existing, expected) {
  return expected === undefined || (typeof expected === 'string' && !Number.isNaN(Date.parse(expected)) && new Date(existing.updatedAt).getTime() === Date.parse(expected));
}
const conflict = () => jsonError('This goal changed in another window. Refresh the goals and try again. Your draft has been kept.', 409);

export async function GET(request) {
  try {
    const view = request ? new URL(request.url).searchParams.get('view') : null;
    const database = await getDatabase();
    const collection = database.collection('goals');
    const active = () => collection.find({ deletedAt: null }).sort({ pinned: -1, createdAt: -1, _id: -1 }).limit(500).toArray();
    const trash = () => collection.find({ deletedAt: { $ne: null } }).sort({ deletedAt: -1, _id: -1 }).limit(500).toArray();
    const goals = view === 'workspace' ? (await Promise.all([active(), trash()])).flat() : view === 'trash' ? await trash() : await active();
    return NextResponse.json({ data: goals.map(serializeGoal) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Goals GET error:', error);
    return jsonError('Goals could not be loaded.', 500);
  }
}

export async function POST(request) {
  try {
    let fields;
    try { fields = validateGoalFields(await request.json()); }
    catch (error) { return jsonError(error.message); }
    const now = new Date();
    const progress = resolveGoalProgress(fields);
    const goal = { ...fields, progress, createdAt: now, updatedAt: now, completedAt: progress === 100 ? now : null, deletedAt: null };
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
    let body;
    try { body = await request.json(); } catch { return jsonError('Provide a valid goal.'); }
    if (!body || !validId(body.id)) return jsonError('Invalid goal.');
    const restoring = body.action === 'restore';
    if (body.action && !restoring) return jsonError('Choose a valid goal action.');
    let updates;
    try { updates = restoring ? { deletedAt: null } : validateGoalFields(body, true); }
    catch (error) { return jsonError(error.message); }
    const database = await getDatabase();
    const collection = database.collection('goals');
    const id = new ObjectId(body.id);
    const existing = await collection.findOne({ _id: id, deletedAt: restoring ? { $ne: null } : null });
    if (!existing) return jsonError(restoring ? 'This goal is not in Trash.' : 'Goal not found. Check Trash if it was removed.', 404);
    if (!versionMatches(existing, body.expectedUpdatedAt)) return conflict();
    const now = nextTimestamp(existing);
    if (!restoring) {
      let progress;
      try { progress = resolveGoalProgress(updates, existing); } catch (error) { return jsonError(error.message); }
      updates.progress = progress;
      if (progress === 100 && existing.progress !== 100) updates.completedAt = now;
      if (progress < 100 && existing.progress === 100) updates.completedAt = null;
    }
    updates.updatedAt = now;
    const saved = await collection.findOneAndUpdate({ _id: id, updatedAt: existing.updatedAt, deletedAt: existing.deletedAt || null }, { $set: updates }, { returnDocument: 'after' });
    if (!saved) return conflict();
    return NextResponse.json({ data: serializeGoal(saved) });
  } catch (error) {
    console.error('Goals PATCH error:', error);
    return jsonError('The goal could not be updated.', 500);
  }
}

export async function DELETE(request) {
  try {
    const params = new URL(request.url).searchParams;
    const idValue = params.get('id');
    if (!validId(idValue)) return jsonError('Invalid goal.');
    const database = await getDatabase();
    const collection = database.collection('goals');
    const id = new ObjectId(idValue);
    const existing = await collection.findOne({ _id: id, deletedAt: null });
    if (!existing) return jsonError('Goal not found.', 404);
    if (!versionMatches(existing, params.get('expectedUpdatedAt') ?? undefined)) return conflict();
    const now = nextTimestamp(existing);
    // Preserve the entire document so it remains recoverable from Trash.
    const saved = await collection.findOneAndUpdate({ _id: id, deletedAt: null, updatedAt: existing.updatedAt }, { $set: { deletedAt: now, updatedAt: now } }, { returnDocument: 'after' });
    if (!saved) return conflict();
    return NextResponse.json({ data: { ...serializeGoal(saved), deletedId: idValue } });
  } catch (error) {
    console.error('Goals DELETE error:', error);
    return jsonError('The goal could not be moved to Trash.', 500);
  }
}
