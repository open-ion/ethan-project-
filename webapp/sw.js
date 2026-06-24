/* Service Worker — オフライン対応。
   アプリシェルはキャッシュ優先、データ(digest.json)はネット優先＋キャッシュ退避。 */
const CACHE = "news-digest-v2";
const SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./briefings.html",
  "./briefings.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // データ(JSON)はネット優先で最新を取りに行く。シェルはキャッシュ優先。
  const isData = url.pathname.endsWith(".json") &&
    !url.pathname.endsWith("manifest.webmanifest");

  if (isData) {
    // ネット優先：最新を取りに行き、取れたらキャッシュ更新。失敗時はキャッシュ。
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // それ以外（シェル）：キャッシュ優先
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
