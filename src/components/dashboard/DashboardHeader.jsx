'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Bell, CalendarDays, CheckSquare, ChevronDown, Clock3, ExternalLink, LayoutGrid, Menu, Moon, NotebookPen, PanelLeftOpen, Search, SlidersHorizontal, Sun, Target } from 'lucide-react';
import { usePrayer } from '@/context/prayer-context';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchTaskWorkspace, isTaskWorkspaceStale } from '@/store/features/tasks/tasksSlice';
import { getPrayerDateKey } from '@/lib/prayerTimes';
import PrayerNow from './PrayerNow';

const PAGES = [
  { href: '/dashboard', label: 'Prayer Routine', description: 'Daily rhythm, prayer times, and intention', icon: CalendarDays, keywords: 'dashboard namaz salah prayer routine today' },
  { href: '/dashboard/overview', label: 'Workspace', description: 'Focus timer, habits, momentum, and daily reflection', icon: LayoutGrid, keywords: 'overview focus timer pomodoro habits streaks momentum statistics reflection journal capture widgets' },
  { href: '/dashboard/tasks', label: 'Tasks', description: 'Your to-dos, lists, and priorities', icon: CheckSquare, keywords: 'work todo task lists' },
  { href: '/dashboard/notes', label: 'Notes', description: 'Your PDF library and folders', icon: NotebookPen, keywords: 'pdf documents notes files learning' },
  { href: '/dashboard/goals', label: 'Goals', description: 'Track the progress that matters', icon: Target, keywords: 'goals progress targets' },
  { href: '/dashboard/manage', label: 'Manage', description: 'Portfolio projects, categories, CV, and storage', icon: SlidersHorizontal, keywords: 'manage settings storage cloudinary portfolio projects categories stacks code' },
  { href: '/dashboard/ahd-nama', label: 'Ahd Nama', description: 'Return to your personal commitments', icon: NotebookPen, keywords: 'ahd nama promise pledges' },
];

