'use client';

import { useRef, useState } from 'react';
import { Check, Layers, LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '@/store/apiClient';

export default function ProjectCategories({ categories, projects, onSaved, onDelete, disabled }) {
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const counts = new Map();
  for (const project of projects) counts.set(project.categoryId, (counts.get(project.categoryId) || 0) + 1);

  async function save(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const saved = await apiRequest(`/api/project-categories${editing ? `?id=${editing}` : ''}`, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      onSaved(saved);
      setName(''); setEditing(null);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <section className="pm-category-manager" aria-labelledby="pm-categories-heading"><div><p className="bk-ahd-kicker">Organize your work</p><h3 id="pm-categories-heading">Project categories</h3><p>Create a category for any stack. You can add as many categories and projects as you need.</p></div>
    <form className="pm-category-form" onSubmit={save}><label className="sr-only" htmlFor="pm-category-name">Category name</label><input ref={inputRef} id="pm-category-name" placeholder="e.g. MERN, Flutter, Laravel…" value={name} onChange={(event) => setName(event.target.value)} required maxLength={60} disabled={busy || disabled} /><button className="pm-button" disabled={busy || disabled} type="submit">{busy ? <LoaderCircle size={15} className="pm-spin" /> : editing ? <Check size={15} /> : <Plus size={15} />}{editing ? 'Save name' : 'Add category'}</button>{editing && <button className="pm-button pm-button-secondary" type="button" disabled={busy} onClick={() => { setEditing(null); setName(''); }}>Cancel</button>}</form>
    {error && <p className="pm-message pm-message-error" role="alert">{error}</p>}
    <div className="pm-category-list">{categories.map((category) => <div key={category.id}><Layers size={15} /><span>{category.name}<small>{counts.get(category.id) || 0} projects</small></span><button className="pm-icon-button" aria-label={`Rename ${category.name}`} disabled={busy || disabled} type="button" onClick={() => { setEditing(category.id); setName(category.name); setError(''); inputRef.current?.focus(); }}><Pencil size={14} /></button><button className="pm-icon-button pm-danger-icon" aria-label={`Delete category ${category.name}`} disabled={busy || disabled} type="button" onClick={() => onDelete(category)}><Trash2 size={14} /></button></div>)}</div>
  </section>;
}
