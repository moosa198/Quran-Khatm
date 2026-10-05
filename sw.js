const VERSION='quran-v46';
const SHELL=['./','./index.html','./style.css','./app.js','./manifest.webmanifest','./icons/mushaf.svg'];
const CDN='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const OFFLINE='quran-offline-v1';
const SHELL_PATHS=new Set(SHELL.map(p=>new URL(p,self.location).pathname));
self.addEventListener('install',e=>e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION&&k!==OFFLINE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function rangeFromCache(r){
 const c=await caches.open(OFFLINE),x=await c.match(r.url);if(!x)return null;
 const h=r.headers.get('range');if(!h)return x;const m=/bytes=(\d*)-(\d*)/.exec(h);if(!m)return x;
 const b=await x.arrayBuffer(),n=b.byteLength;let s=m[1]?+m[1]:Math.max(0,n-(+(m[2]||0))),e=m[2]?+m[2]:n-1;
 if(s>=n)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+n,'Accept-Ranges':'bytes'}});
 e=Math.min(e,n-1);const part=b.slice(s,e+1);
 return new Response(part,{status:206,headers:{'Content-Type':x.headers.get('Content-Type')||'audio/mpeg','Content-Range':'bytes '+s+'-'+e+'/'+n,'Content-Length':String(part.byteLength),'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;const u=new URL(e.request.url);
 if(e.request.headers.has('range')){e.respondWith((async()=>{const x=await rangeFromCache(e.request);return x||fetch(e.request)})());return}
 if(u.origin!==location.origin&&!u.href.startsWith(CDN))return;
 const shell=SHELL_PATHS.has(u.pathname)||e.request.mode==='navigate';
 if(shell){e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r.ok||r.type==='opaque')caches.open(VERSION).then(c=>c.put(e.request,r.clone())).catch(()=>{});return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html'))));return}
 e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request).then(r=>{if(r.ok||r.type==='opaque')caches.open(VERSION).then(c=>c.put(e.request,r.clone())).catch(()=>{});return r}).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});