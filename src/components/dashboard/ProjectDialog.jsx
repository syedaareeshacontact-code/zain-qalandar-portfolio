'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function ProjectDialog({ title, label = 'Portfolio manager', busy, onClose, children }) {
  const dialogRef = useRef(null);
  useEffect(() => { dialogRef.current?.showModal(); }, []);
  return <dialog className="pm-dialog" ref={dialogRef} aria-labelledby="pm-dialog-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="pm-dialog-inner"><header className="pm-dialog-heading"><div><p className="bk-ahd-kicker">{label}</p><h2 id="pm-dialog-title">{title}</h2></div><button className="pm-icon-button" type="button" aria-label="Close dialog" disabled={busy} onClick={onClose}><X size={20} /></button></header>{children}</div>
  </dialog>;
}
