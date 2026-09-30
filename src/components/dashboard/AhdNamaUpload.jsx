'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  ImagePlus,
  LoaderCircle,
  UploadCloud,
  X,
} from 'lucide-react';

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const ACCEPTED_EXTENSIONS = new Set(['pdf', 'jpg', 'jpeg', 'png', 'webp']);

function isSupportedFile(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return ACCEPTED_TYPES.has(file.type) || ACCEPTED_EXTENSIONS.has(extension);
}

function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AhdNamaUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const chooseFile = (file) => {
    if (!file) return;

    const maxSize = isPdf(file) ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
    if (!isSupportedFile(file)) {
      setError('PDF, JPG, PNG یا WEBP file select کریں۔');
      return;
    }

    if (file.size > maxSize) {
      setError(isPdf(file) ? 'PDF 20 MB سے چھوٹی ہونی چاہیے۔' : 'Image 10 MB سے چھوٹی ہونی چاہیے۔');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError('');
    setUploadedFile(null);
    setSelectedFile(file);
    setPreviewUrl(isPdf(file) ? '' : URL.createObjectURL(file));
  };

  const handleInputChange = (event) => {
    chooseFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
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

      setUploadedFile(payload.data);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
      setSelectedFile(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="bk-ahd-upload" aria-labelledby="ahd-upload-title">
      <div className="bk-ahd-upload-heading">
        <div>
          <p className="bk-ahd-kicker">Keep your promise close</p>
          <h2 id="ahd-upload-title">Upload your Ahd Nama</h2>
          <p>Add a personal PDF or image of your written covenant. It will be stored securely in Cloudinary.</p>
        </div>
        <span className="bk-ahd-upload-badge"><UploadCloud size={15} /> Cloud upload</span>
      </div>

      <div className="bk-ahd-upload-grid">
        <label
          className={`bk-ahd-dropzone${isDragging ? ' is-dragging' : ''}${selectedFile ? ' has-file' : ''}`}
          htmlFor="ahd-nama-file"
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            id="ahd-nama-file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            disabled={isUploading}
          />
          {selectedFile ? (
            <>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="bk-ahd-file-preview" src={previewUrl} alt="Selected Ahd Nama preview" />
              ) : (
                <span className="bk-ahd-file-icon"><FileText size={30} /></span>
              )}
              <strong>{selectedFile.name}</strong>
              <small>{formatBytes(selectedFile.size)} · Ready to upload</small>
              <span className="bk-ahd-change-file">Choose a different file</span>
            </>
          ) : (
            <>
              <span className="bk-ahd-dropzone-icon"><ImagePlus size={23} /></span>
              <strong>Drop your file here</strong>
              <span>or click to browse from your device</span>
              <small>PDF up to 20 MB · JPG, PNG, WEBP up to 10 MB</small>
            </>
          )}
        </label>

        <div className="bk-ahd-upload-side">
          <div className="bk-ahd-upload-note">
            <FileText size={19} aria-hidden="true" />
            <div>
              <strong>Designed for reflection</strong>
              <p>Upload a clean scan, a signed document, or a meaningful visual reminder.</p>
            </div>
          </div>

          {error && <p className="bk-ahd-upload-error" role="alert">{error}</p>}

          {selectedFile && (
            <button className="bk-ahd-upload-button" type="button" onClick={handleUpload} disabled={isUploading}>
              {isUploading ? <LoaderCircle size={17} className="bk-spin" /> : <UploadCloud size={17} />}
              {isUploading ? 'Uploading…' : 'Upload Ahd Nama'}
            </button>
          )}
        </div>
      </div>

      {uploadedFile && (
        <div className="bk-ahd-upload-success" role="status">
          <span className="bk-ahd-success-icon"><CheckCircle2 size={18} /></span>
          <div>
            <strong>Uploaded successfully</strong>
            <span>{uploadedFile.originalName}</span>
          </div>
          <a href={uploadedFile.secureUrl} target="_blank" rel="noreferrer">
            Open file <ExternalLink size={14} />
          </a>
          <button type="button" aria-label="Dismiss upload confirmation" onClick={() => setUploadedFile(null)}><X size={16} /></button>
        </div>
      )}
    </section>
  );
}
