/* ============================================================
   UTMESchools v3 — sw.js
   Service Worker — fresh app code + safe offline fallback
   ============================================================ */

const CACHE_NAME = 'utmeschools-v3';

/* Files to cache for offline use */
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
      .then(cache => {
        console.log('UTMESchools: installing v3 cache');
        return cache.addAll(CORE_FILES);
      })
      .then(() => self.skipWaiting())
  );
});


/* ============================================================
   ACTIVATE
   Delete every older UTMESchools cache.
   ============================================================ */

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});


/* ============================================================
   HELPERS
   ============================================================ */

function isBackendRequest(url) {
  return url.hostname === 'utmeschools-ng.onrender.com';
}

function isSupabaseRequest(url) {
  return url.hostname.includes('supabase.co');
}

function isAppScriptOrStyle(request) {
  const destination = request.destination;

  return (
    destination === 'script' ||
    destination === 'style'
  );
}

function isDocument(request) {
  return request.destination === 'document';
}


/* ============================================================
   FETCH
   ============================================================ */

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  /*
    Only handle GET requests.

    POST/PATCH/DELETE requests must go directly to
    the network.
  */
  if (request.method !== 'GET') {
    return;
  }


  /* ==========================================================
     1. RENDER BACKEND API
     ==========================================================

     NEVER cache API responses.

     This is extremely important for UTMESchools because:
     - questions can change
     - sessions can change
     - attempts can change
     - Coach data can change
     - Supabase data can change

     The browser must always ask the live backend.
  */

  if (isBackendRequest(url)) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({
              ok: false,
              offline: true,
              message: 'Backend unavailable'
            }),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        })
    );

    return;
  }


  /* ==========================================================
     2. SUPABASE
     ==========================================================

     Never cache Supabase requests.
  */

  if (isSupabaseRequest(url)) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify([]),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        })
    );

    return;
  }


  /* ==========================================================
     3. JAVASCRIPT + CSS
     ==========================================================

     NETWORK FIRST.

     This prevents the old practice.js / coach.js /
     result.js from being permanently served from cache.

     If internet fails, use the cached version.
  */

  if (isAppScriptOrStyle(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {

          if (
            response &&
            response.status === 200 &&
            response.type !== 'opaque'
          ) {
            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, clone);
              });
          }

          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );

    return;
  }


  /* ==========================================================
     4. HTML DOCUMENTS
     ==========================================================

     NETWORK FIRST.

     This ensures the latest HTML is used whenever internet
     is available, while still allowing offline access.
  */

  if (isDocument(request)) {
    event.respondWith(
      fetch(request)
        .then(response => {

          if (
            response &&
            response.status === 200 &&
            response.type !== 'opaque'
          ) {
            const clone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(request, clone);
              });
          }

          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => {
              return cached ||
                caches.match('/utmeschools.ng/index.html');
            });
        })
    );

    return;
  }


  /* ==========================================================
     5. IMAGES / ICONS / OTHER STATIC FILES
     ==========================================================

     Cache first for speed, with network fallback.
  */

  event.respondWith(
    caches.match(request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(request)
          .then(response => {

            if (
              response &&
              response.status === 200 &&
              response.type !== 'opaque'
            ) {
              const clone = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, clone);
                });
            }

            return response;
          });
      })
      .catch(() => {
        return new Response('', {
          status: 503
        });
      })
  );
});
