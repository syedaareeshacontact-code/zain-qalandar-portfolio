import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getProjectDatabase, serializeProjectCategory } from '@/lib/portfolioProjects';
import { ProjectValidationError, validateProjectCategory } from '@/lib/projectValidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failure(error) {
  if (error instanceof ProjectValidationError) return NextResponse.json({ message: error.message }, { status: error.status });
  if (error.code === 11000) return NextResponse.json({ message: 'A category with this name already exists.' }, { status: 409 });
  if (error instanceof SyntaxError) return NextResponse.json({ message: 'Provide a category name.' }, { status: 400 });
  console.error('Project category API failed:', error.message);
  return NextResponse.json({ message: 'Categories could not be saved. Please try again.' }, { status: 500 });
}

function categoryId(request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !/^[a-f\d]{24}$/i.test(id)) throw new ProjectValidationError('A valid category id is required.');
  return new ObjectId(id);
}

export async function POST(request) {
  try {
    const data = validateProjectCategory(await request.json());
    const database = await getProjectDatabase();
    const category = { ...data, createdAt: new Date() };
    const { insertedId } = await database.collection('portfolioProjectCategories').insertOne(category);
    revalidatePath('/');
    return NextResponse.json({ data: serializeProjectCategory({ ...category, _id: insertedId }) }, { status: 201 });
  } catch (error) { return failure(error); }
}

export async function PATCH(request) {
  try {
    const id = categoryId(request);
    const data = validateProjectCategory(await request.json());
    const database = await getProjectDatabase();
    const category = await database.collection('portfolioProjectCategories').findOneAndUpdate({ _id: id }, { $set: data }, { returnDocument: 'after' });
    if (!category) throw new ProjectValidationError('That category could not be found.', 404);
    revalidatePath('/');
    return NextResponse.json({ data: serializeProjectCategory(category) });
  } catch (error) { return failure(error); }
}

export async function DELETE(request) {
  try {
    const id = categoryId(request);
    const database = await getProjectDatabase();
    const category = await database.collection('portfolioProjectCategories').findOneAndDelete({ _id: id });
    if (!category) throw new ProjectValidationError('That category could not be found.', 404);
    await database.collection('portfolioProjects').updateMany({ categoryId: id.toString() }, { $set: { categoryId: null } });
    revalidatePath('/');
    return NextResponse.json({ data: { id: id.toString() } });
  } catch (error) { return failure(error); }
}
