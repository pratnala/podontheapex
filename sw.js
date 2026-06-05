const CACHE_NAME = 'apex-cache-v1';

const urlsToCache = [
    // Core Routes
    '/',
    '/index.html',
    '/shorts.html',
    '/predictions.html',
    '/learn.html',
    '/history.html',
    '/instant-reactions.html',
    '/clips.html',
    '/collabs.html',
    '/live.html',

    // Injected Components & Data
    '/navbar.html',
    '/footer.html',
    '/header.html',
    '/header.json',
    '/videos.json',

    // Styles & Logic
    '/css/styles.min.css',
    '/js/custom.min.js',

    // Brand Assets
    '/img/logo.png',
    '/img/face-logo.png',
    '/img/header.jpg',
    '/img/predictions-logo.png',
    '/img/learn-logo.png',
    '/img/history-logo.png',
    '/img/instant-reactions-logo.png',
    '/img/clips-logo.png',
    '/img/collabs-logo.png',
    '/img/live-logo.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                caches.open(CACHE_NAME).then(cache => {
                    // Only cache valid GET requests
                    if (event.request.method === 'GET' && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                });
                return networkResponse;
            }).catch(() => {
                console.log("Network fetch failed, serving from cache if available.");
            });

            // Return the instant cached version if it exists, otherwise wait for the network
            return cachedResponse || fetchPromise;
        })
    );
});
