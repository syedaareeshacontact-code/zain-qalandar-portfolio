'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Github, ImagePlus, LoaderCircle, Star, X } from 'lucide-react';
import { apiRequest } from '@/store/apiClient';
import { validateProject, validateProjectImage } from '@/lib/projectValidation';
import ProjectImage from '@/components/ui/ProjectImage';
import ProjectDialog from './ProjectDialog';

export default function ProjectEditor({ project, categories, onSaved, onClose }) {
  const editing = Boolean(project?.id);
  const [form, setForm] = useState(() => ({
    title: project?.title || '', description: project?.description || '', categoryId: project?.categoryId || '',
    skills: project?.skills?.join(', ') || '', date: project?.date || '', liveUrl: project?.liveUrl || '',
    codeUrl: project?.codeUrl || '', featured: project?.featured || false, removeImage: false,
  }));
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!file) { setPreview(''); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  function selectImage(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    try {
      validateProjectImage(selected);
      setFile(selected);
      setForm((current) => ({ ...current, removeImage: false }));
      setError('');
    } catch (err) { setError(err.message); event.target.value = ''; }
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    try {
      const data = validateProject({ ...form, categoryId: form.categoryId || null });
      const payload = new FormData();
      payload.set('project', JSON.stringify({ ...data, removeImage: form.removeImage }));
      if (file) payload.set('image', file);
      setBusy(true);
      const saved = await apiRequest(`/api/projects${editing ? `?id=${project.id}` : ''}`, { method: editing ? 'PATCH' : 'POST', body: payload });
      onSaved(saved);
    } catch (err) { setError(err.message); setBusy(false); }
  }

  const imageSource = preview || (!form.removeImage ? project?.imageUrl : '');
  return <ProjectDialog title={editing ? 'Edit project' : 'Add a project'} busy={busy} onClose={onClose}>
    <form className="pm-editor" onSubmit={save}>
      <fieldset disabled={busy}>
        <div className="pm-image-editor"><div className="pm-image-preview"><ProjectImage src={imageSource} alt="Project image preview" width={640} height={360} sizes="(max-width: 600px) 80vw, 220px" /></div><div><strong>Project cover</strong><p>Add a screenshot or cover image. A default cover appears when no image is added.</p><label className="pm-button pm-button-secondary pm-upload-label" htmlFor="pm-project-image"><ImagePlus size={16} />{imageSource ? 'Change image' : 'Choose image'}</label><input ref={fileRef} id="pm-project-image" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectImage} />{imageSource && <button className="pm-remove-image" type="button" onClick={() => { setFile(null); setForm((current) => ({ ...current, removeImage: true })); if (fileRef.current) fileRef.current.value = ''; }}><X size={13} />Remove image</button>}<small>{file?.name || 'JPG, PNG, WEBP · Up to 10 MB'}</small></div></div>
        <label className="pm-field" htmlFor="pm-title">Project title <span>Required</span><input id="pm-title" name="title" value={form.title} onChange={change} maxLength={120} required placeholder="e.g. My MERN storefront" /></label>
        <label className="pm-field" htmlFor="pm-description">Description <span>Required</span><textarea id="pm-description" name="description" value={form.description} onChange={change} maxLength={4000} rows={4} required placeholder="What does it do, and what did you build?" /></label>
        <div className="pm-field-grid"><label className="pm-field" htmlFor="pm-category">Category<select id="pm-category" name="categoryId" value={form.categoryId} onChange={change}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="pm-field" htmlFor="pm-date">Project date<input id="pm-date" name="date" type="date" value={form.date} onChange={change} /></label></div>
        <label className="pm-field" htmlFor="pm-skills">Skills & technologies<input id="pm-skills" name="skills" value={form.skills} onChange={change} placeholder="React, Node.js, MongoDB, Tailwind CSS" /><small>Separate skills with commas.</small></label>
        <div className="pm-field-grid"><label className="pm-field" htmlFor="pm-live-url">Live project link<input id="pm-live-url" name="liveUrl" type="url" value={form.liveUrl} onChange={change} maxLength={2048} placeholder="https://your-project.com" /></label><label className="pm-field" htmlFor="pm-code-url"><span className="pm-field-name"><Github size={15} />Source code link</span><input id="pm-code-url" name="codeUrl" type="url" value={form.codeUrl} onChange={change} maxLength={2048} placeholder="https://github.com/you/project" /></label></div>
        <label className="pm-featured-toggle"><input type="checkbox" name="featured" checked={form.featured} onChange={change} /><Star size={17} /><span><strong>Feature this project</strong><small>Show it first with a larger card on the homepage.</small></span></label>
      </fieldset>
      {error && <p className="pm-message pm-message-error" role="alert">{error}</p>}
      <footer className="pm-dialog-actions"><button className="pm-button pm-button-secondary" type="button" disabled={busy} onClick={onClose}>Cancel</button><button className="pm-button" type="submit" disabled={busy}>{busy ? <LoaderCircle className="pm-spin" size={16} /> : <Check size={16} />}{busy ? 'Saving…' : editing ? 'Save changes' : 'Add project'}</button></footer>
    </form>
  </ProjectDialog>;
}
