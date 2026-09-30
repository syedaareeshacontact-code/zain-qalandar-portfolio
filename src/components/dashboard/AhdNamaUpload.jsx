'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FileText,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCloudinaryUsage } from '@/store/features/cloudinaryUsage/cloudinaryUsageSlice';
import { deleteUpload, fetchUploads, uploadPdf } from '@/store/features/uploads/uploadsSlice';
import { CloudinaryUsageCard } from './CloudinaryUsage';

const MAX_PDF_SIZE = 20 * 1024 * 1024;

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

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function AhdNamaUpload() {
  const dispatch = useAppDispatch();
  const { items: uploads, listStatus, uploadStatus, deleteStatus, error: uploadError } = useAppSelector((state) => state.uploads);
  const isLoadingList = listStatus === 'idle' || listStatus === 'loading';
  const isUploading = uploadStatus === 'loading';
  const isDeleting = deleteStatus === 'loading';
  const listError = listStatus === 'failed' ? uploadError : '';
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    void dispatch(fetchUploads({ category: 'ahd-nama', kind: 'pdf' }));
  }, [dispatch]);

  useEffect(() => {
    if (!isModalOpen && !deleteTarget) return undefined;

    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || isUploading || isDeleting) return;
      setIsModalOpen(false);
      setDeleteTarget(null);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [deleteTarget, isDeleting, isModalOpen, isUploading]);

  const closeModal = () => {
    if (isUploading) return;
    setIsModalOpen(false);
    setSelectedFile(null);
    setError('');
  };

  const openModal = () => {
    setSuccessMessage('');
    setError('');
    setIsModalOpen(true);
  };

  const requestDelete = (upload) => {
    setDeleteError('');
    setDeleteTarget(upload);
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
      void dispatch(fetchCloudinaryUsage());
    } catch (deleteUploadError) {
      setDeleteError(deleteUploadError instanceof Error ? deleteUploadError.message : 'Could not delete this PDF.');
    }
  };

  const chooseFile = (file) => {
    if (!file) return;

    if (!isPdf(file)) {
      setError('Please select a PDF file.');
      return;
    }

    if (file.size === 0 || file.size > MAX_PDF_SIZE) {
      setError('Your PDF must be smaller than 20 MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setError('');

    try {
      await dispatch(uploadPdf({ file: selectedFile, category: 'ahd-nama' })).unwrap();
      setSuccessMessage('Your PDF has been added to the archive.');
      setIsModalOpen(false);
      setSelectedFile(null);
      void dispatch(fetchCloudinaryUsage());
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    }
  };

  return (
    <section className="bk-ahd-library" aria-labelledby="uploaded-pdfs-title">
      <header className="bk-ahd-library-actionbar">
        <p className="bk-ahd-kicker">Personal archive</p>
        <button className="bk-ahd-upload-trigger" type="button" onClick={openModal} aria-label="Upload a PDF" title="Upload a PDF">
          <Upload size={21} strokeWidth={2.1} />
          <span>Upload PDF</span>
        </button>
      </header>

      {successMessage && <p className="bk-ahd-success-message" role="status"><FileCheck2 size={16} />{successMessage}</p>}

      <CloudinaryUsageCard />

      <section className="bk-ahd-documents" aria-labelledby="uploaded-pdfs-title">
        <div className="bk-ahd-documents-head">
          <div>
            <p className="bk-ahd-kicker">Your collection</p>
            <h2 id="uploaded-pdfs-title">Uploaded PDFs</h2>
          </div>
          <span>{uploads.length} {uploads.length === 1 ? 'document' : 'documents'}</span>
        </div>

        {isLoadingList ? (
          <div className="bk-ahd-loading"><LoaderCircle size={18} className="bk-spin" /> Loading your archive…</div>
        ) : listError ? (
          <div className="bk-ahd-list-error">
            <span>{listError}</span>
            <button type="button" onClick={() => void dispatch(fetchUploads({ category: 'ahd-nama', kind: 'pdf' }))}><RefreshCw size={15} /> Try again</button>
          </div>
        ) : uploads.length === 0 ? (
          <div className="bk-ahd-empty">
            <span><FileText size={24} /></span>
            <strong>No PDFs yet</strong>
            <p>Use the upload button above to add your first Ahd Nama.</p>
          </div>
        ) : (
          <ul className="bk-ahd-document-list">
            {uploads.map((upload) => (
              <li className="bk-ahd-document" key={upload.id}>
                <span className="bk-ahd-document-icon"><FileText size={20} /></span>
                <div className="bk-ahd-document-copy">
                  <strong title={upload.originalName}>{upload.originalName}</strong>
                  <span><CalendarDays size={13} /> {formatDate(upload.createdAt)} <i /> {formatBytes(upload.bytes)}</span>
                </div>
                <a href={upload.secureUrl} target="_blank" rel="noreferrer">
                  Open <ExternalLink size={15} />
                </a>
                <button className="bk-ahd-delete-trigger" type="button" onClick={() => requestDelete(upload)} aria-label={`Delete ${upload.originalName}`} title="Delete PDF">
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isModalOpen && (
        <div className="bk-ahd-modal-layer" role="presentation" onMouseDown={closeModal}>
          <section className="bk-ahd-modal" role="dialog" aria-modal="true" aria-labelledby="upload-pdf-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="bk-ahd-modal-close" type="button" aria-label="Close upload dialog" onClick={closeModal} disabled={isUploading}><X size={19} /></button>
            <span className="bk-ahd-modal-icon"><Upload size={22} /></span>
            <p className="bk-ahd-kicker">Ahd Nama archive</p>
            <h2 id="upload-pdf-title">Upload a PDF</h2>
            <p className="bk-ahd-modal-copy">Choose a written covenant, note, or reflection to add to your personal archive.</p>

            <label className={`bk-ahd-file-picker${selectedFile ? ' has-file' : ''}`} htmlFor="ahd-nama-file">
              <input
                id="ahd-nama-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) => { chooseFile(event.target.files?.[0]); event.target.value = ''; }}
                disabled={isUploading}
              />
              <FileText size={20} />
              <span>{selectedFile ? selectedFile.name : 'Choose a PDF from your device'}</span>
              <small>{selectedFile ? formatBytes(selectedFile.size) : 'Maximum file size: 20 MB'}</small>
            </label>

            {error && <p className="bk-ahd-upload-error" role="alert">{error}</p>}

            <div className="bk-ahd-modal-actions">
              <button className="bk-ahd-cancel-button" type="button" onClick={closeModal} disabled={isUploading}>Cancel</button>
              <button className="bk-ahd-upload-button" type="button" onClick={handleUpload} disabled={!selectedFile || isUploading}>
                {isUploading ? <LoaderCircle size={17} className="bk-spin" /> : <Upload size={17} />}
                {isUploading ? 'Uploading…' : 'Upload PDF'}
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div className="bk-ahd-modal-layer" role="presentation" onMouseDown={closeDeleteModal}>
          <section className="bk-ahd-modal bk-ahd-delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-pdf-title" aria-describedby="delete-pdf-description" onMouseDown={(event) => event.stopPropagation()}>
            <span className="bk-ahd-delete-icon"><AlertTriangle size={22} /></span>
            <p className="bk-ahd-kicker">Remove from archive</p>
            <h2 id="delete-pdf-title">Delete this PDF?</h2>
            <p id="delete-pdf-description" className="bk-ahd-modal-copy">“{deleteTarget.originalName}” will be permanently removed from your Ahd Nama archive.</p>

            {deleteError && <p className="bk-ahd-upload-error" role="alert">{deleteError}</p>}

            <div className="bk-ahd-modal-actions">
              <button className="bk-ahd-cancel-button" type="button" onClick={closeDeleteModal} disabled={isDeleting}>Keep PDF</button>
              <button className="bk-ahd-delete-button" type="button" onClick={() => void handleDelete()} disabled={isDeleting}>
                {isDeleting ? <LoaderCircle size={17} className="bk-spin" /> : <Trash2 size={17} />}
                {isDeleting ? 'Deleting…' : 'Delete PDF'}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
