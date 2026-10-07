import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { getPortfolioWorkspace, getProjectDatabase, serializeProject } from '@/lib/portfolioProjects';
import { ProjectValidationError, validateProject, validateProjectImage } from '@/lib/projectValidation';
import { uploadProjectImage, deleteProjectImage } from '@/lib/projectImages';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function failure(error) {
  if (error instanceof ProjectValidationError) return NextResponse.json({ message: error.message }, { status: error.status });
  console.error('Portfolio project API failed:', error.message);
  return NextResponse.json({ message: 'Projects could not be saved or loaded. Please try again.' }, { status: 500 });
}

function projectId(request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !/^[a-f\d]{24}$/i.test(id)) throw new ProjectValidationError('A valid project id is required.');
  return new ObjectId(id);
}

async function readProject(request) {
  try {
    if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
      const form = await request.formData();
      const body = JSON.parse(form.get('project'));
      const file = form.get('image');
      if (file && !(file instanceof File)) throw new ProjectValidationError('Choose an image file.');
      if (file) validateProjectImage(file);
      return { data: validateProject(body), file, removeImage: body.removeImage === true };
    }
    const body = await request.json();
    return { data: validateProject(body), file: null, removeImage: body.removeImage === true };
  } catch (error) {
    if (error instanceof ProjectValidationError) throw error;
    throw new ProjectValidationError('The project form could not be read. Please try again.');
  }
}

async function saveProject(request, editing) {
  let uploaded;
  try {
    const id = editing ? projectId(request) : new ObjectId();
    const { data, file, removeImage } = await readProject(request);
    const database = await getProjectDatabase();
    const collection = database.collection('portfolioProjects');
    const previous = editing ? await collection.findOne({ _id: id }) : null;
    if (editing && !previous) throw new ProjectValidationError('That project could not be found.', 404);
    if (data.categoryId && !await database.collection('portfolioProjectCategories').findOne({ _id: new ObjectId(data.categoryId) })) {
      throw new ProjectValidationError('That category no longer exists. Choose another category.');
    }
    if (file) uploaded = await uploadProjectImage(file);
    const image = uploaded || (removeImage ? { imageUrl: '', imagePublicId: '' } : { imageUrl: previous?.imageUrl || '', imagePublicId: previous?.imagePublicId || '' });
    const changes = { ...data, ...image, updatedAt: new Date() };
    let project;
    if (editing) {
      project = await collection.findOneAndUpdate({ _id: id }, { $set: changes }, { returnDocument: 'after' });
      if (!project) throw new ProjectValidationError('That project could not be found.', 404);
    } else {
      project = { _id: id, ...changes, createdAt: new Date(), order: -Date.now(), isDemo: false, highlights: [], eyebrow: '' };
      await collection.insertOne(project);
    }
    // The image belongs to a saved project now; only roll it back before a successful database write.
    uploaded = null;
    if (previous?.imagePublicId && previous.imagePublicId !== image.imagePublicId) await deleteProjectImage(previous.imagePublicId);
    revalidatePath('/');
    return NextResponse.json({ data: serializeProject(project) }, { status: editing ? 200 : 201 });
  } catch (error) {
    if (uploaded) await deleteProjectImage(uploaded.imagePublicId);
    return failure(error);
  }
}

export async function GET() {
  try {
    return NextResponse.json({ data: await getPortfolioWorkspace() }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}

export async function POST(request) { return saveProject(request, false); }
export async function PATCH(request) { return saveProject(request, true); }

export async function DELETE(request) {
  try {
    const id = projectId(request);
    const database = await getProjectDatabase();
    const project = await database.collection('portfolioProjects').findOneAndDelete({ _id: id });
    if (!project) throw new ProjectValidationError('That project could not be found.', 404);
    await deleteProjectImage(project.imagePublicId);
    revalidatePath('/');
    return NextResponse.json({ data: { id: id.toString() } });
  } catch (error) { return failure(error); }
}
