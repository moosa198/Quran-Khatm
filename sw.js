const VERSION='quran-v21';
const SHELL=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icons/mushaf.svg'];
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const OFFLINE='quran-offline-v1';
const SHELL_PATHS=new Set(SHELL.map(p=>new URL(p,self.location).pathname));
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&k!==OFFLINE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function rangeFromCache(request){
 const cache=await caches.open(OFFLINE);
 const cached=await cache.match(request.url);
 if(!cached)return null;
 const header=request.headers.get('range');if(!header)return cached;
 const match=/bytes=(\d*)-(\d*)/.exec(header);if(!match)return cached;
 const buffer=await cached.arrayBuffer(),total=buffer.byteLength;
 let start=match[1]?Number(match[1]):Math.max(0,total-Number(match[2]||0));
 let end=match[2]?Number(match[2]):total-1;
 if(start>=total)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${total}`,'Accept-Ranges':'bytes'}});
 end=Math.min(end,total-1);
 const slice=buffer.slice(start,end+1);
 return new Response(slice,{status:206,statusText:'Partial Content',headers:{'Content-Type':cached.headers.get('Content-Type')||'audio/mpeg','Content-Range':`bytes ${start}-${end}/${total}`,'Content-Length':String(slice.byteLength),'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 const u=new URL(e.request.url);
 if(e.request.headers.has('range')){
   e.respondWith((async()=>{const cached=await rangeFromCache(e.request);if(cached)return cached;return fetch(e.request)})());
   return;
 }
 if(u.origin!==location.origin&&!u.href.startsWith(CDN))return;
 const isShell=SHELL_PATHS.has(u.pathname) || e.request.mode==='navigate';
 if(isShell){
   e.respondWith(fetch(e.request).then(r=>{
     if(r.ok||r.type==='opaque')caches.open(VERSION).then(c=>c.put(e.request,r.clone())).catch(()=>{});
     return r;
   }).catch(()=>caches.match(e.request).then(c=>c||caches.match('./index.html'))));
   return;
 }
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
   if(r.ok||r.type==='opaque')caches.open(VERSION).then(c=>c.put(e.request,r.clone())).catch(()=>{});
   return r;
 }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});