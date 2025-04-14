// Define a cache name
const CACHE_NAME = 'simple-groceries-pwa-cache-v1';
// List of URLs to cache on install
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other essential assets like main CSS/JS bundles if they have stable names
  // Or rely on runtime caching for dynamically named assets
];

// Install event: Cache essential assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting');
        return self.skipWaiting(); // Activate the new SW immediately
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log(`[ServiceWorker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim(); // Take control of open pages immediately
    })
  );
});

// Fetch event: Serve from cache or network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // --- Share Target Handling ---
  if (event.request.method === 'POST' && url.pathname === '/share-recipe') {
    console.log('[ServiceWorker] Intercepted share target POST request');
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const sharedUrl = formData.get('url') || formData.get('text') || ''; // Get URL or text
          const sharedTitle = formData.get('title') || ''; // Optional title
          console.log(`[ServiceWorker] Shared URL: ${sharedUrl}, Title: ${sharedTitle}`);

          if (sharedUrl) {
            // Find the main client (browser window/tab)
            const clientList = await self.clients.matchAll({
              type: 'window',
              includeUncontrolled: true
            });

            let client = null;
            for (const c of clientList) {
              // Check if the client URL is the main app path
              if (c.url && new URL(c.url).pathname === '/') {
                client = c;
                break;
              }
            }

            if (client) {
              console.log('[ServiceWorker] Found client, posting message');
              // Send the URL to the main client
              client.postMessage({
                type: 'RECIPE_SHARED',
                payload: { url: sharedUrl, title: sharedTitle } // Send URL and optional title
              });
              // Focus the client window
              await client.focus();
            } else {
              console.log('[ServiceWorker] No client found, opening new window');
              // If no client is open, open the app with the URL as a query parameter
              // (App.jsx needs to handle this query parameter on load)
              const openUrl = `/?sharedUrl=${encodeURIComponent(sharedUrl)}`;
              await self.clients.openWindow(openUrl);
            }
          } else {
             console.log('[ServiceWorker] No URL found in shared data');
          }
          
          // Redirect the user back to the root page after handling the share
          return Response.redirect('/', 303); 

        } catch (error) {
          console.error('[ServiceWorker] Error handling share target:', error);
          // Redirect on error too, maybe show an error message via query param?
          return Response.redirect('/?shareError=true', 303);
        }
      })()
    );
    return; // Don't process this fetch request further
  }
  // --- End Share Target Handling ---

  // Standard Cache-First Strategy for other requests
  // Only handle GET requests for caching
  if (event.request.method !== 'GET') {
    // console.log('[ServiceWorker] Ignoring non-GET request:', event.request.method, event.request.url);
    return; // Ignore non-GET requests
  }

  // Ignore API requests for caching (or use a different strategy)
  if (url.pathname.startsWith('/api/')) {
    // console.log('[ServiceWorker] Ignoring API request for cache:', event.request.url);
    return; // Let API requests go directly to the network
  }

  // Ignore requests to external domains
  if (url.origin !== self.location.origin) {
    // console.log('[ServiceWorker] Ignoring external request:', event.request.url);
    return;
  }
  
  // console.log('[ServiceWorker] Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          // console.log('[ServiceWorker] Serving from cache:', event.request.url);
          return response;
        }

        // console.log('[ServiceWorker] Fetching from network:', event.request.url);
        // Not in cache, fetch from network
        return fetch(event.request).then(
          (networkResponse) => {
            // Check if we received a valid response
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                // console.log('[ServiceWorker] Caching new resource:', event.request.url);
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch((error) => {
          console.error('[ServiceWorker] Fetch failed; returning offline page instead.', error);
          // Optional: Return a fallback offline page if fetch fails
          // return caches.match('/offline.html'); 
        });
      })
  );
}); 