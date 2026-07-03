import { Lineup, UserProfile } from '../types';

const DB_NAME = 'valorant-lineups-db';
const DB_VERSION = 2;
const STORE_CUSTOMS = 'custom_lineups';
const STORE_BOOKMARKS = 'bookmarks';
const STORE_USERS = 'users';

/**
 * Initializes and returns the IndexedDB instance.
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Não foi possível abrir o IndexedDB para suporte offline."));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CUSTOMS)) {
        db.createObjectStore(STORE_CUSTOMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BOOKMARKS)) {
        db.createObjectStore(STORE_BOOKMARKS, { keyPath: 'id' }); // stores { id: "uuid", bookmarkedAt: timestamp }
      }
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Saves a custom lineup to IndexedDB.
 */
export async function saveCustomLineup(lineup: Lineup): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_CUSTOMS, 'readwrite');
    const store = transaction.objectStore(STORE_CUSTOMS);
    
    // Ensure marked as custom
    const dataToSave = { ...lineup, isCustom: true };
    const request = store.put(dataToSave);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Falha ao salvar lineup personalizada no IndexedDB."));
  });
}

/**
 * Deletes a custom lineup from IndexedDB.
 */
export async function deleteCustomLineup(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_CUSTOMS, 'readwrite');
    const store = transaction.objectStore(STORE_CUSTOMS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Falha ao eliminar lineup personalizada do IndexedDB."));
  });
}

/**
 * Retrieves all custom lineups from IndexedDB.
 */
export async function getCustomLineups(): Promise<Lineup[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_CUSTOMS, 'readonly');
    const store = transaction.objectStore(STORE_CUSTOMS);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };
    request.onerror = () => {
      reject(new Error("Falha ao ler lineups do IndexedDB."));
    };
  });
}

/**
 * Adds a lineup to bookmarks.
 */
export async function addBookmark(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKMARKS, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKMARKS);
    const request = store.put({ id, bookmarkedAt: Date.now() });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Falha ao guardar favorito no IndexedDB."));
  });
}

/**
 * Removes a lineup from bookmarks.
 */
export async function removeBookmark(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKMARKS, 'readwrite');
    const store = transaction.objectStore(STORE_BOOKMARKS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Falha ao remover favorito do IndexedDB."));
  });
}

/**
 * Retrieves all bookmark entries (ids).
 */
export async function getBookmarks(): Promise<string[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_BOOKMARKS, 'readonly');
    const store = transaction.objectStore(STORE_BOOKMARKS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      resolve(results.map((r: any) => r.id));
    };
    request.onerror = () => {
      reject(new Error("Falha ao obter favoritos do IndexedDB."));
    };
  });
}

/**
 * Saves a user profile to IndexedDB.
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_USERS, 'readwrite');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.put(user);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Falha ao salvar utilizador no IndexedDB."));
  });
}

/**
 * Retrieves a user profile by ID from IndexedDB.
 */
export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_USERS, 'readonly');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Falha ao ler utilizador do IndexedDB."));
  });
}

/**
 * Retrieves all registered users from IndexedDB.
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_USERS, 'readonly');
    const store = transaction.objectStore(STORE_USERS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Falha ao obter utilizadores do IndexedDB."));
  });
}

/**
 * Retrieves a user profile by email from IndexedDB.
 */
export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}
