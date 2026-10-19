/* Pixxivo V11 PX SVG: real five-path mark traces + fills, then elegant crossfade.
   Later routes get a minimal monochrome handoff. All visual CSS is in the head
   so users never see unstyled page content before the screen is uncovered. */
(() => {
  'use strict';
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const KEY = 'pixxivo-classic-intro-v11';
  const isStudio = /(?:^|\/)studio\.html$/.test(location.pathname);
  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch {}
  const full = !seen && !isStudio && !reduce;
  let state = 'pending';
  let cover = document.querySelector('.px11-boot');
  const referenceMarkup = cover?.innerHTML || '';
  const startedAt = performance.now();
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const paint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (!full) cover?.classList.add('px11-boot--short');

  function complete() {
    if (state === 'done') return;
    state = 'done';
    clearTimeout(window.__px11Watchdog);
    html.classList.remove('px11-revealing', 'px11-covering');
    html.classList.add('px11-ready');
    cover?.remove(); cover = null;
    try { if (full) sessionStorage.setItem(KEY, '1'); } catch {}
  }

  async function run() {
    if (state !== 'pending') return;
    state = 'intro';
    // DOMContentLoaded waits for blocking CSS and deferred/module scripts.
    // Fonts get a brief opportunity to load but never hold visitors hostage.
    if (document.fonts?.ready) await Promise.race([document.fonts.ready,wait(260)]);
    await paint();
    const duration = full ? 1700 : reduce ? 0 : 95;
    await wait(Math.max(0,duration - (performance.now()-startedAt)));
    if (state !== 'intro') return;
    html.classList.add('px11-revealing'); // Crossfade to the fully styled page.
    await wait(reduce ? 20 : full ? 760 : 420);
    complete();
  }

  function start() { run().catch(complete); }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
  // Global fail-open in case of a network failure/third-party resource issue.
  setTimeout(() => { if (state==='pending'||state==='intro') complete(); }, 4800);

  document.addEventListener('click', event => {
    if(state!=='done'||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.altKey||event.shiftKey||reduce)return;
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
    let next;
    try {next = new URL(anchor.href,location.href)} catch {return;}
    if(next.origin!==location.origin||!['http:','https:'].includes(next.protocol))return;
    if(next.pathname===location.pathname&&next.search===location.search)return;
    event.preventDefault();
    state='leaving';
    const departing = document.createElement('div');
    departing.className='px11-boot px11-boot--out px11-boot--short';
    departing.setAttribute('aria-hidden','true');
    departing.innerHTML=referenceMarkup;
    document.body.append(departing);
    departing.getBoundingClientRect(); // Commit initial position before covering.
    html.classList.add('px11-covering');
    setTimeout(() => location.assign(next.href), 245);
    // If navigation is cancelled, avoid trapping the user on a blank page.
    setTimeout(() => { if(state==='leaving'){departing.remove();html.classList.remove('px11-covering');state='done';}},2100);
  });

  window.addEventListener('pageshow', e => {
    if(!e.persisted)return;
    state='done';
    clearTimeout(window.__px11Watchdog);
    html.classList.remove('px11-revealing','px11-covering');
    html.classList.add('px11-ready');
    document.querySelectorAll('.px11-boot').forEach(el=>el.remove());
  });
})();
