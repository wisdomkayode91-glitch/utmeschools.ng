/* ============================================================
   UTMESchools v2 — sw.js
   Service Worker. Makes the app work offline.
   ============================================================ */

const CACHE_NAME = 'utmeschools-' + Date.now();

/* Files to cache immediately when app is installed */
const CORE_FILES = [
  '/utmeschools.ng/',
  '/utmeschools.ng/index.html',
  '/utmeschools.ng/shared.css',
  '/utmeschools.ng/shared.js',
  '/utmeschools.ng/script.js',
  '/utmeschools.ng/literature-config.js',
  '/utmeschools.ng/auth.html',
  '/utmeschools.ng/auth.js',
  '/utmeschools.ng/select-subjects.html',
  '/utmeschools.ng/select-subjects.js',
  '/utmeschools.ng/practice.html',
  '/utmeschools.ng/practice.js',
  '/utmeschools.ng/result.html',
  '/utmeschools.ng/result.js',
  '/utmeschools.ng/dashboard.html',
  '/utmeschools.ng/dashboard.js',
  '/utmeschools.ng/bookmarks.html',
  '/utmeschools.ng/bookmarks.js',
  '/utmeschools.ng/coach.html',
  '/utmeschools.ng/coach.js',
  '/utmeschools.ng/discussion.html',
  '/utmeschools.ng/discussion.js',
  '/utmeschools.ng/manifest.json',
  '/utmeschools.ng/icons/icon-192.png',
  '/utmeschools.ng/icons/icon-512.png'
];

/* ---- Install: cache all core files ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('UTMESchools: Caching core files');
      return cache.addAll(CORE_FILES);
    }).then(() => self.skipWaiting())
  );
});

/* ---- Activate: remove old caches ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ---- Fetch: network-first for HTML, cache-first for assets ---- */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Supabase API — network only, no cache */
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  /* SdashAPI — network only, no cache */
  if (url.hostname.includes('sdashapi.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  /* HTML pages: network-first, fall back to cache */
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
        .then(cached => cached || caches.match('/utmeschools.ng/index.html'))
    );
    return;
  }

  /* Everything else — cache first, then network */
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/utmeschools.ng/index.html');
        }
      });
    })
  );
});

/* ---- Background sync for bookmarks ---- */
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bookmarks') {
    console.log('UTMESchools: Syncing bookmarks');
  }
});
