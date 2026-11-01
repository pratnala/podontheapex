const CACHE_NAME = 'apex-cache-v5';

const urlsToCache = [
    // Core Routes
    '/',
    '/shorts',
    '/predictions',
    '/learn',
    '/history',
    '/instant-reactions',
    '/clips',
    '/collabs',
    '/live'
];

function fetchAndCache(request) {
    return fetch(request).then(networkResponse => {
        if (networkResponse.status === 200) {
            // Clone before returning, the page may consume the body first
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseCopy));
        }
        return networkResponse;
    });
}

function isFreshContent(request) {
    const url = new URL(request.url);
    return request.mode === 'navigate'
        || (url.origin === self.location.origin && (url.pathname.endsWith('.html') || url.pathname.endsWith('.json')));
}

function networkFirst(request) {
    return fetchAndCache(request).catch(() => {
        return caches.match(request)
            .then(cachedResponse => cachedResponse || (request.mode === 'navigate' ? caches.match('/') : undefined))
            .then(fallbackResponse => fallbackResponse || Response.error());
    });
}

function cacheFirst(request) {
    return caches.match(request).then(cachedResponse => {
        const fetchPromise = fetchAndCache(request).catch(() => Response.error());

        // Return the instant cached version if it exists, otherwise wait for the network
        return cachedResponse || fetchPromise;
    });
}

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(isFreshContent(event.request) ? networkFirst(event.request) : cacheFirst(event.request));
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
