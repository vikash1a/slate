import type { Item, FilterRule } from '@/types';

export function applyFilterRules(rows: Item[], filterRules: FilterRule[]): Item[] {
  if (!filterRules || filterRules.length === 0) {
    return rows;
  }

  return rows.filter((row) => {
    return filterRules.every((rule) => {
      const { propertyId, operator, value } = rule;

      let val = row.propertyValues?.[propertyId];

      if (propertyId === 'title') {
        val = row.title;
      }

      // Convert Timestamp to date string if applicable
      if (val && typeof val === 'object' && 'toDate' in val) {
        val = (val as { toDate: () => Date }).toDate().toISOString().split('T')[0];
      }

      const strVal = val != null ? String(val).toLowerCase() : '';
      const filterVal = value != null ? String(value).toLowerCase() : '';

      switch (operator) {
        case 'equals':
          if (Array.isArray(val)) {
            return val.some((v) => String(v).toLowerCase() === filterVal);
          }
          return strVal === filterVal;

        case 'not_equals':
          if (Array.isArray(val)) {
            return !val.some((v) => String(v).toLowerCase() === filterVal);
          }
          return strVal !== filterVal;

        case 'contains':
          if (Array.isArray(val)) {
            return val.some((v) => String(v).toLowerCase().includes(filterVal));
          }
          return strVal.includes(filterVal);

        case 'gt':
          return Number(val) > Number(value);

        case 'lt':
          return Number(val) < Number(value);

        case 'gte':
          return Number(val) >= Number(value);

        case 'lte':
          return Number(val) <= Number(value);

        case 'is_empty':
          return val == null || val === '' || (Array.isArray(val) && val.length === 0);

        case 'is_not_empty':
          return val != null && val !== '' && (!Array.isArray(val) || val.length > 0);

        default:
          return true;
      }
    });
  });
}
