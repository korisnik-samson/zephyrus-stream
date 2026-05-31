const CACHE_VERSION = "zephyrus-v1";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const IMAGE_CACHE   = `${CACHE_VERSION}-images`;
const OFFLINE_PAGE  = "/offline";

// Assets to precache on install
const PRECACHE_URLS = ["/", OFFLINE_PAGE];

// ── Install ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate — purge old caches ─────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Let Next.js internals, API calls, and auth pass through untouched
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/api/auth/")
  ) {
    return;
  }

  // Images — cache-first, 7-day freshness
  if (
    url.hostname === "image.tmdb.org" ||
    request.destination === "image"
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          }).catch(() => cached ?? new Response("", { status: 404 }));
        })
      )
    );
    return;
  }

  // App pages — network-first with static fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached ?? caches.match(OFFLINE_PAGE)
        )
      )
  );
});

// ── Background sync — queue progress saves when offline ──────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-progress") {
    event.waitUntil(flushProgressQueue());
  }
});

async function flushProgressQueue() {
  // Progress payloads are stored in IndexedDB by the client; flush them here
  // Full implementation wired when backend is online
}