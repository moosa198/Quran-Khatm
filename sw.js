const VERSION='quran-v3';
const SHELL=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icons/mushaf.svg'];
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&k!=='quran-offline-v1').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(e.request.headers.has('range'))return;
 if(u.origin!==location.origin&&!u.href.startsWith(CDN))return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
   if(r.ok||r.type==='opaque')caches.open(VERSION).then(c=>c.put(e.request,r.clone())).catch(()=>{});
   return r;
 }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});