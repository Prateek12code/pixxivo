// PIXXIVO STUDIO / V12: progressive upgrade, preserves original Studio auth/editor logic.
import {escapeHTML} from './content.js';

const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const comma=n=>Number(n||0).toLocaleString('en-IN');
const niceDate=s=>new Date(`${s}T12:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const html=escapeHTML;

function lineChart(rows){
  if(!rows?.length)return '<p class="pv12-empty">No views recorded yet.</p>';
  const w=900,h=252,pad=20;
  const vals=rows.map(r=>Number(r.views)||0);const peak=Math.max(1,...vals);
  const pts=vals.map((v,i)=>[pad+i*(w-2*pad)/Math.max(1,vals.length-1),h-pad-v/peak*(h-2*pad)]);
  const line=pts.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area=`${line} L${pts.at(-1)[0].toFixed(1)},${h-pad} L${pts[0][0].toFixed(1)},${h-pad} Z`;
  const dots=pts.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="4.5"><title>${html(rows[i].day)}: ${comma(vals[i])} views</title></circle>`).join('');
  return `<div class="pv12-chart-frame"><svg class="pv12-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Page views over the selected period" preserveAspectRatio="none">
    <defs><linearGradient id="pv12Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#caff20" stop-opacity=".28"/><stop offset="1" stop-color="#caff20" stop-opacity="0"/></linearGradient></defs>
    ${[.25,.5,.75,1].map(t=>`<line class="pv12-gridline" x1="0" x2="${w}" y1="${(h-pad-(h-2*pad)*t).toFixed(1)}" y2="${(h-pad-(h-2*pad)*t).toFixed(1)}"/>`).join('')}
    <path d="${area}" fill="url(#pv12Area)"/><path d="${line}" class="pv12-curve"/>${dots}
  </svg><div class="pv12-chart-axis"><span>${html(niceDate(rows[0].day))}</span><span>${html(niceDate(rows[Math.floor((rows.length-1)/2)].day))}</span><span>${html(niceDate(rows.at(-1).day))}</span></div></div>`;
}

