// ============================================================
// SERVICE WORKER — VII Olimpiadas Atletismo FEMVO 2026
//
// Su único propósito es habilitar que el navegador ofrezca
// "Instalar app" / "Agregar a pantalla de inicio", y dar una
// carga inicial más rápida cacheando los archivos propios de la app.
//
// IMPORTANTE: nunca cachea las peticiones a Google Sheets
// (docs.google.com) — esas siempre van directo a la red, para
// que los resultados en vivo, el medallero, etc. se actualicen
// de verdad y no se queden pegados con una copia vieja.
// ============================================================

const CACHE_NAME = 'olimpiadas-femvo-v1';
const APP_SHELL = [
  './',
  './index.html',
  './data.js',
  './sheets-loader.js',
  './render.js',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Nunca interceptar ni cachear peticiones a Google Sheets:
  // estas SIEMPRE deben ir a la red para traer datos en vivo.
  if (url.includes('docs.google.com')) {
    return; // deja pasar la petición sin tocarla
  }

  // Para el resto de archivos propios de la app: intenta red primero,
  // y si no hay internet, usa la copia guardada en caché como respaldo.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
