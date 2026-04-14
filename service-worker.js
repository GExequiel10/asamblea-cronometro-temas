/**
 * service-worker.js
 * Asamblea de Circuito 2025-2026 - PWA Offline Support
 */

const CACHE_NAME = 'asamblea-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];

// Instalación: precachear assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS.map(url => {
        // Las URLs externas pueden fallar; intentar sin romper
        return fetch(url).then(r => cache.put(url, r)).catch(() => {});
      })))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache First para assets, Network First para API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Solo interceptar requests GET
  if (event.request.method !== 'GET') return;

  // Estrategia: Cache First con fallback a red
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          // Cachear respuestas válidas
          if (response && response.status === 200 && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback offline: devolver index.html para navegación
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
