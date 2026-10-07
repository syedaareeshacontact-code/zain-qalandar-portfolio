'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarDays, Check, FolderKanban, Github, Layers, LoaderCircle, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { apiRequest } from '@/store/apiClient';
import { formatProjectDate } from '@/lib/projectValidation';
import ProjectImage from '@/components/ui/ProjectImage';
import ProjectDialog from './ProjectDialog';
import ProjectEditor from './ProjectEditor';
import ProjectCategories from './ProjectCategories';

const EMPTY_WORKSPACE = { categories: [], projects: [] };

export default function ProjectManager() {
  const [workspace, setWorkspace] = useState(EMPTY_WORKSPACE);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest('/api/projects', { cache: 'no-store', signal: controller.signal }).then((data) => { setWorkspace(data); setStatus('ready'); }).catch((err) => { if (err.name !== 'AbortError') { setError(err.message); setStatus('failed'); } });
    return () => controller.abort();
  }, []);

  async function reload() {
    setStatus('loading'); setError('');
    try { setWorkspace(await apiRequest('/api/projects', { cache: 'no-store' })); setStatus('ready'); }
    catch (err) { setError(err.message); setStatus('failed'); }
  }

  function projectSaved(project) {
    const wasEditing = Boolean(editor?.id);
    setWorkspace((current) => ({ ...current, projects: wasEditing ? current.projects.map((item) => item.id === project.id ? project : item) : [project, ...current.projects] }));
    setEditor(null); setNotice(wasEditing ? 'Project updated. Your homepage is up to date.' : 'Project added to your homepage.');
    setCategoryFilter('all'); setQuery('');
  }

  function categorySaved(category) {
    setWorkspace((current) => ({ ...current, categories: current.categories.some((item) => item.id === category.id) ? current.categories.map((item) => item.id === category.id ? category : item) : [...current.categories, category] }));
    setNotice('Category saved.');
  }

  async function remove() {
    setDeleting(true); setError('');
    try {
      const { kind, item } = confirmation;
      await apiRequest(`/api/${kind === 'project' ? 'projects' : 'project-categories'}?id=${item.id}`, { method: 'DELETE' });
      setWorkspace((current) => kind === 'project' ? { ...current, projects: current.projects.filter((project) => project.id !== item.id) } : { categories: current.categories.filter((category) => category.id !== item.id), projects: current.projects.map((project) => project.categoryId === item.id ? { ...project, categoryId: null } : project) });
      if (kind === 'category' && categoryFilter === item.id) setCategoryFilter('all');
      setNotice(kind === 'project' ? 'Project deleted from your portfolio.' : 'Category deleted. Its projects are now uncategorized.');
      setConfirmation(null);
    } catch (err) { setError(err.message); }
    finally { setDeleting(false); }
  }

  const { categories, projects } = workspace;
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const counts = new Map();
  for (const project of projects) counts.set(project.categoryId, (counts.get(project.categoryId) || 0) + 1);
  const visible = projects.filter((project) => (categoryFilter === 'all' || (project.categoryId || 'uncategorized') === categoryFilter) && `${project.title} ${project.description} ${project.skills.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));

  return <section id="portfolio-manager" className="pm-manager" aria-labelledby="pm-heading">
    <header className="pm-heading"><div><p className="bk-ahd-kicker"><FolderKanban size={15} />Public portfolio</p><h2 id="pm-heading">Your work, on display.</h2><p>Add your latest projects, organize them by stack, and make your portfolio yours.</p></div><Link href="/#projects" className="pm-preview-link" prefetch={false} target="_blank" rel="noopener noreferrer">View homepage<ArrowUpRight size={16} /></Link></header>
    <div className="pm-summary"><div><strong>{projects.length}</strong><span>Projects</span></div><div><strong>{categories.length}</strong><span>Categories</span></div><div><strong>{projects.filter((project) => project.featured).length}</strong><span>Featured</span></div><span className="pm-synced"><span />Homepage synced</span></div>
    <div className="pm-actions"><label className="pm-search"><Search size={16} /><span className="sr-only">Search projects</span><input type="search" placeholder="Search projects or skills…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><button className="pm-button pm-button-secondary" type="button" aria-expanded={showCategories} aria-controls="pm-category-panel" disabled={status !== 'ready'} onClick={() => setShowCategories((current) => !current)}><Layers size={16} />Categories</button><button className="pm-button" type="button" disabled={status !== 'ready'} onClick={() => { setEditor({}); setNotice(''); }}><Plus size={17} />Add project</button></div>
    {showCategories && <div id="pm-category-panel"><ProjectCategories categories={categories} projects={projects} onSaved={categorySaved} onDelete={(item) => { setError(''); setConfirmation({ kind: 'category', item }); }} disabled={status !== 'ready'} /></div>}
    {notice && <p className="pm-message pm-message-success" role="status"><Check size={15} />{notice}</p>}
    {error && !confirmation && <p className="pm-message pm-message-error" role="alert">{error}{status === 'failed' && <button className="pm-button pm-button-secondary" type="button" onClick={reload}>Try again</button>}</p>}
    <div className="pm-filters" role="group" aria-label="Filter managed projects by category"><button type="button" aria-pressed={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All projects <span>{projects.length}</span></button>{categories.map((category) => <button key={category.id} type="button" aria-pressed={categoryFilter === category.id} onClick={() => setCategoryFilter(category.id)}>{category.name}<span>{counts.get(category.id) || 0}</span></button>)}{counts.get(null) > 0 && <button type="button" aria-pressed={categoryFilter === 'uncategorized'} onClick={() => setCategoryFilter('uncategorized')}>Uncategorized<span>{counts.get(null)}</span></button>}</div>
    {status === 'loading' && <p className="pm-empty" role="status"><LoaderCircle className="pm-spin" size={22} />Loading your portfolio…</p>}
    {status === 'ready' && <><div className="pm-list-heading"><h3>{categoryFilter === 'all' ? 'Project library' : categoryNames.get(categoryFilter) || 'Uncategorized'}</h3><span>{visible.length} project{visible.length === 1 ? '' : 's'}</span></div><div className="pm-project-list">{visible.map((project) => <article className="pm-project" key={project.id}><div className="pm-project-cover"><ProjectImage src={project.imageUrl} alt={`${project.title} cover`} width={360} height={220} sizes="(max-width: 600px) 90vw, 140px" /></div><div className="pm-project-info"><div className="pm-project-meta"><span>{categoryNames.get(project.categoryId) || 'Uncategorized'}</span>{project.isDemo && <span className="pm-demo">Demo</span>}{project.featured && <span className="pm-featured"><Star size={11} />Featured</span>}{project.date && <time dateTime={project.date}><CalendarDays size={11} />{formatProjectDate(project.date)}</time>}</div><h4>{project.title}</h4><p>{project.description}</p><ul className="pm-skills" aria-label={`${project.title} skills`}>{project.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div><div className="pm-project-actions"><button type="button" className="pm-icon-button" aria-label={`Edit ${project.title}`} onClick={() => { setEditor(project); setNotice(''); }}><Pencil size={16} /></button><button type="button" className="pm-icon-button pm-danger-icon" aria-label={`Delete ${project.title}`} onClick={() => { setError(''); setConfirmation({ kind: 'project', item: project }); }}><Trash2 size={16} /></button>{project.liveUrl && <a className="pm-icon-button" href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} live project`}><ArrowUpRight size={16} /></a>}{project.codeUrl && <a className="pm-icon-button" href={project.codeUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.title} source code`}><Github size={16} /></a>}</div></article>)}</div>{!visible.length && <div className="pm-empty"><FolderKanban size={30} /><h3>{projects.length ? 'No projects found' : 'Your next project starts here'}</h3><p>{projects.length ? 'Try another category or search term.' : 'Add a project and it will appear on your homepage.'}</p>{!projects.length && <button className="pm-button" type="button" onClick={() => setEditor({})}><Plus size={16} />Add your first project</button>}</div>}</>}
    {editor && <ProjectEditor project={editor} categories={categories} onSaved={projectSaved} onClose={() => setEditor(null)} />}
    {confirmation && <ProjectDialog title={confirmation.kind === 'project' ? 'Delete this project?' : 'Delete this category?'} busy={deleting} onClose={() => { setConfirmation(null); setError(''); }}><p className="pm-delete-copy">{confirmation.kind === 'project' ? `“${confirmation.item.title}” will be removed from your homepage and project library.` : `“${confirmation.item.name}” will be removed. Its projects will stay in your portfolio under Uncategorized.`}</p>{error && <p className="pm-message pm-message-error" role="alert">{error}</p>}<footer className="pm-dialog-actions"><button className="pm-button pm-button-secondary" type="button" disabled={deleting} onClick={() => { setConfirmation(null); setError(''); }}>Cancel</button><button className="pm-button pm-button-danger" type="button" disabled={deleting} onClick={remove}>{deleting ? <LoaderCircle className="pm-spin" size={16} /> : <Trash2 size={16} />}{deleting ? 'Deleting…' : `Delete ${confirmation.kind}`}</button></footer></ProjectDialog>}
  </section>;
}
