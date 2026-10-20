// Privacy-minded website telemetry. No cookies, fingerprinting or personal data.
// One page view per tab per page within 15 minutes; not a unique-visitor counter.
const allowed = new Set([
  '/', '/index.html', '/x1.html', '/research.html', '/journal.html',
  '/dispatch.html', '/contact.html', '/privacy.html', '/terms.html',
  '/lab.html', '/support.html'
]);
const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

function pagePath(){
  const page=window.location.pathname;
  if (page==='/post.html'){
    const slug=new URLSearchParams(location.search).get('slug')||'';
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? `/post.html?slug=${slug}` : null;
  }
  return allowed.has(page)?page:null;
}

async function track(){
  if (!url || !key || !/^https:\/\/[^/]+\.supabase\.co\/?$/.test(url)) return;
  if (navigator.doNotTrack==='1' || navigator.globalPrivacyControl===true) return;
  if (document.prerendering || navigator.webdriver) return;
  const path=pagePath();if(!path)return;
  const storageKey='pxview:'+path;
  const now=Date.now();
  try {
    const last=Number(sessionStorage.getItem(storageKey)||0);
    if(now-last<15*60*1000)return;
  }catch{}
  try{
    const res=await fetch(`${url.replace(/\/$/,'')}/functions/v1/site-view`,{
      method:'POST',keepalive:true,headers:{'content-type':'application/json','apikey':key},
      body:JSON.stringify({path}),credentials:'omit'
    });
    if(res.ok)try{sessionStorage.setItem(storageKey,String(now));}catch{}
  }catch{} // Visitor experience must never break if analytics is unavailable.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',track,{once:true});
else track();
