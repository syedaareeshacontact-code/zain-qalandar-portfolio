import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { getDefaultPortfolioWorkspace } from '@/data/portfolioProjects';

const globalForProjects = globalThis;

async function initialize(database) {
  const config = database.collection('portfolioProjectConfig');
  if (await config.findOne({ _id: 'initialized' })) return;
  const defaults = getDefaultPortfolioWorkspace();
  const createdAt = new Date();
  await database.collection('portfolioProjectCategories').createIndex({ nameKey: 1 }, { unique: true });
  await database.collection('portfolioProjectCategories').bulkWrite(defaults.categories.map(({ id, name }) => ({
    updateOne: { filter: { _id: new ObjectId(id) }, update: { $setOnInsert: { name, nameKey: name.toLowerCase(), createdAt } }, upsert: true },
  })));
  await database.collection('portfolioProjects').bulkWrite(defaults.projects.map(({ id, ...project }, order) => ({
    updateOne: { filter: { _id: new ObjectId(id) }, update: { $setOnInsert: { ...project, order, createdAt, updatedAt: createdAt } }, upsert: true },
  })));
  await config.updateOne({ _id: 'initialized' }, { $setOnInsert: { createdAt } }, { upsert: true });
}

export async function getProjectDatabase() {
  const database = await getDatabase();
  if (!globalForProjects.__portfolioProjectsInitialization) {
    globalForProjects.__portfolioProjectsInitialization = initialize(database).catch((error) => {
      globalForProjects.__portfolioProjectsInitialization = null;
      throw error;
    });
  }
  await globalForProjects.__portfolioProjectsInitialization;
  return database;
}

export function serializeProject(project) {
  return {
    id: project._id.toString(), title: project.title, description: project.description,
    categoryId: project.categoryId || null, skills: project.skills || [], date: project.date || '',
    imageUrl: project.imageUrl || '', liveUrl: project.liveUrl || '', codeUrl: project.codeUrl || '',
    featured: Boolean(project.featured), isDemo: Boolean(project.isDemo),
    eyebrow: project.eyebrow || '', highlights: project.highlights || [],
  };
}

export function serializeProjectCategory(category) {
  return { id: category._id.toString(), name: category.name };
}

export async function getPortfolioWorkspace() {
  const database = await getProjectDatabase();
  const [categories, projects] = await Promise.all([
    database.collection('portfolioProjectCategories').find().sort({ createdAt: 1, _id: 1 }).toArray(),
    database.collection('portfolioProjects').find().sort({ featured: -1, order: 1, createdAt: -1, _id: -1 }).toArray(),
  ]);
  return { categories: categories.map(serializeProjectCategory), projects: projects.map(serializeProject) };
}

export async function getPublicPortfolioWorkspace() {
  try {
    return await getPortfolioWorkspace();
  } catch (error) {
    console.error('Portfolio project lookup failed:', error.message);
    return getDefaultPortfolioWorkspace();
  }
}
