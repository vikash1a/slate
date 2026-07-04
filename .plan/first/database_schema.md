# Slate — Unified Data Schema (Option B)

> Everything is an **Item**. A page is an item. A database is an item. A database row is an item.

---

## Firestore Data Model

```
/users/{uid}/items/{itemId}
│
├── title: string                           "Sprint Board" / "Meeting Notes"
├── icon: string                            "🏃" / "📝"
├── type: "page" | "database"               What kind of item
├── parentId: string | null                  null = top-level, itemId = row in a database
├── content: JSON | null                     BlockNote document (rich-text body)
├── order: number                            For manual sorting / drag-drop
├── isArchived: boolean                      Soft delete
├── createdAt: Timestamp
├── updatedAt: Timestamp
│
│ ── Only if type === "database" ──
│
├── properties: {                            Schema definition (columns)
│     [propertyId: string]: {
│       name: string                         "Status"
│       type: PropertyType                   "select"
│       options?: SelectOption[]             [{id, name, color}, ...]
│       config?: object                      Type-specific settings
│       order: number                        Column display order
│     }
│   }
│
├── views: {                                 Saved views
│     [viewId: string]: {
│       name: string                         "Kanban"
│       type: ViewType                       "table" | "board" | "list"
│       groupBy?: string                     propertyId (for board view)
│       sortBy?: SortRule[]
│       filters?: FilterRule[]
│       visibleProperties: string[]          propertyId[]
│       order: number
│     }
│   }
│
│ ── Only if parentId points to a database ──
│
└── propertyValues: {                        Values for parent database's properties
      [propertyId: string]: any              Typed by property definition
    }
```

---

## TypeScript Types

```typescript
// ─── Core Item ───

interface Item {
  id: string;
  title: string;
  icon: string;
  type: "page" | "database";
  parentId: string | null;
  content: BlockNoteDocument | null;
  order: number;
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  // Database-only fields
  properties?: Record<string, PropertyDefinition>;
  views?: Record<string, ViewDefinition>;

  // Row-only fields (when parentId → a database)
  propertyValues?: Record<string, PropertyValue>;
}

// ─── Property System ───

type PropertyType =
  | "text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "phone"
  | "created_time"
  | "updated_time";

interface PropertyDefinition {
  name: string;
  type: PropertyType;
  options?: SelectOption[];     // for select / multi_select
  config?: Record<string, any>;
  order: number;
}

interface SelectOption {
  id: string;
  name: string;
  color: "red" | "orange" | "yellow" | "green" | "blue"
       | "purple" | "pink" | "gray";
}

// ─── View System ───

type ViewType = "table" | "board" | "list";

interface ViewDefinition {
  name: string;
  type: ViewType;
  groupBy?: string;               // propertyId (for board)
  sortBy?: SortRule[];
  filters?: FilterRule[];
  visibleProperties: string[];    // propertyId[]
  order: number;
}

interface SortRule {
  propertyId: string;
  direction: "asc" | "desc";
}

interface FilterRule {
  propertyId: string;
  operator: "equals" | "not_equals" | "contains"
          | "gt" | "lt" | "gte" | "lte"
          | "is_empty" | "is_not_empty";
  value: any;
}

// ─── Property Values ───

type PropertyValue =
  | string          // text, select, url, email, phone
  | number          // number
  | boolean         // checkbox
  | string[]        // multi_select
  | Timestamp       // date, created_time, updated_time
  | null;
```

---

## Key Queries

```typescript
// Sidebar — all top-level items (pages + databases)
query(
  collection(db, "users", uid, "items"),
  where("parentId", "==", null),
  where("isArchived", "==", false),
  orderBy("order")
)

// All rows in a database
query(
  collection(db, "users", uid, "items"),
  where("parentId", "==", databaseId),
  where("isArchived", "==", false),
  orderBy("order")
)

// Single item (page, database, or row)
doc(db, "users", uid, "items", itemId)

// Archived items (trash)
query(
  collection(db, "users", uid, "items"),
  where("isArchived", "==", true)
)
```

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/items/{itemId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## How the Sidebar Looks

```
Sidebar (query: parentId == null, isArchived == false)
│
├── 📝 Meeting Notes              { type: "page",     parentId: null }
├── 📝 Project Ideas              { type: "page",     parentId: null }
├── 🏃 Sprint Board               { type: "database", parentId: null }
│     └── (click to open → shows table/board of rows)
│         ├── Implement login      { type: "page", parentId: "sprint-board-id" }
│         ├── Fix navbar bug       { type: "page", parentId: "sprint-board-id" }
│         └── Design settings      { type: "page", parentId: "sprint-board-id" }
├── 📇 CRM                        { type: "database", parentId: null }
└── 📋 Reading List                { type: "database", parentId: null }
```

---

## Example: Creating a Task Board

### 1. User creates a database

```json
{
  "title": "Sprint Board",
  "icon": "🏃",
  "type": "database",
  "parentId": null,
  "properties": {
    "p1": { "name": "Status",       "type": "select",       "options": [
              {"id":"s1","name":"To Do","color":"gray"},
              {"id":"s2","name":"In Progress","color":"blue"},
              {"id":"s3","name":"Done","color":"green"}
            ], "order": 0 },
    "p2": { "name": "Priority",     "type": "select",       "options": [
              {"id":"r1","name":"Low","color":"gray"},
              {"id":"r2","name":"Medium","color":"yellow"},
              {"id":"r3","name":"High","color":"orange"},
              {"id":"r4","name":"Urgent","color":"red"}
            ], "order": 1 },
    "p3": { "name": "Story Points", "type": "number",       "order": 2 },
    "p4": { "name": "Due Date",     "type": "date",         "order": 3 },
    "p5": { "name": "Labels",       "type": "multi_select", "options": [
              {"id":"l1","name":"frontend","color":"blue"},
              {"id":"l2","name":"backend","color":"purple"},
              {"id":"l3","name":"bug","color":"red"}
            ], "order": 4 }
  },
  "views": {
    "v1": { "name": "Board",  "type": "board", "groupBy": "p1", "visibleProperties": ["p2","p3","p4"], "order": 0 },
    "v2": { "name": "Table",  "type": "table", "sortBy": [{"propertyId":"p4","direction":"asc"}], "visibleProperties": ["p1","p2","p3","p4","p5"], "order": 1 }
  }
}
```

### 2. User adds a row (task)

```json
{
  "title": "Implement Google login",
  "icon": "",
  "type": "page",
  "parentId": "sprint-board-id",
  "propertyValues": {
    "p1": "In Progress",
    "p2": "High",
    "p3": 5,
    "p4": "2026-07-15T00:00:00Z",
    "p5": ["frontend"]
  },
  "content": null
}
```

### 3. User clicks the row → opens as a full page with BlockNote editor
