'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  LayoutGrid,
  CheckSquare,
  PanelLeftClose,
  NotebookPen,
  SlidersHorizontal,
  Target,
  X,
} from 'lucide-react';
import MongoDBUsageSidebar from './MongoDBUsageSidebar';
import DashboardHeader from './DashboardHeader';

const SIDEBAR_STORAGE_KEY = 'barakah.sidebar.open';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: CalendarDays, shortcut: 'Alt ⇧ D', aliases: ['/dashboard/prayer-routine'] },
  { href: '/dashboard/overview', label: 'Workspace', icon: LayoutGrid },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare, shortcut: 'Alt ⇧ T' },
  { href: '/dashboard/notes', label: 'Notes', icon: NotebookPen, shortcut: 'Alt ⇧ N' },
  { href: '/dashboard/goals', label: 'Goals', icon: Target, shortcut: 'Alt ⇧ G' },
  { href: '/dashboard/manage', label: 'Manage', icon: SlidersHorizontal },
  { href: '/dashboard/ahd-nama', label: 'Ahd Nama', iconOnly: true, premium: true, premiumIcon: '/images/barakah/perimum icon/ahd_nama_icon.png' },
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(null);
  const [topbarVisible, setTopbarVisible] = useState(true);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try { setDark(localStorage.getItem('barakah.theme.v1') !== 'light'); } catch { /* Keep the default theme. */ }
    const desktop = window.matchMedia('(min-width: 781px)');
    let storedPreference = null;
    try {
      storedPreference = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    } catch {
      storedPreference = null;
    }

    setSidebarOpen(desktop.matches ? storedPreference !== 'closed' : false);

    const syncSidebarForViewport = (event) => {
      if (!event.matches) {
        setSidebarOpen(false);
        return;
      }

      try {
        setSidebarOpen(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'closed');
      } catch {
        setSidebarOpen(true);
      }
    };

    desktop.addEventListener('change', syncSidebarForViewport);
    return () => desktop.removeEventListener('change', syncSidebarForViewport);
  }, []);

  useEffect(() => {
    if (sidebarOpen === null || !window.matchMedia('(min-width: 781px)').matches) return;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarOpen ? 'open' : 'closed');
    } catch {
      // Keep the sidebar usable if storage is unavailable in private browsing.
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (window.matchMedia('(max-width: 780px)').matches) setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const navigateWithShortcut = (event) => {
      if (event.ctrlKey || event.metaKey || !event.altKey || !event.shiftKey || event.repeat) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName) || event.target?.isContentEditable) return;

      const shortcutRoutes = { d: '/dashboard', t: '/dashboard/tasks', n: '/dashboard/notes', g: '/dashboard/goals' };
      const route = shortcutRoutes[event.key.toLowerCase()];
      if (!route) return;

      event.preventDefault();
      router.push(route);
    };

    document.addEventListener('keydown', navigateWithShortcut);
    return () => document.removeEventListener('keydown', navigateWithShortcut);
  }, [router]);

  useEffect(() => {
    const toggleTopbarWithShortcut = (event) => {
      if (event.ctrlKey || event.metaKey || !event.altKey || !event.shiftKey || event.key.toLowerCase() !== 'h') return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName) || event.target?.isContentEditable) return;

      event.preventDefault();
      setTopbarVisible((visible) => !visible);
    };

    document.addEventListener('keydown', toggleTopbarWithShortcut);
    return () => document.removeEventListener('keydown', toggleTopbarWithShortcut);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  useEffect(() => {
    const toggleSidebarWithShortcut = (event) => {
      if (!event.ctrlKey || event.metaKey || event.altKey || event.key.toLowerCase() !== 'b') return;

      event.preventDefault();
      setSidebarOpen((current) => (current === null ? window.matchMedia('(min-width: 781px)').matches : !current));
    };

    document.addEventListener('keydown', toggleSidebarWithShortcut);
    return () => document.removeEventListener('keydown', toggleSidebarWithShortcut);
  }, []);

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
                className={`bk-nav-item${active ? ' is-active' : ''}${item.premium ? ' is-premium' : ''}${item.iconOnly ? ' is-icon-only' : ''}`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
                title={item.iconOnly ? item.label : undefined}
              >
                {item.premiumIcon ? (
                  <span className="bk-nav-premium-icon" aria-hidden="true">
                    <Image src={item.premiumIcon} alt="" width={30} height={30} />
                  </span>
                ) : <Icon size={18} strokeWidth={1.85} />}
                {!item.iconOnly && <span>{item.label}</span>}
                {item.shortcut && <kbd className="bk-nav-shortcut" aria-label={`Keyboard shortcut ${item.shortcut}`}>{item.shortcut}</kbd>}
              </Link>
            );
          })}
        </nav>

        <MongoDBUsageSidebar />

      </aside>

      <div className="bk-main">
        {topbarVisible && <DashboardHeader sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} dark={dark} onToggleTheme={() => {
          const nextDark = !dark;
          setDark(nextDark);
          try { localStorage.setItem('barakah.theme.v1', nextDark ? 'dark' : 'light'); } catch { /* Storage is optional. */ }
        }} />}

        <main className="bk-content" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
