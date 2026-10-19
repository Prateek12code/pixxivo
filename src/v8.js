import {supabase} from './supabaseClient.js';
// PX V8. Vanilla JS progressive enhancements. Graceful when backend is not configured.
const $ = (selector, root=document)=>root.querySelector(selector);
const $$ = (selector, root=document)=>[...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));
function updateNavbar(){
 const nav=$('header.px7-nav');if(!nav)return;
 const refresh=()=>nav.classList.toggle('px8-is-scrolled',scrollY>80);
 refresh();addEventListener('scroll',refresh,{passive:true});
}
function initX1Hero(){
 const hero=$('[data-px8-x1-hero]');if(!hero)return;
 const img=$('[data-px8-x1-image]',hero),label=$('[data-px8-x1-mode-label]',hero);
 const modes={pcb:{src:'/assets/pcb-4.png',alt:'Custom X1 PCB render',label:'01 / CUSTOM ELECTRONICS'},prototype:{src:'/assets/prototype-2.webp',alt:'Real physical X1 prototype',label:'02 / PHYSICAL PROTOTYPE'}};
 $$('[data-px8-x1-mode]',hero).forEach(button=>button.addEventListener('click',()=>{
   const mode=button.dataset.px8X1Mode,selected=modes[mode];if(!selected)return;
   hero.dataset.view=mode;
   img.src=selected.src;img.alt=selected.alt;label.textContent=selected.label;
   $$('[data-px8-x1-mode]',hero).forEach(b=>{const on=b===button;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
 }));
 hero.dataset.view='pcb';
}
function initFounderDesk(){
 const wrapper=$('[data-px8-founder]');if(!wrapper)return;
 const variants=[
  {img:'/assets/pcb-3.png',alt:'Pixxivo circuit-board reverse view',eyebrow:'HARDWARE / CIRCUIT BOARD',title:'Learning through the layout.',copy:'Every trace, power decision and connector is a design constraint made visible.'},
  {img:'/assets/prototype-2.webp',alt:'Pixxivo X1 physical prototype photograph',eyebrow:'FORM / PROTOTYPE',title:'The physical test comes first.',copy:'A real object reveals ergonomic and interaction problems a render cannot show.'},
  {img:'/assets/bte-detail.webp',alt:'Conceptual behind-the-ear wearable industrial-design study',eyebrow:'RESEARCH / FORM CONCEPT',title:'A hypothesis, not a finished device.',copy:'Possible wearable directions begin with careful questions about fit, contact and signal physics.'}
 ];
 const image=$('[data-px8-founder-image]',wrapper),eyebrow=$('[data-px8-founder-eyebrow]',wrapper),title=$('[data-px8-founder-title]',wrapper),copy=$('[data-px8-founder-copy]',wrapper);
 $$('[data-px8-founder-item]',wrapper).forEach(btn=>btn.addEventListener('click',()=>{
  const v=variants[Number(btn.dataset.px8FounderItem)];if(!v)return;
  image.src=v.img;image.alt=v.alt;eyebrow.textContent=v.eyebrow;title.textContent=v.title;copy.textContent=v.copy;
  $$('[data-px8-founder-item]',wrapper).forEach(b=>{const on=b===btn;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
 }));
}
function initInspector(){
 const button=$('[data-px8-inspect-zoom]'),container=$('.px-explorer');if(!button||!container)return;
 const d=document.createElement('dialog');d.className='px8-inspect-dialog';
 d.innerHTML=`<div class="px8-inspect-dialog__top"><span>PIXXIVO / X1 CIRCUIT BOARD INSPECTOR</span><button type="button" data-px8-close>ESC / CLOSE ✕</button></div><div class="px8-inspect-dialog__stage" data-px8-pan><img data-px8-zoom-image alt="Zoomable Pixxivo board view"></div><div class="px8-inspect-dialog__bottom"><span>DRAG TO PAN · USE + AND − TO ZOOM</span><div class="px8-inspect-dialog__controls"><button type="button" data-px8-zoom-out aria-label="Zoom out">−</button><button type="button" data-px8-zoom-reset>RESET</button><button type="button" data-px8-zoom-in aria-label="Zoom in">+</button></div></div>`;
 document.body.append(d);
 const image=$('[data-px8-zoom-image]',d),pan=$('[data-px8-pan]',d);
 let scale=1.2,x=0,y=0,dragging=null;
 const update=()=>image.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
 const reset=()=>{scale=1.2;x=0;y=0;update()};
 const open=()=>{
  image.src=$('[data-explorer-image]',container)?.src||'/assets/pcb-1.png';
  image.alt=$('[data-explorer-image]',container)?.alt||'X1 board view';reset();d.showModal();
 };
 button.addEventListener('click',open);
 $('[data-px8-close]',d).addEventListener('click',()=>d.close());
 d.addEventListener('click',e=>{if(e.target===d)d.close()});
 $('[data-px8-zoom-out]',d).addEventListener('click',()=>{scale=clamp(scale-.25,1,4);update()});
 $('[data-px8-zoom-in]',d).addEventListener('click',()=>{scale=clamp(scale+.25,1,4);update()});
 $('[data-px8-zoom-reset]',d).addEventListener('click',reset);
 pan.addEventListener('pointerdown',e=>{if(e.button!==0)return;dragging={id:e.pointerId,x:e.clientX,y:e.clientY,startX:x,startY:y};pan.setPointerCapture(e.pointerId)});
 pan.addEventListener('pointermove',e=>{if(!dragging||dragging.id!==e.pointerId)return;x=dragging.startX+e.clientX-dragging.x;y=dragging.startY+e.clientY-dragging.y;update()});
 pan.addEventListener('pointerup',()=>dragging=null);pan.addEventListener('pointercancel',()=>dragging=null);
 d.addEventListener('close',()=>{image.removeAttribute('src');dragging=null});
}
const objects={
 early:{tag:'01 / PHYSICAL PROTOTYPE',title:'X1 as a physical object.',image:'/assets/prototype-2.webp',alt:'X1 prototype photo',copy:'A physical X1 prototype helps investigate placement, handling and the interface experience before committing to a production-like enclosure.',note:'What remains uncertain: comfort, consistent sensing, packaging and eventual manufacturability.'},
 board:{tag:'02 / CIRCUIT BOARD',title:'The custom PCB direction.',image:'/assets/pcb-2.png',alt:'Pixxivo board component-side render',copy:'The board brings processing, connectors, controls and power architecture into one layout. These are design and integration constraints, not evidence of a finished measurement platform.',note:'The diagram is a PCB render. Component functions are described at a system level, not as an independently verified pin map.'},
 reverse:{tag:'03 / BOARD INTEGRATION',title:'Consider the other side.',image:'/assets/pcb-3.png',alt:'Reverse-side X1 PCB render',copy:'Routing, physical connectors and enclosure clearance are easy to overlook when looking only at the assembled product from the front.',note:'One board, multiple views. This is not an invented side-by-side revision history.'},
 wearable:{tag:'04 / EXPERIMENTAL CONCEPT',title:'What could come after X1?',image:'/assets/bte-assembled.webp',alt:'Research-stage behind-the-ear wearable concept',copy:'A compact pod with a lightweight curved support is a speculative design direction worth evaluating for fit and positioning.',note:'Illustrative concept render. No manufactured device or medically useful signal has been validated.'},
 interface:{tag:'05 / HUMAN FACTORS',title:'The interaction matters.',image:'/assets/prototype-3.webp',alt:'Actual physical X1 prototype front image',copy:'Placement, feedback, readability and interaction flow affect whether a physical device feels intuitive and reliable to use.',note:'This photograph is evidence of a physical form study, not product certification.'},
 sensing:{tag:'06 / FEASIBILITY',title:'The unknown part is the signal.',image:'/assets/bte-detail.webp',alt:'Conceptual behind-ear sensor housing render',copy:'Behind-ear optical sensing is a hypothesis that requires rigorous study of coupling, motion, tissue variation, heat and signal reproducibility.',note:'Conceptual visualization only. Do not infer glucose, hemoglobin or diagnostic accuracy.'}
};
function initLab(){
 const grid=$('[data-px8-lab-grid]');if(!grid)return;
 $$('[data-px8-filter]').forEach(btn=>btn.addEventListener('click',()=>{
  const key=btn.dataset.px8Filter;
  $$('[data-px8-filter]').forEach(b=>{const on=b===btn;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on))});
  $$('[data-px8-object]',grid).forEach(card=>card.hidden=key!=='all'&&card.dataset.px8Category!==key);
 }));
 const dialog=$('[data-px8-lab-dialog]');if(!dialog)return;
 const image=$('[data-px8-lab-dialog-img]',dialog),tag=$('[data-px8-lab-dialog-tag]',dialog),title=$('[data-px8-lab-dialog-title]',dialog),copy=$('[data-px8-lab-dialog-copy]',dialog),note=$('[data-px8-lab-dialog-note]',dialog);
 const share=$('[data-px11-copy-object]',dialog);
 let activeKey='';
 const urlFor=(key)=>{const url=new URL('/journal.html',location.origin);url.searchParams.set('object',key);url.hash='hardware';return url;};
 const openObject=(key,updateHistory=true)=>{
  const item=objects[key];if(!item)return;
  activeKey=key;
  image.src=item.image;image.alt=item.alt;tag.textContent=item.tag;title.textContent=item.title;copy.textContent=item.copy;note.textContent=item.note;
  if(updateHistory)history.pushState({pixxivoObject:key},'',urlFor(key));
  if(!dialog.open)dialog.showModal();
  if(share)share.textContent='COPY LINK ↗';
 };
 $$('[data-px8-object]',grid).forEach(card=>card.addEventListener('click',()=>openObject(card.dataset.px8Object)));
 $('[data-px8-lab-close]',dialog)?.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{
  activeKey='';
  const url=new URL(location.href);
  if(url.searchParams.has('object')){url.searchParams.delete('object');history.replaceState(null,'',url);}
 });
 share?.addEventListener('click',async()=>{
  if(!activeKey)return;
  const url=urlFor(activeKey).href;
  try{
   if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
   else{
    const temp=document.createElement('textarea');temp.value=url;temp.setAttribute('readonly','');temp.style.cssText='position:fixed;left:-9999px';document.body.append(temp);temp.select();
    const success=document.execCommand('copy');temp.remove();if(!success)throw new Error('Cannot copy');
   }
   share.textContent='LINK COPIED ✓';
  }catch{ share.textContent='COPY FROM ADDRESS BAR'; }
 });
 // Bookmarked links open the actual item, not a generic archive screen.
 const incoming=new URLSearchParams(location.search).get('object');
 if(incoming&&Object.hasOwn(objects,incoming))requestAnimationFrame(()=>openObject(incoming,false));
 window.addEventListener('popstate',()=>{
  const next=new URLSearchParams(location.search).get('object');
  if(next&&Object.hasOwn(objects,next))openObject(next,false);
  else if(dialog.open)dialog.close();
 });
}
async function loadLabStatus(){
 const nodes=$$('[data-px8-lab-status]');if(!nodes.length)return;
 const fallback='X1 hardware studies · build journal open';
 nodes.forEach(n=>n.textContent=fallback);
 if(!supabase)return;
 try{
  const {data,error}=await supabase.from('journal_posts').select('title,published_at').eq('status','published').order('published_at',{ascending:false}).limit(1);
  if(error||!data?.length)return;
  const post=data[0];nodes.forEach(n=>n.textContent=`LATEST JOURNAL / ${post.title.slice(0,72)}`);
 }catch{ /* The static fallback remains informative. */ }
}
function initSensing(){
 const root=$('[data-px8-sensing]');if(!root)return;
 const canvas=$('[data-px8-scope]',root),intensity=$('[data-px8-intensity]',root),motion=$('[data-px8-motion]',root),toggle=$('[data-px8-scope-toggle]',root),reset=$('[data-px8-scope-reset]',root);
 const il=$('[data-px8-intensity-label]',root),ml=$('[data-px8-motion-label]',root),quality=$('[data-px8-readability]',root),bar=$('[data-px8-readability-bar]',root);
 if(!canvas||!intensity||!motion)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 let running=!reducedMotion,visible=true,phase=0,raf=0;
 function updateControls(){
  const i=Number(intensity.value),m=Number(motion.value);
  il.textContent=`${i}%`;ml.textContent=`${m}%`;
  const score=clamp((i*.88 + 11) - m*.65,5,99);
  quality.textContent=score>65?'Clearer':score>36?'Moderate':'Distorted';
  bar.style.width=`${score}%`;
 }
 function plot(){
  const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(rect.width<1)return;
  const w=Math.max(200,Math.round(rect.width*dpr)),h=Math.max(160,Math.round(rect.height*dpr));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#101712';ctx.fillRect(0,0,w,h);
  ctx.lineWidth=Math.max(1,dpr*.65);ctx.strokeStyle='rgba(195,230,179,.12)';
  for(let x=0;x<w;x+=w/12){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<h;y+=h/6){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  const amp=(.045+Number(intensity.value)/100*.23)*h,noise=Number(motion.value)/100;
  ctx.strokeStyle='#ccff00';ctx.lineWidth=Math.max(2,dpr*1.65);ctx.shadowBlur=12*dpr;ctx.shadowColor='rgba(204,255,0,.25)';ctx.beginPath();
  for(let k=0;k<=w;k+=2*dpr){
   const x=k/w,base=Math.sin((x*4.4-phase*.35)*Math.PI*2)*.6 + Math.sin((x*8.8-phase*.6)*Math.PI*2)*.25;
   const deterministicDistortion=(Math.sin(x*219 + phase*9)*.6 +Math.sin(x*377+phase*14)*.35)*noise;
   const yy=h*.5-(base+deterministicDistortion)*amp;
   if(k===0)ctx.moveTo(k,yy);else ctx.lineTo(k,yy);
  }ctx.stroke();ctx.shadowBlur=0;
  ctx.font=`${12*dpr}px IBM Plex Mono,monospace`;ctx.fillStyle='#d0dec9';ctx.fillText('SYNTHETIC SIGNAL · NOT PATIENT DATA',18*dpr,27*dpr);
 }
 function frame(){if(!running||!visible)return;phase+=.019;plot();raf=requestAnimationFrame(frame)}
 const toggleRunning=(next)=>{cancelAnimationFrame(raf);running=next;toggle.textContent=running?'PAUSE ◼':'PLAY ▶';toggle.setAttribute('aria-pressed',String(!running));if(running&&visible)frame();else plot()};
 [intensity,motion].forEach(s=>s.addEventListener('input',()=>{updateControls();if(!running)plot()}));
 toggle.addEventListener('click',()=>toggleRunning(!running));
 reset.addEventListener('click',()=>{intensity.value=60;motion.value=25;phase=0;updateControls();plot()});
 new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;cancelAnimationFrame(raf);if(visible)running?frame():plot()},{threshold:.05}).observe(canvas);
 addEventListener('resize',()=>{if(!running)plot()},{passive:true});
 updateControls();plot();if(running)frame();else toggle.textContent='PLAY ▶';
}
function initEasterEgg(){
 const target=$('.px8-lab-hero__status');if(!target)return;
 let taps=0;
 target.addEventListener('click',()=>{
  taps++;
  if(taps>=5){taps=0;const status=$('[data-px8-lab-status]',target);if(status){const orig=status.textContent;status.textContent='PX // CURIOSITY IS A FEATURE ✳';setTimeout(()=>status.textContent=orig,2300)}}
 });
}
function init(){updateNavbar();initX1Hero();initFounderDesk();initInspector();initLab();initSensing();initEasterEgg();loadLabStatus()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
