/** Small no-dependency Markdown subset. All content is escaped before styling. Raw HTML is never interpreted. */
export const escapeHTML = (value='')=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const fmtDate = value=> value ? new Date(value).toLocaleDateString('en-IN',{year:'numeric',month:'short',day:'numeric'}) : '—';
export const safeURL = raw=> {
  try{const u=new URL(String(raw),location.origin);return (u.protocol==='https:'||(u.hostname==='localhost'&&u.protocol==='http:'))?u.href:'';}catch{return '';}
};
const inline = txt => {
  let html=escapeHTML(txt);
  html=html.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  html=html.replace(/`([^`]+)`/g,'<code>$1</code>');
  html=html.replace(/\[([^\]]{1,150})\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=> {
    const decoded=url.replace(/&amp;/g,'&');const safe=safeURL(decoded);
    return safe?`<a href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer nofollow">${label}</a>`:label;
  });
  return html;
};
export function renderBody(src=''){
  const lines=String(src).split(/\r?\n/);let out='',inList=false,inCode=false,code=[];
  const endList=()=>{if(inList){out+='</ul>';inList=false;}};
  for(const l of lines){
    if(l.trim().startsWith('```')){endList();if(inCode){out+=`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`;code=[];}inCode=!inCode;continue;}
    if(inCode){code.push(l);continue;}
    if(!l.trim()){endList();continue;}
    if(/^### /.test(l)){endList();out+=`<h3>${inline(l.slice(4))}</h3>`;}
    else if(/^## /.test(l)){endList();out+=`<h2>${inline(l.slice(3))}</h2>`;}
    else if(/^# /.test(l)){endList();out+=`<h2>${inline(l.slice(2))}</h2>`;}
    else if(/^[-*] /.test(l)){if(!inList){out+='<ul>';inList=true;}out+=`<li>${inline(l.slice(2))}</li>`;}
    else {endList();out+=`<p>${inline(l)}</p>`;}
  }
  endList(); if(inCode)out+=`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`;
  return out;
}
export function postCard(post){
  const title=escapeHTML(post.title);const excerpt=escapeHTML(post.excerpt||'An engineering note from Pixxivo.');
  const url=`/post.html?slug=${encodeURIComponent(post.slug)}`;
  const cover=post.cover_url && safeURL(post.cover_url)?`<img src="${escapeHTML(safeURL(post.cover_url))}" loading="lazy" alt="${title}"/>`:`<div class="pj-card-placeholder"><span>PX / ${escapeHTML(post.category||'JOURNAL')}</span><b>↗</b></div>`;
  return `<article class="pj-post-card"><a href="${url}" class="pj-card-cover">${cover}</a><div class="pj-card-meta"><span>${escapeHTML(post.category)}</span><time datetime="${escapeHTML(post.published_at||'')}">${fmtDate(post.published_at)}</time></div><h3><a href="${url}">${title}</a></h3><p>${excerpt}</p><a href="${url}" class="pj-link">Read the update ↗</a></article>`;
}
