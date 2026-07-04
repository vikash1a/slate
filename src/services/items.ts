import {
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Item, ItemType, NewItemData } from '@/types';

function itemsCollection(uid: string) {
  return collection(db, 'users', uid, 'items');
}

function itemDoc(uid: string, itemId: string) {
  return doc(db, 'users', uid, 'items', itemId);
}

// ─── Create ───

export async function createItem(
  uid: string,
  type: ItemType,
  parentId: string | null = null
): Promise<string> {
  const data: Omit<NewItemData, 'id'> & { createdAt: ReturnType<typeof serverTimestamp>; updatedAt: ReturnType<typeof serverTimestamp> } = {
    title: type === 'database' ? 'Untitled Database' : 'Untitled',
    icon: type === 'database' ? '📊' : '📝',
    type,
    parentId,
    content: null,
    order: Date.now(),
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (type === 'database') {
    Object.assign(data, {
      properties: {},
      views: {},
    });
  }

  if (parentId) {
    Object.assign(data, {
      propertyValues: {},
    });
  }

  const docRef = await addDoc(itemsCollection(uid), data);
  return docRef.id;
}

// ─── Read (single) ───

export async function getItem(uid: string, itemId: string): Promise<Item | null> {
  const snap = await getDoc(itemDoc(uid, itemId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Item;
}

// ─── Update ───

export async function updateItem(
  uid: string,
  itemId: string,
  data: Partial<Pick<Item, 'title' | 'icon' | 'content' | 'order' | 'properties' | 'views' | 'propertyValues'>>
): Promise<void> {
  await updateDoc(itemDoc(uid, itemId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── Archive (soft delete) ───

export async function archiveItem(uid: string, itemId: string): Promise<void> {
  await updateDoc(itemDoc(uid, itemId), {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
}

// ─── Restore ───

export async function restoreItem(uid: string, itemId: string): Promise<void> {
  await updateDoc(itemDoc(uid, itemId), {
    isArchived: false,
    updatedAt: serverTimestamp(),
  });
}

// ─── Real-time listeners ───

export function subscribeToTopLevelItems(
  uid: string,
  callback: (items: Item[]) => void
): Unsubscribe {
  const q = query(
    itemsCollection(uid),
    where('parentId', '==', null),
    where('isArchived', '==', false),
    orderBy('order', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Item[];
    callback(items);
  });
}

export function subscribeToDatabaseRows(
  uid: string,
  databaseId: string,
  callback: (rows: Item[]) => void
): Unsubscribe {
  const q = query(
    itemsCollection(uid),
    where('parentId', '==', databaseId),
    where('isArchived', '==', false),
    orderBy('order', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Item[];
    callback(rows);
  });
}

export function subscribeToItem(
  uid: string,
  itemId: string,
  callback: (item: Item | null) => void
): Unsubscribe {
  return onSnapshot(itemDoc(uid, itemId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() } as Item);
  });
}
