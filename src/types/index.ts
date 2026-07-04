import { Timestamp } from 'firebase/firestore';

// ─── Property System ───

export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'phone'
  | 'created_time'
  | 'updated_time';

export type SelectOptionColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

export interface SelectOption {
  id: string;
  name: string;
  color: SelectOptionColor;
}

export interface PropertyDefinition {
  name: string;
  type: PropertyType;
  options?: SelectOption[];
  config?: Record<string, unknown>;
  order: number;
}

// ─── View System ───

export type ViewType = 'table' | 'board' | 'list';

export interface SortRule {
  propertyId: string;
  direction: 'asc' | 'desc';
}

export interface FilterRule {
  propertyId: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'gt'
    | 'lt'
    | 'gte'
    | 'lte'
    | 'is_empty'
    | 'is_not_empty';
  value: unknown;
}

export interface ViewDefinition {
  name: string;
  type: ViewType;
  groupBy?: string;
  sortBy?: SortRule[];
  filters?: FilterRule[];
  visibleProperties: string[];
  order: number;
}

// ─── Property Values ───

export type PropertyValue =
  | string
  | number
  | boolean
  | string[]
  | Timestamp
  | null;

// ─── Core Item ───

export type ItemType = 'page' | 'database';

export interface Item {
  id: string;
  title: string;
  icon: string;
  type: ItemType;
  parentId: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any | null; // BlockNote document JSON
  order: number;
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Database-only fields
  properties?: Record<string, PropertyDefinition>;
  views?: Record<string, ViewDefinition>;

  // Row-only fields (when parentId points to a database)
  propertyValues?: Record<string, PropertyValue>;
}

// ─── Convenience Types ───

export type NewItemData = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
