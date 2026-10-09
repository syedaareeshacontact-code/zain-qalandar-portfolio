'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function GoalDialog({ titleId, children, onClose, busy, alert = false, className = '' }) {
  const dialog = useRef(null);
  const callbacks = useRef({ onClose, busy });
  useEffect(() => { callbacks.current = { onClose, busy }; }, [onClose, busy]);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => (dialog.current?.querySelector('[data-autofocus]') || dialog.current)?.focus());
    const handleKey = (event) => {
      if (event.key === 'Escape' && !callbacks.current.busy) { event.preventDefault(); callbacks.current.onClose(); }
      if (event.key !== 'Tab') return;
      const elements = Array.from(dialog.current?.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]') || []).filter((element) => element.getClientRects().length);
      const first = elements[0], last = elements.at(-1);
      if (!first) { event.preventDefault(); dialog.current?.focus(); }
      else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
      else document.querySelector('.bk-goals-filters > button.is-active')?.focus();
    };
  }, []);
  return <div className="bk-goals-dialog-layer"><section ref={dialog} tabIndex={-1} className={`bk-goals-dialog ${className}`} role={alert ? 'alertdialog' : 'dialog'} aria-modal="true" aria-labelledby={titleId}>
    <button type="button" className="bk-goals-dialog-close" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={19} /></button>{children}
  </section></div>;
}
