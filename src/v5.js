
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function initResearchTabs(){
  const shell=q('[data-v5-concept]');
  if(!shell) return;
  const buttons=qa('[data-v5-tab]',shell);
  const panels=qa('[data-v5-panel]',shell);
  const visuals=qa('[data-v5-visual]',shell);
  const activate=(id)=>{
    buttons.forEach(btn=>{const on=btn.dataset.v5Tab===id;btn.classList.toggle('is-active',on);btn.setAttribute('aria-pressed',String(on));});
    panels.forEach(panel=>panel.classList.toggle('is-active',panel.dataset.v5Panel===id));
    visuals.forEach(panel=>panel.classList.toggle('is-active',panel.dataset.v5Visual===id));
  };
  buttons.forEach(btn=>btn.addEventListener('click',()=>activate(btn.dataset.v5Tab)));
  activate(buttons[0]?.dataset.v5Tab || 'exterior');
}
function initExplodedScroll(){
  const wrap=q('[data-bte-exploded]');
  if(!wrap) return;
  const stage=q('.v5-exploded__stage',wrap);
  const hook=q('.v5-layer--hook',wrap);
  const shell=q('.v5-layer--shell-top',wrap);
  const optic=q('.v5-layer--optic',wrap);
  const board=q('.v5-layer--board',wrap);
  const battery=q('.v5-layer--battery',wrap);
  const base=q('.v5-layer--base',wrap);
  const callouts=qa('.v5-callout',wrap);
  if(!stage||!hook||!shell||!optic||!board||!battery||!base) return;
  if(reduce || window.innerWidth<960){ gsap.set(callouts,{opacity:1}); return; }
  const tl=gsap.timeline({
    scrollTrigger:{trigger:wrap,start:'top top',end:'bottom bottom',scrub:.85,invalidateOnRefresh:true}
  });
  gsap.set(callouts,{opacity:.15});
  tl.to(hook,{rotation:18,x:120,y:-120,duration:.9},0)
    .to(shell,{y:-150,duration:.9},0)
    .to(optic,{y:-55,scale:1.02,duration:.9},0)
    .to(board,{y:78,rotation:-4,duration:.9},0)
    .to(battery,{y:170,x:-12,duration:.9},0)
    .to(base,{y:270,duration:.9},0)
    .to(callouts,{opacity:1,stagger:.08,duration:.35},.28);
}
window.addEventListener('DOMContentLoaded',()=>{initResearchTabs();initExplodedScroll();});
