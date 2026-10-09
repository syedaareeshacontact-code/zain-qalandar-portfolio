'use client';

import { useId, useRef, useState } from 'react';
import { Bold, Code, Eye, Heading, Italic, Link2, List, ListOrdered, Pencil, Quote, Strikethrough, X } from 'lucide-react';
import { formatGoalSelection, GOAL_DESCRIPTION_LIMIT, safeGoalLink } from '@/lib/goals';
import GoalDescription from './GoalDescription';

const tools = [
  { type: 'bold', label: 'Bold (Ctrl or ⌘ B)', icon: Bold }, { type: 'italic', label: 'Italic (Ctrl or ⌘ I)', icon: Italic },
  { type: 'strike', label: 'Strikethrough', icon: Strikethrough }, { type: 'heading', label: 'Heading', icon: Heading },
  { type: 'bullet', label: 'Bullet list', icon: List }, { type: 'numbered', label: 'Numbered list', icon: ListOrdered },
  { type: 'quote', label: 'Quote', icon: Quote }, { type: 'code', label: 'Inline code', icon: Code },
];

export default function GoalDescriptionEditor({ value, format, onChange, disabled }) {
  const id = useId();
  const textarea = useRef(null);
  const [preview, setPreview] = useState(false);
  const [link, setLink] = useState(null);
  const [error, setError] = useState('');

  const replaceText = ({ text, start, end }) => {
    if (text.length > GOAL_DESCRIPTION_LIMIT) { setError('The description is full. Remove some text before adding formatting.'); return; }
    setError('');
    onChange(text, 'markdown');
    requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(start, end); });
  };
  const apply = (type) => {
    const input = textarea.current;
    if (!input || disabled) return;
    replaceText(formatGoalSelection(value, input.selectionStart, input.selectionEnd, type));
  };
  const openLink = () => {
    const input = textarea.current;
    if (!input) return;
    setLink({ start: input.selectionStart, end: input.selectionEnd, label: value.slice(input.selectionStart, input.selectionEnd), url: '' });
    setError('');
  };
  const insertLink = () => {
    const url = safeGoalLink(link.url.trim());
    if (!url) { setError('Use a full https:// link or a mailto: address.'); return; }
    const label = (link.label.trim() || 'Link').replace(/[\[\]\\]/g, '\\$&');
    const insert = `[${label}](<${url}>)`;
    replaceText({ text: value.slice(0, link.start) + insert + value.slice(link.end), start: link.start, end: link.start + insert.length });
    if (value.length - (link.end - link.start) + insert.length <= GOAL_DESCRIPTION_LIMIT) setLink(null);
  };

  return (
    <div className="bk-goals-field">
      <div className="bk-goal-editor-label"><label htmlFor={id}>Description</label><div className="bk-goal-editor-tabs">
        <button type="button" aria-pressed={!preview} onClick={() => { setPreview(false); setLink(null); }}><Pencil size={13} /> Write</button>
        <button type="button" aria-pressed={preview} onClick={() => { setPreview(true); setLink(null); }}><Eye size={13} /> Preview</button>
      </div></div>
      <div className="bk-goal-description-editor">
        {!preview && <div className="bk-goal-format-toolbar" role="group" aria-label="Description formatting">
          {tools.map(({ type, label, icon: Icon }) => <button key={type} type="button" title={label} aria-label={label} disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={() => apply(type)}><Icon size={16} /></button>)}
          <button type="button" title="Insert link" aria-label="Insert link" disabled={disabled} onMouseDown={(event) => event.preventDefault()} onClick={openLink}><Link2 size={16} /></button>
        </div>}
        {link && <div className="bk-goal-link-form">
          <label>Link text<input value={link.label} placeholder="Website" onChange={(event) => setLink({ ...link, label: event.target.value })} disabled={disabled} /></label>
          <label>URL<input type="url" value={link.url} placeholder="https://example.com" onChange={(event) => setLink({ ...link, url: event.target.value })} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); insertLink(); } }} disabled={disabled} /></label>
          <button type="button" className="bk-goal-action" onClick={insertLink} disabled={disabled}>Add link</button><button type="button" className="bk-goal-icon-action" aria-label="Cancel link" onClick={() => setLink(null)}><X size={15} /></button>
        </div>}
        {preview ? <div id={id} className="bk-goal-description-preview" role="region" aria-label="Description preview"><GoalDescription text={value} format={format} /></div> :
          <textarea id={id} ref={textarea} rows={6} value={value} maxLength={GOAL_DESCRIPTION_LIMIT} placeholder="What does success look like? Add your plan, resources, and reminders…" disabled={disabled}
            onChange={(event) => { onChange(event.target.value, format); setError(''); }}
            onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && ['b', 'i'].includes(event.key.toLowerCase())) { event.preventDefault(); apply(event.key.toLowerCase() === 'b' ? 'bold' : 'italic'); } }} />}
      </div>
      <div className="bk-goal-editor-help"><span>Select text to format it. Use Preview to see the result.</span><span>{value.length.toLocaleString('en')} / {GOAL_DESCRIPTION_LIMIT.toLocaleString('en')}</span></div>
      {error && <p className="bk-goals-form-error" role="alert">{error}</p>}
    </div>
  );
}
