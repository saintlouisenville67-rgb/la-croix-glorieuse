// ============================================================
// SERVICE WORKER — La Croix Glorieuse
// Stratégie : Cache First pour les assets statiques,
//             Network First pour les données dynamiques
// ============================================================

const CACHE_NAME = 'lcg-cache-v1';

// Assets à mettre en cache immédiatement à l'installation
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/annonces.html',
    '/agenda.html',
    '/priere.html',
    '/groupes.html',
    '/entraide.html',
    '/contact.html',
    '/don.html',
    '/bible.html',
    '/missel.html',
    '/office.html',
    '/messes.html',
    '/lecturedujour.html',
    '/mesprieres.html',
    '/priere-matin.html',
    '/priere-soir.html',
    '/priere-usuelles.html',
    '/priere-chapelet.html',
    '/priere-misericorde.html',
    '/demande-messe.html',
    '/css/style.css',
    '/js/config.js',
    '/js/menu.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png',
];

// Installation : mise en cache des assets statiques
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch : stratégie adaptée selon la requête
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Requêtes Supabase & Google API → toujours réseau (données en direct)
    if (url.hostname.includes('supabase.co') || url.hostname.includes('googleapis.com')) {
        event.respondWith(
            fetch(event.request).catch(() => new Response(JSON.stringify({ error: 'offline' }), {
                headers: { 'Content-Type': 'application/json' }
            }))
        );
        return;
    }

    // CDN externe (Tailwind, Lucide…) → Cache First
    if (url.hostname !== self.location.hostname) {
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }))
        );
        return;
    }

    // Assets locaux → Cache First avec fallback réseau
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') return response;
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                return response;
            }).catch(() => {
                // Fallback page hors-ligne si disponible
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});
