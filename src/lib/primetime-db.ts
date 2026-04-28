const DB_NAME = 'primetime-db';
const DB_VERSION = 1;
const IMAGES_STORE = 'images';
const REPAINTS_STORE = 'repaints';

export type StoredImageType = 'main' | 'reference';

interface StoredImage {
  id: string;
  file: File;
  type: StoredImageType;
}

interface StoredRepaint {
  key: string;
  data: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IMAGES_STORE)) {
        db.createObjectStore(IMAGES_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(REPAINTS_STORE)) {
        db.createObjectStore(REPAINTS_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

export async function initDB(): Promise<void> {
  await openDB();
}

function txComplete(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function saveImage(id: string, file: File, type: StoredImageType): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(IMAGES_STORE, 'readwrite');
  tx.objectStore(IMAGES_STORE).put({ id, file, type });
  return txComplete(tx);
}

export async function loadImages(): Promise<StoredImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IMAGES_STORE, 'readonly');
    const req = tx.objectStore(IMAGES_STORE).getAll();
    req.onsuccess = () => resolve((req.result as StoredImage[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearImages(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(IMAGES_STORE, 'readwrite');
  tx.objectStore(IMAGES_STORE).clear();
  return txComplete(tx);
}

export async function saveRepaint(key: string, data: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(REPAINTS_STORE, 'readwrite');
  tx.objectStore(REPAINTS_STORE).put({ key, data });
  return txComplete(tx);
}

export async function loadRepaints(): Promise<StoredRepaint[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(REPAINTS_STORE, 'readonly');
    const req = tx.objectStore(REPAINTS_STORE).getAll();
    req.onsuccess = () => resolve((req.result as StoredRepaint[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

export async function clearRepaints(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(REPAINTS_STORE, 'readwrite');
  tx.objectStore(REPAINTS_STORE).clear();
  return txComplete(tx);
}
