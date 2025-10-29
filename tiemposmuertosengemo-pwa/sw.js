// sw.js — generado automáticamente
const CACHE = "app-cache-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE = [
  "/",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/index.html",
  "/manifest.json",
  "/offline.html",
  "/tiemposmuertosengemo.html/css/tiemposmuertos.css",
  "/tiemposmuertosengemo.html/img/logoengemo.png",
  "/tiemposmuertosengemo.html/tiemposmuertoscontrol.html"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

// network-first para HTML; cache-first para estáticos
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isHTML = req.headers.get("accept")?.includes("text/html");

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match(OFFLINE_URL);
        })
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => {
        return (
          cached ||
          fetch(req)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
              return res;
            })
            .catch(() => cached)
        );
      })
    );
  }
});
