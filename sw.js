/* ============================================================
   UTMESchools — Service Worker
   v4 — fresh app files, safe API handling
   ============================================================ */

const CACHE_NAME = 'utmeschools-v4';

const CORE_FILES = [
  '/utmeschools.ng/',
  '/utmeschools.ng/index.html',
  '/utmeschools.ng/shared.css',
  '/utmeschools.ng/shared.js',
  '/utmeschools.ng/script.js',
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
  '/utmeschools.ng/discussion.html',
  '/utmeschools.ng/discussion.js',
  '/utmeschools.ng/manifest.json',
  '/utmeschools.ng/icons/icon-192.png',
  '/utmeschools.ng/icons/icon-512.png'
];

/* ============================================================
   INSTALL
   ============================================================ */

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_FILES))
      .then(() => self.skipWaiting())
  );
});

/* ============================================================
   ACTIVATE
   ============================================================ */

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ============================================================
   FETCH
   ============================================================ */

self.addEventListener('fetch', event => {
  const request = event.request;

  /* Only handle GET requests */
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  /* ----------------------------------------------------------
     Backend / API — NEVER use service-worker cache
     ---------------------------------------------------------- */

  if (
    url.hostname === 'utmeschools-ng.onrender.com' ||
    url.hostname.includes('supabase.co')
  ) {
    event.respondWith(
      fetch(request, {
        cache: 'no-store'
      }).catch(() => {
        return new Response(
          JSON.stringify([]),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      })
    );

    return;
  }

  /* ----------------------------------------------------------
     HTML — NETWORK FIRST
     ---------------------------------------------------------- */

  if (request.destination === 'document') {
    event.respondWith(
      fetch(request, {
        cache: 'no-cache'
      })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy));

            return response;
          }

          return caches.match(request);
        })
        .catch(() => caches.match(request))
    );

    return;
  }

  /* ----------------------------------------------------------
     JavaScript / CSS — NETWORK FIRST
     ---------------------------------------------------------- */

  if (
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(
      fetch(request, {
        cache: 'no-cache'
      })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy));
          }

          return response;
        })
        .catch(() => caches.match(request))
    );

    return;
  }

  /* ----------------------------------------------------------
     Images / icons — CACHE FIRST
     ---------------------------------------------------------- */

  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) return cached;

        return fetch(request)
          .then(response => {
            if (response && response.ok) {
              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, copy));
            }

            return response;
          });
      })
  );
});
