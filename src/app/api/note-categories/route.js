import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { DEFAULT_NOTE_CATEGORIES, NOTE_ICON_KEYS, serializeNoteCategory } from '@/data/noteCategories';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ICON_KEYS = new Set(NOTE_ICON_KEYS);

function jsonError(message, status = 400) {
  return NextResponse.json({ message }, { status });
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40);
}

function validText(value, maxLength) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= maxLength;
}

async function ensureDefaults(collection, database) {
  const config = database.collection('noteCategoryConfig');
  const initialized = await config.findOne({ key: 'initialized' });
  const count = await collection.countDocuments();

  if (count === 0 && !initialized) {
    const createdAt = new Date();
    await collection.insertMany(DEFAULT_NOTE_CATEGORIES.map((category) => ({ ...category, createdAt })));
  }

  if (!initialized) await config.insertOne({ key: 'initialized', createdAt: new Date() });
  return collection.find().sort({ order: 1, createdAt: 1 }).toArray();
}

function uniqueCategories(categories) {
  return categories.filter((category, index, list) => list.findIndex((item) => item.slug === category.slug) === index);
}

export async function GET() {
  try {
    const database = await getDatabase();
    const categories = await ensureDefaults(database.collection('noteCategories'), database);
    return NextResponse.json({ data: uniqueCategories(categories).map(serializeNoteCategory) });
  } catch (error) {
    console.error('Note categories list route error:', error);
    return jsonError('Categories could not be loaded right now.', 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const label = typeof body.label === 'string' ? body.label.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const icon = typeof body.icon === 'string' ? body.icon : '';
    const requestedParentId = body.parentId ?? null;
    const baseSlug = slugify(label) || 'folder';

    if (!validText(label, 32)) return jsonError('Category name must be between 1 and 32 characters.');
    if (description.length > 52) return jsonError('Category description must be 52 characters or less.');
    if (!ICON_KEYS.has(icon)) return jsonError('Choose an icon for this category.');
    if (requestedParentId !== null && (typeof requestedParentId !== 'string' || !ObjectId.isValid(requestedParentId))) return jsonError('Choose a valid parent category.');
    const parentId = requestedParentId ? new ObjectId(requestedParentId).toString() : null;

    const database = await getDatabase();
    const collection = database.collection('noteCategories');
    if (parentId && !await collection.findOne({ _id: new ObjectId(parentId) })) return jsonError('The parent category could not be found.', 404);

    let slug = baseSlug;
    let suffix = 2;
    while (await collection.findOne({ slug })) {
      slug = `${baseSlug.slice(0, 40 - String(suffix).length - 1)}-${suffix}`;
      suffix += 1;
    }

    const category = {
      slug,
      parentId,
      label,
      description: description || 'Custom notes',
      icon,
      isDefault: false,
      order: Date.now(),
      createdAt: new Date(),
    };
    const { insertedId } = await collection.insertOne(category);
    return NextResponse.json({ data: serializeNoteCategory({ ...category, _id: insertedId }) }, { status: 201 });
  } catch (error) {
    console.error('Note category create route error:', error);
    return jsonError('The category could not be created right now.', 500);
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const id = searchParams.get('id') || body.id;
    if (!id || !ObjectId.isValid(id)) return jsonError('A valid category id is required.');

    const updates = {};
    if (body.label !== undefined) {
      if (!validText(body.label, 32)) return jsonError('Category name must be between 1 and 32 characters.');
      updates.label = body.label.trim();
    }
    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim().length > 52) return jsonError('Category description must be 52 characters or less.');
      updates.description = body.description.trim() || 'Custom notes';
    }
    if (body.icon !== undefined) {
      if (!ICON_KEYS.has(body.icon)) return jsonError('Choose an icon for this category.');
      updates.icon = body.icon;
    }
    if (body.parentId !== undefined) {
      if (body.parentId !== null && (typeof body.parentId !== 'string' || !ObjectId.isValid(body.parentId))) return jsonError('Choose a valid parent category.');
      updates.parentId = body.parentId ? new ObjectId(body.parentId).toString() : null;
    }
    if (!Object.keys(updates).length) return jsonError('There is nothing to update.');

    const database = await getDatabase();
    const collection = database.collection('noteCategories');
    const category = await collection.findOne({ _id: new ObjectId(id) });
    if (!category) return jsonError('That category could not be found.', 404);

    if (updates.parentId) {
      const visited = new Set([category._id.toString()]);
      let ancestorId = updates.parentId;
      while (ancestorId) {
        if (visited.has(ancestorId)) return jsonError('A folder cannot be moved inside itself or one of its subfolders.');
        visited.add(ancestorId);
        const ancestor = await collection.findOne({ _id: new ObjectId(ancestorId) }, { projection: { parentId: 1 } });
        if (!ancestor) return jsonError('The parent category could not be found.', 404);
        ancestorId = ancestor.parentId ? new ObjectId(ancestor.parentId).toString() : null;
      }
    }

    await collection.updateOne({ _id: category._id }, { $set: updates });
    return NextResponse.json({ data: serializeNoteCategory({ ...category, ...updates }) });
  } catch (error) {
    console.error('Note category update route error:', error);
    return jsonError('The category could not be updated right now.', 500);
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || !ObjectId.isValid(id)) return jsonError('A valid category id is required.');

    const database = await getDatabase();
    const categories = database.collection('noteCategories');
    const category = await categories.findOne({ _id: new ObjectId(id) });
    if (!category) return jsonError('That category could not be found.', 404);

    const parent = category.parentId
      ? await categories.findOne({ _id: new ObjectId(category.parentId) })
      : null;
    const fallbackCategory = parent || await categories.findOne({ slug: 'other', _id: { $ne: category._id } });

    await database.collection('uploads').updateMany(
      { category: 'notes', documentCategory: category.slug },
      { $set: { documentCategory: fallbackCategory?.slug || '' } },
    );
    await categories.updateMany(
      { parentId: category._id.toString() },
      { $set: { parentId: parent?._id.toString() || null } },
    );
    await database.collection('noteCategoryConfig').updateOne(
      { key: 'initialized' },
      { $setOnInsert: { key: 'initialized', createdAt: new Date() } },
      { upsert: true },
    );
    await categories.deleteOne({ _id: category._id });
    return NextResponse.json({ data: { id, parentId: parent?._id.toString() || null, fallbackCategory: fallbackCategory?.slug || '' } });
  } catch (error) {
    console.error('Note category delete route error:', error);
    return jsonError('The category could not be deleted right now.', 500);
  }
}
