'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { profile } from '@/data/profile';
import Reveal from '@/components/ui/Reveal';

export default function Contact() {
  const { contact, contactSection, design } = profile;
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    const data = new FormData(event.currentTarget);
    const fields = Object.fromEntries(['name', 'email', 'subject', 'message'].map((name) => [name, String(data.get(name) || '').trim()]));
    if (Object.values(fields).some((value) => !value)) {
      setError(contactSection.form.validation.required);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      setError(contactSection.form.validation.invalidEmail);
      return;
    }
    const labels = contactSection.form.emailBody;
    const body = `${labels.nameLabel}: ${fields.name}\n${labels.emailLabel}: ${fields.email}\n${labels.subjectLabel}: ${fields.subject}\n\n${labels.messageLabel}:\n${fields.message}`;
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(fields.subject)}&body=${encodeURIComponent(body)}`;
    setStatus(contactSection.form.successMessage);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  };

  return (
    <section id="contact" className="contact-section">
      <Reveal className="contact-heading">
        <p className="eyebrow">06 / {design.contactLabel}</p>
        <h2>{contactSection.title}<em>{design.contactAccent}</em></h2>
        <p>{design.contactNote}</p>
      </Reveal>
      <div className="contact-grid">
        <Reveal className="contact-details">
          <p className="availability"><span className="status-dot" />{design.availability}</p>
          <div className="contact-email-row"><a href={`mailto:${contact.email}`} className="contact-email">{contact.email}<ArrowUpRight size={22} /></a><button type="button" onClick={copyEmail} className="copy-button" aria-label={copyStatus === 'copied' ? design.copiedEmail : design.copyEmail}>{copyStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />}</button></div>
          <p className="copy-status" role="status">{copyStatus === 'copied' ? design.copiedEmail : copyStatus === 'failed' ? design.copyFailed : ''}</p>
          <div className="contact-info">{contactSection.infoCards.filter((item) => item.title !== 'Email').map((item) => {
            const Icon = item.icon;
            return <div key={item.title}><Icon size={17} /><div><span className="eyebrow">{item.title}</span>{item.href ? <a href={item.href}>{item.value}</a> : <span>{item.value}</span>}</div></div>;
          })}</div>
          <div className="contact-socials">{contactSection.socialLinks.map((social) => <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer">{social.label}<ArrowUpRight size={15} /></a>)}</div>
        </Reveal>
        <Reveal className="contact-form-wrap" delay={0.08}>
          <h3>{contactSection.form.title}</h3>
          <form onSubmit={handleSubmit} className="contact-form" aria-describedby="form-note">
            <div className="form-row">
              {['name', 'email'].map((field) => <div className="form-field" key={field}><label htmlFor={`contact-${field}`}>{contactSection.form.labels[field]} <span>{contactSection.form.requiredIndicator}</span></label><input id={`contact-${field}`} name={field} type={field === 'email' ? 'email' : 'text'} autoComplete={field} placeholder={contactSection.form.placeholders[field]} required maxLength={field === 'email' ? 254 : 120} onChange={() => setStatus('')} /></div>)}
            </div>
            <div className="form-field"><label htmlFor="contact-subject">{contactSection.form.labels.subject} <span>{contactSection.form.requiredIndicator}</span></label><input id="contact-subject" name="subject" placeholder={contactSection.form.placeholders.subject} required maxLength={180} onChange={() => setStatus('')} /></div>
            <div className="form-field"><label htmlFor="contact-message">{contactSection.form.labels.message} <span>{contactSection.form.requiredIndicator}</span></label><textarea id="contact-message" name="message" rows={4} placeholder={contactSection.form.placeholders.message} required maxLength={3000} onChange={() => setStatus('')} /></div>
            <p id="form-note" className="form-note">{design.formNote}</p>
            {error && <p className="form-error" role="alert">{error}</p>}
            {status && <p className="form-status" role="status">{status}</p>}
            <button type="submit" className="button button-primary">{contactSection.form.submitLabel}<ArrowUpRight size={17} /></button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
