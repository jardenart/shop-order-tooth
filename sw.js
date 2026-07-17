// Porders Service Worker
// 方針：ネットワーク優先（GitHub Pagesの更新を即反映）、圏外時はキャッシュで起動
const CACHE = "hacchu-v1";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 取得成功→キャッシュを更新して返す
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        // 圏外→キャッシュから返す（ナビゲーションはindex.htmlへフォールバック）
        caches.match(e.request).then((hit) => hit || caches.match("./index.html"))
      )
  );
});
