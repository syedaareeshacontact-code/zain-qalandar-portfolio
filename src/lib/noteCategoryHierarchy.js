export function buildNoteCategoryHierarchy(categories) {
  const byId = new Map(categories.map((item) => [item.id, item]));
  const childrenByParent = new Map();

  for (const item of categories) {
    const parentId = item.parentId && byId.has(item.parentId) && item.parentId !== item.id
      ? item.parentId
      : null;
    const siblings = childrenByParent.get(parentId) || [];
    siblings.push(item);
    childrenByParent.set(parentId, siblings);
  }

  const ordered = [];
  const visited = new Set();
  const build = (item, depth = 0) => {
    if (visited.has(item.id)) return null;
    visited.add(item.id);
    const node = { ...item, depth, children: [] };
    ordered.push(node);
    node.children = (childrenByParent.get(item.id) || []).map((child) => build(child, depth + 1)).filter(Boolean);
    return node;
  };

  const roots = (childrenByParent.get(null) || []).map((item) => build(item)).filter(Boolean);
  for (const item of categories) {
    if (!visited.has(item.id)) roots.push(build(item));
  }

  return { roots, ordered, byId };
}

export function getCategoryPath(item, byId) {
  const path = [];
  const seen = new Set();
  let current = item;
  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = byId.get(current.parentId);
  }
  return path;
}

export function getDescendantIds(item, byId) {
  const childrenByParent = new Map();
  for (const category of byId.values()) {
    const siblings = childrenByParent.get(category.parentId) || [];
    siblings.push(category);
    childrenByParent.set(category.parentId, siblings);
  }
  const ids = new Set([item.id]);
  const visit = (parentId) => {
    for (const child of childrenByParent.get(parentId) || []) {
      if (ids.has(child.id)) continue;
      ids.add(child.id);
      visit(child.id);
    }
  };
  visit(item.id);
  return ids;
}
