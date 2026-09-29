'use client';

import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  CloudSun,
  X,
} from 'lucide-react';

const navigation = [
  { label: 'Overview', icon: LayoutDashboard, active: true },
  { label: 'Projects', icon: FolderKanban, badge: '8' },
  { label: 'Messages', icon: MessageSquare, badge: '3' },
  { label: 'Documents', icon: FileText },
  { label: 'Prayer Routine', icon: Sunrise, href: '/dashboard' },
];

const workspaceLinks = [
  { label: 'Portfolio', icon: BriefcaseBusiness },
  { label: 'Settings', icon: Settings },
];

const projects = [
  { name: 'Read Al Quran', tag: 'Product', progress: 86, color: 'mint', updated: 'Updated 2h ago' },
  { name: 'ERPfy', tag: 'Dashboard', progress: 64, color: 'cyan', updated: 'Updated yesterday' },
  { name: 'NeighborLend', tag: 'Platform', progress: 41, color: 'warm', updated: 'Updated Sep 18' },
];

const tasks = [
  { title: 'Review landing-page refinements', project: 'Read Al Quran', due: 'Today, 4:00 PM', state: 'Review' },
  { title: 'Prepare ERPfy dashboard handoff', project: 'ERPfy', due: 'Tomorrow', state: 'In progress' },
  { title: 'Respond to new project enquiry', project: 'Portfolio', due: 'Friday', state: 'New' },
];

function SidebarNav({ items, activeLabel, showBadges = true }) {
  return items.map(({ label, icon: Icon, active, badge, href }) => {
    const isActive = activeLabel ? label === activeLabel : active;
    const content = <>
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
      {badge && showBadges && <b>{badge}</b>}
    </>;

    return href ? <a className={`dashboard-nav-item${isActive ? ' is-active' : ''}`} href={href} key={label}>{content}</a> : <button className={`dashboard-nav-item${isActive ? ' is-active' : ''}`} type="button" key={label}>{content}</button>;
  });
}

const prayerRoutine = [
  { range: 'Fajr → Dhuhr', title: 'Priority 1 — Deep Work', description: 'Main tasks, coding, study, important work.', icon: Sunrise, tone: 'is-deep-work' },
  { range: 'Dhuhr → Asr', title: 'Priority 2 — Light Work', description: 'Small tasks, revisions, emails, easy work.', icon: Sun, tone: 'is-light-work' },
  { range: 'Asr → Maghrib', title: 'No Work', description: 'Break, rest, walk, family.', icon: CloudSun, tone: 'is-rest' },
  { range: 'Maghrib → Isha', title: 'Review', description: 'Review the day and check pending work.', icon: Sunset, tone: 'is-review' },
  { range: 'Isha → 10:00 PM', title: 'Planning & Decisions', description: 'Decide what to work on tomorrow, what not to do, and set priorities.', icon: Sparkles, tone: 'is-planning' },
];

