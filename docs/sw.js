const VERSION = "d47086f9d3fd3e1d";
const FILES = ["index.html","assets/index-DGqmikJg.css","assets/index-DpELilSf.js","assets/last-pier-ZofxUHlq.svg"];
const scope = self.registration.scope;
const prefix = 'last-pier:' + scope + ':';
const cacheName = prefix + VERSION;
const index = new URL('index.html', scope).href;
const files = new Set(FILES.map(file => new URL(file, scope).href));

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
  }
});
