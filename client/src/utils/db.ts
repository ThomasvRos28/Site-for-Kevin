export async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('TicketAppDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pendingTickets')) {
        db.createObjectStore('pendingTickets', { keyPath: 'id' });
      }
    };
  });
}

// Add type definitions for IndexedDB
declare global {
  interface IDBDatabase {
    add(storeName: string, value: any): Promise<void>;
    getAll(storeName: string): Promise<any[]>;
    delete(storeName: string, key: string): Promise<void>;
  }
} 