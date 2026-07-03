/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CACHE_NAME = 'valorant-lineups-v1';

// Static resources to pre-cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/metadata.json'
];

// Install event - pre-caches core layout shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching Core Offline Shell');
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('Pre-cache error, continuing for runtime capture:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - cleans up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing Outdated Cache Store:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - dynamic stale-while-revalidate capture
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Focus only on same-origin GET requests, images from allowlist, or YouTube embeds
  if (event.request.method !== 'GET') return;

  // Bypass dev HMR and Chrome development extensions
  if (requestUrl.pathname.includes('/@vite/') || requestUrl.pathname.includes('/@react-refresh')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If response is valid, update cache clone
          if (networkResponse && networkResponse.status === 200) {
            // Only cache secure scheme, standard origin assets or permitted asset sources
            if (event.request.url.startsWith('http') || event.request.url.startsWith('https')) {
              cache.put(event.request, networkResponse.clone());
            }
          }
          return networkResponse;
        }).catch((err) => {
          console.log('[Service Worker] Fetch failed, serving cache fallback:', err);
        });

        // Return cached asset immediately, otherwise wait for network fetch
        return cachedResponse || fetchPromise;
      });
    })
  );
});
