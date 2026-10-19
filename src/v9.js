/* Pixxivo V9. Optional enhancements; no new dependencies or navigation router. */
const q=(selector,root=document)=>root.querySelector(selector);
const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function fixLabDialog(){
 const dialog=q('[data-px8-lab-dialog]');if(!dialog)return;
 let previousFocus=null;
 dialog.addEventListener('close',()=>{
  document.body.classList.remove('px9-dialog-open');
  previousFocus?.focus({preventScroll:true});previousFocus=null;
 });
 // v8's button handlers call showModal synchronously; click capture records the trigger.
 qa('[data-px8-object]').forEach(btn=>btn.addEventListener('click',()=>{
   previousFocus=btn;
   document.body.classList.add('px9-dialog-open');
 },{capture:true}));
}
function sensingPresets(){
 const root=q('[data-px8-sensing]'),buttons=qa('[data-px9-scenario]');if(!root||!buttons.length)return;
 const light=q('[data-px8-intensity]',root),motion=q('[data-px8-motion]',root),desc=q('[data-px9-scenario-note]',root);
 if(!light||!motion)return;
 const scenarios={
  clear:{light:80,motion:5,text:'Stable conditions: stronger simulated signal with minimal motion distortion.'},
  motion:{light:65,motion:85,text:'In motion: interference distorts the simulated waveform despite available light.'},
  dim:{light:15,motion:20,text:'Low illumination: a smaller synthetic signal is more susceptible to uncertainty.'}
 };
 function active(value){buttons.forEach(b=>{const is=b.dataset.px9Scenario===value;b.setAttribute('aria-pressed',String(is))});}
 buttons.forEach(btn=>btn.addEventListener('click',()=>{
  const data=scenarios[btn.dataset.px9Scenario];if(!data)return;
  light.value=String(data.light);motion.value=String(data.motion);
  light.dispatchEvent(new Event('input',{bubbles:true}));motion.dispatchEvent(new Event('input',{bubbles:true}));
  active(btn.dataset.px9Scenario);if(desc)desc.textContent=data.text;
 }));
 const reset=q('[data-px8-scope-reset]',root);
 reset?.addEventListener('click',()=>{active('');if(desc)desc.textContent='Choose a scenario or move the controls to create your own.'});
 [light,motion].forEach(input=>input.addEventListener('input',()=>{
   active('');if(desc)desc.textContent='Custom scenario: adjust either control to explore the effect on the synthetic waveform.';
 }));
}
function init(){fixLabDialog();sensingPresets()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
