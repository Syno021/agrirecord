import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  onSnapshot,
  query,
  QueryConstraint,
  setDoc,
  updateDoc,
  WithFieldValue,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { COLLECTIONS, CollectionName } from '@/lib/firebase/collections';
import { WithId } from '@/types/firestore';

export function col(name: CollectionName) {
  return collection(db, COLLECTIONS[name]);
}

export async function getDocument<T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
): Promise<WithId<T> | null> {
  const snap = await getDoc(doc(db, COLLECTIONS[collectionName], id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

export async function addDocument<T extends DocumentData>(
  collectionName: CollectionName,
  data: WithFieldValue<T>,
): Promise<string> {
  const ref = await addDoc(col(collectionName), data);
  return ref.id;
}

export async function setDocument(
  collectionName: CollectionName,
  id: string,
  data: DocumentData,
  merge = true,
): Promise<void> {
  await setDoc(doc(db, COLLECTIONS[collectionName], id), data, { merge });
}

export async function patchDocument<T extends DocumentData>(
  collectionName: CollectionName,
  id: string,
  data: Partial<T>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS[collectionName], id), data as DocumentData);
}

export async function deleteDocument(
  collectionName: CollectionName,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS[collectionName], id));
}

export function subscribeQuery<T extends DocumentData>(
  collectionName: CollectionName,
  constraints: QueryConstraint[],
  onData: (items: WithId<T>[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(col(collectionName), ...constraints);
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as T),
      }));
      onData(items);
    },
    (err) => onError?.(err),
  );
}
