'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import {
  AlertTriangle, BookOpenText, Braces, Brackets, BriefcaseBusiness, Bug, CalendarDays,
  ChartNoAxesCombined, Check, CloudCog, Code2, Command, Component, Cpu, Database,
  ExternalLink, FileCheck2, FileCode2, FileText, Folder, FolderCode, Github, Globe2,
  Blocks, Boxes, BrainCircuit, Bot, GitBranch, GitMerge, Library, Lightbulb, Laptop2,
  LoaderCircle, LockKeyhole, MonitorCog, MoonStar, MoreHorizontal, Network, NotebookTabs,
  Package, PanelsTopLeft, PencilLine, Plus, Puzzle, RefreshCw, Rocket, Search, Server,
  Settings2, ShieldCheck, Terminal, TestTube2, Trash2, Upload, UserRound, Workflow,
  Wrench, X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useNotification } from '@/context/notification-context';
import { fetchCloudinaryUsage } from '@/store/features/cloudinaryUsage/cloudinaryUsageSlice';
import { deleteUpload, fetchUploads, getUploadScopeKey, isUploadScopeStale, updateUploadCategory, uploadPdf } from '@/store/features/uploads/uploadsSlice';
import { CloudinaryUsageCard } from './CloudinaryUsage';

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const CATEGORY_ICONS = {
  'study': BookOpenText, 'islamic': MoonStar, 'work': BriefcaseBusiness, 'personal': UserRound, 'reference': Library, 'other': Folder,
  'moon-star': MoonStar, 'briefcase-business': BriefcaseBusiness, 'user-round': UserRound, library: Library, folder: Folder,
  'code-2': Code2, terminal: Terminal, 'file-code-2': FileCode2, braces: Braces, brackets: Brackets, database: Database,
  server: Server, cpu: Cpu, network: Network, 'globe-2': Globe2, workflow: Workflow, 'git-branch': GitBranch,
  'git-merge': GitMerge, github: Github, bug: Bug, 'test-tube-2': TestTube2, package: Package, boxes: Boxes,
  component: Component, blocks: Blocks, puzzle: Puzzle, rocket: Rocket, bot: Bot, 'brain-circuit': BrainCircuit,
  command: Command, 'laptop-2': Laptop2, 'monitor-cog': MonitorCog, 'settings-2': Settings2, wrench: Wrench,
  lightbulb: Lightbulb, 'book-open': BookOpenText, 'folder-code': FolderCode, 'notebook-tabs': NotebookTabs,
  'chart-no-axes-combined': ChartNoAxesCombined, 'shield-check': ShieldCheck, 'lock-keyhole': LockKeyhole,
  'cloud-cog': CloudCog, 'panels-top-left': PanelsTopLeft,
};

const ICON_OPTIONS = [
  ['code-2', 'Code'], ['terminal', 'Terminal'], ['file-code-2', 'File code'], ['braces', 'Braces'], ['brackets', 'Brackets'],
  ['database', 'Database'], ['server', 'Server'], ['cpu', 'CPU'], ['network', 'Network'], ['globe-2', 'Web'],
  ['workflow', 'Workflow'], ['git-branch', 'Git branch'], ['git-merge', 'Git merge'], ['github', 'GitHub'], ['bug', 'Bug'],
  ['test-tube-2', 'Testing'], ['package', 'Package'], ['boxes', 'Boxes'], ['component', 'Component'], ['blocks', 'Blocks'],
  ['puzzle', 'Plugin'], ['rocket', 'Deploy'], ['bot', 'Bot'], ['brain-circuit', 'AI'], ['command', 'Command'],
  ['laptop-2', 'Laptop'], ['monitor-cog', 'Monitor'], ['settings-2', 'Settings'], ['wrench', 'Tools'], ['lightbulb', 'Ideas'],
  ['book-open', 'Docs'], ['folder-code', 'Code folder'], ['notebook-tabs', 'Notebook'], ['chart-no-axes-combined', 'Analytics'],
  ['shield-check', 'Security'], ['lock-keyhole', 'Auth'], ['cloud-cog', 'Cloud'], ['panels-top-left', 'UI'],
];

