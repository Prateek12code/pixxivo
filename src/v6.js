import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const $ = (q, scope = document) => scope.querySelector(q);
const $$ = (q, scope = document) => [...scope.querySelectorAll(q)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function infiniteMarquee(){
 const section = $('.marquee-section');
 const track = $('[data-infinite-marquee]', section || document);
 const first = $('[data-marquee-set]', track || document);
 if(!section || !track || !first) return;
 const source = [...first.children].map(node => node.cloneNode(true));
 if(!source.length) return;
 let width = 0;
 const build = () => {
  const nextWidth = section.clientWidth;
  if(!nextWidth || Math.abs(nextWidth - width) < 24) return;
  width = nextWidth;
  track.classList.remove('is-ready');
  track.replaceChildren();
  const original = document.createElement('div');
  original.className = 'marquee__set';
  original.setAttribute('data-marquee-set','');
  source.forEach(el => original.append(el.cloneNode(true)));
  track.append(original);
  // One complete pattern must cover the viewport; otherwise a large screen can see an empty gap.
  // Repeat the actual labels enough times, then make a pixel-identical second pattern.
  let guard=0;
  while(original.getBoundingClientRect().width < nextWidth + 220 && guard < 20){
   source.forEach(el=>original.append(el.cloneNode(true)));guard++;
  }
  const twin = original.cloneNode(true);
  twin.removeAttribute('data-marquee-set');
  twin.setAttribute('aria-hidden','true');
  track.append(twin);
  if(!reduceMotion.matches)requestAnimationFrame(()=>track.classList.add('is-ready'));
 };
 build();
 if('ResizeObserver' in window){new ResizeObserver(build).observe(section)}
 else window.addEventListener('resize', build, {passive:true});
 reduceMotion.addEventListener?.('change', build);
}

function systemFocus(){
 const container=$('[data-px6-system]');if(!container)return;
 const controls=$$('[data-system-step]',container);
 const image=$('[data-system-image]',container),cat=$('[data-system-category]',container),number=$('[data-system-count]',container),readout=$('[data-system-readout]',container);
 const data=[
  {name:'01 / CUSTOM HARDWARE',src:'/assets/pcb-4.png',alt:'X1 PCB angled engineering render',description:'From prototype wiring to a custom PCB, decisions become visible in copper, connectors and layout constraints.'},
  {name:'02 / HUMAN INTERACTION',src:'/assets/prototype-2.webp',alt:'Original handheld X1 physical form prototype',description:'Before optimizing algorithms, the scan flow must be understandable: placement, timing, progress and clear results.'},
  {name:'03 / INTERPRETATION',src:'/assets/pcb-2.png',alt:'Custom X1 electronics architecture',description:'Repeated data may help explore trends, but interpretation must never become an unsupported diagnostic claim.'},
  {name:'04 / ITERATION',src:'/assets/pcb-3.png',alt:'Reverse view of Pixxivo X1 circuit board',description:'Each revision reveals constraints. Reliability, signal quality and careful testing determine what gets built next.'}
 ];
 let active=0;
 const set=index=>{
  const current=data[index];if(!current)return;
  active=index;
  controls.forEach((b,i)=>{const on=i===index;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});
  if(cat)cat.textContent=current.name;
  if(number)number.textContent=`0${index+1} / 04`;
  if(readout)readout.textContent=current.description;
  if(image){
   if(!reduceMotion.matches) image.style.opacity='.25';
   const next=new Image();next.src=current.src;
   const apply=()=>{image.src=current.src;image.alt=current.alt;image.style.opacity='1'};
   if(next.complete)apply();else{next.onload=apply;next.onerror=()=>{image.style.opacity='1';};}
  }
 };
 controls.forEach((btn,i)=>btn.addEventListener('click',()=>set(i)));
 data.forEach(item=>{const preload=new Image();preload.src=item.src});
 set(active);
}

function researchAssembly(){
 const section=$('[data-px6-assembly]');if(!section)return;
 const closed=$('.px6-r-assembly__image--closed',section);
 const opened=$('.px6-r-assembly__image--open',section);
 const title=$('[data-assembly-title]',section),desc=$('[data-assembly-description]',section),bar=$('[data-assembly-progress]',section);
 const controls=$$('[data-assembly-view]',section);
 if(!closed||!opened)return;
 const desktop=window.matchMedia('(min-width: 1061px) and (min-height: 630px) and (prefers-reduced-motion: no-preference)');
 let trigger=null,showing='closed';
 const setButtons=(open)=>{const id=open?'open':'closed';if(showing===id)return;showing=id;controls.forEach(button=>{const is=button.dataset.assemblyView===id;button.classList.toggle('is-active',is);button.setAttribute('aria-pressed',String(is));});
  if(title)title.innerHTML=open?'AN IDEA,<br><em>IN PARTS.</em>':'THE OUTSIDE<br><em>IS ONLY HALF.</em>';
  if(desc)desc.textContent=open?'A proposed shell, circuitry, battery and sensing window. This is a visualization of design intent, not a verified layout.':'One compact form. Scroll to see a possible packaging architecture emerge—without pretending it is final production CAD.';
 };
 const render=p=>{
   const fade=Math.max(0,Math.min(1,(p-.24)/.48));
   gsap.set(closed,{opacity:1-fade,scale:1-.035*fade,rotate:-1.3*fade});
   gsap.set(opened,{opacity:fade,yPercent:(1-fade)*5,scale:.96+fade*.04});
   if(bar)bar.style.width=`${Math.round(p*100)}%`;
   setButtons(fade>.54);
 };
 const setup=()=>{
  trigger?.kill();trigger=null;
  gsap.set([closed,opened],{clearProps:'all'});
  if(!desktop.matches){if(bar)bar.style.width='100%';return;}
  trigger=ScrollTrigger.create({trigger:section,start:'top top',end:'bottom bottom',onUpdate:self=>render(self.progress),invalidateOnRefresh:true});
  render(trigger.progress);
 };
 controls.forEach(btn=>btn.addEventListener('click',()=>{
  if(!desktop.matches||!trigger)return;
  const p=btn.dataset.assemblyView==='open'?.89:.06;
  window.scrollTo({top:trigger.start+(trigger.end-trigger.start)*p,behavior:'smooth'});
 }));
 desktop.addEventListener('change',setup);
 setup();
}

function removeClonedKeyboardTargets(){
 // The motion module duplicates note cards for a seamless rail. Clones remain decorative,
 // and must not create a second tab-stop sequence.
 $$('.px-voices__track > [aria-hidden="true"]').forEach(node=>node.setAttribute('inert',''));
}

function init(){infiniteMarquee();systemFocus();removeClonedKeyboardTargets()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
