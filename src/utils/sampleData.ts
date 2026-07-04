import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

const SAMPLE_PAGE_CONTENT = [
  {
    id: 'b1',
    type: 'heading',
    props: { level: 1, textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [{ type: 'text', text: 'Welcome to Slate! 🚀', styles: {} }],
    children: [],
  },
  {
    id: 'b2',
    type: 'paragraph',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [
      {
        type: 'text',
        text: 'This is a personal workspace for your notes, tasks, and custom databases.',
        styles: {},
      },
    ],
    children: [],
  },
  {
    id: 'b3',
    type: 'heading',
    props: { level: 2, textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [{ type: 'text', text: 'Quick Features Guide:', styles: {} }],
    children: [],
  },
  {
    id: 'b4',
    type: 'bulletListItem',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [
      { type: 'text', text: 'Slash Commands: ', styles: { bold: true } },
      { type: 'text', text: 'Type ', styles: {} },
      { type: 'text', text: '/', styles: { code: true } },
      { type: 'text', text: ' on any empty line to open formatting choices.', styles: {} },
    ],
    children: [],
  },
  {
    id: 'b5',
    type: 'bulletListItem',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [
      { type: 'text', text: 'Generic Databases: ', styles: { bold: true } },
      { type: 'text', text: 'Build spreadsheet boards or Kanban boards with custom properties.', styles: {} },
    ],
    children: [],
  },
  {
    id: 'b6',
    type: 'bulletListItem',
    props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
    content: [
      { type: 'text', text: 'Drag and Drop: ', styles: { bold: true } },
      { type: 'text', text: 'Easily rearrange blocks here or drag cards between Kanban board columns.', styles: {} },
    ],
    children: [],
  },
];

export async function createSampleData(uid: string): Promise<void> {
  const itemsColl = collection(db, 'users', uid, 'items');

  // 1. Create Sample Page
  await addDoc(itemsColl, {
    title: 'Welcome to Slate',
    icon: '🚀',
    type: 'page',
    parentId: null,
    content: SAMPLE_PAGE_CONTENT,
    order: Date.now() - 10000,
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2. Create Sample Database (Sprint Board)
  const dbDocRef = await addDoc(itemsColl, {
    title: 'Sprint Board',
    icon: '🏃',
    type: 'database',
    parentId: null,
    content: null,
    order: Date.now(),
    isArchived: false,
    properties: {
      p_status: {
        name: 'Status',
        type: 'select',
        options: [
          { id: 'o_todo', name: 'To Do', color: 'gray' },
          { id: 'o_progress', name: 'In Progress', color: 'blue' },
          { id: 'o_done', name: 'Done', color: 'green' },
        ],
        order: 0,
      },
      p_priority: {
        name: 'Priority',
        type: 'select',
        options: [
          { id: 'o_low', name: 'Low', color: 'gray' },
          { id: 'o_med', name: 'Medium', color: 'yellow' },
          { id: 'o_high', name: 'High', color: 'orange' },
          { id: 'o_urg', name: 'Urgent', color: 'red' },
        ],
        order: 1,
      },
      p_points: {
        name: 'Story Points',
        type: 'number',
        order: 2,
      },
      p_date: {
        name: 'Due Date',
        type: 'date',
        order: 3,
      },
    },
    views: {
      v_board: {
        name: 'Kanban Board',
        type: 'board',
        groupBy: 'p_status',
        visibleProperties: ['p_priority', 'p_points'],
        order: 0,
      },
      v_table: {
        name: 'Table view',
        type: 'table',
        visibleProperties: ['p_status', 'p_priority', 'p_points', 'p_date'],
        order: 1,
      },
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const databaseId = dbDocRef.id;

  // 3. Create Sample Rows inside the Database
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await addDoc(itemsColl, {
    title: 'Design landing page mockup',
    icon: '🎨',
    type: 'page',
    parentId: databaseId,
    order: Date.now() + 10,
    isArchived: false,
    propertyValues: {
      p_status: 'Done',
      p_priority: 'High',
      p_points: 3,
      p_date: new Date(),
    },
    content: [
      {
        id: 'r1_b1',
        type: 'paragraph',
        props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
        content: [{ type: 'text', text: 'This task is completed. Mockup files are attached in Figma.', styles: {} }],
        children: [],
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(itemsColl, {
    title: 'Implement Google Sign-In',
    icon: '🔑',
    type: 'page',
    parentId: databaseId,
    order: Date.now() + 20,
    isArchived: false,
    propertyValues: {
      p_status: 'In Progress',
      p_priority: 'Urgent',
      p_points: 5,
      p_date: tomorrow,
    },
    content: [
      {
        id: 'r2_b1',
        type: 'paragraph',
        props: { textColor: 'default', backgroundColor: 'default', textAlignment: 'left' },
        content: [{ type: 'text', text: 'Firebase auth integration is underway. Working on token lifecycle next.', styles: {} }],
        children: [],
      },
    ],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(itemsColl, {
    title: 'Write project documentation',
    icon: '📚',
    type: 'page',
    parentId: databaseId,
    order: Date.now() + 30,
    isArchived: false,
    propertyValues: {
      p_status: 'To Do',
      p_priority: 'Low',
      p_points: 2,
      p_date: nextWeek,
    },
    content: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
