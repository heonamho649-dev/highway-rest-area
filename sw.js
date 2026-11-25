// 휴게소 주유 지도 — 앱 화면만 저장해 빨리 열리게 함.
// 기름값·휴게소 정보(data.ex.co.kr)는 절대 저장하지 않고 항상 새로 받음 (오래된 가격 표시 방지)
const CACHE = 'hw-shell-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
const LIBS = ['unpkg.com', 'cdn.jsdelivr.net'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (u.hostname === 'data.ex.co.kr') return;                // 가격 데이터: 저장 안 함
  if (u.origin === location.origin) {                         // 앱 화면: 새 버전 우선, 인터넷 없으면 저장본
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
    return;
  }
  if (LIBS.includes(u.hostname)) {                            // 지도·글꼴 라이브러리: 저장본 우선
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return res; })));
  }
});
