import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { ObjectId } from 'mongodb';
import * as goalHelpers from '../src/lib/goals.js';

const require = createRequire(import.meta.url);
const { NextResponse } = require('next/server');
const routeSource = await readFile(new URL('../src/app/api/goals/route.js', import.meta.url), 'utf8');
const original = { _id: new ObjectId('700000000000000000000001'), title: 'Important goal', description: '**Keep every detail.**', descriptionFormat: 'markdown', category: 'career', priority: 'high', targetDate: '2026-11-01', progress: 50, pinned: true, milestones: [{ id: 'a', title: 'First step', completed: true }, { id: 'b', title: 'Second step', completed: false }], createdAt: new Date('2026-10-01T00:00:00Z'), updatedAt: new Date('2026-10-01T00:00:00Z'), completedAt: null };
const copy = (value) => ({ ...value, milestones: value.milestones?.map((item) => ({ ...item })) });
const equal = (a, b) => a == null && b == null || String(a?.getTime?.() ?? a) === String(b?.getTime?.() ?? b);
const matches = (row, filter) => Object.entries(filter).every(([key, expected]) => expected && typeof expected === 'object' && Object.hasOwn(expected, '$ne') ? !equal(row[key], expected.$ne) : equal(row[key], expected));

async function fixture(seed = [original]) {
  const rows = seed.map(copy);
  const collection = {
    find: (filter) => { let limit = Infinity; const cursor = { sort: () => cursor, limit: (value) => { limit = value; return cursor; }, toArray: async () => rows.filter((row) => matches(row, filter)).slice(0, limit).map(copy) }; return cursor; },
    findOne: async (filter) => { const row = rows.find((item) => matches(item, filter)); return row ? copy(row) : null; },
    findOneAndUpdate: async (filter, update) => { const row = rows.find((item) => matches(item, filter)); if (!row) return null; Object.assign(row, update.$set); return copy(row); },
    insertOne: async (document) => { const row = { _id: new ObjectId(), ...document }; rows.push(row); return { insertedId: row._id }; },
    deleteOne: () => { throw new Error('Goals must never be permanently deleted.'); },
  };
  const modules = {
    mongodb: { ObjectId }, 'next/server': { NextResponse }, '@/lib/goals': goalHelpers,
    '@/lib/mongodb': { getDatabase: async () => ({ collection: () => collection }) },
  };
  const route = new vm.SourceTextModule(routeSource);
  await route.link((name) => {
    const exports = modules[name];
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); });
  });
  await route.evaluate();
  return { route: route.namespace, rows };
}
const request = (method, body, query = '') => new Request(`http://localhost/api/goals${query}`, { method, ...(body ? { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } } : {}) });
const data = async (response) => (await response.json()).data;

test('DELETE preserves the complete goal, hides it from the live list, and allows exact restore', async () => {
  const { route, rows } = await fixture();
  const removed = await route.DELETE(request('DELETE', null, `?id=${original._id}&expectedUpdatedAt=${original.updatedAt.toISOString()}`));
  assert.equal(removed.status, 200);
  assert.equal(rows.length, 1);
  assert.ok(rows[0].deletedAt);
  assert.equal(rows[0].description, original.description);
  assert.deepEqual(rows[0].milestones, original.milestones);
  assert.equal((await data(await route.GET(request('GET')))).length, 0);
  const trash = await data(await route.GET(request('GET', null, '?view=trash')));
  assert.equal(trash.length, 1);
  assert.equal((await route.PATCH(request('PATCH', { id: String(original._id), title: 'Overwrite trash' }))).status, 404);
  const restored = await data(await route.PATCH(request('PATCH', { id: String(original._id), action: 'restore', expectedUpdatedAt: trash[0].updatedAt })));
  assert.equal(restored.deletedAt, null);
  for (const key of ['description', 'descriptionFormat', 'priority', 'pinned', 'progress', 'targetDate']) assert.equal(restored[key], original[key]);
  assert.deepEqual(restored.milestones, original.milestones);
  assert.equal((await data(await route.GET(request('GET')))).length, 1);
});

test('pin updates persist across reads without changing milestones or progress', async () => {
  const { route, rows } = await fixture();
  assert.equal((await route.PATCH(request('PATCH', { id: String(original._id), pinned: false }))).status, 200);
  const saved = (await data(await route.GET(request('GET'))))[0];
  assert.equal(saved.pinned, false);
  assert.equal(saved.progress, 50);
  assert.deepEqual(rows[0].milestones, original.milestones);
});

test('stale edits and stale deletes return 409 and preserve the latest saved goal', async () => {
  const { route, rows } = await fixture();
  const id = String(original._id), expectedUpdatedAt = original.updatedAt.toISOString();
  assert.equal((await route.PATCH(request('PATCH', { id, title: 'Saved in another window', expectedUpdatedAt }))).status, 200);
  assert.equal((await route.PATCH(request('PATCH', { id, title: 'Old draft', expectedUpdatedAt }))).status, 409);
  assert.equal((await route.DELETE(request('DELETE', null, `?id=${id}&expectedUpdatedAt=${expectedUpdatedAt}`))).status, 409);
  assert.equal(rows[0].title, 'Saved in another window');
  assert.equal(rows[0].deletedAt, undefined);
});

test('checking every milestone completes a goal, and reopening clears the completion timestamp', async () => {
  const { route } = await fixture();
  const id = String(original._id);
  const completed = await data(await route.PATCH(request('PATCH', { id, milestones: original.milestones.map((item) => ({ ...item, completed: true })), progress: 0 })));
  assert.equal(completed.progress, 100);
  assert.ok(completed.completedAt);
  const reopened = await data(await route.PATCH(request('PATCH', { id, milestones: original.milestones })));
  assert.equal(reopened.progress, 50);
  assert.equal(reopened.completedAt, null);
  assert.equal((await route.PATCH(request('PATCH', { id, progress: 100 }))).status, 400);
});

test('new formatted goals round-trip with pins and milestone progress', async () => {
  const { route } = await fixture([]);
  const response = await route.POST(request('POST', { title: 'New goal', description: '## Plan\n\n**Launch** with care.', descriptionFormat: 'markdown', category: 'career', priority: 'low', targetDate: '', progress: 0, pinned: true, milestones: original.milestones }));
  assert.equal(response.status, 201);
  const saved = await data(response);
  assert.equal(saved.progress, 50);
  assert.equal(saved.pinned, true);
  assert.equal(saved.descriptionFormat, 'markdown');
  assert.deepEqual((await data(await route.GET(request('GET', null, '?view=workspace'))))[0], saved);
});

test('invalid payloads cannot mutate identity, Trash state, or progress', async () => {
  const { route, rows } = await fixture();
  for (const fields of [{ pinned: 'true' }, { milestones: null }, { milestones: [{ id: { $gt: '' }, title: 'bad', completed: false }] }, { deletedAt: 'forged' }]) assert.equal((await route.PATCH(request('PATCH', { id: String(original._id), ...fields }))).status, 400);
  assert.equal((await route.DELETE(request('DELETE', null, '?id=invalid'))).status, 400);
  assert.equal((await route.PATCH(new Request('http://localhost/api/goals', { method: 'PATCH', body: 'not-json' }))).status, 400);
  assert.equal(rows[0].pinned, original.pinned);
  assert.deepEqual(rows[0].milestones, original.milestones);
  assert.equal(rows[0]._id.toString(), original._id.toString());
});