function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently uploaded';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function DocumentListSkeleton() {
  return (
    <ul className="bk-ahd-document-list bk-ahd-document-skeleton" aria-label="Loading documents">
      {[0, 1, 2].map((item) => <li className="bk-ahd-document" key={item}><span /><div><i /><i /></div><span /></li>)}
    </ul>
  );
}

export default function PdfLibrary({
  category,
  categories = [],
  actionKicker = 'Personal archive',
  collectionKicker = 'Your collection',
  collectionTitle = 'Uploaded PDFs',
  emptyCopy = 'Use the upload button above to add your first PDF.',
  modalKicker = 'Personal archive',
  modalCopy = 'Choose a PDF to add to your personal archive.',
  deleteCopy = 'your archive',
  showUsage = true,
  editableCategories = false,
  categoriesLoading = false,
  onCategoriesChanged,
}) {
  const dispatch = useAppDispatch();
  const { success: notifySuccess, error: notifyError, warning: notifyWarning } = useNotification();
  const inputId = useId();
  const uploadScope = useAppSelector((state) => state.uploads.scopes?.[getUploadScopeKey(category, 'pdf')]);
  const { uploadStatus, updateStatus, deleteStatus } = useAppSelector((state) => state.uploads);
  const uploads = uploadScope?.items || [];
  const isLoadingList = !uploadScope?.hasLoaded && (uploadScope?.status === 'idle' || uploadScope?.status === 'loading' || !uploadScope);
  const isRefreshingList = Boolean(uploadScope?.hasLoaded && uploadScope.status === 'loading');
  const isUploading = uploadStatus === 'loading';
  const isUpdatingCategory = updateStatus === 'loading';
  const isDeleting = deleteStatus === 'loading';
  const listError = uploadScope?.status === 'failed' ? uploadScope.error : '';
  const hasCategories = categories.length > 0;
  const showCategoryManager = hasCategories || editableCategories || categoriesLoading;
  const defaultDocumentCategory = categories[0]?.value || '';
  const [activeCategory, setActiveCategory] = useState('all');
  const [documentCategory, setDocumentCategory] = useState(defaultDocumentCategory);
  const [query, setQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [categoryDialog, setCategoryDialog] = useState(null);
  const [categoryDeleteTarget, setCategoryDeleteTarget] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('code-2');
  const [iconQuery, setIconQuery] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('idle');

  useEffect(() => {
    if (uploadScope?.status === 'loading' || uploadScope?.status === 'failed') return;
    if (isUploadScopeStale(uploadScope)) void dispatch(fetchUploads({ category, kind: 'pdf' }));
  }, [category, dispatch, uploadScope]);

  useEffect(() => {
    if (listError) notifyError(listError);
  }, [listError, notifyError]);

  useEffect(() => {
    if (!isModalOpen && !deleteTarget && !categoryDialog && !categoryDeleteTarget) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || isUploading || isDeleting || categoryStatus === 'loading') return;
      setIsModalOpen(false);
      setDeleteTarget(null);
      setCategoryDialog(null);
      setCategoryDeleteTarget(null);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [categoryDeleteTarget, categoryDialog, categoryStatus, deleteTarget, isDeleting, isModalOpen, isUploading]);

  useEffect(() => {
    if (activeCategory !== 'all' && !categories.some((item) => item.value === activeCategory)) setActiveCategory('all');
    if (documentCategory && !categories.some((item) => item.value === documentCategory)) setDocumentCategory(defaultDocumentCategory);
  }, [activeCategory, categories, defaultDocumentCategory, documentCategory]);

  const categoryCounts = useMemo(() => uploads.reduce((counts, upload) => {
    const key = upload.documentCategory || 'other';
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {}), [uploads]);

  const visibleUploads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return uploads.filter((upload) => {
      const matchesCategory = activeCategory === 'all' || (upload.documentCategory || 'other') === activeCategory;
      const matchesQuery = !normalizedQuery || upload.originalName.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, uploads]);

  const getCategoryLabel = (value) => categories.find((item) => item.value === value)?.label || 'Other';

  const closeModal = () => {
    if (isUploading) return;
    setIsModalOpen(false);
    setSelectedFile(null);
    setError('');
  };

  const openModal = () => {
    setSuccessMessage('');
    setError('');
    setDocumentCategory(activeCategory === 'all' ? defaultDocumentCategory : activeCategory);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteError('');
  };

  const handleDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setDeleteError('');
    try {
      await dispatch(deleteUpload(deleteTarget.id)).unwrap();
      setDeleteTarget(null);
      setSuccessMessage('The PDF was removed from your archive.');
      notifySuccess('PDF removed from your archive.');
      void dispatch(fetchCloudinaryUsage());
    } catch (deleteUploadError) {
      const message = deleteUploadError instanceof Error ? deleteUploadError.message : 'Could not delete this PDF.';
      setDeleteError(message);
      notifyError(message);
    }
  };

  const chooseFile = (file) => {
    if (!file) return;
    if (!isPdf(file)) {
      const message = 'Please select a PDF file.';
      setError(message);
      notifyWarning(message);
      return;
    }
    if (file.size === 0 || file.size > MAX_PDF_SIZE) {
      const message = 'Your PDF must be smaller than 20 MB.';
      setError(message);
      notifyWarning(message);
      return;
    }
    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    setError('');
    try {
      await dispatch(uploadPdf({ file: selectedFile, category, documentCategory })).unwrap();
      setSuccessMessage('Your PDF has been added to the archive.');
      setIsModalOpen(false);
      setSelectedFile(null);
      notifySuccess('PDF added to your archive.');
      void dispatch(fetchCloudinaryUsage());
    } catch (uploadRequestError) {
      const message = uploadRequestError instanceof Error ? uploadRequestError.message : 'Upload failed.';
      setError(message);
      notifyError(message);
    }
  };

  const handleCategoryChange = async (upload, nextDocumentCategory) => {
    const currentDocumentCategory = upload.documentCategory || 'other';
    if (currentDocumentCategory === nextDocumentCategory || isUpdatingCategory) return;

    try {
      await dispatch(updateUploadCategory({ id: upload.id, documentCategory: nextDocumentCategory })).unwrap();
      setSuccessMessage(`PDF moved to ${getCategoryLabel(nextDocumentCategory)}.`);
      notifySuccess(`PDF moved to ${getCategoryLabel(nextDocumentCategory)}.`);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Could not update the PDF category.';
      notifyError(message);
    }
  };

  const openCreateCategory = () => {
    setCategoryDialog({ mode: 'create' });
    setCategoryName('');
    setCategoryDescription('');
    setCategoryIcon('code-2');
    setIconQuery('');
    setCategoryError('');
  };

  const openEditCategory = (item) => {
    setCategoryDialog({ mode: 'edit', item });
    setCategoryName(item.label);
    setCategoryDescription(item.description || '');
    setCategoryIcon(item.icon || 'folder');
    setIconQuery('');
    setCategoryError('');
  };

  const closeCategoryDialog = () => {
    if (categoryStatus === 'loading') return;
    setCategoryDialog(null);
    setCategoryError('');
  };

  const saveCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryError('Give this category a name first.');
      return;
    }

    setCategoryStatus('loading');
    setCategoryError('');
    const isEditing = categoryDialog?.mode === 'edit';
    const endpoint = isEditing ? `/api/note-categories?id=${encodeURIComponent(categoryDialog.item.id)}` : '/api/note-categories';

    try {
      const response = await fetch(endpoint, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: categoryName, description: categoryDescription, icon: categoryIcon }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'The category could not be saved.');

      const savedCategory = payload.data;
      const nextCategories = isEditing
        ? categories.map((item) => item.id === savedCategory.id ? savedCategory : item)
        : [...categories, savedCategory];
      onCategoriesChanged?.(nextCategories);
      setCategoryDialog(null);
      setCategoryStatus('idle');
      setSuccessMessage(isEditing ? 'Category updated.' : 'Category created.');
      notifySuccess(isEditing ? 'Category updated.' : 'Category created.');
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'The category could not be saved.';
      setCategoryError(message);
      notifyError(message);
      setCategoryStatus('idle');
    }
  };

  const deleteCategory = async () => {
    if (!categoryDeleteTarget || categoryStatus === 'loading') return;
    setCategoryStatus('loading');
    setCategoryError('');

    try {
      const response = await fetch(`/api/note-categories?id=${encodeURIComponent(categoryDeleteTarget.id)}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || 'The category could not be deleted.');
      onCategoriesChanged?.(categories.filter((item) => item.id !== categoryDeleteTarget.id));
      void dispatch(fetchUploads({ category, kind: 'pdf' }));
      setCategoryDeleteTarget(null);
      setCategoryStatus('idle');
      setActiveCategory('all');
      setSuccessMessage('Category deleted. Its PDFs were moved to Other.');
      notifySuccess('Category deleted. Its PDFs were moved to Other.');
    } catch (deleteErrorMessage) {
      const message = deleteErrorMessage instanceof Error ? deleteErrorMessage.message : 'The category could not be deleted.';
      setCategoryError(message);
      notifyError(message);
      setCategoryStatus('idle');
    }
  };

  const filteredIconOptions = ICON_OPTIONS.filter(([, label]) => label.toLowerCase().includes(iconQuery.trim().toLowerCase()));
  const SelectedCategoryIcon = CATEGORY_ICONS[categoryIcon] || Code2;

  return (
    <section className={`bk-ahd-library${hasCategories ? ' bk-notes-library' : ''}`} aria-labelledby="uploaded-pdfs-title">
      <header className="bk-ahd-library-actionbar">
        <div><p className="bk-ahd-kicker">{actionKicker}</p>{hasCategories && <p className="bk-notes-action-copy">Keep every PDF in the right place, ready when you need it.</p>}</div>
        <button className="bk-ahd-upload-trigger" type="button" onClick={openModal} aria-label="Upload a PDF" title="Upload a PDF"><Upload size={21} strokeWidth={2.1} /><span>Upload PDF</span></button>
      </header>

      {successMessage && <p className="bk-ahd-success-message" role="status"><FileCheck2 size={16} />{successMessage}</p>}
      {showUsage && <CloudinaryUsageCard />}

      {showCategoryManager && (
        <section className="bk-notes-categories" aria-labelledby="notes-categories-title">
          <div className="bk-notes-section-heading">
            <div><p className="bk-ahd-kicker">Browse your library</p><h2 id="notes-categories-title">Categories</h2></div>
            <div className="bk-notes-section-actions">
              <span>{uploads.length} total</span>
              {editableCategories && <button className="bk-notes-add-category" type="button" onClick={openCreateCategory}><Plus size={15} /> New category</button>}
            </div>
          </div>
          <div className="bk-notes-category-grid">
            <article className={`bk-notes-category-card${activeCategory === 'all' ? ' is-active' : ''}`}>
              <button className="bk-notes-category-main" type="button" onClick={() => setActiveCategory('all')} aria-pressed={activeCategory === 'all'}>
                <span className="bk-notes-category-icon"><Library size={19} /></span><span><strong>All notes</strong><small>Complete PDF library</small></span><b>{uploads.length}</b>
              </button>
            </article>
            {categories.map((item) => {
              const Icon = CATEGORY_ICONS[item.icon] || CATEGORY_ICONS[item.value] || Folder;
              return (
                <article className={`bk-notes-category-card${activeCategory === item.value ? ' is-active' : ''}`} key={item.value}>
                  <button className="bk-notes-category-main" type="button" onClick={() => setActiveCategory(item.value)} aria-pressed={activeCategory === item.value}>
                    <span className="bk-notes-category-icon"><Icon size={19} /></span><span><strong>{item.label}</strong><small>{item.description}</small></span><b>{categoryCounts[item.value] || 0}</b>
                  </button>
                  {editableCategories && <div className="bk-notes-category-actions">
                    <button type="button" onClick={() => openEditCategory(item)} aria-label={`Change icon for ${item.label}`} title="Change icon"><PencilLine size={14} strokeWidth={2.1} /></button>
                    <button className="is-danger" type="button" onClick={() => { setCategoryError(''); setCategoryDeleteTarget(item); }} aria-label={`Delete ${item.label}`} title="Delete category"><Trash2 size={14} /></button>
                  </div>}
                </article>
              );
            })}
            {categoriesLoading && Array.from({ length: 5 }, (_, index) => <div className="bk-notes-category-skeleton" key={`category-loading-${index}`} aria-hidden="true" />)}
          </div>
        </section>
      )}

      <section className="bk-ahd-documents" aria-labelledby="uploaded-pdfs-title">
        <div className="bk-ahd-documents-head"><div><p className="bk-ahd-kicker">{collectionKicker}</p><h2 id="uploaded-pdfs-title">{activeCategory === 'all' ? collectionTitle : getCategoryLabel(activeCategory)}</h2></div><span>{isRefreshingList ? 'Refreshing…' : `${visibleUploads.length} ${visibleUploads.length === 1 ? 'document' : 'documents'}`}</span></div>
        {hasCategories && <label className="bk-notes-search"><Search size={16} /><span className="sr-only">Search PDFs</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search PDFs by file name..." /></label>}

        {isLoadingList ? (
          <DocumentListSkeleton />
        ) : listError ? (
          <div className="bk-ahd-list-error"><span>{listError}</span><button type="button" onClick={() => void dispatch(fetchUploads({ category, kind: 'pdf', force: true }))}><RefreshCw size={15} /> Try again</button></div>
        ) : visibleUploads.length === 0 ? (
          <div className="bk-ahd-empty"><span><FileText size={24} /></span><strong>{uploads.length ? 'No matching PDFs' : 'No PDFs yet'}</strong><p>{uploads.length ? 'Try another category or search term.' : emptyCopy}</p></div>
        ) : (
          <ul className="bk-ahd-document-list">
            {visibleUploads.map((upload) => (
              <li className={`bk-ahd-document${hasCategories ? ' has-category-control' : ''}`} key={upload.id}>
                <span className="bk-ahd-document-icon"><FileText size={20} /></span>
                <div className="bk-ahd-document-copy"><strong title={upload.originalName}>{upload.originalName}</strong><span><CalendarDays size={13} /> {formatDate(upload.createdAt)} <i /> {formatBytes(upload.bytes)}{hasCategories && <em>{getCategoryLabel(upload.documentCategory)}</em>}</span></div>
                {hasCategories && <label className="bk-notes-document-category-control">
                  <span className="sr-only">Change category for {upload.originalName}</span>
                  <select className="bk-notes-document-category" value={upload.documentCategory || 'other'} onChange={(event) => void handleCategoryChange(upload, event.target.value)} disabled={isUpdatingCategory} title="Change PDF category">
                    {categories.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
                  </select>
                </label>}
                <a href={upload.secureUrl} target="_blank" rel="noreferrer">Open <ExternalLink size={15} /></a>
                <button className="bk-ahd-delete-trigger" type="button" onClick={() => { setDeleteError(''); setDeleteTarget(upload); }} aria-label={`Delete ${upload.originalName}`} title="Delete PDF"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isModalOpen && (
        <div className="bk-ahd-modal-layer" role="presentation" onMouseDown={closeModal}>
          <section className="bk-ahd-modal" role="dialog" aria-modal="true" aria-labelledby={`${inputId}-title`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="bk-ahd-modal-close" type="button" aria-label="Close upload dialog" onClick={closeModal} disabled={isUploading}><X size={19} /></button>
            <span className="bk-ahd-modal-icon"><Upload size={22} /></span><p className="bk-ahd-kicker">{modalKicker}</p><h2 id={`${inputId}-title`}>Upload a PDF</h2><p className="bk-ahd-modal-copy">{modalCopy}</p>
            {hasCategories && <fieldset className="bk-notes-category-picker"><legend>Choose a category</legend><div>{categories.map((item) => <button className={documentCategory === item.value ? 'is-active' : ''} type="button" key={item.value} onClick={() => setDocumentCategory(item.value)} aria-pressed={documentCategory === item.value} disabled={isUploading}>{item.label}</button>)}</div></fieldset>}
            <label className={`bk-ahd-file-picker${selectedFile ? ' has-file' : ''}`} htmlFor={`${inputId}-file`}>
              <input id={`${inputId}-file`} type="file" accept="application/pdf,.pdf" onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ''; }} disabled={isUploading} />
              <FileText size={20} /><span>{selectedFile ? selectedFile.name : 'Choose a PDF from your device'}</span><small>{selectedFile ? formatBytes(selectedFile.size) : 'Maximum file size: 20 MB'}</small>
            </label>
            {error && <p className="bk-ahd-upload-error" role="alert">{error}</p>}
            <div className="bk-ahd-modal-actions"><button className="bk-ahd-cancel-button" type="button" onClick={closeModal} disabled={isUploading}>Cancel</button><button className="bk-ahd-upload-button" type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>{isUploading ? <LoaderCircle size={17} className="bk-spin" /> : <Upload size={17} />}{isUploading ? 'Uploading…' : 'Upload PDF'}</button></div>
          </section>
        </div>
      )}

      {categoryDialog && (
        <div className="bk-ahd-modal-layer" role="presentation" onMouseDown={closeCategoryDialog}>
          <section className="bk-ahd-modal bk-notes-category-modal" role="dialog" aria-modal="true" aria-labelledby={`${inputId}-category-title`} onMouseDown={(event) => event.stopPropagation()}>
            <button className="bk-ahd-modal-close" type="button" aria-label="Close category dialog" onClick={closeCategoryDialog} disabled={categoryStatus === 'loading'}><X size={19} /></button>
            <span className="bk-ahd-modal-icon"><SelectedCategoryIcon size={22} /></span>
            <p className="bk-ahd-kicker">Category settings</p>
            <h2 id={`${inputId}-category-title`}>{categoryDialog.mode === 'edit' ? 'Change category' : 'Create a category'}</h2>
            <p className="bk-ahd-modal-copy">Choose a development icon so this folder is easy to recognize at a glance.</p>

            <label className="bk-notes-category-field">
              <span>Name</span>
              <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} maxLength={32} placeholder="e.g. Frontend patterns" autoFocus disabled={categoryStatus === 'loading'} />
            </label>
            <label className="bk-notes-category-field">
              <span>Description <small>optional</small></span>
              <input value={categoryDescription} onChange={(event) => setCategoryDescription(event.target.value)} maxLength={52} placeholder="What belongs here?" disabled={categoryStatus === 'loading'} />
            </label>

            <div className="bk-notes-icon-picker">
              <div className="bk-notes-icon-picker-head"><strong>Choose an icon</strong><span>{filteredIconOptions.length} available</span></div>
              <label className="bk-notes-icon-search"><Search size={14} /><span className="sr-only">Search development icons</span><input value={iconQuery} onChange={(event) => setIconQuery(event.target.value)} placeholder="Search icons..." /></label>
              <div className="bk-notes-icon-grid" role="listbox" aria-label="Development icons">
                {filteredIconOptions.map(([value, label]) => {
                  const Icon = CATEGORY_ICONS[value] || Code2;
                  return <button className={categoryIcon === value ? 'is-active' : ''} type="button" key={value} onClick={() => setCategoryIcon(value)} aria-label={label} aria-selected={categoryIcon === value} role="option"><Icon size={17} /><small>{label}</small>{categoryIcon === value && <Check size={12} />}</button>;
                })}
              </div>
            </div>

            {categoryError && <p className="bk-ahd-upload-error" role="alert">{categoryError}</p>}
            <div className="bk-ahd-modal-actions"><button className="bk-ahd-cancel-button" type="button" onClick={closeCategoryDialog} disabled={categoryStatus === 'loading'}>Cancel</button><button className="bk-ahd-upload-button" type="button" onClick={() => void saveCategory()} disabled={categoryStatus === 'loading'}>{categoryStatus === 'loading' ? <LoaderCircle size={17} className="bk-spin" /> : <Check size={17} />}{categoryStatus === 'loading' ? 'Saving…' : categoryDialog.mode === 'edit' ? 'Save changes' : 'Create category'}</button></div>
          </section>
        </div>
      )}

      {categoryDeleteTarget && (
        <div className="bk-ahd-modal-layer" role="presentation" onMouseDown={() => categoryStatus !== 'loading' && setCategoryDeleteTarget(null)}>
          <section className="bk-ahd-modal bk-ahd-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby={`${inputId}-category-delete-title`} onMouseDown={(event) => event.stopPropagation()}>
            <span className="bk-ahd-delete-icon"><AlertTriangle size={22} /></span>
            <p className="bk-ahd-kicker">Remove category</p>
            <h2 id={`${inputId}-category-delete-title`}>Delete {categoryDeleteTarget.label}?</h2>
            <p className="bk-ahd-modal-copy">Any PDFs in this category will be moved to Other. This cannot be undone.</p>
            {categoryError && <p className="bk-ahd-upload-error" role="alert">{categoryError}</p>}
            <div className="bk-ahd-modal-actions"><button className="bk-ahd-cancel-button" type="button" onClick={() => setCategoryDeleteTarget(null)} disabled={categoryStatus === 'loading'}>Keep category</button><button className="bk-ahd-delete-button" type="button" onClick={() => void deleteCategory()} disabled={categoryStatus === 'loading'}>{categoryStatus === 'loading' ? <LoaderCircle size={17} className="bk-spin" /> : <Trash2 size={17} />}{categoryStatus === 'loading' ? 'Deleting…' : 'Delete category'}</button></div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="bk-ahd-modal-layer" role="presentation" onMouseDown={closeDeleteModal}>
          <section className="bk-ahd-modal bk-ahd-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby={`${inputId}-delete-title`} aria-describedby={`${inputId}-delete-description`} onMouseDown={(event) => event.stopPropagation()}>
            <span className="bk-ahd-delete-icon"><AlertTriangle size={22} /></span><p className="bk-ahd-kicker">Remove from archive</p><h2 id={`${inputId}-delete-title`}>Delete this PDF?</h2><p id={`${inputId}-delete-description`} className="bk-ahd-modal-copy">“{deleteTarget.originalName}” will be permanently removed from {deleteCopy}.</p>
            {deleteError && <p className="bk-ahd-upload-error" role="alert">{deleteError}</p>}
            <div className="bk-ahd-modal-actions"><button className="bk-ahd-cancel-button" type="button" onClick={closeDeleteModal} disabled={isDeleting}>Keep PDF</button><button className="bk-ahd-delete-button" type="button" onClick={() => void handleDelete()} disabled={isDeleting}>{isDeleting ? <LoaderCircle size={17} className="bk-spin" /> : <Trash2 size={17} />}{isDeleting ? 'Deleting…' : 'Delete PDF'}</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
