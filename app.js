(() => {
const WEEKLY_DAYS=[
 {key:'friday',name:'Friday',number:'01',surahs:'Al-Fātiḥah – Āl ʿImrān',pages:[2,106],pdf:'quran/friday.pdf',audio:'quran/friday.mp3',duration:3524},
 {key:'saturday',name:'Saturday',number:'02',surahs:'An-Nisā’ – Al-Anfāl',pages:[106,260],pdf:'quran/saturday.pdf',audio:'quran/saturday.mp3',duration:5354},
 {key:'sunday',name:'Sunday',number:'03',surahs:'At-Tawbah – Al-Ḥijr',pages:[260,372],pdf:'quran/sunday.pdf',audio:'quran/sunday.mp3',duration:4011},
 {key:'monday',name:'Monday',number:'04',surahs:'An-Naḥl – An-Nūr',pages:[372,501],pdf:'quran/monday.pdf',audio:'quran/monday.mp3',duration:4008},
 {key:'tuesday',name:'Tuesday',number:'05',surahs:'Al-Furqān – Fāṭir',pages:[501,611],pdf:'quran/tuesday.pdf',audio:'quran/tuesday.mp3',duration:3279},
 {key:'wednesday',name:'Wednesday',number:'06',surahs:'Yā-Sīn – Al-Fatḥ',pages:[611,716],pdf:'quran/wednesday.pdf',audio:'quran/wednesday.mp3',duration:3235},
 {key:'thursday',name:'Thursday',number:'07',surahs:'Al-Ḥujurāt – An-Nās (Al-Mufassal)',pages:[716,849],pdf:'quran/thursday.pdf',audio:'quran/thursday.mp3',duration:3502}
];
const PLANS={weekly:{id:'weekly',name:'7-day khatm',short:'7 days',count:7},biweekly:{id:'biweekly',name:'14-day khatm',short:'14 days',count:14},fourweekly:{id:'fourweekly',name:'28-day khatm',short:'28 days',count:28}};
const KEY='weeklyQuran:';
const PLAN_CHOSEN=KEY+'planChosen';
const PLAN_START_KEY=KEY+'planStart:';
const COMPLETED_KEY=KEY+'completed';
const PAGE_DONE_KEY=KEY+'pageDone';
const AUDIO_DONE_KEY=KEY+'audioDone';
const completedMap=()=>safeGet(COMPLETED_KEY,{})||{};
const pageDoneMap=()=>safeGet(PAGE_DONE_KEY,{})||{};
const audioDoneMap=()=>safeGet(AUDIO_DONE_KEY,{})||{};
const completionKey=(planId,key)=>planId+':'+key;
const isCompleted=(planId,key)=>!!completedMap()[completionKey(planId,key)];
function markCompleted(planId,key){const m=completedMap();m[completionKey(planId,key)]={completedAt:Date.now()};safeSet(COMPLETED_KEY,m);return m;}
function unmarkCompleted(planId,key){const m=completedMap();delete m[completionKey(planId,key)];safeSet(COMPLETED_KEY,m);}
function completionReady(plan,d){const k=completionKey(plan.id,d.key);return !!pageDoneMap()[k];}
function setDone(mapKey,planId,key){const m=safeGet(mapKey,{})||{};m[completionKey(planId,key)]=Date.now();safeSet(mapKey,m);return m;}
function completedCount(plan){return plan.portions.filter(p=>isCompleted(plan.id,p.key)).length;}
function portionProgress(plan,d){
 if(isCompleted(plan.id,d.key))return 100;
 const last=safeGet(KEY+'last',{}),page=last?.plan===plan.id&&last.key===d.key?Number(last.page)||0:0;
 return page>=d.pages[0]?Math.max(0,Math.min(100,Math.round(((page-d.pages[0]+1)/(d.pages[1]-d.pages[0]+1))*100))):0;
}
const QURAN_FIRST=2,QURAN_LAST=849,QURAN_PAGES=848;
const DAY_NAMES=['Friday','Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday'];
const safeGet=(key,fallback=null)=>{try{const v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch{return fallback}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
const weeklyByKey=k=>WEEKLY_DAYS.find(d=>d.key===k)||WEEKLY_DAYS[0];
const planId=()=>safeGet(KEY+'plan','weekly');
const buildRanges=count=>Array.from({length:count},(_,i)=>[QURAN_FIRST+Math.round(i*QURAN_PAGES/count),QURAN_FIRST+Math.round((i+1)*QURAN_PAGES/count)-1]);
function audioForRange(range){
 const [start,end]=range,segments=[];
 WEEKLY_DAYS.forEach(d=>{
  const overlapStart=Math.max(start,d.pages[0]),overlapEnd=Math.min(end,d.pages[1]);
  if(overlapStart<=overlapEnd){
   const pages=d.pages[1]-d.pages[0]+1, from=(overlapStart-d.pages[0])/pages, to=(overlapEnd-d.pages[0]+1)/pages;
   segments.push({src:d.audio,from:Math.max(0,from*d.duration),to:Math.min(d.duration,to*d.duration),duration:Math.max(0,(to-from)*d.duration),day:d.key});
  }
 });
 return segments;
}
function buildPlan(id){
 if(id==='weekly')return {id:'weekly',name:PLANS.weekly.name,cycleDays:7,portions:WEEKLY_DAYS.map((d,i)=>({...d,index:i,label:d.name,week:1,audioSegments:[{src:d.audio,from:0,to:d.duration,duration:d.duration,day:d.key}]}))};
 const p=PLANS[id]||PLANS.weekly,factor=p.count/7,portions=[];
 WEEKLY_DAYS.forEach((day,dayIndex)=>{const length=day.pages[1]-day.pages[0],bounds=Array.from({length:factor+1},(_,j)=>day.pages[0]+Math.round(j*length/factor));for(let part=0;part<factor;part++){const i=dayIndex*factor+part,range=[bounds[part],bounds[part+1]],audioSegments=audioForRange(range);portions.push({key:id+'-'+(i+1),name:day.name,number:String(i+1).padStart(2,'0'),pages:range,pdf:null,audio:null,duration:audioSegments.reduce((a,s)=>a+s.duration,0),index:i,label:'Day '+(i+1),surahLabel:day.surahs,week:Math.floor(i/7)+1,part:part+1,factor,audioSegments})}});
 return {id,name:p.name,cycleDays:p.count,portions};
}
function getPlan(){return buildPlan(planId())}
function todayIndex(plan){
 const start=ensurePlanStart(plan.id),elapsed=daysBetweenDates(start,new Date());
 return elapsed%plan.portions.length;
}
function portionFromRoute(plan,raw){
 if(plan.id==='weekly')return plan.portions.findIndex(p=>p.key===raw);
 const match=String(raw).match(/^(?:biweekly|fourweekly)-(\d+)$/);const n=match?Number(match[1]):Number(raw);return Number.isInteger(n)&&n>=1&&n<=plan.portions.length?n-1:-1;
}
const prefersDark=()=>window.matchMedia?window.matchMedia('(prefers-color-scheme:dark)').matches:false;
const getTheme=()=>document.documentElement.dataset.theme||(prefersDark()?'dark':'light');
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem(KEY+'theme',t)}catch{};document.querySelectorAll('[data-theme-toggle]').forEach(b=>{b.setAttribute('aria-label',t==='dark'?'Switch to light mode':'Switch to dark mode');b.title=t==='dark'?'Light mode':'Dark mode';b.textContent=icon(t==='dark'?'sun':'moon')})}
function icon(name){if(name==='bookmark'||name==='bookmarked')return '<svg class="bookmark-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.75L6 21V4.75Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';return({back:'‹',next:'›',play:'▶',pause:'Ⅱ',sun:'☼',moon:'☾',expand:'⛶',exit:'×',save:'⇩',check:'✓'})[name]||'·'}
function dateKey(date){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return y+'-'+m+'-'+d}
function parseDateKey(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||'')))return null;const [y,m,d]=String(value).split('-').map(Number);const date=new Date(y,m-1,d);return Number.isNaN(date.getTime())?null:date}
function daysBetweenDates(from,to){const a=new Date(from.getFullYear(),from.getMonth(),from.getDate()),b=new Date(to.getFullYear(),to.getMonth(),to.getDate());return Math.max(0,Math.round((Date.UTC(b.getFullYear(),b.getMonth(),b.getDate())-Date.UTC(a.getFullYear(),a.getMonth(),a.getDate()))/86400000))}
function planStart(id){return parseDateKey(safeGet(PLAN_START_KEY+id,null))}
function ensurePlanStart(id,fallback=null){const existing=planStart(id);if(existing)return existing;const source=fallback||new Date();safeSet(PLAN_START_KEY+id,dateKey(source));return source}
function migratePlanProgress(fromId,toId){
 if(!fromId||fromId===toId)return;
 const from=buildPlan(fromId),to=buildPlan(toId);
 const sourceRanges=from.portions.filter(p=>isCompleted(from.id,p.key)).map(p=>p.pages).sort((a,b)=>a[0]-b[0]);
 if(sourceRanges.length){
  const merged=[];
  sourceRanges.forEach(r=>{const last=merged[merged.length-1];if(last&&r[0]<=last[1]+1)last[1]=Math.max(last[1],r[1]);else merged.push([r[0],r[1]])});
  const covered=r=>merged.some(m=>r[0]>=m[0]&&r[1]<=m[1]);
  const map=completedMap();
  to.portions.forEach(p=>{if(covered(p.pages))map[completionKey(to.id,p.key)]={completedAt:Date.now(),migratedFrom:fromId}});
  safeSet(COMPLETED_KEY,map);
 }
 const last=safeGet(KEY+'last',null);
 if(last?.plan===fromId&&Number.isFinite(Number(last.page)))safeSet(KEY+'lastPage',Number(last.page));
 const fromStart=planStart(fromId);
 if(fromStart&&!planStart(toId))safeSet(PLAN_START_KEY+toId,dateKey(fromStart));
}
function setPlan(id){
 if(!PLANS[id])id='weekly';
 const previous=planId();
 if(previous!==id)migratePlanProgress(previous,id);
 safeSet(KEY+'plan',id);
 ensurePlanStart(id,planStart(previous)||new Date());
 safeSet(PLAN_CHOSEN,true);
}
function install(){
 let prompt=null;const note=document.querySelector('#install-note'),button=document.querySelector('#install'),textEl=document.querySelector('#install-text');
 const isInstalled=()=>((window.matchMedia?window.matchMedia('(display-mode: standalone)').matches:false)||window.navigator.standalone===true);
 const hide=()=>note?.setAttribute('hidden','');if(isInstalled()){hide();return}
 note?.removeAttribute('hidden');const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
 window.addEventListener('appinstalled',hide);window.addEventListener('pageshow',()=>{if(isInstalled())hide()});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&isInstalled())hide()});
 if(isiOS&&textEl)textEl.textContent='On iPhone or iPad: Share → Add to Home Screen.';
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();prompt=e;if(textEl)textEl.textContent="Install Qur'an Khatm on your device."});
 button?.addEventListener('click',async()=>{if(prompt){await prompt.prompt();prompt=null;return}if(isiOS)alert('On iPhone or iPad, tap Share, then choose “Add to Home Screen”.');else alert('Open your browser menu and choose “Install app” or “Add to Home Screen”.')});
}
function scheduleSelector(plan){
 return '<div class="schedule-selector" role="group" aria-label="Reading schedule">'+Object.values(PLANS).map(p=>'<button class="schedule-option '+(p.id===plan.id?'active':'')+'" data-plan="'+p.id+'">'+p.name+'</button>').join('')+'</div>';
}


