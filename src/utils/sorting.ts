import type { Item, SortRule } from '@/types';

export function applySortRules(rows: Item[], sortRules: SortRule[]): Item[] {
  if (!sortRules || sortRules.length === 0) {
    return rows;
  }

  // Create a copy of the rows to avoid mutating original state
  const sorted = [...rows];

  sorted.sort((a, b) => {
    for (const rule of sortRules) {
      const { propertyId, direction } = rule;

      let valA = a.propertyValues?.[propertyId];
      let valB = b.propertyValues?.[propertyId];

      // Use title as fallback if propertyId is "title"
      if (propertyId === 'title') {
        valA = a.title;
        valB = b.title;
      }

      if (valA === valB) continue;

      // Handle null/undefined (put empty values at the end)
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Convert Firestore Timestamps to date number if applicable
      const dateA = valA && typeof valA === 'object' && 'toDate' in valA ? (valA as { toDate: () => Date }).toDate().getTime() : null;
      const dateB = valB && typeof valB === 'object' && 'toDate' in valB ? (valB as { toDate: () => Date }).toDate().getTime() : null;

      if (dateA !== null && dateB !== null) {
        valA = dateA;
        valB = dateB;
      }

      // Comparison
      const isAsc = direction === 'asc';

      if (typeof valA === 'string' && typeof valB === 'string') {
        return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return isAsc ? valA - valB : valB - valA;
      }

      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return isAsc
          ? (valA ? 1 : 0) - (valB ? 1 : 0)
          : (valB ? 1 : 0) - (valA ? 1 : 0);
      }

      // Fallback
      const strA = String(valA);
      const strB = String(valB);
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    }

    // Secondary fallback: manual order
    return a.order - b.order;
  });

  return sorted;
}
