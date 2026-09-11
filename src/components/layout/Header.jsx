'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { profile } from '@/data/profile';

const navLinks = profile.sections.filter((section) => section.showInNav);

export default function Header() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('hero');
  const menuButton = useRef(null);
  const navigation = useRef(null);

  useEffect(() => {
    const updateSection = () => {
      let current = 'hero';
      for (const section of profile.sections) {
        if (document.getElementById(section.id)?.getBoundingClientRect().top <= 160) {
          current = section.id;
        }
      }
      setActive(current);
    };
    updateSection();
    window.addEventListener('scroll', updateSection, { passive: true });
    return () => window.removeEventListener('scroll', updateSection);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (!navigation.current?.contains(event.target) && !menuButton.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const desktop = window.matchMedia('(min-width: 801px)');
    const onResize = () => { if (desktop.matches) setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    desktop.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [open]);

  const closeAndNavigate = (event, href) => {
    setOpen(false);
    const section = document.querySelector(href);
    if (section) {
      event.preventDefault();
      window.history.pushState(null, '', href);
      section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  };

  return (
    <header className="site-header">
      <div className="page-container header-inner">
        <a href="#hero" className="brand" aria-label={profile.basic.fullName}>
          <span className="brand-mark">{profile.design.monogram}</span>
          <span className="brand-name">{profile.basic.brandName}<span className="brand-dot">.</span></span>
        </a>
        <button
          ref={menuButton}
          className="menu-toggle"
          type="button"
          aria-label={open ? profile.ui.closeMenuLabel : profile.ui.menuAriaLabel}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
        <nav
          ref={navigation}
          id="site-navigation"
          className={`site-navigation${open ? ' is-open' : ''}`}
          aria-label={profile.design.navigationLabel}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget) && event.relatedTarget !== menuButton.current) setOpen(false);
          }}
        >
          {navLinks.map((link) => (
            <a key={link.id} href={link.href} aria-current={active === link.id ? 'location' : undefined} onClick={(event) => closeAndNavigate(event, link.href)}>
              {link.label}
            </a>
          ))}
          <a href="#contact" className="header-contact" onClick={(event) => closeAndNavigate(event, '#contact')}>
            {profile.design.contactCta} <ArrowUpRight size={16} />
          </a>
        </nav>
      </div>
    </header>
  );
}