function showGuidance(focus='niyyah'){
 const old=document.querySelector('.guidance-overlay');if(old){old.remove();return}
 const overlay=document.createElement('div');overlay.className='guidance-overlay';overlay.innerHTML=`
 <section class="guidance-sheet" role="dialog" aria-modal="true" aria-labelledby="guidance-title">
  <div class="guidance-handle"></div><button class="guidance-close" type="button" aria-label="Close">×</button>
  <p class="guidance-kicker">BEFORE TILĀWAH</p><h2 id="guidance-title">Prepare your heart</h2>
  <p class="guidance-intro">A gentle companion for approaching the Qur’an with sincerity, presence and gratitude. These reflections are invitations, not a checklist or a condition for recitation.</p>
  <details data-guidance-section="amal"><summary>Amal · intentions for every action <span>8</span></summary><p class="guidance-source">Advice attributed to Ḥaḍrat Mawlānā Ilyās (رحمه الله)</p><ol>
   <li><b>Tawfīq</b><p>O Allah, You are giving me the tawfīq to do this amal, and its outcome is in Your hands.</p></li>
   <li><b>Itā‘ah and ittibā‘</b><p>O Allah, I am doing this amal to obey Your command and follow the Sunnah of Your beloved Nabī ﷺ. I reflect on the commands and Sunnahs connected to it.</p></li>
   <li><b>Faḍā’il and istihḍār</b><p>I remember the virtues of this amal and bring to mind the reward associated with it.</p></li>
   <li><b>Murāqabah</b><p>I ponder that Allah is watching me, hears me, knows what I am doing, and is with me.</p></li>
   <li><b>Tawāḍu‘</b><p>O Allah, I am not deserving of this amal because of my sins. Through the acceptance of those performing it, accept my amal too.</p></li>
   <li><b ik>Ikhlāṣ</b><p>O Allah, I am doing this amal only to please You.</p></li>
   <li><b>Qabūl and hidāyah</b><p>O Allah, accept this amal and make it a means of hidāyah for me and all humanity.</p></li>
   <li><b>Shukr and istighfār</b><p>After the amal, thank Allah and seek His forgiveness for not having performed it as it ought to have been.</p></li>
  </ol><p class="guidance-source">The narration “Actions are judged by intentions…” is recorded in Ṣaḥīḥ al-Bukhārī. The eight points above are presented as attributed advice, not as a prescribed formula.</p></details>
  <details data-guidance-section="niyyah"><summary>Niyyah · intentions for reciting the Qur’an <span>9</span></summary><p class="guidance-source">Answered by Sayyidi Ḥabīb ʿUmar bin Ḥafīẓ (may Allah protect and benefit us by him)</p><ol>
   <li>To listen to the speech of Allah as though hearing it conveyed by Allah on the tongue of His Messenger ﷺ.</li>
   <li>To have an intimate munājāt with Allah through His speech, the best means by which we commune with Him.</li>
   <li>To draw near to Allah through His speech.</li>
   <li>To open the door to ‘ilm through its sublime source: the speech of Allah.</li>
   <li>To seek the downpour of Allah’s raḥmah, remembering Qur’an 7:204.</li>
   <li>To use my time in the best way.</li>
   <li>To seek the pleasure of the Prophet ﷺ.</li>
   <li>To beautify my heart, mind and tongue with the speech of Allah.</li>
   <li>To join those in the heavens and earth who are reciting the Qur’an at that time.</li>
  </ol></details>
  <details data-guidance-section="adab"><summary>Adab · etiquette of recitation <span>Dear Huffaz</span></summary><ul>
   <li>Prepare with cleanliness and respect; wudū’ is necessary when handling a physical muṣḥaf, while reciting from memory without touching it does not require wudū’ (the text recommends it as an etiquette).</li>
   <li>Choose a clean place and sit respectfully; facing the qiblah is recommended, not a condition.</li>
   <li>Begin with isti‘ādhah and basmalah. Recite with tajwīd, slowly and clearly.</li>
   <li>Give the Qur’an your full attention. Listen attentively and ponder its meanings (tadabbur).</li>
   <li>Where appropriate, ask Allah for raḥmah at verses of mercy, seek refuge at verses of punishment, and glorify Him when His greatness is mentioned.</li>
   <li>Recite audibly when suitable, but lower your voice if you may disturb someone, interrupt worship or invite showing off.</li>
   <li>When you need to speak, finish the āyah if possible, pause respectfully, then resume with isti‘ādhah.</li>
   <li>Hold and place a physical muṣḥaf respectfully; do not place it on the floor or where feet tread.</li>
  </ul><p class="guidance-source">Adapted from “The Rights and Etiquettes of the Glorious Qur’an” in <i>Dear Huffaz</i>. Distinctions between necessary and recommended practices are retained.</p></details>
  <details><summary>For ḥuffāẓ: preserving the Qur’an</summary><ul>
   <li>Maintain regular tilāwah and murāja‘ah; seek a sustainable wird.</li><li>Recite in ṣalāh where able and keep revision connected to worship.</li><li>Have a daily portion reviewed by a qualified teacher or fellow ḥāfiẓ when possible.</li><li>Study meanings with reliable scholars and strive to live by the Qur’an.</li><li>Remain humble, sincere and of good character; seek the company and guidance of people of knowledge.</li><li>Remember the blessing of hifẓ with shukr, and turn to Allah with istighfār.</li>
  </ul><p class="guidance-source">A concise selection from the ḥuffāẓ guidance in <i>Dear Huffaz</i>. Specific practices in the source are not presented as universal obligations.</p></details>
  <div class="guidance-after"><b>After your recitation</b><p>Alḥamdulillāh for the tawfīq to recite. O Allah, accept it, forgive my shortcomings, and make the Qur’an a means of hidāyah.</p><small>An app-authored reflection, not a transmitted or prescribed du‘ā’.</small></div>
 </section>`;
 document.body.appendChild(overlay);const sections={niyyah:overlay.querySelector('[data-guidance-section="niyyah"]'),adab:overlay.querySelector('[data-guidance-section="adab"]'),amal:overlay.querySelector('[data-guidance-section="amal"]')};Object.entries(sections).forEach(([key,el])=>{if(el)el.open=key===focus});const close=()=>overlay.remove();overlay.querySelector('.guidance-close').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});const onKey=e=>{if(e.key==='Escape'){close();document.removeEventListener('keydown',onKey)}};document.addEventListener('keydown',onKey);
}

