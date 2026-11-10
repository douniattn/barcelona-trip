'use strict';
const CACHE = 'barcelone-a-deux-shell-v9';
const FILES = ['./', './index.html', './styles.css', './data.js', './weather.js', './app.js', './icon.svg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('barcelone-a-deux-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  const allowed = FILES.map(file => new URL(file, self.registration.scope).href);
  if (!allowed.includes(new URL(event.request.url).href)) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
