const VERSION = "05a8b966b69ae08f";
const FILES = ["index.html","assets/golos-text-cyrillic-ext-wght-normal-hICkpzq7.woff2","assets/golos-text-cyrillic-wght-normal-mKek_fSS.woff2","assets/golos-text-latin-ext-wght-normal-B-I5lbAQ.woff2","assets/golos-text-latin-wght-normal-BS5oQT7X.woff2","assets/index-BVOkct62.js","assets/index-CeGkquPr.css","assets/last-pier-ZofxUHlq.svg","assets/oswald-cyrillic-ext-wght-normal-DLWmRmaW.woff2","assets/oswald-cyrillic-wght-normal-C8sJyxwB.woff2","assets/oswald-latin-ext-wght-normal-Dj_1K-Kw.woff2","assets/oswald-latin-wght-normal-CzS3kehr.woff2","assets/oswald-vietnamese-wght-normal-Tdf5mmdl.woff2","assets/shop-items-D_OLdHtB.webp","assets/winter-harbor-mobile-N-1cP3r1.webp"];
const HERO = {"desktop":"assets/winter-harbor-cEUpKvAI.webp","offline":"assets/winter-harbor-mobile-N-1cP3r1.webp"};
const scope = self.registration.scope;
const prefix = 'last-pier:' + scope + ':';
const cacheName = prefix + VERSION;
const index = new URL('index.html', scope).href;
const files = new Set(FILES.map(file => new URL(file, scope).href));
const desktopHero = new URL(HERO.desktop, scope).href;
const offlineHero = new URL(HERO.offline, scope).href;

self.addEventListener('install', event => {
  const requests = [...files].map(url => new Request(url, { cache: 'reload' }));
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(requests)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(prefix) && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const path = url.origin + url.pathname;
  if (request.mode === 'navigate' && (path === scope || path === index)) {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName);
      return await cache.match(index) ?? Response.error();
    }));
  } else if (files.has(url.href) && url.href !== index) {
    event.respondWith(caches.open(cacheName).then(async cache => await cache.match(request) ?? fetch(request)));
  } else if (url.href === desktopHero) {
    event.respondWith(fetch(request).catch(async () => {
      const cache = await caches.open(cacheName);
      return await cache.match(offlineHero) ?? Response.error();
    }));
  }
});
