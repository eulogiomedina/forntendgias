/* eslint-disable no-restricted-globals */
const CACHE_NAME = "gias-cache-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json"
];

// Install: precachea archivos estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate: limpia cachés viejas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

// Fetch: intercepta peticiones
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Caso especial: logo desde Cloudinary
  if (request.url.includes("res.cloudinary.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        const networkResponse = await fetch(request);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      })
    );
    return;
  }

  // Estrategia Cache First para otros assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).then((response) =>
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          })
        )
      );
    })
  );
});
