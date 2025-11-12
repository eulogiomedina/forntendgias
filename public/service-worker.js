/* eslint-disable no-restricted-globals */
const CACHE_NAME = "gias-cache-v6";  // sube versión cuando cambies algo
const API_BASE = "https://backendgias.onrender.com";

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

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

/* =============================
      🟢 INSTALL
============================= */
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);

      console.log("⏳ Precaching textos legales...");

      // ✅ precache de endpoints base
      await Promise.all(
        BACKEND_ENDPOINTS.map(async (endpoint) => {
          const url = `${API_BASE}${endpoint}`;
          try {
            const res = await fetch(url, { mode: "cors" });
            if (res.ok) {
              cache.put(url, res.clone());
              console.log("✅ Precache guardado:", url);
            }
          } catch (err) {
            console.warn("⚠️ No se pudo precachear:", url);
          }
        })
      );

      // ✅ precache dinámico de detalles
      await precacheDetails("/api/policies");
      await precacheDetails("/api/terms");
      await precacheDetails("/api/legal-boundaries");

      console.log("✅ Precaching COMPLETO ✅");
    })()
  );

  self.skipWaiting();
});

/**
 * ✅ Función que cachea todos los detalles por ID
 * Corrección clave: clonamos el response ANTES del json()
 */
async function precacheDetails(endpoint) {
  try {
    const listRes = await fetch(`${API_BASE}${endpoint}`, { mode: "cors" });

    if (!listRes.ok) return;

    const cloned = listRes.clone();     // ✅ clone para cache
    const items = await cloned.json();  // ✅ json desde el clone, no desde listRes

    const cache = await caches.open(CACHE_NAME);

    await Promise.all(
      items.map(async (item) => {
        const detailUrl = `${API_BASE}${endpoint}/${item._id}`;
        try {
          const detailRes = await fetch(detailUrl, { mode: "cors" });

          if (detailRes.ok) {
            cache.put(detailUrl, detailRes.clone()); // ✅ ahora SI se puede clonar
          }
        } catch {}
      })
    );

    console.log(`✅ Precaching detalles para ${endpoint}`);
  } catch (err) {
    console.warn(`⚠️ No se pudieron obtener ids de ${endpoint}`);
  }
}

/* =============================
      🟢 ACTIVATE
============================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* =============================
      🟢 FETCH STRATEGY
============================= */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // ✅ Dynamic cache: /api/.../:id
  if (
    url.pathname.startsWith("/api/policies/") ||
    url.pathname.startsWith("/api/terms/") ||
    url.pathname.startsWith("/api/legal-boundaries/")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(req);

        const network = fetch(req, { mode: "cors", cache: "no-store" })
          .then((res) => {
            if (res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);

        return cached || network;
      })
    );
    return;
  }

  // ✅ navegación SPA
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

  // ✅ /static
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

  // ✅ Cloudinary
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

  // ✅ GET genérico
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

/* =============================
      🟢 NOTIFICACIONES PWA
============================= */
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "NOTIFY_STATUS") {
    const { status } = event.data;

    self.registration.showNotification(
      status === "online"
        ? "✅ Conexión restaurada"
        : "⚠️ Sin conexión a Internet",
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
