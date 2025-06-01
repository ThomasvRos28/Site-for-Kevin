interface SyncManager {
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
  sync: SyncManager;
}

interface Window {
  SyncManager: {
    prototype: SyncManager;
    new(): SyncManager;
  };
} 