import { profile } from './profile';

export const DEFAULT_PROJECT_CATEGORIES = [
  { id: '700000000000000000000001', name: 'MERN' },
  { id: '700000000000000000000002', name: 'Next.js' },
  { id: '700000000000000000000003', name: 'React' },
  { id: '700000000000000000000004', name: 'Python' },
];

export function getDefaultPortfolioWorkspace() {
  const existing = profile.projects.map((project, index) => ({
    id: `71000000${String(index + 1).padStart(16, '0')}`,
    title: project.title,
    description: project.description,
    categoryId: DEFAULT_PROJECT_CATEGORIES[1].id,
    skills: project.tech,
    imageUrl: project.image || '',
    liveUrl: project.links.live || '',
    codeUrl: project.links.repo || '',
    date: '',
    featured: Boolean(project.featured),
    eyebrow: project.eyebrow,
    highlights: project.highlights || [],
    isDemo: false,
  }));
  const examples = [
    { title: 'ShopSphere', categoryId: DEFAULT_PROJECT_CATEGORIES[0].id, description: 'Demo project: a full-stack storefront with product discovery, a shopping cart, secure accounts, and an order management dashboard.', skills: ['MongoDB', 'Express', 'React', 'Node.js', 'Redux'], date: '2026-09-18', imageUrl: '/images/projects/demo-commerce.svg' },
    { title: 'SprintBoard', categoryId: DEFAULT_PROJECT_CATEGORIES[0].id, description: 'Demo project: a team task workspace with kanban boards, project milestones, and real-time collaboration.', skills: ['React', 'Node.js', 'MongoDB', 'Socket.io'], date: '2026-08-25', imageUrl: '' },
    { title: 'Creator Journal', categoryId: DEFAULT_PROJECT_CATEGORIES[1].id, description: 'Demo project: a publishing platform with a content editor, topic collections, responsive article pages, and fast search.', skills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'MDX'], date: '2026-08-10', imageUrl: '/images/projects/demo-journal.svg' },
    { title: 'Weatherly', categoryId: DEFAULT_PROJECT_CATEGORIES[2].id, description: 'Demo project: a clean weather dashboard with city search, hourly forecasts, and saved locations. This example uses the default project image.', skills: ['React', 'REST API', 'CSS'], date: '2026-07-12', imageUrl: '' },
    { title: 'Data Lens', categoryId: DEFAULT_PROJECT_CATEGORIES[3].id, description: 'Demo project: an analytics workspace that turns datasets into useful charts, summary reports, and exportable insights.', skills: ['Python', 'FastAPI', 'Pandas', 'PostgreSQL'], date: '2026-06-22', imageUrl: '/images/projects/demo-analytics.svg' },
  ].map((project, index) => ({
    ...project, id: `72000000${String(index + 1).padStart(16, '0')}`,
    liveUrl: '', codeUrl: '', featured: false, eyebrow: '', highlights: [], isDemo: true,
  }));
  return { categories: DEFAULT_PROJECT_CATEGORIES, projects: [...existing, ...examples] };
}