export function initStudioV12({supabase}){
  if(!supabase)return;
  const shell=$('#studio-shell'),nav=$('.ps-side-nav'),panels=$('.ps-content');
  if(!shell||!nav||!panels)return;
  let days=30,metrics=null,isLoading=false;
  const navItem=document.createElement('button');
  navItem.type='button';navItem.dataset.tab='analytics';
  navItem.innerHTML='<span class="pv12-nav-glyph" aria-hidden="true">◉</span><span>Analytics</span><span class="pv12-new">NEW</span>';
  const postsItem=$('[data-tab="posts"]',nav);
  nav.insertBefore(navItem,postsItem);
  const card=document.createElement('section');card.className='ps-panel pv12-panel';card.dataset.panel='analytics';card.hidden=true;
  card.innerHTML=`
    <div class="ps-page-intro pv12-head"><div><p class="pj-label">PIXXIVO / INTELLIGENCE</p>
      <h1>Site analytics<span class="pv12-accent">.</span></h1>
      <p>Real page-view data. No visitor identities, cookies, or fingerprinting.</p></div>
      <div class="pv12-toolbar"><div class="pv12-period" role="group" aria-label="Analytics date range">
        <button type="button" data-pv12-days="7">7D</button><button type="button" data-pv12-days="30" class="active">30D</button><button type="button" data-pv12-days="90">90D</button>
      </div><button type="button" class="ps-button pv12-refresh" id="pv12-refresh">↻ Refresh</button></div></div>
    <div class="pv12-metrics" id="pv12-metrics"><div class="pv12-skeleton">Preparing analytics…</div></div>
    <div class="pv12-analysis-grid">
      <section class="ps-card pv12-data-card pv12-graph-wrap"><div class="pv12-card-head"><div><p class="pv12-overline">TRAFFIC / OVER TIME</p><h2>Page views</h2></div>
      <span id="pv12-peak" class="pv12-little-pill">Awaiting data</span></div><div id="pv12-graph" class="pv12-graph"></div>
      <p class="pv12-footnote">Daily page views · Asia/Kolkata time · refresh to update</p></section>
      <section class="ps-card pv12-data-card"><div class="pv12-card-head"><div><p class="pv12-overline">CONTENT / PERFORMANCE</p><h2>Top pages</h2></div><span class="pv12-little-pill">TOP 12</span></div>
      <div id="pv12-pages" class="pv12-pages"></div></section>
    </div>
    <div class="pv12-bottom">
      <div class="ps-card pv12-info-card"><span class="pv12-overline">WORKSPACE / INFORMATION</span><h2>Built for signal.<br><em>Not surveillance.</em></h2><p>Counts are page views, not unique people. Repeated visits may count; bots and blockers can affect totals. Tracking starts only after the V12 tracker goes live.</p></div>
      <div class="ps-card pv12-info-card"><span class="pv12-overline">DATA / EXPORT</span><h2>Your data.<br><em>One click away.</em></h2><p>Export daily view counts and page performance for the selected time range.</p><button type="button" class="ps-button ps-primary" id="pv12-export">Export CSV ↗</button></div>
    </div>`;
  const firstPanel=$('[data-panel="overview"]',panels);
  firstPanel?.after(card);

  const ribbon=document.createElement('div');ribbon.className='pv12-quick-stats';ribbon.innerHTML='<span class="pv12-dot"></span><span>TRAFFIC INTELLIGENCE</span><strong id="pv12-quick-number">—</strong><span>page views · last 30 days</span><button type="button" id="pv12-go">Explore analytics ↗</button>';
  $('#ps-overview-stats')?.after(ribbon);
  $('#pv12-go')?.addEventListener('click',openAnalytics);
  navItem.addEventListener('click',openAnalytics);
  function openAnalytics(){
    $$('.ps-panel').forEach(p=>p.hidden=p!==card);
    $$('[data-tab]').forEach(b=>b.classList.toggle('active',b===navItem));
    const name=$('#ps-page-name');if(name)name.textContent='Analytics';
    $('#ps-flash').hidden=true;
    $('.ps-sidebar')?.classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
    if(!metrics)void loadAnalytics();
  }
  // Native Studio navigation still works; this extension has no access to private auth internals.
  const escapeCSV=v=>`"${String(v??'').replaceAll('"','""')}"`;
  $('#pv12-export')?.addEventListener('click',()=>{
    if(!metrics)return;
    const lines=[['type','date_or_path','views'],...metrics.daily.map(r=>['daily',r.day,r.views]),...metrics.pages.map(r=>['page',r.path,r.views])];
    const file=new Blob([lines.map(a=>a.map(escapeCSV).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
    const href=URL.createObjectURL(file),a=document.createElement('a');a.href=href;a.download=`pixxivo-traffic-${days}d.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
  });
  $('#pv12-refresh')?.addEventListener('click',()=>loadAnalytics());
  $$('[data-pv12-days]',card).forEach(b=>b.addEventListener('click',()=>{
    days=Number(b.dataset.pv12Days);
    $$('[data-pv12-days]',card).forEach(x=>x.classList.toggle('active',x===b));
    void loadAnalytics();
  }));

  async function loadAnalytics(){
    if(shell.hidden||isLoading)return;
    isLoading=true;
    const button=$('#pv12-refresh');button.disabled=true;
    try{
      const {data,error}=await supabase.rpc('studio_site_analytics',{p_days:days});
      if(error)throw error;
      metrics=data;draw();
    }catch(err){
      metrics=null;
      $('#pv12-metrics').innerHTML='<div class="pv12-error"><strong>Analytics are not connected.</strong><p>'+html(err.message||'Could not load the analytics database.')+'</p><small>Run supabase/studio_analytics.sql and deploy the site-view function.</small></div>';
      $('#pv12-graph').innerHTML='<p class="pv12-empty">No chart available.</p>';
      $('#pv12-pages').innerHTML='<p class="pv12-empty">No page data available.</p>';
      $('#pv12-quick-number').textContent='—';
    }finally{isLoading=false;button.disabled=false;}
  }
  function draw(){
    if(!metrics)return;
    const total=Number(metrics.period)||0,prev=Number(metrics.previous_period)||0;
    const growth=prev>0?`${total>=prev?'+':''}${(((total-prev)/prev)*100).toFixed(1)}%`:'—';
    const growthLabel=prev>0?'vs previous period':'No earlier period to compare';
    const blocks=[
      ['PAGE VIEWS',comma(total),`${days}-day total`],
      ['TODAY',comma(metrics.today),'Since midnight IST'],
      ['ALL TIME',comma(metrics.all_time),'Since tracking began'],
      ['TRAFFIC CHANGE',growth,growthLabel]
    ];
    $('#pv12-metrics').innerHTML=blocks.map(([name,value,note],i)=>`<div class="pv12-metric ${i===0?'pv12-metric--hero':''}"><span>${html(name)}</span><strong>${html(value)}</strong><small>${html(note)}</small></div>`).join('');
    $('#pv12-quick-number').textContent=comma(total);
    $('#pv12-graph').innerHTML=lineChart(metrics.daily);
    $('#pv12-peak').textContent=`PEAK ${comma(Math.max(0,...metrics.daily.map(r=>Number(r.views)||0)))} / DAY`;
    const first=Number(metrics.pages[0]?.views)||0;
    $('#pv12-pages').innerHTML=metrics.pages.length?metrics.pages.map((p,i)=>{
      const name=p.path==='/'||p.path==='/index.html'?'Homepage':p.path.startsWith('/post.html?slug=')?'Journal / '+p.path.split('slug=')[1]:p.path.slice(1).replace('.html','');
      const width=Math.max(2,100*(Number(p.views)||0)/Math.max(1,first));
      return `<div class="pv12-page"><div class="pv12-page-line"><span><b>${String(i+1).padStart(2,'0')}</b><strong title="${html(p.path)}">${html(name)}</strong></span><em>${comma(p.views)}</em></div><div class="pv12-track"><span style="width:${width.toFixed(1)}%"></span></div></div>`;
    }).join(''):'<p class="pv12-empty">No views yet. Deploy the public tracker to start counting.</p>';
  }
  // Login screen becomes hidden after MFA and admin allowlist check in existing Studio.
  const watcher=new MutationObserver(()=>{if(!shell.hidden){void loadAnalytics();}});
  watcher.observe(shell,{attributes:true,attributeFilter:['hidden']});
  window.addEventListener('focus',()=>{if(!shell.hidden&&!card.hidden)void loadAnalytics();});

  // Minimal but real editor quality-of-life improvements, without changing publishing semantics.
  const editor=$('#ps-body'),title=$('#ps-title');
  if(editor){
    const meter=document.createElement('div');meter.className='pv12-writing-meter';
    editor.insertAdjacentElement('afterend',meter);
    const measure=()=>{const text=editor.value||'';const words=(text.trim().match(/\S+/g)||[]).length;meter.innerHTML=`<span>WORDS <strong>${comma(words)}</strong></span><span>READ TIME <strong>${Math.max(1,Math.ceil(words/220))} MIN</strong></span><span>CHARACTERS <strong>${comma(text.length)}</strong></span>`;};
    editor.addEventListener('input',measure);document.addEventListener('click',e=>{if(e.target.closest('[data-action="new-post"],[data-edit],#ps-new-post'))queueMicrotask(measure);});measure();
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&!$('[data-panel="editor"]').hidden){e.preventDefault();$('#ps-save-draft')?.click();}
    });
  }
  if(title){title.setAttribute('spellcheck','true');}
}
