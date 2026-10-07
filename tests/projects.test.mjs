import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProject, validateProjectCategory, validateProjectImage, formatProjectDate, PROJECT_IMAGE_LIMIT } from '../src/lib/projectValidation.js';

const project = { title: '  Storefront  ', description: '  A full-stack store.  ', categoryId: '700000000000000000000001', skills: 'React, MongoDB, React, , Node.js', date: '2026-10-06', liveUrl: 'https://example.com', codeUrl: 'https://github.com/example/store', featured: true };

test('normalizes project fields, deduplicates skills, and accepts both public links', () => {
  const value = validateProject(project);
  assert.equal(value.title, 'Storefront');
  assert.equal(value.description, 'A full-stack store.');
  assert.deepEqual(value.skills, ['React', 'MongoDB', 'Node.js']);
  assert.equal(value.liveUrl, 'https://example.com/');
  assert.equal(value.codeUrl, project.codeUrl);
  assert.equal(value.featured, true);
});

test('supports projects without an image, links, skills, date, or category', () => {
  assert.deepEqual(validateProject({ title: 'Project', description: 'Description' }), { title: 'Project', description: 'Description', categoryId: null, skills: [], date: '', liveUrl: '', codeUrl: '', featured: false });
});

test('requires a title and description and rejects invalid field types', () => {
  for (const updates of [{ title: ' ' }, { description: '' }, { title: {} }, { skills: [123] }, { featured: 'true' }, { removeImage: 'false' }, { categoryId: false }, { categoryId: { $ne: null } }]) {
    assert.throws(() => validateProject({ ...project, ...updates }));
  }
});

test('rejects executable URLs, embedded credentials, and relative links', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'ftp://example.com', 'https://user:password@example.com']) {
    assert.throws(() => validateProject({ ...project, liveUrl: url }), /full http/);
    assert.throws(() => validateProject({ ...project, codeUrl: url }), /full http/);
  }
});

test('rejects impossible calendar dates, including non-leap-year February 29', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-2-05', 'invalid']) {
    assert.throws(() => validateProject({ ...project, date }), /valid project date/);
  }
  assert.equal(validateProject({ ...project, date: '2024-02-29' }).date, '2024-02-29');
});

test('does not allow clients to overwrite internal image, demo, or identity fields', () => {
  const value = validateProject({ ...project, _id: 'forged', isDemo: true, imageUrl: 'https://example.com/forged.png', imagePublicId: 'another-users-image', order: -999 });
  for (const field of ['_id', 'isDemo', 'imageUrl', 'imagePublicId', 'order']) assert.equal(field in value, false);
});

test('normalizes category names for case-insensitive uniqueness', () => {
  assert.deepEqual(validateProjectCategory({ name: '  MERN  ' }), { name: 'MERN', nameKey: 'mern' });
  assert.equal(validateProjectCategory({ name: 'ｍｅｒｎ' }).nameKey, 'mern');
  assert.throws(() => validateProjectCategory({ name: ' ' }));
  assert.throws(() => validateProjectCategory({ name: 'x'.repeat(61) }));
});

test('accepts supported images and rejects PDFs, SVGs, empty and oversized files', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) assert.doesNotThrow(() => validateProjectImage({ type, size: 1024 }));
  for (const file of [{ type: 'application/pdf', size: 1024 }, { type: 'image/svg+xml', size: 1024 }, { type: 'image/png', size: 0 }, { type: 'image/png', size: PROJECT_IMAGE_LIMIT + 1 }]) assert.throws(() => validateProjectImage(file));
});

test('formats project dates independently of browser or server timezone', () => {
  assert.equal(formatProjectDate('2026-10-01'), 'Oct 2026');
  assert.equal(formatProjectDate('2026-01-31'), 'Jan 2026');
  assert.equal(formatProjectDate(''), '');
});
