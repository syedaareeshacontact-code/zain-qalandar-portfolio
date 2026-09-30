export const NOTE_ICON_KEYS = [
  'code-2', 'terminal', 'file-code-2', 'braces', 'brackets', 'database', 'server', 'cpu',
  'network', 'globe-2', 'workflow', 'git-branch', 'git-merge', 'github', 'bug', 'test-tube-2',
  'package', 'boxes', 'component', 'blocks', 'puzzle', 'rocket', 'bot', 'brain-circuit', 'command',
  'laptop-2', 'monitor-cog', 'settings-2', 'wrench', 'lightbulb', 'book-open', 'folder-code', 'folder', 'library', 'moon-star', 'briefcase-business', 'user-round',
  'notebook-tabs', 'chart-no-axes-combined', 'shield-check', 'lock-keyhole', 'cloud-cog', 'panels-top-left',
];

export const DEFAULT_NOTE_CATEGORIES = [
  { slug: 'study', label: 'Study', description: 'Courses and learning', icon: 'book-open', isDefault: true, order: 10 },
  { slug: 'islamic', label: 'Islamic', description: 'Deen and reflections', icon: 'moon-star', isDefault: true, order: 20 },
  { slug: 'work', label: 'Work', description: 'Projects and research', icon: 'briefcase-business', isDefault: true, order: 30 },
  { slug: 'personal', label: 'Personal', description: 'Private documents', icon: 'user-round', isDefault: true, order: 40 },
  { slug: 'reference', label: 'Reference', description: 'Keep for later', icon: 'library', isDefault: true, order: 50 },
  { slug: 'other', label: 'Other', description: 'Everything else', icon: 'folder', isDefault: true, order: 60 },
];

export function serializeNoteCategory(category) {
  return {
    id: category._id?.toString() || category.id || category.slug,
    value: category.slug,
    label: category.label,
    description: category.description,
    icon: category.icon,
    isDefault: Boolean(category.isDefault),
  };
}
