export class ProjectValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const PROJECT_IMAGE_LIMIT = 10 * 1024 * 1024;
export const PROJECT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function text(value, label, maxLength, required = false) {
  if (value !== undefined && typeof value !== 'string') throw new ProjectValidationError(`${label} must be text.`);
  const result = (value || '').trim();
  if (required && !result) throw new ProjectValidationError(`${label} is required.`);
  if (result.length > maxLength) throw new ProjectValidationError(`${label} must be ${maxLength} characters or less.`);
  return result;
}

function link(value, label) {
  const result = text(value, label, 2048);
  if (!result) return '';
  try {
    const url = new URL(result);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.href;
  } catch {
    throw new ProjectValidationError(`${label} must be a full http:// or https:// URL.`);
  }
}

export function validateProject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ProjectValidationError('Provide the project details.');
  const title = text(body.title, 'Project title', 120, true);
  const description = text(body.description, 'Description', 4000, true);
  const date = text(body.date, 'Project date', 10);
  if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00Z`)) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date)) {
    throw new ProjectValidationError('Choose a valid project date.');
  }
  const categoryId = body.categoryId ?? null;
  if (categoryId !== null && (typeof categoryId !== 'string' || !/^[a-f\d]{24}$/i.test(categoryId))) throw new ProjectValidationError('Choose a valid category.');
  let skills = body.skills ?? [];
  if (typeof skills === 'string') skills = skills.split(',');
  if (!Array.isArray(skills)) throw new ProjectValidationError('Enter skills separated by commas.');
  skills = [...new Set(skills.map((skill) => text(skill, 'Each skill', 60)).filter(Boolean))];
  if (skills.length > 50) throw new ProjectValidationError('Use up to 50 skills for a project.');
  if (body.featured !== undefined && typeof body.featured !== 'boolean') throw new ProjectValidationError('Featured must be true or false.');
  if (body.removeImage !== undefined && typeof body.removeImage !== 'boolean') throw new ProjectValidationError('Remove image must be true or false.');
  return {
    title, description, date, categoryId, skills,
    liveUrl: link(body.liveUrl, 'Live project link'),
    codeUrl: link(body.codeUrl, 'Source code link'),
    featured: body.featured === true,
  };
}

export function validateProjectCategory(body) {
  const name = text(body?.name, 'Category name', 60, true);
  return { name, nameKey: name.normalize('NFKC').toLowerCase() };
}

export function validateProjectImage(file) {
  if (!PROJECT_IMAGE_TYPES.includes(file.type)) throw new ProjectValidationError('Choose a JPG, PNG, or WEBP image.');
  if (!file.size || file.size > PROJECT_IMAGE_LIMIT) throw new ProjectValidationError('The image must be smaller than 10 MB.');
}

export function formatProjectDate(date) {
  return date ? new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : '';
}
