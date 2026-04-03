const CACHE = "sentinel-ops-v2";
const ASSETS = [
  "/sentinal-ops/",
  "/sentinal-ops/index.html",
  "/sentinal-ops/manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Only cache successful responses - never cache 404s
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Offline fallback - serve from cache
        return caches.match(e.request)
          .then(cached => cached || caches.match("/sentinal-ops/index.html"));
      })
  );
});
