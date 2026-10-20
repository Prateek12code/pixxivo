import './style.css';
import './pixxivo-extended.css';
import './studio-original.css';
import './studio-v12.css';
import {initStudioV12} from './studio-v12.js';
import {supabase,hasSupabaseConfig} from './supabaseClient.js';
import {escapeHTML as esc,fmtDate,renderBody,safeURL} from './content.js';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const state={posts:[],subscribers:[],campaigns:[],deliveries:[],editing:null,slugTouched:false,user:null,tab:'overview'};
const form=$('#ps-editor-form');
const message=(txt,error=false)=>{const el=$('#ps-flash');el.hidden=false;el.textContent=txt;el.classList.toggle('error',error);window.scrollTo({top:0,behavior:'smooth'});};
const empty=txt=>`<p class="ps-empty">${esc(txt)}</p>`;
const idDate=(val)=>fmtDate(val);
const slugify=str=>str.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100);
const isNumeric=s=>typeof s==='string'&&/^[0-9]/.test(s);

function showTab(tab){
  state.tab=tab;
  $$('.ps-panel').forEach(p=>p.hidden=p.dataset.panel!==tab);
  $$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  const names={overview:'Overview',posts:'Journal posts',editor:'Post editor',subscribers:'Subscribers',deliveries:'Email delivery',settings:'Settings'};
  $('#ps-page-name').textContent=names[tab]||tab;
  $('#ps-flash').hidden=true;
  $('.ps-sidebar').classList.remove('open');
  if(tab==='posts')renderPosts();if(tab==='subscribers')renderSubscribers();if(tab==='deliveries')renderDeliveries();
}
function statusTag(s){return `<span class="ps-pill ${s==='published'||s==='active'||s==='sent'?'good':s==='draft'||s==='unsubscribed'?'neutral':'pending'}">${esc(s)}</span>`;}
async function loadAll(){
  const requests=[
    supabase.from('journal_posts').select('id,title,slug,excerpt,body,category,cover_url,status,featured,email_on_publish,scheduled_for,published_at,updated_at,created_at').order('updated_at',{ascending:false}).limit(1000),
    supabase.from('newsletter_subscribers').select('id,email,status,created_at,updated_at').order('created_at',{ascending:false}).limit(1000),
    supabase.from('newsletter_campaigns').select('id,post_id,status,created_at,completed_at').order('created_at',{ascending:false}).limit(1000),
    supabase.from('newsletter_deliveries').select('id,campaign_id,status,attempts,sent_at,last_error').limit(1000)
  ];
  const results=await Promise.all(requests);
  const errors=results.filter(r=>r.error);
  if(errors.length)message(`Could not load workspace: ${errors[0].error.message}`,true);
  [state.posts,state.subscribers,state.campaigns,state.deliveries]=results.map(r=>r.data||[]);
  renderOverview();renderPosts();renderSubscribers();renderDeliveries();
}
function renderOverview(){
 const active=state.subscribers.filter(s=>s.status==='active').length;
 const published=state.posts.filter(p=>p.status==='published').length;
 const count=(key,value,label)=>`<div class="ps-stat"><span>${key}</span><strong>${value}</strong><p>${label}</p></div>`;
 $('#ps-overview-stats').innerHTML=count('TOTAL ARTICLES',state.posts.length,'Across published, scheduled and drafts')+count('PUBLISHED',published,'Publicly available updates')+count('SUBSCRIBERS',active,'Active Dispatch readers')+count('CAMPAIGNS',state.campaigns.length,'Generated from published entries');
 $('#ps-overview-posts').innerHTML=state.posts.length?state.posts.slice(0,6).map(p=>`<div class="ps-mini-row"><div><strong>${esc(p.title)}</strong><small>${idDate(p.updated_at)}</small></div><div>${statusTag(p.status)}<button data-edit="${p.id}" aria-label="Edit ${esc(p.title)}">↗</button></div></div>`).join(''):empty('Write your first journal update to get started.');
}
function renderPosts(){
 const query=$('#ps-search-posts').value.toLowerCase();const filter=$('#ps-status-filter').value;
 const filtered=state.posts.filter(p=>(filter==='all'||p.status===filter)&&`${p.title} ${p.category}`.toLowerCase().includes(query));
 $('#ps-post-table').innerHTML=filtered.length?filtered.map(p=>`<tr><td><strong>${esc(p.title)}</strong><small>/post.html?slug=${esc(p.slug)}</small></td><td>${esc(p.category)}</td><td>${statusTag(p.status)}</td><td>${idDate(p.updated_at)}</td><td><button class="ps-text-button" data-edit="${p.id}">Edit ↗</button></td></tr>`).join(''):`<tr><td colspan="5">${empty('No matching posts yet.')}</td></tr>`;
}
function renderSubscribers(){
 const active=state.subscribers.filter(p=>p.status==='active').length;
 const stats=$('#ps-subscriber-stats');stats.innerHTML=`<div class="ps-stat"><span>ACTIVE READERS</span><strong>${active}</strong><p>People receiving Pixxivo Dispatch</p></div><div class="ps-stat"><span>TOTAL ADDRESSES</span><strong>${state.subscribers.length}</strong><p>Including unsubscribed readers</p></div><div class="ps-stat"><span>UNSUBSCRIBED</span><strong>${state.subscribers.length-active}</strong><p>Addresses excluded from future campaigns</p></div>`;
 const q=$('#ps-search-subs').value.toLowerCase();const filtered=state.subscribers.filter(s=>s.email.toLowerCase().includes(q));
 $('#ps-subs-table').innerHTML=filtered.length?filtered.map(s=>`<tr><td><strong>${esc(s.email)}</strong></td><td>${statusTag(s.status)}</td><td>${idDate(s.created_at)}</td><td>${s.status==='active'?`<button class="ps-text-button" data-unsub="${s.id}">Unsubscribe</button>`:'—'}</td></tr>`).join(''):`<tr><td colspan="4">${empty('No matching subscribers.')}</td></tr>`;
}
function renderDeliveries(){
 const sent=state.deliveries.filter(p=>p.status==='sent').length;
 const queued=state.deliveries.filter(p=>p.status==='queued'||p.status==='sending').length;
 const failed=state.deliveries.filter(p=>p.status==='failed').length;
 $('#ps-delivery-stats').innerHTML=`<div class="ps-stat"><span>DELIVERED TO API</span><strong>${sent}</strong><p>Accepted by email provider</p></div><div class="ps-stat"><span>IN QUEUE</span><strong>${queued}</strong><p>Pending delivery</p></div><div class="ps-stat"><span>FAILED ATTEMPTS</span><strong>${failed}</strong><p>Worker retries up to three times</p></div>`;
 $('#ps-deliveries-list').innerHTML=state.campaigns.length?state.campaigns.map(c=>{
   const post=state.posts.find(p=>p.id===c.post_id);const deliveries=state.deliveries.filter(d=>d.campaign_id===c.id);
   const delivered=deliveries.filter(d=>d.status==='sent').length;const failures=deliveries.filter(d=>d.status==='failed').length;
   return `<div class="ps-mini-row ps-campaign"><div><strong>${esc(post?.title||'Deleted article')}</strong><small>${idDate(c.created_at)} · ${delivered}/${deliveries.length} email requests accepted ${failures?`· ${failures} retry/failure`:''}</small></div>${statusTag(c.status)}</div>`;
 }).join(''):empty('No campaigns yet. Publish a post with email notification enabled.');
}
function openEditor(post=null){
 state.editing=post?.id||null;state.slugTouched=Boolean(post);
 form.reset();
 const fd={title:post?.title||'',excerpt:post?.excerpt||'',body:post?.body||'',slug:post?.slug||'',category:post?.category||'Engineering',status:post?.status||'draft',cover_url:post?.cover_url||''};
 Object.entries(fd).forEach(([key,val])=>{const input=form.elements.namedItem(key);if(input)input.value=val;});
 form.elements.namedItem('featured').checked=Boolean(post?.featured);
 form.elements.namedItem('email_on_publish').checked=Boolean(post?.email_on_publish);
 form.elements.namedItem('scheduled_for').value=post?.scheduled_for?new Date(new Date(post.scheduled_for).getTime()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,16):'';
 $('#ps-editor-eyebrow').textContent=post?'EDITING / JOURNAL':'NEW / JOURNAL';
 $('#ps-delete-post').hidden=!post;
 $('#ps-editor-preview').hidden=true;
 $('#ps-cover-message').textContent='Up to 10 MB · PNG / JPG / WebP / AVIF';
 showTab('editor');
}
function getFormPayload(){
 const data=new FormData(form);const obj={title:String(data.get('title')||'').trim(),slug:String(data.get('slug')||'').trim(),excerpt:String(data.get('excerpt')||'').trim(),body:String(data.get('body')||'').trim(),category:String(data.get('category')||'Engineering'),cover_url:String(data.get('cover_url')||'').trim()||null,status:String(data.get('status')||'draft'),featured:data.get('featured')==='on',email_on_publish:data.get('email_on_publish')==='on',scheduled_for:null};
 const date=String(data.get('scheduled_for')||'');if(date)obj.scheduled_for=new Date(date).toISOString();
 if(!obj.slug)obj.slug=slugify(obj.title);
 if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(obj.slug))throw new Error('Slug must contain lowercase letters, numbers and hyphens only.');
 if(obj.title.length<4||obj.title.length>140)throw new Error('Title must be 4–140 characters.');
 if(obj.excerpt.length>320)throw new Error('Excerpt must be 320 characters or less.');
 if(!obj.body)throw new Error('Please write some article content.');
 if(obj.status==='scheduled'&&(!obj.scheduled_for||new Date(obj.scheduled_for)<=new Date()))throw new Error('Scheduled posts need a future date and time.');
 if(obj.cover_url&&!safeURL(obj.cover_url))throw new Error('Cover URL must be http:// or https://.');
 return obj;
}
async function savePost(forceDraft=false){
 let obj;try{obj=getFormPayload();}catch(err){message(err.message,true);return;}
 if(forceDraft)obj.status='draft';
 const btn=$('#ps-save-post');btn.disabled=true;btn.textContent='Saving…';
 try{
   if(!state.editing)obj.created_by=state.user.id;
   const query=state.editing?supabase.from('journal_posts').update(obj).eq('id',state.editing):supabase.from('journal_posts').insert(obj);
   const {data,error}=await query.select().single();if(error)throw error;
   await loadAll();showTab('posts');
   message(data.status==='published'?(data.email_on_publish?'Article published. Newsletter delivery is queued.':'Article published to the journal.'):'Article saved successfully.');
   if(data.status==='published'&&data.email_on_publish) processDispatch(true);
 }catch(err){message(`Could not save post: ${err.message}`,true);}
 finally{btn.disabled=false;btn.textContent='Save / publish ↗';}
}
async function uploadCover(){
 const file=$('#ps-cover-file').files[0];if(!file)return;
 const label=$('#ps-cover-message');
 if(file.size>10*1024*1024){label.textContent='File too large; maximum is 10 MB.';return;}
 const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/avif':'avif'}[file.type];
  if(!ext){label.textContent='Please upload PNG, JPEG, WebP or AVIF.';return;}
 const head=new Uint8Array(await file.slice(0,32).arrayBuffer());
 const isJpg=head[0]===0xff&&head[1]===0xd8&&head[2]===0xff;
 const isPng=head.slice(0,8).every((b,i)=>b===[137,80,78,71,13,10,26,10][i]);
 const isWebp=String.fromCharCode(...head.slice(0,4))==='RIFF'&&String.fromCharCode(...head.slice(8,12))==='WEBP';
 const isAvif=String.fromCharCode(...head.slice(4,8))==='ftyp'&&String.fromCharCode(...head.slice(8,32)).includes('avif');
 if(!({'image/jpeg':isJpg,'image/png':isPng,'image/webp':isWebp,'image/avif':isAvif}[file.type])){label.textContent='File content does not match its image format.';return;}
 label.textContent='Uploading cover securely…';
 try{
  const path=`covers/${crypto.randomUUID()}.${ext}`;
  const {error}=await supabase.storage.from('journal-media').upload(path,file,{contentType:file.type,upsert:false});
  if(error)throw error;
  const {data}=supabase.storage.from('journal-media').getPublicUrl(path);
  form.elements.namedItem('cover_url').value=data.publicUrl;
  label.textContent='Cover uploaded! URL has been filled in.';
 }catch(err){label.textContent=`Upload failed: ${err.message}`;}
}
async function deletePost(){
 if(!state.editing||!confirm('Permanently delete this article and its newsletter history?'))return;
 const {error}=await supabase.from('journal_posts').delete().eq('id',state.editing);
 if(error){message(error.message,true);return;}
 await loadAll();showTab('posts');message('Post deleted.');
}
function previewPost(){
 try{
 const p=getFormPayload();
 const box=$('#ps-editor-preview');box.innerHTML=`<p class="pj-label">ARTICLE PREVIEW · NOT PUBLISHED</p><h1>${esc(p.title)}</h1><p>${esc(p.excerpt)}</p><div class="pj-article-body">${renderBody(p.body)}</div>`;box.hidden=false;box.scrollIntoView({behavior:'smooth',block:'start'});
 }catch(err){message(err.message,true);}
}
async function processDispatch(silent=false){
 const btn=$('#ps-run-dispatch');if(btn)btn.disabled=true;
 try{
  const {data,error}=await supabase.functions.invoke('newsletter-dispatch',{body:{action:'dispatch'}});
  if(error||data?.error)throw new Error(data?.error||error?.message||'Send failed');
  if(!silent)message(`Worker processed ${data.sent||0} email requests. ${data.failed||0} failed; remaining messages will process during scheduled runs.`);
  await loadAll();
 }catch(err){if(!silent)message(`Worker unavailable: ${err.message}`,true);else console.warn('Newsletter dispatcher:',err.message);}
 finally{if(btn)btn.disabled=false;}
}
async function unsubscribeAdmin(id){
 if(!confirm('Unsubscribe this address from future Pixxivo emails?'))return;
 const {error}=await supabase.from('newsletter_subscribers').update({status:'unsubscribed',updated_at:new Date().toISOString()}).eq('id',id);
 if(error)message(error.message,true);else{await loadAll();message('Subscriber unsubscribed.');}
}
function exportCSV(){
 const clean=s=>{let text=String(s??'');if(/^[=+\-@\t\r]/.test(text))text="'"+text;return `"${text.replaceAll('"','""')}"`;};
 const rows=[['email','status','created_at'],...state.subscribers.map(s=>[s.email,s.status,s.created_at])];
 const blob=new Blob([rows.map(row=>row.map(clean).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
 const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='pixxivo-subscribers.csv';a.click();setTimeout(()=>URL.revokeObjectURL(href),1500);
}
function bind(){
 $$('[data-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
 $$('[data-go]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.go)));
 $$('[data-action="new-post"]').forEach(b=>b.addEventListener('click',()=>openEditor()));
 $('#ps-new-post').addEventListener('click',()=>openEditor());
 $('#ps-back-posts').addEventListener('click',()=>showTab('posts'));
 $('#ps-save-post').addEventListener('click',()=>savePost());
 $('#ps-save-draft').addEventListener('click',()=>savePost(true));
 $('#ps-preview-post').addEventListener('click',previewPost);
 $('#ps-delete-post').addEventListener('click',deletePost);
 $('#ps-cover-file').addEventListener('change',uploadCover);
 $('#ps-title').addEventListener('input',e=>{if(!state.slugTouched)form.elements.namedItem('slug').value=slugify(e.target.value);});
 form.elements.namedItem('slug').addEventListener('input',()=>state.slugTouched=true);
 form.addEventListener('submit',e=>{e.preventDefault();savePost();});
 $('#ps-search-posts').addEventListener('input',renderPosts);$('#ps-status-filter').addEventListener('change',renderPosts);
 $('#ps-search-subs').addEventListener('input',renderSubscribers);
 $('#ps-run-dispatch').addEventListener('click',()=>processDispatch());
 $('#ps-export-subs').addEventListener('click',exportCSV);
 $('#studio-logout').addEventListener('click',logout);$('#ps-settings-logout').addEventListener('click',logout);
 document.addEventListener('click',e=>{
  const edit=e.target.closest('[data-edit]');if(edit){const p=state.posts.find(p=>p.id===edit.dataset.edit);if(p)openEditor(p);}
  const unsub=e.target.closest('[data-unsub]');if(unsub)unsubscribeAdmin(unsub.dataset.unsub);
 });
 $('#ps-mobile-menu').addEventListener('click',()=>$('.ps-sidebar').classList.toggle('open'));
}
async function logout(){await supabase.auth.signOut();location.reload();}
function authMsg(txt,error=true){const el=$('[data-auth-message]');el.textContent=txt;el.classList.toggle('error',error);}
let mfaFactor = null;
async function showMfaGate(user){
  const gate=$('#ps-mfa-gate');gate.hidden=false;$('#studio-auth').hidden=true;$('#studio-shell').hidden=true;
  const {data,error}=await supabase.auth.mfa.listFactors();
  if(error){$('#ps-mfa-message').textContent='Could not load MFA factors. Sign out and try again.';return;}
  const factor=data?.totp?.find(f=>f.status==='verified');
  if(factor){mfaFactor=factor.id;$('#ps-mfa-instructions').textContent='Enter the current code from your authenticator app.';$('#ps-mfa-qr-wrap').hidden=true;return;}
  const enrollment=await supabase.auth.mfa.enroll({factorType:'totp',friendlyName:'Pixxivo Studio'});
  if(enrollment.error){$('#ps-mfa-message').textContent='Unable to enroll MFA. Contact your administrator.';return;}
  mfaFactor=enrollment.data.id;
  $('#ps-mfa-instructions').textContent='Scan the QR code with an authenticator app, then enter a code to finish setup. Keep a second enrolled factor as a backup.';
  const qr=enrollment.data.totp?.qr_code||'';
  if(!qr.startsWith('data:image/svg+xml')&&!qr.startsWith('data:image/png')) {$('#ps-mfa-message').textContent='Invalid QR payload.';return;}
  $('#ps-mfa-qr').src=qr;$('#ps-mfa-secret').textContent=enrollment.data.totp?.secret||'';
  $('#ps-mfa-qr-wrap').hidden=false;
}
$('#ps-mfa-form')?.addEventListener('submit',async event=>{
  event.preventDefault();const code=String(new FormData(event.currentTarget).get('code')||'').trim();
  if(!/^\d{6}$/.test(code)||!mfaFactor)return;
  const btn=event.currentTarget.querySelector('button');btn.disabled=true;
  const {error}=await supabase.auth.mfa.challengeAndVerify({factorId:mfaFactor,code});
  btn.disabled=false;
  if(error){$('#ps-mfa-message').textContent='Verification failed. Try a fresh code.';return;}
  $('#ps-mfa-gate').hidden=true;await checkAuth();
});
$('#ps-mfa-logout')?.addEventListener('click',async()=>{await supabase?.auth.signOut();location.reload();});
async function checkAuth(){
 if(!hasSupabaseConfig){authMsg('Add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to activate Studio.');return;}
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user)return;
 const {data:level,error:levelError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
 if(levelError||level?.currentLevel!=='aal2'){await showMfaGate(user);return;}
 const {data:isAdmin,error:adminError}=await supabase.rpc('is_studio_admin');
 if(adminError||!isAdmin){authMsg('This account has no Studio publishing access. Check the studio_admins allowlist.');return;}
 state.user=user;
 $('#studio-auth').hidden=true;$('#studio-shell').hidden=false;
 $('#studio-date').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 $('#ps-admin-email').textContent=user.email||'—';
 await loadAll();
}
$('#studio-login').addEventListener('submit',async e=>{
 e.preventDefault();if(!supabase){authMsg('Configure Supabase before signing in.');return;}
 const fd=new FormData(e.currentTarget),btn=e.currentTarget.querySelector('button');btn.disabled=true;authMsg('Authenticating…',false);
 try{
  const {error}=await supabase.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});
  if(error)throw error;
  await checkAuth();
 }catch(err){authMsg(err.message||'Could not sign in.');}finally{btn.disabled=false;}
});
bind();initStudioV12({supabase});checkAuth();
