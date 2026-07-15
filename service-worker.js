// ============================================================
// SERVICE WORKER — La Croix Glorieuse
// Chemins relatifs → compatible GitHub Pages (sous-dossier)
// Stratégies :
//   - Cache First  : assets locaux (HTML, CSS, JS, images)
//   - Cache First  : CDN externes (Tailwind, Lucide, Supabase lib)
//   - Network Only : API Supabase et Google Calendar (données live)
// ============================================================

const CACHE_VERSION = 'lcg-v2';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_CDN     = `${CACHE_VERSION}-cdn`;

const STATIC_ASSETS = [
    './',
    './index.html',
    './annonces.html',
    './agenda.html',
    './priere.html',
    './groupes.html',
    './entraide.html',
    './contact.html',
    './don.html',
    './bible.html',
    './missel.html',
    './office.html',
    './messes.html',
    './lecturedujour.html',
    './mesprieres.html',
    './demande-messe.html',
    './priere-matin.html',
    './priere-soir.html',
    './priere-usuelles.html',
    './priere-chapelet.html',
    './priere-misericorde.html',
    './css/style.css',
    './js/config.js',
    './js/menu.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './favicon.ico',
];

const CDN_ASSETS = [
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
];

// INSTALLATION
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_STATIC).then(cache =>
                cache.addAll(STATIC_ASSETS).catch(err =>
                    console.warn('[SW] Assets locaux partiellement non mis en cache :', err)
                )
            ),
            caches.open(CACHE_CDN).then(cache =>
                Promise.allSettled(
                    CDN_ASSETS.map(url =>
                        fetch(url, { mode: 'no-cors' })
                            .then(r => cache.put(url, r))
                            .catch(() => {})
                    )
                )
            )
        ]).then(() => self.skipWaiting())
    );
});

// ACTIVATION — supprime les anciens caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(k => !k.startsWith(CACHE_VERSION))
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// FETCH
self.addEventListener('fetch', event => {
    const req = event.request;
    const url = new URL(req.url);

    // 1. API données (Supabase REST, Google, HelloAsso) → Network Only
    if (
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('helloasso.com')
    ) {
        event.respondWith(
            fetch(req).catch(() =>
                new Response(JSON.stringify({ data: null, error: { message: 'offline' } }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' }
                })
            )
        );
        return;
    }

    // 2. CDN externes (Tailwind, Supabase JS lib) → Cache First + mise à jour fond
    if (url.hostname !== self.location.hostname) {
        event.respondWith(
            caches.open(CACHE_CDN).then(cache =>
                cache.match(req).then(cached => {
                    const networkFetch = fetch(req, { mode: 'no-cors' })
                        .then(response => { cache.put(req, response.clone()); return response; })
                        .catch(() => cached);
                    return cached || networkFetch;
                })
            )
        );
        return;
    }

    // 3. Assets locaux → Stale-While-Revalidate
    event.respondWith(
        caches.open(CACHE_STATIC).then(cache =>
            cache.match(req).then(cached => {
                const networkFetch = fetch(req)
                    .then(response => {
                        if (response && response.status === 200) cache.put(req, response.clone());
                        return response;
                    })
                    .catch(() => {
                        if (req.destination === 'document') return cache.match('./index.html');
                    });
                return cached || networkFetch;
            })
        )
    );
});
