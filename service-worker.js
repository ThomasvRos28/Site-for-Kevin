const CACHE_NAME = 'ticket-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
});

// Handle background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tickets') {
    event.waitUntil(syncTickets());
  }
});

async function syncTickets() {
  const db = await openDB();
  const tickets = await db.getAll('pendingTickets');
  
  for (const ticket of tickets) {
    try {
      const response = await fetch('http://localhost:5000/api/tickets', {
        method: 'POST',
        body: JSON.stringify(ticket),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        await db.delete('pendingTickets', ticket.id);
      }
    } catch (error) {
      console.error('Failed to sync ticket:', error);
    }
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TicketAppDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTickets')) {
        db.createObjectStore('pendingTickets', { keyPath: 'id' });
      }
    };
  });
} 