function PrayerRoutineContent() {
  return (
    <div className="prayer-routine-content">
      <section className="prayer-routine-intro" aria-labelledby="prayer-routine-title">
        <p className="dashboard-kicker"><span />Personal discipline system</p>
        <h1 id="prayer-routine-title">Prayer Routine<span>.</span></h1>
        <p>A prayer-led daily work rhythm, designed to protect deep focus, leave space for rest, and end each day with clear intentions.</p>
      </section>

      <section className="prayer-routine-flow" aria-label="Prayer-based daily work routine">
        {prayerRoutine.map(({ range, title, description, icon: Icon, tone }, index) => (
          <article className={`prayer-routine-card ${tone}`} key={range}>
            <div className="prayer-routine-card-top"><span className="prayer-routine-order">0{index + 1}</span><span className="prayer-routine-icon"><Icon size={19} strokeWidth={1.7} /></span></div>
            <p className="prayer-routine-range">{range}</p>
            <h2>{title}</h2>
            <p className="prayer-routine-description">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function DashboardWorkspace({ view = 'overview' }) {
  const isPrayerRoutine = view === 'prayer';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 781px)');
    const syncSidebarForViewport = (event) => setSidebarOpen(event.matches);

    syncSidebarForViewport(desktop);
    desktop.addEventListener('change', syncSidebarForViewport);
    return () => desktop.removeEventListener('change', syncSidebarForViewport);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((open) => !open);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className={`dashboard-shell${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
      <button
        className="dashboard-backdrop"
        type="button"
        aria-label="Close dashboard sidebar"
        onClick={closeSidebar}
      />
      <aside className="dashboard-sidebar" aria-label="Dashboard navigation">
        <div className="dashboard-sidebar-top">
          <a className="dashboard-brand" href="/" aria-label="Return to portfolio home">
            <span className="dashboard-brand-mark">ZQ</span>
            <span className="dashboard-brand-copy"><strong>Zain Qalandar</strong><small>Workspace</small></span>
          </a>
          <button className="dashboard-mobile-close" type="button" aria-label="Close sidebar" onClick={closeSidebar}><X size={19} /></button>
        </div>

        <nav className="dashboard-navigation">
          <p className="dashboard-nav-label">Menu</p>
          <SidebarNav items={navigation} activeLabel={isPrayerRoutine ? 'Prayer Routine' : 'Overview'} showBadges={!isPrayerRoutine} />
          <p className="dashboard-nav-label dashboard-nav-label-space">Workspace</p>
          <SidebarNav items={workspaceLinks} />
        </nav>

        {!isPrayerRoutine && <div className="dashboard-side-card">
          <span className="dashboard-side-card-icon"><Sparkles size={17} /></span>
          <div><strong>Keep shipping</strong><p>2 tasks are ready for your review.</p></div>
          <button type="button" aria-label="View pending tasks"><ArrowUpRight size={15} /></button>
        </div>}

        <div className="dashboard-user">
          <span className="dashboard-avatar">ZQ</span>
          <div><strong>Syed Zain</strong><small>Full-stack developer</small></div>
          <MoreHorizontal size={18} aria-hidden="true" />
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              className="dashboard-sidebar-toggle"
              type="button"
              aria-label={sidebarOpen ? 'Collapse dashboard sidebar' : 'Open dashboard sidebar'}
              aria-expanded={sidebarOpen}
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
            </button>
            <button className="dashboard-menu-button" type="button" aria-label="Open dashboard sidebar" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div className="dashboard-breadcrumb"><span>Workspace</span><ChevronRight size={14} /><strong>{isPrayerRoutine ? 'Prayer Routine' : 'Overview'}</strong></div>
          </div>
          {!isPrayerRoutine && <div className="dashboard-topbar-actions">
            <label className="dashboard-search"><Search size={17} /><span className="sr-only">Search workspace</span><input type="search" placeholder="Search" /></label>
            <button className="dashboard-icon-button has-notification" type="button" aria-label="View notifications"><Bell size={18} /></button>
            <button className="dashboard-add-button" type="button"><Plus size={17} /> <span>New project</span></button>
          </div>}
        </header>

        <main className="dashboard-content" id="main-content">
          {isPrayerRoutine ? <PrayerRoutineContent /> : <>
          <section className="dashboard-welcome" aria-labelledby="dashboard-title">
            <div>
              <p className="dashboard-kicker"><span />Monday, September 29</p>
              <h1 id="dashboard-title">Good morning, Zain<span>.</span></h1>
              <p>Here’s what’s moving across your workspace today.</p>
            </div>
            <button className="dashboard-outline-button" type="button">View portfolio <ArrowUpRight size={16} /></button>
          </section>

          <section className="dashboard-metrics" aria-label="Portfolio statistics">
            <article className="dashboard-metric-card"><div className="dashboard-metric-icon icon-green"><FolderKanban size={19} /></div><div><p>Active projects</p><strong>08</strong><small><i>+2</i> this month</small></div><span className="dashboard-spark spark-green">╱╲╱╲</span></article>
            <article className="dashboard-metric-card"><div className="dashboard-metric-icon icon-cyan"><MessageSquare size={19} /></div><div><p>New enquiries</p><strong>14</strong><small><i>+18%</i> from last month</small></div><span className="dashboard-spark spark-cyan">╱╲╱╲</span></article>
            <article className="dashboard-metric-card"><div className="dashboard-metric-icon icon-warm"><CircleCheck size={19} /></div><div><p>Tasks complete</p><strong>72<span>%</span></strong><small><i>18</i> of 25 this week</small></div><span className="dashboard-progress-ring">72</span></article>
          </section>

          <section className="dashboard-focus-grid">
            <article className="dashboard-activity-card">
              <div className="dashboard-card-heading"><div><p className="dashboard-card-eyebrow">Performance</p><h2>Weekly momentum</h2></div><button type="button" aria-label="More performance options"><MoreHorizontal size={20} /></button></div>
              <div className="dashboard-chart-summary"><div><strong>42h <small>18m</small></strong><span>Focused work</span></div><p><i>↗ 12.5%</i> vs last week</p></div>
              <div className="dashboard-chart" aria-label="Weekly focused work chart">
                {[42, 58, 46, 72, 61, 87, 69].map((height, index) => <span style={{ '--bar-height': `${height}%` }} key={index} />)}
              </div>
              <div className="dashboard-chart-days"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </article>

            <article className="dashboard-priority-card">
              <div className="dashboard-card-heading"><div><p className="dashboard-card-eyebrow">Priority focus</p><h2>Today’s plan</h2></div><span className="dashboard-priority-count">3 items</span></div>
              <div className="dashboard-priority-list">
                <div><span className="priority-dot dot-green" /><div><strong>Finalize portfolio dashboard</strong><small>Design system & responsive states</small></div><Clock3 size={16} /><time>10:30</time></div>
                <div><span className="priority-dot dot-cyan" /><div><strong>Client feedback call</strong><small>Propteq marketing team</small></div><Clock3 size={16} /><time>14:00</time></div>
                <div><span className="priority-dot dot-warm" /><div><strong>Review pull requests</strong><small>ERPfy workspace</small></div><Clock3 size={16} /><time>16:30</time></div>
              </div>
              <button className="dashboard-text-button" type="button">Open task board <ArrowUpRight size={15} /></button>
            </article>
          </section>

          <section className="dashboard-lower-grid">
            <article className="dashboard-table-card">
              <div className="dashboard-card-heading"><div><p className="dashboard-card-eyebrow">In progress</p><h2>Recent projects</h2></div><button className="dashboard-text-button" type="button">View all <ArrowUpRight size={15} /></button></div>
              <div className="dashboard-project-list">
                {projects.map((project) => <div className="dashboard-project-row" key={project.name}>
                  <span className={`dashboard-project-symbol ${project.color}`}>{project.name.slice(0, 2).toUpperCase()}</span>
                  <div className="dashboard-project-name"><strong>{project.name}</strong><small>{project.tag} · {project.updated}</small></div>
                  <div className="dashboard-project-progress"><span><i style={{ width: `${project.progress}%` }} /></span><small>{project.progress}%</small></div>
                  <button type="button" aria-label={`Open ${project.name}`}><ChevronRight size={17} /></button>
                </div>)}
              </div>
            </article>

            <article className="dashboard-tasks-card">
              <div className="dashboard-card-heading"><div><p className="dashboard-card-eyebrow">Up next</p><h2>Tasks</h2></div><button type="button" aria-label="More task options"><MoreHorizontal size={20} /></button></div>
              <div className="dashboard-task-list">
                {tasks.map((task) => <label className="dashboard-task" key={task.title}><input type="checkbox" /><span className="dashboard-task-check"><CircleCheck size={16} /></span><span><strong>{task.title}</strong><small>{task.project} · {task.due}</small></span><em>{task.state}</em></label>)}
              </div>
            </article>
          </section>
          </>}
        </main>
      </div>
    </div>
  );
}
