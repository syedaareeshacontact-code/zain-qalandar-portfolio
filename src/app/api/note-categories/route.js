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
    const slug = slugify(label);

    if (!validText(label, 32) || !slug) return jsonError('Category name must be between 1 and 32 characters.');
    if (description.length > 52) return jsonError('Category description must be 52 characters or less.');
    if (!ICON_KEYS.has(icon)) return jsonError('Choose an icon for this category.');

    const database = await getDatabase();
    const collection = database.collection('noteCategories');
    const existing = await collection.findOne({ slug });
    if (existing) return jsonError('A category with this name already exists.', 409);

    const category = {
      slug,
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
    if (!Object.keys(updates).length) return jsonError('There is nothing to update.');

    const database = await getDatabase();
    const collection = database.collection('noteCategories');
    const category = await collection.findOne({ _id: new ObjectId(id) });
    if (!category) return jsonError('That category could not be found.', 404);

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

    const fallbackCategory = category.slug === 'other'
      ? null
      : await categories.findOne({ slug: 'other', _id: { $ne: category._id } });

    await database.collection('uploads').updateMany(
      { category: 'notes', documentCategory: category.slug },
      { $set: { documentCategory: fallbackCategory?.slug || '' } },
    );
    await database.collection('noteCategoryConfig').updateOne(
      { key: 'initialized' },
      { $setOnInsert: { key: 'initialized', createdAt: new Date() } },
      { upsert: true },
    );
    await categories.deleteOne({ _id: category._id });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error('Note category delete route error:', error);
    return jsonError('The category could not be deleted right now.', 500);
  }
}
