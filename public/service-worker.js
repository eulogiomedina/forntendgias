/* eslint-disable no-restricted-globals */
const CACHE_NAME = "gias-cache-v4"; // sube versión cuando cambies algo

// ✅ URL base DEL BACKEND (CAMBIA ESTA POR LA TUYA ⬇)
const API_BASE = "https://backendgias.onrender.com";

// ✅ Rutas que quieres cachear sin necesidad de entrar
const BACKEND_ENDPOINTS = [
  "/api/policies",
  "/api/terms",
  "/api/contact",
  "/api/social-links",
  "/api/legal-boundaries",
  "/api/slogan",
  "/api/nuevos-ahorros",
  "/api/perfil",
  "/api/cuenta-destino",
];

// ✅ App Shell (UI mínima para levantar la app sin red)
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

// 🟢 INSTALL → Precache App Shell + Endpoints backend
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);

      // ✅ Precache de textos legales y configuración del backend
      await Promise.all(
        BACKEND_ENDPOINTS.map(async (endpoint) => {
          const url = `${API_BASE}${endpoint}`;
          try {
            const res = await fetch(url);
            if (res.ok) cache.put(url, res.clone());
          } catch (err) {
            console.warn("⚠️ No se pudo precachear:", url);
          }
        })
      );
    })()
  );
  self.skipWaiting();
});

// 🟢 ACTIVATE → limpia versiones viejas
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 🟢 FETCH → Estrategias por tipo de recurso
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Solo cachea GET
  if (req.method !== "GET") return;

  // 1️⃣ Navegaciones (SPA) → network first + fallback index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          caches.open(CACHE_NAME).then((c) => c.put("/index.html", res.clone()));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 2️⃣ Archivos estáticos (`/static/...`)
  if (url.pathname.startsWith("/static/")) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            caches.open(CACHE_NAME).then((c) => c.put(req, networkRes.clone()));
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 3️⃣ Cloudinary (cache-first con actualización)
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

  // 4️⃣ Otros GET → cache-first con fallback
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type === "opaque") return res;
          caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => {
          if (req.headers.get("accept")?.includes("text/html"))
            return caches.match("/index.html");
        });
    })
  );
});

// 🟢 Notificación PWA cuando cambia el estado de red
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "NOTIFY_STATUS") {
    const { status } = event.data;

    self.registration.showNotification(
      status === "online" ? "✅ Conexión restaurada" : "⚠️ Sin conexión a Internet",
      {
        body:
          status === "online"
            ? "Tu dispositivo volvió a conectarse. Se sincronizarán datos pendientes."
            : "Estás sin conexión. Seguiremos trabajando offline.",
        icon: "/logo192.png",
        vibrate: [200, 100, 200],
      }
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
