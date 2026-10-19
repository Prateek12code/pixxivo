import { supabase } from './supabaseClient.js';
import {escapeHTML,renderBody,fmtDate,postCard,safeURL} from './content.js';
const one=(s,root=document)=>root.querySelector(s);
const all=(s,root=document)=>[...root.querySelectorAll(s)];
const set=(s,text)=>{const el=one(s);if(el)el.textContent=text;};
const empty='<div class="pj-empty"><b>Our next entry is on its way.</b><p>First-hand engineering stories will appear here as they are published.</p></div>';
async function loadPosts(){
  if(!supabase){all('[data-journal-posts],[data-latest-posts]').forEach(el=>el.innerHTML=empty);return;}
  const {data,error}=await supabase.from('journal_posts').select('id,slug,title,excerpt,category,cover_url,published_at,featured').eq('status','published').order('published_at',{ascending:false}).limit(100);
  if(error){all('[data-journal-posts],[data-latest-posts]').forEach(el=>el.innerHTML='<div class="pj-empty">Journal is temporarily unavailable.</div>');return;}
  const posts=data||[];
  const render=(filter='all')=>{
    const filtered=filter==='all'?posts:posts.filter(p=>p.category===filter);
    const grid=one('[data-journal-posts]');if(grid)grid.innerHTML=filtered.length?filtered.map(postCard).join(''):empty;
  };
  render();const latest=one('[data-latest-posts]');
  if(latest) latest.innerHTML=posts.length?posts.slice(0,3).map(postCard).join(''):empty;
  one('[data-post-filter]')?.addEventListener('change',e=>render(e.target.value));
}
async function loadArticle(){
  const article=one('[data-article]');if(!article)return;
  const slug=new URLSearchParams(location.search).get('slug');
  if(!slug||!supabase){article.innerHTML='<div class="pj-empty">The article could not be loaded. <a href="/journal.html">Browse the journal.</a></div>';return;}
  const {data,error}=await supabase.from('journal_posts').select('slug,title,excerpt,body,cover_url,category,published_at').eq('slug',slug).eq('status','published').maybeSingle();
  if(error||!data){article.innerHTML='<div class="pj-empty"><h1>Entry not found.</h1><p>This post may have been moved or unpublished.</p><a class="pj-link" href="/journal.html">Back to journal ↗</a></div>';return;}
  document.title=`${data.title} | Pixxivo Journal`;
  one('meta[name="description"]')?.setAttribute('content',data.excerpt||'Pixxivo engineering journal');
  const cover=data.cover_url&&safeURL(data.cover_url)?`<figure class="pj-article-cover"><img src="${escapeHTML(safeURL(data.cover_url))}" alt="${escapeHTML(data.title)}"></figure>`:'';
  article.innerHTML=`<header class="pj-article-header"><a href="/journal.html" class="pj-link">← Journal</a><p class="pj-label">${escapeHTML(data.category)} · ${fmtDate(data.published_at)}</p><h1>${escapeHTML(data.title)}</h1><p>${escapeHTML(data.excerpt||'')}</p></header>${cover}<div class="pj-article-body">${renderBody(data.body)}</div>`;
}
async function subscribe(e){
  e.preventDefault();const form=e.currentTarget,status=one('[data-newsletter-status]',form),button=one('button[type="submit"]',form),fd=new FormData(form);
  if(!supabase){status.textContent='Subscription opens when the backend is configured.';return;}
  const email=String(fd.get('email')||'').trim();if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){status.textContent='Please enter a valid email.';return;}
  button.disabled=true;button.textContent='Subscribing…';status.textContent='Adding your address securely…';
  try{
    const token=one('input[name="cf-turnstile-response"]',form)?.value||'';
    const {data,error}=await supabase.functions.invoke('newsletter-subscribe',{body:{email,website:fd.get('website'),turnstileToken:token}});
    if(error||data?.error)throw new Error(data?.error||error?.message||'Signup failed');
    status.textContent=data?.message||'Subscribed!';form.reset();
  }catch(err){status.textContent=err.message||'Unable to subscribe. Please try again.';}
  finally{button.disabled=false;button.textContent=button.dataset.label||'Subscribe ↗';if(window.turnstile)all('.cf-turnstile',form).forEach(el=>window.turnstile.reset(el));}
}
function initTurnstile(){
  const sitekey=import.meta.env.VITE_TURNSTILE_SITE_KEY;
  if(!sitekey){all('[data-newsletter-form] button[type=submit]').forEach(b=>b.disabled=true);all('[data-newsletter-form] [data-newsletter-status]').forEach(e=>e.textContent='Newsletter is being configured. Check back soon.');return;}
  if(!one('[data-turnstile-container]'))return;
  all('[data-turnstile-container]').forEach(el=>{const d=document.createElement('div');d.className='cf-turnstile';d.dataset.sitekey=sitekey;el.append(d);});
  const js=document.createElement('script');js.src='https://challenges.cloudflare.com/turnstile/v0/api.js';js.async=true;js.defer=true;document.head.append(js);
}
async function unsubscribe(){
 const el=one('[data-unsubscribe-status]');if(!el)return;
 const token=new URLSearchParams(location.search).get('token');
 if(!token||!supabase){el.textContent='That link is incomplete or subscriptions are not configured.';return;}
 try{
  const {data,error}=await supabase.functions.invoke('newsletter-unsubscribe',{body:{token}});
  if(error||!data?.ok)throw new Error(data?.error||'Could not unsubscribe');
  el.textContent="You've been unsubscribed from future Pixxivo updates.";
  history.replaceState(null,'',location.pathname);
 }catch{el.textContent='We could not process that link. Please contact contact@pixxivo.com.';}
}
all('[data-newsletter-form]').forEach(f=>f.addEventListener('submit',subscribe));
initTurnstile();loadPosts();loadArticle();unsubscribe();
