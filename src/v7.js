// Pixxivo V7: keyboard-accessible research dossier tabs, no mock patient data.
const container = document.querySelector('.px7-r-dossier');
if (container) {
  const tabs = [...container.querySelectorAll('[data-research-topic]')];
  const panels = [...container.querySelectorAll('[data-research-panel]')];
  function activate(tab, focus=false) {
    const id = tab.dataset.researchTopic;
    tabs.forEach(t => { const selected=t===tab; t.classList.toggle('is-active',selected); t.setAttribute('aria-selected',String(selected)); t.tabIndex=selected?0:-1; });
    panels.forEach(p=>{const selected=p.dataset.researchPanel===id;p.hidden=!selected;p.classList.toggle('is-active',selected);});
    if (focus) tab.focus();
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>activate(tab));
    tab.addEventListener('keydown',e=>{
      let next=-1;
      if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(i+1)%tabs.length;
      if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(i-1+tabs.length)%tabs.length;
      if(e.key==='Home')next=0; if(e.key==='End')next=tabs.length-1;
      if(next!==-1){e.preventDefault();activate(tabs[next],true);} });
  });
  activate(tabs[0]);
}
