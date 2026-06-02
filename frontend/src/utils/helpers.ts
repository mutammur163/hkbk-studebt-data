import type { Category } from '../types';

export function getCategoryColor(cat: Category): string {
  switch (cat) {
    case 'GM': return 'badge-gm';
    case 'SNQ': return 'badge-snq';
    case 'SC': case 'ST': return 'badge-sc';
    case 'OBC-A': case 'OBC-B': return 'badge-obc-a';
    default: return 'badge-gm';
  }
}

export function highlightMatch(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!query.trim()) return null;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return null;
  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length),
  };
}