export default function DashboardHeader({ sidebarOpen, onOpenSidebar, dark, onToggleTheme }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { live, now, location, data } = usePrayer();
  const { tasks, status, lastFetchedAt } = useAppSelector((state) => state.tasks);
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const triggerRef = useRef(null);
  const resultsRef = useRef(null);
  const results = PAGES.filter((page) => `${page.label} ${page.keywords}`.toLowerCase().includes(query.trim().toLowerCase()));
  // Task due dates belong to the existing Pakistan-based workspace, independent of prayer-city preference.
  const taskDate = now ? getPrayerDateKey(undefined, new Date(now)) : null;
  const pending = tasks.filter((task) => !task.completed && task.dueDate === taskDate).length;
  const overdue = tasks.filter((task) => !task.completed && task.dueDate && task.dueDate < taskDate).length;
  const soon = Boolean(live && live.next.time - now <= 15 * 60_000);
  const date = now ? new Intl.DateTimeFormat('en-US', { timeZone: location.timezone, weekday: 'short', day: 'numeric', month: 'short' }).format(now) : 'Your day, with intention';
  const clock = now ? new Intl.DateTimeFormat('en-US', { timeZone: location.timezone, hour: 'numeric', minute: '2-digit', hour12: true }).format(now) : '—';

  useEffect(() => {
    setPanel(null);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    if (panel === 'notifications' && isTaskWorkspaceStale({ status, lastFetchedAt })) void dispatch(fetchTaskWorkspace());
  }, [dispatch, panel, status, lastFetchedAt]);

  useEffect(() => {
    const closeOutside = (event) => { if (!rootRef.current?.contains(event.target)) setPanel(null); };
    const handleKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPanel('search');
        searchRef.current?.focus();
      }
      if (event.key === 'Escape' && panel) {
        event.preventDefault();
        setPanel(null);
        (panel === 'search' ? searchRef.current : triggerRef.current)?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', handleKey, true);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', handleKey, true); };
  }, [panel]);

  function togglePanel(name, event) {
    triggerRef.current = event.currentTarget;
    setPanel((value) => value === name ? null : name);
  }

  return (
    <header className="bk-topbar bk-dynamic-topbar" ref={rootRef}>
      {sidebarOpen === false && <button className="bk-sidebar-toggle" type="button" aria-label="Open sidebar" aria-expanded={false} onClick={onOpenSidebar}><PanelLeftOpen size={19} /></button>}
      <button className="bk-menu" type="button" aria-label="Open sidebar" onClick={onOpenSidebar}><Menu size={20} /></button>
      <div className="bk-header-date"><span>{date}</span><small>{clock} · {location.city}</small></div>
      <div className="bk-header-search-wrap">
        <form role="search" className="bk-search" onSubmit={(event) => { event.preventDefault(); if (results[0]) { setPanel(null); searchRef.current?.blur(); router.push(results[0].href); } }}>
          <Search size={16} aria-hidden="true" /><label className="sr-only" htmlFor="dashboard-search">Find a page</label>
          <input ref={searchRef} id="dashboard-search" type="search" placeholder="Find a page…" autoComplete="off" value={query} onFocus={() => setPanel('search')} onChange={(event) => { setQuery(event.target.value); setPanel('search'); }} aria-controls={panel === 'search' ? "dashboard-search-results" : undefined} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); resultsRef.current?.querySelector('a')?.focus(); } }} /><kbd>⌘ / Ctrl K</kbd>
        </form>
        {panel === 'search' && <div id="dashboard-search-results" className="bk-header-popover bk-search-results" ref={resultsRef}><span className="bk-section-kicker">{query ? 'MATCHING PAGES' : 'JUMP TO A SPACE'}</span>{results.map(({ href, label, description, icon: Icon }) => <Link href={href} key={href} onClick={() => { setPanel(null); searchRef.current?.blur(); }}><Icon size={17} aria-hidden="true" /><span><strong>{label}</strong><small>{description}</small></span><ArrowUpRight size={14} aria-hidden="true" /></Link>)}{!results.length && <p role="status">No pages match “{query}”. Try tasks, notes, goals, or prayer.</p>}<small className="bk-search-hint">Enter to open the first result · Esc to close</small></div>}
      </div>
      <div className="bk-top-actions">
        <div className="bk-header-panel-anchor bk-prayer-anchor">
          <button className={`bk-prayer-pill${soon ? ' is-soon' : ''}`} type="button" aria-label={live ? `${live.label}. ${live.next.name} in ${live.countdown}. Show prayer times` : 'Show prayer times'} aria-expanded={panel === 'prayer'} aria-controls="header-prayer-panel" onClick={(event) => togglePanel('prayer', event)}><span className="bk-live-dot" /><span><strong>{live?.label || 'Prayer times'}</strong><small>{live ? `${live.next.name} in ${live.countdown}` : location.city}</small></span><ChevronDown size={13} aria-hidden="true" /></button>
          {panel === 'prayer' && <div className="bk-header-popover bk-prayer-popover" id="header-prayer-panel"><PrayerNow compact /></div>}
        </div>
        <button className="bk-icon-btn" type="button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={onToggleTheme}>{dark ? <Moon size={18} /> : <Sun size={18} />}</button>
        <div className="bk-header-panel-anchor">
          <button className={`bk-icon-btn${soon || overdue > 0 ? ' has-alert' : ''}`} type="button" aria-label="Notifications" aria-expanded={panel === 'notifications'} aria-controls="header-notifications" onClick={(event) => togglePanel('notifications', event)}><Bell size={18} /></button>
          {panel === 'notifications' && <section className="bk-header-popover bk-notification-popover" id="header-notifications" aria-label="Your reminders"><div className="bk-popover-heading"><h2>Your reminders</h2><span>Live overview</span></div><Link className="bk-notice" href="/dashboard" onClick={() => setPanel(null)}><Clock3 size={18} /><div><strong>{live ? `${live.next.name} in ${live.countdown}` : 'Prayer schedule'}</strong><p>{live ? soon ? 'A gentle reminder to wrap up and prepare for prayer.' : 'Let the next prayer give your day a natural pause.' : 'Open your prayer schedule to check today’s times.'}</p></div></Link>{status === 'succeeded' || lastFetchedAt ? <><Link className="bk-notice" href="/dashboard/tasks" onClick={() => setPanel(null)}><CheckSquare size={18} /><div><strong>{pending ? `${pending} task${pending === 1 ? '' : 's'} due today` : 'No tasks due today'}</strong><p>{overdue ? `${overdue} overdue task${overdue === 1 ? '' : 's'} could use your attention.` : 'Choose one priority and keep the day manageable.'}</p></div></Link>{status === 'failed' && <p className="bk-popover-note">Task refresh failed. Showing the last loaded overview.</p>}</> : <p className="bk-popover-note" role="status">{status === 'failed' ? 'Tasks could not be loaded.' : 'Loading your task reminders…'}{status === 'failed' && <button type="button" onClick={() => void dispatch(fetchTaskWorkspace())}>Retry</button>}</p>}<span className="bk-popover-note">Updated from your prayer schedule and task list.</span></section>}
        </div>
        <div className="bk-header-panel-anchor">
          <button className="bk-user" type="button" aria-label="Open profile and shortcuts" aria-expanded={panel === 'profile'} aria-controls="header-profile" onClick={(event) => togglePanel('profile', event)}><span className="bk-avatar"><Image src="/images/barakah/zain-avatar.png" alt="" width={34} height={34} /></span><span className="bk-user-copy"><strong>Zain Qalandar</strong><small>With intention, every day</small></span><ChevronDown size={15} /></button>
          {panel === 'profile' && <section className="bk-header-popover bk-profile-popover" id="header-profile" aria-label="Profile and shortcuts"><div className="bk-popover-heading"><h2>Assalamu alaikum, Zain</h2><span>{data?.hijri || date}</span></div><Link href="/" onClick={() => setPanel(null)}><ExternalLink size={15} />Open portfolio<ArrowUpRight size={13} /></Link><Link href="/dashboard/manage" onClick={() => setPanel(null)}><SlidersHorizontal size={15} />Manage workspace<ArrowUpRight size={13} /></Link><div className="bk-shortcuts"><span className="bk-section-kicker">MAKE YOURSELF AT HOME</span><p>Find a page<kbd>Ctrl / ⌘ K</kbd></p><p>Toggle sidebar<kbd>Ctrl B</kbd></p><p>Toggle header<kbd>Alt ⇧ H</kbd></p><p>Tasks / Notes / Goals<kbd>Alt ⇧ T / N / G</kbd></p></div></section>}
        </div>
      </div>
    </header>
  );
}
