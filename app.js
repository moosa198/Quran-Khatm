(() => {
const DAYS=[
 {key:'friday',name:'Friday',number:'01',pages:[2,147],pdf:'quran/friday.pdf',audio:'quran/friday.mp3',duration:3524},
 {key:'saturday',name:'Saturday',number:'02',pages:[147,288],pdf:'quran/saturday.pdf',audio:'quran/saturday.mp3',duration:5354},
 {key:'sunday',name:'Sunday',number:'03',pages:[288,393],pdf:'quran/sunday.pdf',audio:'quran/sunday.mp3',duration:4011},
 {key:'monday',name:'Monday',number:'04',pages:[393,511],pdf:'quran/monday.pdf',audio:'quran/monday.mp3',duration:4008},
 {key:'tuesday',name:'Tuesday',number:'05',pages:[511,618],pdf:'quran/tuesday.pdf',audio:'quran/tuesday.mp3',duration:3279},
 {key:'wednesday',name:'Wednesday',number:'06',pages:[618,721],pdf:'quran/wednesday.pdf',audio:'quran/wednesday.mp3',duration:3235},
 {key:'thursday',name:'Thursday',number:'07',pages:[721,849],pdf:'quran/thursday.pdf',audio:'quran/thursday.mp3',duration:3502}
];
const KEY='weeklyQuran:';
const safeGet=(key,fallback=null)=>{try{const v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch{return fallback}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const dayByKey=k=>DAYS.find(d=>d.key===k)||DAYS[0];
const todayKey=()=>['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()];
const getTheme=()=>document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem(KEY+'theme',t)}catch{};document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');b.title=t==='dark'?'Light mode':'Dark mode'})}
function icon(name){return({back:'‹',next:'›',play:'▶',pause:'Ⅱ',sun:'☼',bookmark:'♡',bookmarked:'♥',expand:'⛶',exit:'×',save:'⇩',check:'✓'})[name]||'·'}
function install(){let prompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;document.querySelector('#install-note')?.removeAttribute('hidden')});document.querySelector('#install')?.addEventListener('click',async()=>{if(prompt){await prompt.prompt();prompt=null}else alert('Use your browser menu and choose Install app or Add to Home Screen.')})}
function home(){
 const today=todayKey(), saved=safeGet(KEY+'last'), continueDay=saved?.day?dayByKey(saved.day):dayByKey(today), marks=safeGet(KEY+'bookmarks',{});
 document.querySelector('#app').innerHTML=`
 <main class="home">
  <header class="home-header">
   <button data-theme-toggle class="icon-btn theme-btn" aria-label="Theme" title="Theme">${icon(getTheme()==='dark'?'sun':'moon')}</button>
   <div class="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
   <div class="arabic-title" lang="ar" dir="rtl">القرآن الكريم</div>
   <div class="title-rule"><i></i></div>
  </header>
  <section class="hero-actions">
   <a class="action-card primary" href="#read/${continueDay.key}"><span class="action-icon">↗</span><span><b>Continue reading</b><small>${continueDay.name}${saved?.page?' · page '+saved.page:''}</small></span></a>
   <a class="action-card" href="#read/${today}"><span class="action-icon">▣</span><span><b>Today</b><small>${dayByKey(today).name}</small></span></a>
  </section>
  <section class="day-section">
   <div class="section-heading"><span>Friday → Thursday</span></div>
   <nav class="day-grid" aria-label="Weekly portions">${DAYS.map(d=>`<a class="day-card ${d.key===today?'today':''}" href="#read/${d.key}"><span class="day-no">${d.number}</span><span class="day-copy"><b>${d.name}</b>${marks[d.key]?'<small>Bookmarked · page '+marks[d.key]+'</small>':''}</span><span class="chevron">${icon('next')}</span></a>`).join('')}</nav>
  </section>
  <section class="bookmarks-section" ${Object.keys(marks).length?'':'hidden'}>
   <div class="section-heading"><span>Bookmarks</span><small>Saved pages</small></div>
   <div class="bookmark-list">${DAYS.filter(d=>marks[d.key]).map(d=>`<a href="#read/${d.key}">Page ${marks[d.key]} <span>${d.name}</span><b>${icon('next')}</b></a>`).join('')}</div>
  </section>
  <section class="install-note" id="install-note" hidden><span><b>Install the reader</b><small>Quick access to your weekly Qur’an reader.</small></span><button id="install">Install</button></section>
 </main>`;
 document.querySelector('[data-theme-toggle]').onclick=()=>setTheme(getTheme()==='dark'?'light':'dark');install();
}
function reader(key){
 const d=dayByKey(key), saved=safeGet(KEY+'last'), marks=safeGet(KEY+'bookmarks',{});
 const mark=marks[d.key];
 const index=DAYS.findIndex(x=>x.key===d.key), prev=DAYS[index-1], next=DAYS[index+1];
 document.querySelector('#app').innerHTML=`
 <div class="reader">
  <header class="topbar">
   <a class="back" href="#">${icon('back')}<span>Home</span></a>
   <div class="day-title"><b>${d.name}</b><small>Pages ${d.pages[0]}–${d.pages[1]}</small></div>
   <button data-theme-toggle class="icon-btn" aria-label="Theme" title="Theme">${icon(getTheme()==='dark'?'sun':'moon')}</button>
  </header>
  <div class="reader-nav">
   ${prev?`<a href="#read/${prev.key}" class="nav-day">‹ <span>${prev.name}</span></a>`:'<span></span>'}
   <div class="page-jump"><label for="page-range">Page <output id="page-output">${saved?.day===d.key&&saved.page?saved.page:d.pages[0]}</output></label><input id="page-range" type="range" min="${d.pages[0]}" max="${d.pages[1]}" value="${saved?.day===d.key&&saved.page?saved.page:d.pages[0]}" step="1" aria-label="Jump to page"></div>
   ${next?`<a href="#read/${next.key}" class="nav-day"><span>${next.name}</span> ›</a>`:'<span></span>'}
  </div>
  <div class="reader-tools">
   <button id="offline" class="tool-btn" aria-label="Save this day for offline use" title="Save this day for offline use"><span>Save offline</span></button>
   <button id="focus" class="tool-btn desktop-only" aria-label="Enter focus mode" title="Focus mode"><span>Focus</span></button>
  </div>
  <div class="progress-line"><span id="reading-progress"></span></div>
  <section id="pdf-viewer" class="pdf-viewer" aria-label="Qur’an pages"><div class="loading">Opening the Mushaf…</div></section>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <div class="audio-player">
   <audio id="audio" preload="metadata" crossorigin="anonymous" src="${d.audio}"></audio>
   <div class="player-main">
    <button id="play" class="play-btn" aria-label="Play" title="Play">${icon('play')}</button>
    <button id="back10" class="mini-btn" aria-label="Back 10 seconds" title="Back 10 seconds">−10</button>
    <div class="track"><div class="time-row"><span id="time">0:00</span><span>${fmt(d.duration)}</span></div><input id="seek" type="range" min="0" max="${d.duration}" value="0" step=".1" aria-label="Audio position"></div>
    <button id="forward10" class="mini-btn" aria-label="Forward 10 seconds" title="Forward 10 seconds">+10</button>
    <button id="speed" class="speed" aria-label="Playback speed">1×</button>
    <button id="bookmark" class="audio-bookmark ${mark?'active':''}" aria-label="${mark?'Remove bookmark':'Bookmark current page'}" title="${mark?'Remove bookmark':'Bookmark current page'}">${icon(mark?'bookmarked':'bookmark')}</button>
   </div>
   <div class="player-label">Sheikh Ahmed Dibaan · ${d.name} portion</div>
  </div>
 </div>`;
 document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.onclick=()=>setTheme(getTheme()==='dark'?'light':'dark'));
 setupReader(d,saved,mark);
}
function fmt(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return h?h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'):m+':'+String(sec).padStart(2,'0')}
function saveLast(day,page){safeSet(KEY+'last',{day:day.key,page,updated:Date.now()})}
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1800)}
function setBookmark(d,page){
 const marks=safeGet(KEY+'bookmarks',{});
 if(marks[d.key]===page)delete marks[d.key];else marks[d.key]=page;
 safeSet(KEY+'bookmarks',marks);return marks[d.key]||null;
}
async function saveOffline(d){
 const button=document.querySelector('#offline');if(!('caches' in window)){toast('Offline saving is not supported here.');return}
 button.disabled=true;button.classList.add('active');button.textContent='Saving…';
 try{
  const cache=await caches.open('quran-offline-v1');
  await Promise.all([cache.add(new Request(d.pdf)),cache.add(new Request(d.audio,{credentials:'same-origin'}))]);
  safeSet(KEY+'offline:'+d.key,true);button.textContent='Saved offline';toast(d.name+' saved for offline use');
 }catch(e){button.classList.remove('active');button.textContent='Save offline';toast('Could not save this day. Check your connection and try again.')}
 button.disabled=false;
}
async function setupReader(d,saved,initialBookmark){
 const audio=document.querySelector('#audio'),play=document.querySelector('#play'),seek=document.querySelector('#seek'),speed=document.querySelector('#speed'),time=document.querySelector('#time');
 let rate=Number(safeGet(KEY+'speed',1));if(![1,1.5,2].includes(rate))rate=1;audio.playbackRate=rate;speed.textContent=rate+'×';
 const setPlay=()=>{const playing=!audio.paused;play.innerHTML=icon(playing?'pause':'play');play.setAttribute('aria-label',playing?'Pause':'Play');play.title=playing?'Pause':'Play'};
 play.onclick=()=>audio.paused?audio.play().catch(()=>{}):audio.pause();audio.onplay=setPlay;audio.onpause=setPlay;
 let lastSaved=-1;audio.ontimeupdate=()=>{seek.value=audio.currentTime;time.textContent=fmt(audio.currentTime);const bucket=Math.floor(audio.currentTime/5);if(bucket!==lastSaved){lastSaved=bucket;try{localStorage.setItem(KEY+'audio:'+d.key,String(audio.currentTime))}catch{}}};
 audio.onloadedmetadata=()=>{const p=Number(localStorage.getItem(KEY+'audio:'+d.key)||0);if(p>2&&p<audio.duration-2)audio.currentTime=p;setPlay()};
 audio.onended=()=>{const i=DAYS.findIndex(x=>x.key===d.key);if(DAYS[i+1])location.hash='#read/'+DAYS[i+1].key};
 seek.oninput=()=>audio.currentTime=Number(seek.value);
 document.querySelector('#back10').onclick=()=>audio.currentTime=Math.max(0,audio.currentTime-10);
 document.querySelector('#forward10').onclick=()=>audio.currentTime=Math.min(audio.duration||d.duration,audio.currentTime+10);
 speed.onclick=()=>{rate=rate===1?1.5:rate===1.5?2:1;audio.playbackRate=rate;speed.textContent=rate+'×';safeSet(KEY+'speed',rate)};
 audio.onerror=()=>{const label=document.querySelector('.player-label');if(label)label.textContent='Audio unavailable — check the selected MP3 in quran/.'};
 const bookmark=document.querySelector('#bookmark');
 bookmark.onclick=()=>{const p=window.currentQuranPage||d.pages[0],b=setBookmark(d,p),isOn=!!b;bookmark.classList.toggle('active',isOn);bookmark.innerHTML=icon(isOn?'bookmarked':'bookmark');bookmark.setAttribute('aria-label',isOn?'Remove bookmark':'Bookmark current page');bookmark.title=isOn?'Remove bookmark':'Bookmark current page';toast(isOn?'Page '+p+' bookmarked':'Bookmark removed')};
 document.querySelector('#offline').onclick=()=>saveOffline(d);
 const focus=document.querySelector('#focus');
 if(focus){focus.onclick=async()=>{if(document.fullscreenElement){await document.exitFullscreen?.()}else await document.documentElement.requestFullscreen?.();updateFocus()};document.addEventListener('fullscreenchange',updateFocus)}
 function updateFocus(){if(!focus)return;const on=!!document.fullscreenElement;focus.innerHTML='<span>'+(on?'Exit focus':'Focus')+'</span>';focus.setAttribute('aria-label',on?'Exit focus mode':'Enter focus mode');focus.title=on?'Exit focus mode':'Focus mode'}
 const range=document.querySelector('#page-range'),output=document.querySelector('#page-output');
 range.oninput=()=>{output.value=range.value;const p=document.querySelector('.pdf-page[data-page="'+range.value+'"]');p?.scrollIntoView({behavior:'smooth',block:'start'});saveLast(d,Number(range.value));window.currentQuranPage=Number(range.value)};
 await renderPdf(d,saved?.day===d.key&&saved.page?saved.page:d.pages[0]);
 if(initialBookmark)toast('Bookmark: page '+initialBookmark);
}
async function renderPdf(d,startPage){
 const viewer=document.querySelector('#pdf-viewer');if(!window.pdfjsLib){viewer.innerHTML='<div class="error">PDF viewer unavailable.</div>';return}
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 try{
  const pdf=await pdfjsLib.getDocument(d.pdf).promise,first=Math.max(1,d.pages[0]),last=Math.min(d.pages[1],first+pdf.numPages-1),pages=[];
  viewer.replaceChildren();
  for(let n=first;n<=last;n++){const wrap=document.createElement('div');wrap.className='pdf-page';wrap.dataset.page=n;wrap.innerHTML='<div class="page-loading">Page '+n+'</div>';viewer.appendChild(wrap);pages.push(wrap)}
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!e.target.dataset.done)renderPage(pdf,e.target,first)}else if(e.target.dataset.done){e.target.replaceChildren();delete e.target.dataset.done}}),{rootMargin:'1000px 0px'});
  pages.forEach(p=>observer.observe(p));
  const progress=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const n=Number(e.target.dataset.page);window.currentQuranPage=n;saveLast(d,n);document.querySelector('#reading-progress').style.width=((n-first+1)/(last-first+1)*100)+'%';const r=document.querySelector('#page-range'),o=document.querySelector('#page-output');if(r){r.value=n;o.value=n}}}),{rootMargin:'-35% 0px -55% 0px'});
  pages.forEach(p=>progress.observe(p));
  const target=pages.find(p=>Number(p.dataset.page)===Number(startPage));if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
 }catch(e){console.error(e);viewer.innerHTML='<div class="error">The Qur’an PDF could not be opened. Check the selected day’s PDF.</div>'}
}
async function renderPage(pdf,wrap,first){try{const page=await pdf.getPage(Number(wrap.dataset.page)-first+1),base=page.getViewport({scale:1}),width=Math.min(980,Math.max(280,wrap.clientWidth||760)),scale=width/base.width,vp=page.getViewport({scale}),dpr=Math.min(devicePixelRatio||1,2),c=document.createElement('canvas');c.width=vp.width*dpr;c.height=vp.height*dpr;c.style.width=vp.width+'px';c.style.height=vp.height+'px';await page.render({canvasContext:c.getContext('2d'),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;wrap.replaceChildren(c);wrap.dataset.done='1'}catch(e){wrap.innerHTML='<div class="error">Page unavailable.</div>'}}
function route(){const m=location.hash.match(/^#read\/(friday|saturday|sunday|monday|tuesday|wednesday|thursday)$/);m?reader(m[1]):home()}
window.addEventListener('hashchange',route);route();
})();