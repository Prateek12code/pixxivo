/**
 * PIXXIVO / MOTION LAB — Vite + vanilla JavaScript + GSAP only.
 * Scroll is native/Lenis-driven. ScrollTrigger pins visuals while scrolling;
 * NO wheel event interception, scroll-lock or counterfeit product testimonials.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopStoryboard = window.matchMedia('(min-width: 851px) and (prefers-reduced-motion: no-preference)');

function initReadingProgress() {
  const bar = document.createElement('div');
  bar.className = 'px-scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${Math.max(0, Math.min(1, max > 0 ? window.scrollY / max : 0))})`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

function initX1Cinema() {
  const section = $('[data-px-cinema]');
  if (!section) return;
  const pin = $('.px-cinema__pin', section);
  const chapters = $$('.px-cinema__chapter', section);
  const art = $$('.px-cinema__art', section);
  const steps = $$('.px-cinema__dots span', section);
  const meter = $('.px-cinema__meter span', section);
  const count = $('[data-cinema-count]', section);
  if (chapters.length !== 4 || art.length !== 4) return;

  let activeIndex = -1;
  const setChapter = (idx) => {
    if (activeIndex === idx) return;
    activeIndex = idx;
    chapters.forEach((el, i) => el.classList.toggle('is-current', i === idx));
    art.forEach((el, i) => el.classList.toggle('is-current', i === idx));
    steps.forEach((el, i) => el.classList.toggle('is-current', i === idx));
    if (count) count.textContent = `${String(idx + 1).padStart(2, '0')} / 04`;
  };
  setChapter(0);
  let timeline;
  const create = () => {
    if (timeline) return;
    chapters.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 38 }));
    art.forEach((el, i) => gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 38, scale: i === 0 ? 1 : .91 }));
    timeline = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(window.innerHeight * 3.1, 2150)}`,
        pin, pinSpacing: true, scrub: .85,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const index = Math.max(0, Math.min(3, Math.floor(self.progress * 3.3 + .1)));
          setChapter(index);
          if (meter) gsap.set(meter, { width: `${25 + self.progress * 75}%` });
        }
      }
    });
    for (let i = 1; i < 4; i++) {
      const time = (i - 1) * 1.15;
      timeline.to(chapters[i - 1], { autoAlpha: 0, y: -37, duration: .37 }, time + .65)
        .to(art[i - 1], { autoAlpha: 0, scale: .83, y: -55, duration: .45 }, time + .55)
        .to(chapters[i], { autoAlpha: 1, y: 0, duration: .42 }, time + .95)
        .to(art[i], { autoAlpha: 1, scale: 1, y: 0, duration: .5 }, time + .88);
    }
    timeline.to({}, { duration: .5 });
    ScrollTrigger.refresh();
  };
  const destroy = () => {
    timeline?.scrollTrigger?.kill();
    timeline?.kill();
    timeline = null;
    gsap.set([...chapters, ...art], { clearProps: 'all' });
    setChapter(0);
    if (meter) meter.style.width = '';
  };
  const mediaChanged = (e) => e.matches ? create() : destroy();
  desktopStoryboard.addEventListener('change', mediaChanged);
  if (desktopStoryboard.matches) create();
}

function initX1Deck() {
  // Stable, native sticky layout: no GSAP pin nested inside an overflow-hidden ancestor.
  // ScrollTrigger only drives transformations. Reversing scroll reverses the cards.
  const section = $('[data-px-deck]');
  if (!section) return;
  const cards = $$('.px-deck__card', section);
  const cta = $('.px-deck__cta', section);
  const count = $('[data-deck-progress]', section);
  const meter = $('[data-deck-meter]', section);
  const jumpButtons = $$('[data-deck-jump]', section);
  if (cards.length !== 3 || !cta) return;
  let timeline = null;
  const update = progress => {
    const index = progress < .35 ? 0 : progress < .71 ? 1 : 2;
    if (count) count.textContent = `0${index + 1} / 03`;
    if (meter) meter.style.width = `${Math.max(0,Math.min(100,progress * 100))}%`;
    jumpButtons.forEach((button,i)=>{
      button.classList.toggle('is-active',i===index);
      button.setAttribute('aria-pressed',String(i===index));
    });
  };
  const create = () => {
    if (timeline) return;
    gsap.set(cards, {clearProps:'all'});
    gsap.set(cards[0], {yPercent:0, rotation:0, scale:1, zIndex:1});
    gsap.set(cards[1], {yPercent:115, rotation:6, scale:.97, zIndex:2});
    gsap.set(cards[2], {yPercent:115, rotation:-6, scale:.97, zIndex:3});
    timeline = gsap.timeline({
      defaults:{ease:'none'},
      scrollTrigger:{
        trigger:section, start:'top top', end:'bottom bottom',
        scrub:.45, invalidateOnRefresh:true, onUpdate:self=>update(self.progress)
      }
    });
    timeline.to(cards[0],{scale:.91,rotation:-4,y:-24,duration:.54},.12)
      .to(cta,{x:-25,duration:.48},.15)
      .to(cards[1],{yPercent:0,rotation:0,scale:1,duration:.75},.42)
      .to(cards[1],{scale:.93,rotation:4,y:-20,duration:.54},1.28)
      .to(cards[2],{yPercent:0,rotation:0,scale:1,duration:.82},1.56)
      .to(cta,{x:0,duration:.42},1.84)
      .to({}, {duration:.34});
    update(0);
  };
  const destroy = () => {
    timeline?.scrollTrigger?.kill();
    timeline?.kill();timeline=null;
    gsap.set([...cards,cta],{clearProps:'all'});
    update(0);
  };
  desktopStoryboard.addEventListener('change', e => e.matches ? create() : destroy());
  if(desktopStoryboard.matches) create();
  jumpButtons.forEach(button=>button.addEventListener('click',()=>{
    if(!desktopStoryboard.matches || !timeline?.scrollTrigger) return;
    const idx = Number(button.dataset.deckJump);
    const range=timeline.scrollTrigger.end-timeline.scrollTrigger.start;
    const fractions=[.02,.48,.88];
    window.scrollTo({top:timeline.scrollTrigger.start + range*fractions[idx],behavior:prefersReducedMotion.matches?'instant':'smooth'});
  }));
}

function initExplorer() {
  const explorer = $('.px-explorer'); if (!explorer) return;
  const hotspots = $$('.px-hotspot', explorer);
  const detail = [
    { title:'Custom electronics.', description:'Front-side PCB layout: processing, controls and the power architecture are being refined together.', src:'/assets/pcb-1.png', system:'PCB / MAIN ASSEMBLY', readout:'FRONT / A' },
    { title:'Sensing interface.', description:'The optical path needs stable geometry and repeatable signals. The hardware view is a board study—not a verified medical sensor map.', src:'/assets/pcb-2.png', system:'PCB / COMPONENT SIDE', readout:'FRONT / B' },
    { title:'The other side.', description:'Routing, connectors and mechanical clearance matter as much as component selection. Explore the back of the board.', src:'/assets/pcb-3.png', system:'PCB / REVERSE SIDE', readout:'BACK / C' }
  ];
  const media=$('.px-explorer__media',explorer);
  const image=$('[data-explorer-image]',explorer);
  const title=$('[data-explorer-title]',explorer);
  const description=$('[data-explorer-description]',explorer);
  const index=$('[data-explorer-index]',explorer);
  const system=$('[data-explorer-system]',explorer);
  const readout=$('[data-explorer-signal]',explorer);
  const meter=$('[data-explorer-meter]',explorer);
  const flip=$('[data-explorer-rotate]',explorer);
  let current=0,flipped=false;
  // Preload real existing PCB assets to avoid a flash when changing the selected view.
  detail.forEach(item=>{const pre=new Image();pre.src=item.src;});
  const select=(i)=>{
    const next=detail[i];if(!next)return;
    current=i;flipped=false;
    media?.classList.remove('is-flipped');
    media?.setAttribute('data-active-view',String(i));
    hotspots.forEach((button,j)=>{
      button.classList.toggle('is-active',j===i);
      button.setAttribute('aria-pressed',String(j===i));
    });
    if(image) {image.style.opacity='.45'; image.src=next.src; image.alt=`Real Pixxivo X1 PCB ${next.readout} view`; image.onload=()=>image.style.opacity='1';}
    if(title)title.textContent=next.title;
    if(description)description.textContent=next.description;
    if(index)index.textContent=`0${i+1} / 03`;
    if(system)system.textContent=next.system;
    if(readout)readout.textContent=next.readout;
    if(meter)meter.style.width=`${((i+1)/3)*100}%`;
    if(flip){flip.setAttribute('aria-pressed','false');flip.textContent='MIRROR VIEW ↻';}
  };
  hotspots.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
  flip?.addEventListener('click',()=>{
    // A rendered mirror view, labeled clearly. This is NOT a real 3D physical side change.
    flipped=!flipped;media?.classList.toggle('is-flipped',flipped);
    flip.setAttribute('aria-pressed',String(flipped));
    flip.textContent=flipped?'NORMAL VIEW ↺':'MIRROR VIEW ↻';
  });
  select(0);
}

function initMovingNotes() {
  // Duplicate decorative cards to make a seamless strip; screen readers encounter the originals only.
  $$('.px-voices__track').forEach(track => {
    if (track.dataset.duplicated === 'true') return;
    const cards = $$('.px-note', track);
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.append(clone);
    });
    track.dataset.duplicated = 'true';
  });
  // Keyboard viewers can stop animation by focusing the viewport; on reduced-motion, rail scrolls naturally.
}

function initGallery() {
  const gallery = $('.px-gallery-track');
  if (!gallery) return;
  $$('[data-gallery-step]').forEach(button => {
    button.addEventListener('click', () => {
      const card = $('article', gallery);
      const distance = card ? card.getBoundingClientRect().width + 18 : gallery.clientWidth * .8;
      gallery.scrollBy({ left: distance * Number(button.dataset.galleryStep), behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' });
    });
  });
  let down = null;
  gallery.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('video,button,a')) return;
    down = { x: event.clientX, left: gallery.scrollLeft, dragged: false };
  });
  gallery.addEventListener('pointermove', event => {
    if (!down) return;
    const dx = event.clientX - down.x;
    if (Math.abs(dx) > 8) down.dragged = true;
    if (down.dragged) gallery.scrollLeft = down.left - dx;
  });
  const clear = () => { down = null; };
  gallery.addEventListener('pointerup', clear);
  gallery.addEventListener('pointercancel', clear);
  gallery.addEventListener('pointerleave', clear);
  gallery.addEventListener('keydown', event => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    gallery.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * gallery.clientWidth * .65, behavior: 'smooth' });
  });
}

function initAmbientEffects() {
  if (prefersReducedMotion.matches) return;
  // Only motion visual targets; never animate headings used by SplitType or controls.
  gsap.utils.toArray('.px-explorer__media').forEach(media => {
    gsap.fromTo(media, { y: 30 }, {
      y: -25, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });
  gsap.utils.toArray('.px-note').slice(0, 4).forEach((note, i) => {
    note.addEventListener('pointerenter', () => gsap.to(note, { rotation: 0, y: -12, duration: .35, ease: 'power2.out' }));
    note.addEventListener('pointerleave', () => gsap.to(note, { clearProps: 'transform', duration: .4, ease: 'power2.out' }));
  });
}


function initV4Interactions(){
  const activePage=document.body.dataset.page;
  $$('.nav-links a').forEach(link=>{
    const current=link.getAttribute('href');
    const match=activePage==='home'?current==='/':current===`/${activePage}.html`;
    link.classList.toggle('active',match);
    if(match)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
  });
  const inspect=$('[data-hero-inspect]');
  inspect?.addEventListener('click',()=>{
    const stage=inspect.closest('.px4-hero__stage');
    const next=!stage?.classList.contains('is-inspecting');
    stage?.classList.toggle('is-inspecting',next);
    inspect.textContent=next?'VIEW PROTOTYPE ↗':'VIEW PCB ↗';
    inspect.setAttribute('aria-pressed',String(next));
  });
  const poster=$('[data-dispatch-paper]');
  $$('[data-dispatch-view]').forEach(button=>button.addEventListener('click',()=>{
    const proto=button.dataset.dispatchView==='prototype';
    poster?.classList.toggle('is-prototype',proto);
    const image=$('img',poster);if(image){image.src=proto?'/assets/prototype-2.webp':'/assets/pcb-4.png';image.alt=proto?'Real X1 physical prototype photograph':'Real X1 PCB render';}
    $$('[data-dispatch-view]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  }));
  const research=[
    {label:'01 / SIGNAL FEASIBILITY',title:'Can a useful signal be measured here?',copy:'Before miniaturization, investigate whether optical or other sensing at this location yields stable, interpretable data at all.'},
    {label:'02 / FIT & CONTACT',title:'Will it stay comfortable and properly seated?',copy:'Hair, skin, movement and the shape of each ear change how an enclosure sits—and how reliable a contact sensor can be.'},
    {label:'03 / POWER & THERMALS',title:'How small can the system realistically be?',copy:'Battery capacity, skin temperature, charging, electrical safety and space constraints determine feasible packaging.'},
    {label:'04 / EVIDENCE & VALIDATION',title:'How do we prove it works?',copy:'Any reported measurement would need repeatable experiments, suitable reference comparisons and appropriate clinical validation before health claims.'}
  ];
  const diagram=$('[data-research-diagram]');
  $$('[data-research-select]').forEach(button=>button.addEventListener('click',()=>{
    const idx=Number(button.dataset.researchSelect);if(!research[idx])return;
    diagram?.setAttribute('data-question',String(idx));
    $$('[data-research-point]').forEach((el,i)=>el.classList.toggle('is-active',i===idx));
    $$('[data-research-select]').forEach(el=>{
      el.classList.toggle('is-active',el===button);
      el.setAttribute('aria-pressed',String(el===button));
    });
    const label=$('[data-research-label]'),title=$('[data-research-title]'),copy=$('[data-research-copy]'),meter=$('[data-research-meter]');
    if(label)label.textContent=research[idx].label;
    if(title)title.textContent=research[idx].title;
    if(copy)copy.textContent=research[idx].copy;
    if(meter)meter.style.width=`${25*(idx+1)}%`;
  }));
}

function init() {
  initReadingProgress();
  initV4Interactions();
  initExplorer();
  initMovingNotes();
  initGallery();
  initX1Cinema();
  initX1Deck();
  initAmbientEffects();
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
init();
