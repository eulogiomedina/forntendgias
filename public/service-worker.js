/* eslint-disable no-restricted-globals */
const CACHE_NAME = "gias-cache-v3";

// App Shell: lo mínimo para levantar la UI sin red
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

// Al instalar: precache del App Shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Al activar: limpia cachés viejas y toma control inmediato
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Politicas por tipo de request:
// - Navegaciones (React Router): Network-first con fallback a index.html
// - /static/* (JS/CSS/imgs generados por CRA): Cache-first con revalidación
// - Cloudinary: Cache-first con actualización
// - Otros GET: Cache-first y si no existe, intenta red; si falla, para HTML -> index.html
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Solo GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1) Navegaciones (SPA)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Cachea de paso el HTML de navegación
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 2) Estáticos de CRA (/static/*) — cache-first + revalidate
  if (url.pathname.startsWith("/static/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            caches.open(CACHE_NAME).then((c) => c.put(req, networkRes.clone()));
            return networkRes;
          })
          .catch(() => cached); // si no hay red, usa cache si existe
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3) Cloudinary (logo, etc.) — cache-first + revalidate
  if (url.hostname.includes("res.cloudinary.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 4) Otros GET — cache-first con fallback razonable
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Evita cachear respuestas no válidas
          if (!res || res.status !== 200 || res.type === "opaque") return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => {
          // si es HTML, devolver index.html (SPA)
          if (req.headers.get("accept")?.includes("text/html")) {
            return caches.match("/index.html");
          }
        });
    })
  );
});
