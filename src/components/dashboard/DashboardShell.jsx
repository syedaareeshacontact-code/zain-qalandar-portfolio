'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Home,
  Library,
  Menu,
  Moon,
  NotebookPen,
  Search,
  Sun,
  Target,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/overview', label: 'Dashboard', icon: Home },
  { href: '/dashboard', label: 'Prayer Routine', icon: CalendarDays, aliases: ['/dashboard/prayer-routine'] },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/library', label: 'Library', icon: BookOpen },
];

function isActivePath(item, pathname) {
  if (item.aliases?.includes(pathname)) return true;
  if (item.href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/dashboard/prayer-routine';
  }
  return pathname === item.href;
}

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className={`bk-shell${dark ? ' is-dark' : ''}${sidebarOpen ? ' is-open' : ''}`}>
      <button className="bk-backdrop" type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />

      <aside className="bk-sidebar" aria-label="Barakah navigation">
        <div className="bk-sidebar-head">
          <Link className="bk-brand" href="/dashboard">
            <span className="bk-brand-mark" aria-hidden="true">
              <Home size={16} strokeWidth={2.2} />
            </span>
            <span>Barakah</span>
          </Link>
          <button className="bk-close" type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="bk-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActivePath(item, pathname);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`bk-nav-item${active ? ' is-active' : ''}`}
              >
                <Icon size={18} strokeWidth={1.85} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="bk-sidebar-foot">
          <p>A more<br />focused day<br />A closer You</p>
          <MosqueMark />
        </div>
      </aside>

      <div className="bk-main">
        <header className="bk-topbar">
          <button className="bk-menu" type="button" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <label className="bk-search">
            <Search size={16} strokeWidth={1.9} />
            <span className="sr-only">Search anything</span>
            <input type="search" placeholder="Search anything..." />
          </label>

          <div className="bk-top-actions">
            <button
              className="bk-icon-btn"
              type="button"
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setDark((value) => !value)}
            >
              {dark ? <Moon size={18} strokeWidth={1.8} /> : <Sun size={18} strokeWidth={1.8} />}
            </button>
            <button className="bk-icon-btn has-alert" type="button" aria-label="Notifications">
              <Bell size={18} strokeWidth={1.8} />
            </button>
            <button className="bk-user" type="button">
              <span className="bk-avatar" aria-hidden="true">ZQ</span>
              <span className="bk-user-copy">
                <strong>Keep Going</strong>
                <small>For His Sake</small>
              </span>
              <ChevronDown size={16} strokeWidth={1.8} />
            </button>
          </div>
        </header>

        <main className="bk-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function MosqueMark() {
  return (
    <svg className="bk-mosque" viewBox="0 0 220 160" fill="none" aria-hidden="true">
      <path d="M110 18c18 0 32 14 32 32v8H78v-8c0-18 14-32 32-32Z" fill="currentColor" opacity=".18" />
      <circle cx="110" cy="18" r="7" fill="currentColor" opacity=".22" />
      <path d="M36 86c18-22 36-22 54 0v50H36V86Z" fill="currentColor" opacity=".14" />
      <path d="M130 86c18-22 36-22 54 0v50h-54V86Z" fill="currentColor" opacity=".14" />
      <path d="M78 72c16-28 48-28 64 0v64H78V72Z" fill="currentColor" opacity=".2" />
      <rect x="100" y="104" width="20" height="32" rx="3" fill="currentColor" opacity=".16" />
      <path d="M20 136h180v8H20z" fill="currentColor" opacity=".12" />
      <path d="M48 58v18M172 58v18" stroke="currentColor" strokeWidth="4" opacity=".18" />
      <circle cx="48" cy="54" r="4" fill="currentColor" opacity=".2" />
      <circle cx="172" cy="54" r="4" fill="currentColor" opacity=".2" />
    </svg>
  );
}
