'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  Home,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ScrollText,
  Sun,
  Target,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard/overview', label: 'Dashboard', icon: Home },
  { href: '/dashboard', label: 'Prayer Routine', icon: CalendarDays, aliases: ['/dashboard/prayer-routine'] },
  { href: '/dashboard/ahd-nama', label: 'Ahd Nama', icon: ScrollText },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/goals', label: 'Goals', icon: Target },
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
  const [sidebarOpen, setSidebarOpen] = useState(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(max-width: 780px)').matches) setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 781px)');
    const syncSidebarForViewport = (event) => setSidebarOpen(event.matches);

    syncSidebarForViewport(desktop);
    desktop.addEventListener('change', syncSidebarForViewport);
    return () => desktop.removeEventListener('change', syncSidebarForViewport);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  return (
    <div className={`bk-shell${dark ? ' is-dark' : ''}${sidebarOpen === true ? ' is-open' : sidebarOpen === false ? ' is-collapsed' : ''}`}>
      <button className="bk-backdrop" type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)} />

      <aside className="bk-sidebar" aria-label="Barakah navigation">
        <div className="bk-sidebar-head">
          <Link className="bk-brand" href="/dashboard">
            <span className="bk-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 34 38" width="33" height="37" fill="none">
                <path d="M3 35V13L17 2l14 11v22H3Z" fill="currentColor" />
                <path d="M9 34V16l8-6 8 6v18H9Z" fill="#f6f8f8" />
                <path d="M12 34V18l5-4 5 4v16H12Z" fill="currentColor" opacity=".22" />
              </svg>
            </span>
            <span>Barakah</span>
          </Link>
          <button className="bk-sidebar-desktop-toggle" type="button" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
            <PanelLeftClose size={19} />
          </button>
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

      </aside>

      <div className="bk-main">
        <header className="bk-topbar">
          {sidebarOpen === false && <button className="bk-sidebar-toggle" type="button" aria-label="Open sidebar" aria-expanded={false} onClick={() => setSidebarOpen(true)}><PanelLeftOpen size={19} /></button>}
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
