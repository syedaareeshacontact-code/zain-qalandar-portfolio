'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ExternalLink,
  FileCheck2,
  FileText,
  LoaderCircle,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react';

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
  const [uploads, setUploads] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [listError, setListError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadUploads = async () => {
    setIsLoadingList(true);
    setListError('');

    try {
      const response = await fetch('/api/uploads?category=ahd-nama&kind=pdf', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Could not load PDFs.');
      }

      setUploads(payload.data);
    } catch (loadError) {
      setListError(loadError instanceof Error ? loadError.message : 'Could not load PDFs.');
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    void loadUploads();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !isUploading) setIsModalOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isModalOpen, isUploading]);

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

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', 'ahd-nama');

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Upload failed.');
      }

      setUploads((currentUploads) => [payload.data, ...currentUploads]);
      setSuccessMessage('Your PDF has been added to the archive.');
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
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
            <button type="button" onClick={() => void loadUploads()}><RefreshCw size={15} /> Try again</button>
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
    </section>
  );
}
