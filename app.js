(() => {
const DAYS=[
 {key:'friday',name:'Friday',number:'01',pages:[2,147],audio:'audio/friday.mp3',duration:3524},
 {key:'saturday',name:'Saturday',number:'02',pages:[147,288],audio:'audio/saturday.mp3',duration:5354},
 {key:'sunday',name:'Sunday',number:'03',pages:[288,393],audio:'audio/sunday.mp3',duration:4011},
 {key:'monday',name:'Monday',number:'04',pages:[393,511],audio:'audio/monday.mp3',duration:4008},
 {key:'tuesday',name:'Tuesday',number:'05',pages:[511,618],audio:'audio/tuesday.mp3',duration:3279},
 {key:'wednesday',name:'Wednesday',number:'06',pages:[618,721],audio:'audio/wednesday.mp3',duration:3235},
 {key:'thursday',name:'Thursday',number:'07',pages:[721,849],audio:'audio/thursday.mp3',duration:3502}
];
const KEY='weeklyQuran:';
const dayByKey=k=>DAYS.find(d=>d.key===k)||DAYS[0];
function todayKey(){return ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][new Date().getDay()]}
function getTheme(){return document.documentElement.dataset.theme||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light')}
function setTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(KEY+'theme',t);document.querySelector('#theme')?.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode')}
function icon(name){return ({book:'⌑',today:'▣',continue:'↗',prev:'‹',next:'›',play:'▶',pause:'Ⅱ',sun:'☼',moon:'◐',bookmark:'◇',expand:'⛶',download:'↓'})[name]||'·'}
function home(){
 const today=todayKey(), saved=JSON.parse(localStorage.getItem(KEY+'last')||'null'), continueDay=saved?.day?dayByKey(saved.day):dayByKey(today);
 document.querySelector('#app').innerHTML=`
 <main class="home">
  <header class="home-header">
   <button id="theme" class="icon-btn theme-btn" aria-label="Switch to dark mode" title="Theme">${icon(getTheme()==='dark'?'sun':'moon')}</button>
   <div class="mushaf-mark" aria-hidden="true"><span></span></div>
   <h1 lang="ar" dir="rtl">القرآن الكريم</h1><p>Weekly Qur’an Reading</p>
  </header>
  <section class="hero-actions">
   <a class="action-card primary" href="#read/${continueDay.key}"><span class="action-icon">${icon('continue')}</span><span><b>Continue reading</b><small>${continueDay.name}${saved?.page?' · page '+saved.page:''}</small></span></a>
   <a class="action-card" href="#read/${today}"><span class="action-icon">${icon('today')}</span><span><b>Today</b><small>${dayByKey(today).name} · pages ${dayByKey(today).pages[0]}–${dayByKey(today).pages[1]}</small></span></a>
  </section>
  <section class="day-section"><div class="section-heading"><span>Weekly portions</span><small>Friday → Thursday</small></div><nav class="day-grid">${DAYS.map(d=>`<a class="day-card ${d.key===today?'today':''}" href="#read/${d.key}"><span class="day-no">${d.number}</span><span class="day-copy"><b>${d.name}</b><small>Pages ${d.pages[0]}–${d.pages[1]}</small></span><span class="chevron">${icon('next')}</span></a>`).join('')}</nav></section>
  <section class="install-note" id="install-note" hidden><span><b>Install the reader</b><small>Add it to your device for quick access and offline shell support.</small></span><button id="install">Install</button></section>
 </main>`;
 document.querySelector('#theme').onclick=()=>{const n=getTheme()==='dark'?'light':'dark';setTheme(n)};
 setupInstall();
}
async function reader(key){
 const d=dayByKey(key), saved=JSON.parse(localStorage.getItem(KEY+'last')||'null');
 document.querySelector('#app').innerHTML=`
 <div class="reader">
  <header class="topbar"><a class="back" href="#">${icon('prev')} <span>Home</span></a><div class="day-title"><b>${d.name}</b><small>Pages ${d.pages[0]}–${d.pages[1]}</small></div><button id="theme" class="icon-btn" aria-label="Theme">${icon(getTheme()==='dark'?'sun':'moon')}</button></header>
  <div class="reader-tools"><button id="bookmark" class="tool-btn">${icon('bookmark')} <span>Bookmark</span></button><button id="focus" class="tool-btn">${icon('expand')} <span>Focus</span></button><a class="tool-btn" href="quran.pdf" download>${icon('download')} <span>PDF</span></a></div>
  <div class="progress-line"><span id="reading-progress"></span></div>
  <section id="pdf-viewer" class="pdf-viewer"><div class="loading">Opening the Mushaf…</div></section>
  <div class="audio-player">
   <audio id="audio" preload="metadata" src="${d.audio}"></audio>
   <div class="player-top"><button id="play" class="play-btn" aria-label="Play">${icon('play')}</button><div class="track"><div class="time-row"><span id="time">0:00</span><span>${fmt(d.duration)}</span></div><input id="seek" type="range" min="0" max="${d.duration}" value="0" step=".1"></div><button id="speed" class="speed">1×</button></div>
   <div class="player-label">Sheikh Ahmed Dibaan · ${d.name} portion</div>
  </div>
 </div>`;
 document.querySelector('#theme').onclick=()=>{setTheme(getTheme()==='dark'?'light':'dark')};
 setupReader(d,saved);
}
function fmt(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return h?h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'):m+':'+String(sec).padStart(2,'0')}
function save(day,page){localStorage.setItem(KEY+'last',JSON.stringify({day:day.key,page,updated:Date.now()}))}
async function setupReader(d,saved){
 const audio=document.querySelector('#audio'), play=document.querySelector('#play'), seek=document.querySelector('#seek'), speed=document.querySelector('#speed'), time=document.querySelector('#time');
 let rate=Number(localStorage.getItem(KEY+'speed')||1); if(![1,1.5,2].includes(rate))rate=1;audio.playbackRate=rate;speed.textContent=rate+'×';
 play.onclick=()=>audio.paused?audio.play().catch(()=>{}):audio.pause();
 audio.onplay=()=>play.textContent=icon('pause'); audio.onpause=()=>play.textContent=icon('play');
 audio.ontimeupdate=()=>{seek.value=audio.currentTime;time.textContent=fmt(audio.currentTime);if(Math.floor(audio.currentTime)%5===0)localStorage.setItem(KEY+'audio:'+d.key,audio.currentTime)};
 audio.onloadedmetadata=()=>{const p=Number(localStorage.getItem(KEY+'audio:'+d.key)||0);if(p>2&&p<audio.duration-2)audio.currentTime=p};
 seek.oninput=()=>{audio.currentTime=Number(seek.value)};
 speed.onclick=()=>{rate=rate===1?1.5:rate===1.5?2:1;audio.playbackRate=rate;speed.textContent=rate+'×';localStorage.setItem(KEY+'speed',rate)};
 document.querySelector('#bookmark').onclick=()=>{const p=window.currentQuranPage||d.pages[0];save(d,p);document.querySelector('#bookmark').classList.add('active')};
 document.querySelector('#focus').onclick=()=>document.documentElement.requestFullscreen?.();
 await renderPdf(d,saved?.day===d.key?saved.page:d.pages[0]);
}
async function renderPdf(d,startPage){
 const viewer=document.querySelector('#pdf-viewer'); if(!window.pdfjsLib){viewer.innerHTML='<div class="error">PDF viewer unavailable.</div>';return}
 pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
 try{
  const pdf=await pdfjsLib.getDocument('quran.pdf').promise;
  const first=Math.max(1,d.pages[0]), last=Math.min(pdf.numPages,d.pages[1]);
  const pages=[];
  for(let n=first;n<=last;n++){const wrap=document.createElement('div');wrap.className='pdf-page';wrap.dataset.page=n;wrap.innerHTML='<div class="page-loading">Page '+n+'</div>';viewer.appendChild(wrap);pages.push(wrap)}
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting||e.target.dataset.done)return;renderPage(pdf,e.target);}),{rootMargin:'900px 0px'});
  pages.forEach(p=>observer.observe(p));
  const progress=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const n=Number(e.target.dataset.page);window.currentQuranPage=n;save(d,n);document.querySelector('#reading-progress').style.width=((n-first+1)/(last-first+1)*100)+'%'}}),{rootMargin:'-35% 0px -55% 0px'});
  pages.forEach(p=>progress.observe(p));
  const target=pages.find(p=>Number(p.dataset.page)===Number(startPage)); if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
 }catch(e){console.error(e);viewer.innerHTML='<div class="error">The Qur’an PDF could not be opened. Make sure <b>quran.pdf</b> is in the project.</div>'}
}
async function renderPage(pdf,wrap){try{const page=await pdf.getPage(Number(wrap.dataset.page));const base=page.getViewport({scale:1});const width=Math.min(980,Math.max(280,wrap.clientWidth||760));const scale=width/base.width;const vp=page.getViewport({scale});const dpr=Math.min(devicePixelRatio||1,2);const c=document.createElement('canvas');c.width=vp.width*dpr;c.height=vp.height*dpr;c.style.width=vp.width+'px';c.style.height=vp.height+'px';await page.render({canvasContext:c.getContext('2d'),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;wrap.replaceChildren(c);wrap.dataset.done='1'}catch(e){wrap.innerHTML='<div class="error">Page unavailable.</div>'}}
function setupInstall(){let prompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;const n=document.querySelector('#install-note');if(n)n.hidden=false});const b=document.querySelector('#install');if(b)b.onclick=async()=>{if(prompt){await prompt.prompt();prompt=null}else alert('Use your browser menu and choose Install app or Add to Home Screen.')}} 
function route(){const m=location.hash.match(/^#read\/(friday|saturday|sunday|monday|tuesday|wednesday|thursday)$/);m?reader(m[1]):home()}
window.addEventListener('hashchange',route);route();
})();