function planHome(){
 const plan=getPlan(),today=todayIndex(plan),saved=safeGet(KEY+'last'),done=completedCount(plan);
 const foundIncomplete=plan.portions.findIndex(p=>!isCompleted(plan.id,p.key)),firstIncomplete=foundIncomplete<0?0:foundIncomplete;
 const continueIndex=saved?.plan===plan.id&&Number.isInteger(saved.index)?Math.min(saved.index,plan.portions.length-1):firstIncomplete;
 const continuePortion=plan.portions[continueIndex],todayPortion=plan.portions[today],hasStarted=!!(saved?.plan===plan.id||done>0);
 const start=ensurePlanStart(plan.id),elapsed=daysBetweenDates(start,new Date()),dayNumber=Math.min(plan.portions.length,elapsed+1),daysRemaining=Math.max(0,plan.portions.length-dayNumber),behind=Math.max(0,dayNumber-done-1);
 const journeyStatus=done===plan.portions.length?'Khatm complete':behind>0?behind+' day'+(behind===1?'':'s')+' behind':'On pace';
 const primary=hasStarted?continuePortion:todayPortion;
 document.querySelector('#app').innerHTML=`
 <main class="home home-clean home-plan-${plan.id}">
  <header class="home-header">
   <button data-theme-toggle class="icon-btn theme-btn" aria-label="Theme" title="Theme">${icon(getTheme()==='dark'?'sun':'moon')}</button>
   <div class="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
   <div class="arabic-title" lang="ar" dir="rtl">القرآن الكريم</div>
   <div class="title-rule"><i></i></div>
  </header>

  <div class="home-plan-line">
   <span>${plan.name} <small>· ${planDailyTime(plan.id)}/day</small></span>
   <a href="#choose">Change</a>
  </div>

  <section class="home-start">
   <a class="home-start-main" href="#read/${plan.id}/${primary.key}">
    <span class="home-start-icon">${hasStarted?'↗':'▣'}</span>
    <span><b>${hasStarted?'Continue your tilāwah':"Start today's tilāwah"}</b><small>${primary.label}${saved?.plan===plan.id&&saved?.page?' · page '+saved.page:''} · ${habitTime(primary.duration)}</small></span>
    <span class="home-start-arrow">→</span>
   </a>
   <a class="home-today" href="#read/${plan.id}/${todayPortion.key}"><span>Today</span><b>${todayPortion.label}</b><small>${habitTime(todayPortion.duration)}</small></a>
  </section>

  <section class="home-progress" aria-label="Khatm progress">
   <div class="home-progress-top">
    <strong>Day ${dayNumber} of ${plan.portions.length}</strong>
    <span>${done} complete · ${daysRemaining} remaining</span>
    <b>${journeyStatus}</b>
   </div>
   <div class="journey-track"><span style="width:${plan.portions.length?Math.round(done/plan.portions.length*100):0}%"></span></div>
  </section>

  <section class="day-section home-days">
   <div class="section-heading"><span>${plan.id==='weekly'?'Friday → Thursday':'Your tilāwah'}</span><small>${plan.id==='weekly'?'7 days':'Day 1–'+plan.portions.length}</small></div>
   <nav class="day-grid ${plan.id!=='weekly'?'long-grid':''}" aria-label="Days of recitation">${plan.portions.map((d,i)=>{const complete=isCompleted(plan.id,d.key),pct=portionProgress(plan,d);return `<a class="day-card ${complete?'completed ':''}${pct>0&&!complete?'in-progress ':''}${i===today?'today':''}" href="#read/${plan.id}/${d.key}"><span class="day-no">${complete?'✓':d.number}</span><span class="day-copy"><b><span class="day-full">${d.label}</span><span class="day-short">${d.label.length>3?d.label.slice(0,3):d.label}</span><em class="habit-time"> · ${habitTime(d.duration)}</em></b><small>${d.factor?'Pages '+d.pages[0]+'–'+d.pages[1]+' · '+(d.surahLabel||d.surahs):d.surahLabel||d.surahs}</small></span><span class="day-actions"><span class="tile-progress-label">${pct>0&&!complete?pct+'%':''}</span><span class="chevron">${icon('next')}</span></span><span class="tile-progress" role="progressbar" aria-label="${d.label} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></span></a>`}).join('')}</nav>
  </section>
 </main>`;
 document.querySelector('[data-theme-toggle]').onclick=()=>setTheme(getTheme()==='dark'?'light':'dark');
}
function preludeSeen(planId,key){return !!safeGet(KEY+'prelude:'+planId+':'+key,false)}
function setPreludeSeen(planId,key){safeSet(KEY+'prelude:'+planId+':'+key,true)}
function renderPrelude(plan,d,index){
 const app=document.querySelector('#app');
 app.innerHTML='<main class="reading-prelude"><header class="prelude-header"><a class="back" href="#home">'+icon('back')+'<span>Home</span></a><button data-theme-toggle class="icon-btn theme-btn" aria-label="Theme" title="Theme">'+icon(getTheme()==='dark'?'sun':'moon')+'</button></header><div class="prelude-inner"><p class="guidance-kicker">BEFORE TILĀWAH</p><div class="prelude-arabic" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div><h1>'+d.label+'</h1><p class="prelude-surahs">'+(d.surahLabel||d.surahs||d.name)+'</p><p class="prelude-intro">Take a moment before you begin. Renew your niyyah, observe the adab of the Qur’an, and ask Allah to make this tilāwah a means of amal.</p><div class="prelude-path"><button type="button" data-guidance="niyyah"><b>Niyyah</b><span>Why am I reciting?</span><i>→</i></button><button type="button" data-guidance="adab"><b>Adab</b><span>How will I approach it?</span><i>→</i></button><button type="button" data-guidance="amal"><b>Amal</b><span>What will I carry into life?</span><i>→</i></button></div><button class="prelude-begin" type="button" id="begin-tilawah">Begin tilāwah <span>→</span></button><p class="prelude-time">'+habitTime(d.duration)+' · '+(d.pages[1]-d.pages[0]+1)+' pages</p></div></main>';
 document.querySelector('[data-theme-toggle]').onclick=()=>setTheme(getTheme()==='dark'?'light':'dark');
 document.querySelectorAll('[data-guidance]').forEach(b=>b.onclick=()=>showGuidance(b.dataset.guidance||'niyyah'));
 document.querySelector('#begin-tilawah').onclick=()=>{setPreludeSeen(plan.id,d.key);reader(plan.id,d.key,true)};
}
function reader(planIdValue,key,skipPrelude=false){
 setPlan(planIdValue);
 const plan=buildPlan(planIdValue),index=portionFromRoute(plan,key);if(index<0){location.hash='';return}const d=plan.portions[index],saved=safeGet(KEY+'last'),globalPage=Number(safeGet(KEY+'lastPage',0))||0;
 const marks=safeGet(KEY+'bookmarks',{})||{},mark=marks[plan.id+':'+d.key],prev=plan.portions[index-1],next=plan.portions[index+1];
 const hasPdf=!!d.pdf;
 document.querySelector('#app').innerHTML=`
 <div class="reader" data-portion-key="${d.key}">
  <header class="topbar">
   <a class="back" href="#home">${icon('back')}<span>Home</span></a>
   <div class="day-title"><b>${d.label}</b><small>${d.surahLabel||d.surahs||d.name}${d.factor?'<span class=\"portion-detail\">'+d.part+'/'+d.factor+'</span>':''}</small></div>
   <div class="topbar-actions">
    <button id="reader-guidance" class="topbar-guidance" type="button" aria-label="Intentions and adab" title="Intentions and adab">♡</button>\n    <button id="offline" class="topbar-offline" aria-label="Save this day for offline use" title="Save this day for offline use">${icon('save')}</button>
    <button data-theme-toggle class="icon-btn theme-btn" aria-label="Theme" title="Theme">${icon(getTheme()==="dark"?"sun":"moon")}</button>
   </div>
  </header>
  <div class="reader-nav">
   ${prev?`<a href="#read/${plan.id}/${prev.key}" class="nav-day">‹ <span>${prev.label}</span></a>`:'<span></span>'}
   <div class="page-jump"><label for="page-range">Page <output id="page-output">${saved?.plan===plan.id&&saved.index===index&&saved.page?saved.page:d.pages[0]}</output></label><input id="page-range" type="range" min="${d.pages[0]}" max="${d.pages[1]}" value="${saved?.plan===plan.id&&saved.index===index&&saved.page?saved.page:d.pages[0]}" step="1" aria-label="Jump to page"></div>
   ${next?`<a href="#read/${plan.id}/${next.key}" class="nav-day"><span>${next.label}</span> ›</a>`:'<span></span>'}
  </div>
  <div class="reader-bookmarks"><button id="bookmark-list-toggle" type="button" aria-expanded="false">Saved pages <span id="bookmark-count"></span>⌄</button><div id="bookmark-list-panel" hidden></div></div>
  <section id="pdf-viewer" class="pdf-viewer" aria-label="Qur’an pages"></section>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <section class="completion-panel" id="completion-panel" hidden></section>
  <div class="audio-player">
   <audio id="audio" preload="metadata"></audio>
   <div class="player-main">
    <button id="play" class="play-btn" aria-label="Play" title="Play">${icon('play')}</button>
    <button id="back10" class="mini-btn" aria-label="Back 10 seconds" title="Back 10 seconds">−10</button>
    <div class="track"><div class="time-row"><span id="time">0:00</span><span id="total-time">${fmt(d.duration)}</span></div><input id="seek" type="range" min="0" max="${d.duration}" value="0" step=".1" aria-label="Audio position"></div>
    <button id="forward10" class="mini-btn" aria-label="Forward 10 seconds" title="Forward 10 seconds">+10</button>
    <div class="speed-control"><button id="speed" class="speed" type="button" aria-label="Recitation speed" aria-haspopup="menu" aria-expanded="false">1×</button><div id="speed-menu" class="speed-menu" role="menu" hidden><div class="speed-menu-title">Playback speed</div><button type="button" role="menuitemradio" data-speed="0.5" aria-checked="false">0.5×</button><button type="button" role="menuitemradio" data-speed="0.75" aria-checked="false">0.75×</button><button type="button" role="menuitemradio" data-speed="1" aria-checked="true">1×</button><button type="button" role="menuitemradio" data-speed="1.25" aria-checked="false">1.25×</button></div></div>
    <button id="bookmark" class="audio-bookmark ${mark?'active':''}" aria-label="${mark?'Remove bookmark':'Bookmark current page'}" title="${mark?'Remove bookmark':'Bookmark current page'}">${icon(mark?'bookmarked':'bookmark')}</button>
   </div>
   <div class="player-label">Sheikh Ahmed Dibaan · ${d.label} · Follow the recitation, or listen as you go about your day.</div>
  </div>
 </div>`;
 
 document.querySelector('[data-theme-toggle]').onclick=()=>setTheme(getTheme()==='dark'?'light':'dark');
 document.querySelector('#reader-guidance')?.addEventListener('click',()=>showGuidance('niyyah'));
 setupReader(plan,d,index,saved,mark);
 setupDaySwipe(plan,index);
}

function showCompletion(plan,d,index){
 if(isCompleted(plan.id,d.key))return;
 markCompleted(plan.id,d.key);
 const done=completedCount(plan),last=done===plan.portions.length,panel=document.querySelector('#completion-panel');
 if(!panel)return;
 panel.hidden=false;
 panel.innerHTML=last?`
   <div class="completion-inner khatm-complete">
    <div class="completion-arabic" lang="ar" dir="rtl">الحمد لله</div>
    <p class="completion-kicker">KHATM CYCLE COMPLETE</p>
    <h2>Alhamdulillah.</h2>
    <p>You have completed this tilāwah cycle. May Allah accept your recitation and keep you close to His Book.</p>
    <div class="completion-stat">${done} / ${plan.portions.length} portions</div>
    <div class="completion-reflections">
      <div><b>Shukr</b><span>Thank Allah for the tawfīq to complete this khatm.</span></div>
      <div><b>Tadabbur</b><span>What āyah, meaning or reminder will you carry forward?</span></div>
      <div><b>Amal</b><span>Choose one thing from the Qur’an to put into practice.</span></div>
    </div>
    <div class="completion-actions"><a class="completion-button" href="#home">Return home</a><button class="completion-button" type="button" data-guidance="niyyah">Before your next tilāwah</button></div>
   </div>`:`
   <div class="completion-inner">
    <div class="completion-check">✓</div>
    <p class="completion-kicker">ALḤAMDULILLĀH</p>
    <h2>Carry the Qur’an with you.</h2>
    <p>You have reached the end of this portion. Before you move on, take a moment for shukr, tadabbur and amal.</p>
    <div class="completion-reflections">
      <div><b>Shukr</b><span>Thank Allah for the tawfīq to recite His words.</span></div>
      <div><b>Tadabbur</b><span>What āyah, meaning or reminder do you want to keep close?</span></div>
      <div><b>Amal</b><span>What can you put into practice from what you have recited?</span></div>
    </div>
    <div class="completion-actions"><button class="completion-button" type="button" data-post-guidance="niyyah">Return to niyyah & adab</button><a class="completion-button" href="#home">Continue your journey</a></div>
   </div>`;
 panel.querySelector('[data-post-guidance]')?.addEventListener('click',()=>showGuidance('niyyah'));
 panel.querySelector('[data-guidance]')?.addEventListener('click',()=>showGuidance('niyyah'));
 if(last)window.scrollTo({top:0,behavior:'smooth'});else panel.scrollIntoView({behavior:'smooth',block:'center'});
}
function maybeCompleteFromPage(plan,d,index,page){
 if(Number(page)>=Number(d.pages[1])){setDone(PAGE_DONE_KEY,plan.id,d.key);if(completionReady(plan,d))showCompletion(plan,d,index);}
}

function setupDaySwipe(plan,index){
 const surface=document.querySelector('#pdf-viewer');let startX=0,startY=0;
 surface.addEventListener('touchstart',e=>{const t=e.changedTouches[0];startX=t.clientX;startY=t.clientY},{passive:true});
 surface.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;if(Math.abs(dx)<85||Math.abs(dx)<Math.abs(dy)*1.35)return;const target=dx<0?plan.portions[index+1]:plan.portions[index-1];if(target)location.hash='#read/'+plan.id+'/'+target.key},{passive:true});
}
function fmt(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;return h?h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'):m+':'+String(sec).padStart(2,'0')}
function habitTime(s){const minutes=Math.max(1,Math.round(Number(s||0)/60));if(minutes<60)return '≈ '+minutes+' min';const hours=Math.floor(minutes/60),mins=minutes%60;if(mins<10)return '≈ '+hours+' hr';return '≈ '+hours+'½ hr'}
function planDailyTime(planId){const plan=PLANS[planId]||PLANS.weekly;const total=WEEKLY_DAYS.reduce((sum,d)=>sum+d.duration,0);return habitTime(total/plan.count)}
function saveLast(plan,d,index,page){const value={plan:plan.id,key:d.key,index,page,updated:Date.now()};safeSet(KEY+'last',value);if(Number.isFinite(Number(page)))safeSet(KEY+'lastPage',Number(page))}
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),1800)}
function getBookmarks(plan,d){const raw=(safeGet(KEY+'bookmarks',{})||{})[plan.id+':'+d.key];return Array.isArray(raw)?raw.map(Number):raw?[Number(raw)]:[]}
function setBookmark(plan,d,page){const marks=safeGet(KEY+'bookmarks',{})||{},key=plan.id+':'+d.key,list=getBookmarks(plan,d),next=list.includes(Number(page))?list.filter(n=>n!==Number(page)):[...list,Number(page)].sort((a,b)=>a-b);if(next.length)marks[key]=next;else delete marks[key];safeSet(KEY+'bookmarks',marks);return next}
async function saveOffline(d){const button=document.querySelector('#offline');if(!('caches'in window)){toast('Offline saving is not supported here.');return}button.disabled=true;button.classList.add('active');button.setAttribute('aria-label','Saving offline…');try{const cache=await caches.open('quran-offline-v1');const pdfs=d.pdf?[d.pdf]:[...new Set(d.audioSegments.map(s=>weeklyByKey(s.day).pdf))];await Promise.all([...pdfs.map(p=>cache.add(new Request(p))),...d.audioSegments.map(s=>cache.add(new Request(s.src,{credentials:'same-origin'})))]);button.setAttribute('aria-label','Saved offline');toast(d.label+' saved for offline use')}catch(e){button.classList.remove('active');button.setAttribute('aria-label','Save this day for offline use');toast('Could not save this day. Check your connection and try again.')}button.disabled=false}
async function setupReader(plan,d,index,saved,initialBookmark){
 const audio=document.querySelector('#audio'),play=document.querySelector('#play'),seek=document.querySelector('#seek'),speed=document.querySelector('#speed'),time=document.querySelector('#time'),segments=d.audioSegments||[],total=segments.reduce((a,s)=>a+s.duration,0);
 let segIndex=0,segElapsed=0,rate=Number(safeGet(KEY+'speed',1));if(![0.5,0.75,1,1.25].includes(rate))rate=1;audio.playbackRate=rate;speed.textContent=rate+'×';seek.max=total||d.duration;
 const speedMenu=document.querySelector('#speed-menu');
 const speedOptions=[...document.querySelectorAll('[data-speed]')];
 function setSpeed(value){rate=Number(value);audio.playbackRate=rate;speed.textContent=rate+'×';safeSet(KEY+'speed',rate);speedOptions.forEach(b=>b.setAttribute('aria-checked',String(Number(b.dataset.speed)===rate)));}
 function closeSpeedMenu(){speedMenu.hidden=true;speed.setAttribute('aria-expanded','false');}
 function openSpeedMenu(){speedMenu.hidden=false;speed.setAttribute('aria-expanded','true');}
 const setPlay=()=>{const playing=!audio.paused;play.innerHTML=icon(playing?'pause':'play');play.setAttribute('aria-label',playing?'Pause':'Play');play.title=playing?'Pause':'Play'};
 function loadSegment(i,autoplay=false,position=0){if(!segments[i])return;segIndex=i;audio.src=segments[i].src;audio.currentTime=Math.max(0,segments[i].from+position);if(autoplay)audio.play().catch(()=>{})}
 function globalTime(){let t=segElapsed;for(let i=0;i<segIndex;i++)t+=segments[i].duration;return t}
 function setGlobalTime(v,autoplay=false){v=Math.max(0,Math.min(total,v));let acc=0;for(let i=0;i<segments.length;i++){if(v<=acc+segments[i].duration||i===segments.length-1){segIndex=i;segElapsed=Math.max(0,v-acc);loadSegment(i,autoplay,segElapsed);return}acc+=segments[i].duration}}
 if(segments.length)loadSegment(0);
 const stored=Number(localStorage.getItem(KEY+'audio:'+plan.id+':'+d.key)||0);if(stored>2&&stored<total-2)setGlobalTime(stored,false);
 play.onclick=()=>audio.paused?audio.play().catch(()=>{}):audio.pause();audio.onplay=setPlay;audio.onpause=setPlay;
 audio.ontimeupdate=()=>{if(!segments[segIndex])return;segElapsed=Math.max(0,audio.currentTime-segments[segIndex].from);const g=globalTime();seek.value=g;time.textContent=fmt(g);const bucket=Math.floor(g/5);if(bucket!==(window.__audioBucket||-1)){window.__audioBucket=bucket;try{localStorage.setItem(KEY+'audio:'+plan.id+':'+d.key,String(g))}catch{}}};
 audio.onended=()=>{if(segIndex<segments.length-1){loadSegment(segIndex+1,true);return}setDone(AUDIO_DONE_KEY,plan.id,d.key);if(completionReady(plan,d))showCompletion(plan,d,index);audio.pause()};
 seek.oninput=()=>setGlobalTime(Number(seek.value),false);
 document.querySelector('#back10').onclick=()=>setGlobalTime(globalTime()-10,!audio.paused);
 document.querySelector('#forward10').onclick=()=>setGlobalTime(globalTime()+10,!audio.paused);
 setSpeed(rate);
speed.onclick=()=>speedMenu.hidden?openSpeedMenu():closeSpeedMenu();
speedOptions.forEach(option=>option.onclick=()=>{setSpeed(option.dataset.speed);closeSpeedMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.speed-control'))closeSpeedMenu();},{once:false});
 const bookmark=document.querySelector('#bookmark');bookmark.classList.remove('active');bookmark.innerHTML=icon('bookmark');bookmark.setAttribute('aria-label','Save this page');bookmark.title='Save this page';
 const listToggle=document.querySelector('#bookmark-list-toggle'),listPanel=document.querySelector('#bookmark-list-panel'),countEl=document.querySelector('#bookmark-count');
 function refreshBookmarks(){const list=getBookmarks(plan,d);countEl.textContent=list.length?'('+list.length+')':'';listPanel.innerHTML=list.length?list.map(p=>'<button type="button" class="saved-page" data-page="'+p+'">Page '+p+' <span>Open</span></button>').join(''):'<p class="no-saved-pages">No saved pages yet.</p>';listPanel.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{const page=Number(b.dataset.page);document.querySelector('.pdf-page[data-page="'+page+'"]')?.scrollIntoView({behavior:'smooth',block:'start'});listPanel.hidden=true;listToggle.setAttribute('aria-expanded','false')})}
 refreshBookmarks();listToggle.onclick=()=>{const open=listPanel.hidden;listPanel.hidden=!open;listToggle.setAttribute('aria-expanded',String(open))};
 bookmark.onclick=()=>{const p=window.currentQuranPage||d.pages[0],list=setBookmark(plan,d,p),saved=list.includes(p);bookmark.classList.remove('active');bookmark.innerHTML=icon('bookmark');toast(saved?'Page '+p+' saved':'Page '+p+' removed');refreshBookmarks()};
 document.querySelector('#offline').onclick=()=>saveOffline(d);
 const focus=document.querySelector('#focus');if(focus){focus.onclick=async()=>{if(document.fullscreenElement)await document.exitFullscreen?.();else await document.documentElement.requestFullscreen?.();updateFocus()};document.addEventListener('fullscreenchange',updateFocus)}
 function updateFocus(){if(!focus)return;const on=!!document.fullscreenElement;focus.innerHTML='<span>'+(on?'Exit focus':'Focus')+'</span>';focus.setAttribute('aria-label',on?'Exit focus mode':'Enter focus mode');focus.title=on?'Exit focus mode':'Focus mode'}
 const range=document.querySelector('#page-range'),output=document.querySelector('#page-output');range.oninput=()=>{output.value=range.value;document.querySelector('.pdf-page[data-page="'+range.value+'"]')?.scrollIntoView({behavior:'smooth',block:'start'});saveLast(plan,d,index,Number(range.value));window.currentQuranPage=Number(range.value)};
 const startPage=saved?.plan===plan.id&&saved.index===index&&saved.page?saved.page:(globalPage>=d.pages[0]&&globalPage<=d.pages[1]?globalPage:d.pages[0]);
 await renderPdf(d,startPage);
 if(initialBookmark)toast('Bookmark: page '+initialBookmark);
}
async function ensurePdfJs(){
 if(window.pdfjsLib)return window.pdfjsLib;
 if(window.__pdfJsLoading)return window.__pdfJsLoading;
 window.__pdfJsLoading=new Promise((resolve,reject)=>{
  const existing=document.querySelector('script[data-pdfjs]');
  if(existing){existing.addEventListener('load',()=>resolve(window.pdfjsLib));existing.addEventListener('error',reject);return}
  const script=document.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.async=true;script.dataset.pdfjs='1';
  script.onload=()=>resolve(window.pdfjsLib);script.onerror=reject;
  document.head.appendChild(script);
 });
 return window.__pdfJsLoading;
}
async function renderPdf(d,startPage){
 const viewer=document.querySelector('#pdf-viewer');if(!viewer)return;
 const label=d.name||'today’s';
 viewer.innerHTML='<div class="pdf-loading-shell" role="status" aria-live="polite"><div class="pdf-loading-mark" aria-hidden="true"></div><strong>Opening the Mushaf</strong><span id="pdf-loading-text">Preparing '+label+'’s pages…</span><div class="pdf-loading-track" aria-hidden="true"><span id="pdf-loading-progress"></span></div></div>';
 try{
  const pdfjs=await ensurePdfJs();
  if(!pdfjs)throw new Error('PDF.js failed to load');
  pdfjs.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pages=[];
  if(d.pdf){
   const loadingTask=pdfjs.getDocument({url:new URL(d.pdf,document.baseURI).href,rangeChunkSize:262144});
   loadingTask.onProgress=({loaded,total})=>{
    const bar=document.querySelector('#pdf-loading-progress'),text=document.querySelector('#pdf-loading-text');
    if(!bar||!text)return;
    if(total){const pct=Math.max(0,Math.min(100,Math.round((loaded/total)*100)));bar.style.width=pct+'%';text.textContent=pct<100?'Preparing '+label+'’s pages · '+pct+'%':'Preparing the first page…'}
    else{text.textContent='Preparing '+label+'’s pages…'}
   };
   const pdf=await loadingTask.promise;
   pdfCache.set(d.key,Promise.resolve(pdf));
   for(let n=d.pages[0];n<=Math.min(d.pages[1],d.pages[0]+pdf.numPages-1);n++){const wrap=document.createElement('div');wrap.className='pdf-page';wrap.dataset.page=n;wrap.dataset.sourceDay=d.key;wrap.innerHTML='<div class="page-loading">Page '+n+'</div>';viewer.appendChild(wrap);pages.push(wrap)}
   const target=pages.find(p=>Number(p.dataset.page)===Number(startPage));
   if(target)await renderPage(target);
   renderPdfObservers(pages,startPage,target);
  }else{
   const note=document.createElement('div');note.className='schedule-note';note.textContent='This reading plan combines the existing Mushaf day files. Pages are shown continuously here; audio is proportionally mapped to the selected pages.';viewer.replaceChildren(note);
   for(let n=d.pages[0];n<=d.pages[1];n++){
    const source=WEEKLY_DAYS.find(w=>n>=w.pages[0]&&n<=w.pages[1])||WEEKLY_DAYS[0];
    const wrap=document.createElement('div');wrap.className='pdf-page';wrap.dataset.page=n;wrap.dataset.sourceDay=source.key;wrap.innerHTML='<div class="page-loading">Page '+n+'</div>';viewer.appendChild(wrap);pages.push(wrap);
   }
   const target=pages.find(p=>Number(p.dataset.page)===Number(startPage));
   if(target)await renderPage(target);
   renderPdfObservers(pages,startPage,target);
  }
 }catch(e){console.error(e);viewer.innerHTML='<div class="error">The Qur’an page could not be opened. Please try again.</div>'}
}
const pdfCache=new Map();
async function getSourcePdf(dayKey){if(pdfCache.has(dayKey))return pdfCache.get(dayKey);const p=pdfjsLib.getDocument({url:new URL(weeklyByKey(dayKey).pdf,document.baseURI).href}).promise;pdfCache.set(dayKey,p);return p}
function renderPdfObservers(pages,startPage,initialTarget){
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){if(!e.target.dataset.done)renderPage(e.target)}else if(e.target.dataset.done&&Math.abs(Number(e.target.dataset.page)-Number(window.currentQuranPage||startPage))>3){e.target.replaceChildren();delete e.target.dataset.done}}),{rootMargin:'700px 0px'});pages.forEach(p=>observer.observe(p));
 const progress=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const n=Number(e.target.dataset.page);window.currentQuranPage=n;const activePlan=getPlan(),activeKey=document.querySelector('.reader')?.dataset?.portionKey,active=activePlan.portions.find(x=>x.key===activeKey)||activePlan.portions[0],idx=activePlan.portions.indexOf(active);const r=document.querySelector('#page-range'),o=document.querySelector('#page-output');if(r){r.value=Math.min(Math.max(n,Number(r.min)),Number(r.max));o.value=n}saveLast(activePlan,active,idx,n);maybeCompleteFromPage(activePlan,active,idx,n)} }),{rootMargin:'-35% 0px -55% 0px'});pages.forEach(p=>progress.observe(p));
 const target=initialTarget||pages.find(p=>Number(p.dataset.page)===Number(startPage));if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
async function renderPage(wrap){
 try{
  const source=weeklyByKey(wrap.dataset.sourceDay),pdf=await getSourcePdf(source.key),quranPage=Number(wrap.dataset.page),page=await pdf.getPage(quranPage-source.pages[0]+1),base=page.getViewport({scale:1}),width=Math.min(760,Math.max(280,wrap.clientWidth||680)),scale=width/base.width,vp=page.getViewport({scale}),dpr=Math.min(devicePixelRatio||1,1.5),c=document.createElement('canvas');c.width=vp.width*dpr;c.height=vp.height*dpr;c.style.width=vp.width+'px';c.style.height=vp.height+'px';await page.render({canvasContext:c.getContext('2d'),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null}).promise;wrap.replaceChildren(c);wrap.dataset.done='1'
 }catch(e){wrap.innerHTML='<div class="error">Page unavailable.</div>'}
}
function openingPage(){
 const chosen=planId();
 const choices=Object.values(PLANS).map(p=>'<a class="plan-choice '+(chosen===p.id?'selected':'')+'" href="#plan/'+p.id+'"><span class="plan-choice-main"><b>'+p.name+'</b><small>'+(p.count===7?'A daily journey through the Qur’an':p.count===14?'More space for each day’s recitation':'A gentler rhythm, with room to reflect')+'</small><em class="plan-time">'+planDailyTime(p.id)+'/day</em></span><span class="plan-choice-arrow">→</span></a>').join('');
 document.querySelector('#app').innerHTML='<main class="opening"><header class="home-header"><button data-theme-toggle class="icon-btn theme-btn" aria-label="Theme" title="Theme">'+icon(getTheme()==='dark'?'sun':'moon')+'</button><div class="bismillah" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div><div class="arabic-title" lang="ar" dir="rtl">القرآن الكريم</div><div class="title-rule"><i></i></div><p class="opening-kicker">A lifelong companionship with the Qur’an</p></header><section class="opening-content"><p class="eyebrow">YOUR TILĀWAH</p><h1>Choose a rhythm for your tilāwah</h1><div class="motivation-card first-time-motivation"><div class="motivation-label">BEFORE YOU BEGIN</div><h2>Let the Qur’an become part of your day.</h2><p>Begin with bismillah. Take a moment to renew your niyyah and begin in the name of Allah.</p><div class="motivation-placeholder"><button type="button" data-guidance="niyyah">Niyyah</button><button type="button" data-guidance="adab">Adab</button><button type="button" data-guidance="amal">Amal</button></div></div><p class="opening-copy">Choose a rhythm that fits your days. You can change it whenever you need.</p><div class="plan-choices">'+choices+'</div></section></main>';
 document.querySelector('[data-theme-toggle]').onclick=()=>setTheme(getTheme()==='dark'?'light':'dark');
 document.querySelectorAll('[data-guidance]').forEach(b=>b.onclick=()=>showGuidance(b.dataset.guidance||'niyyah'));
 const motivation=document.querySelector('.first-time-motivation'); if(motivation && safeGet(PLAN_CHOSEN,false)) motivation.hidden=true;
}
function route(){
 const hash=decodeURIComponent(location.hash||'');
 if(hash==='#choose'){openingPage();return}
 if(hash==='#home'){planHome();return}
 const planMatch=hash.match(/^#plan\/(weekly|biweekly|fourweekly)$/);
 if(planMatch){setPlan(planMatch[1]);planHome();return}
 const m=hash.match(/^#read\/(weekly|biweekly|fourweekly)\/([a-z0-9-]+)$/);
 if(m){
  const validKey=m[1]==='weekly'
   ? ['friday','saturday','sunday','monday','tuesday','wednesday','thursday'].includes(m[2])
   : m[2].startsWith(m[1]+'-') && Number.isInteger(Number(m[2].slice(m[1].length+1)));
  if(validKey){reader(m[1],m[2]);return}
 }
 if(safeGet(PLAN_CHOSEN,false)||safeGet(KEY+'last')){planHome();return}
 openingPage();
}
window.addEventListener('hashchange',()=>{try{route()}catch(e){console.error(e);showBootError?.(e)}});
function showBootError(error){
 const app=document.querySelector('#app');
 if(!app)return;
 console.error('Quran Khatm boot error:',error);
 app.innerHTML='<div style="padding:32px;max-width:560px;margin:auto;font-family:system-ui,sans-serif;text-align:center"><h2>Quran Khatm</h2><p>The reader encountered an error while loading.</p><p style="font-size:13px;opacity:.7;word-break:break-word">'+String(error?.message||error).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</p><button onclick="location.reload()">Reload</button></div>';
}
try{route()}catch(e){showBootError(e)}
})();