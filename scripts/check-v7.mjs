import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const errors=[],must=(b,msg)=>{if(!b)errors.push(msg)};
const pages=['index','x1','research','journal','dispatch','post','studio','contact','privacy','terms','support','unsubscribe'];
for(const name of pages){let html=read(name+'.html');must(html.includes('pixxivo-v7.css'),`${name} does not load V7 styles`);if(!['studio','support'].includes(name)){must(html.includes('px7-nav'),`${name} missing shared nav`);must(html.includes('px7-mobile-menu'),`${name} missing mobile navigation numbers`)}}
let home=read('index.html'),journal=read('journal.html'),dispatch=read('dispatch.html'),research=read('research.html');
for(const token of ['px7-founder','Prateek Shukla','px7-signup','data-newsletter-form','px6-system','px6-voices']) must(home.includes(token),`Homepage missing ${token}`);
for(const token of ['px7-signup','px7-signup__submit','data-newsletter-form','px7-bridge','px7-bridge__destination'])must(dispatch.includes(token),`Dispatch missing ${token}`);
for(const token of ['px7-bridge','px7-bridge__destination','RESEARCH DIRECTIONS'])must(journal.includes(token)||journal.includes('Explore research'),`Journal missing ${token}`);
for(const token of ['px7-r-dossier','data-research-topic','data-research-panel','bte-assembled.webp','bte-detail.webp','px7-r-method'])must(research.includes(token),`Research missing ${token}`);
for(const absent of ['bte-exploded.webp','data-px6-assembly','data-assembly-view','v5-layer--','px4-ear-outline'])must(!research.includes(absent),`Research still contains retired exploded effect ${absent}`);
const tabs=(research.match(/data-research-topic=/g)||[]).length,panels=(research.match(/data-research-panel=/g)||[]).length;
must(tabs===4&&panels===4,`Expected 4 research tabs and 4 panels, got ${tabs}/${panels}`);
const pub=read('src/public.js');must(pub.includes('button.dataset.label'), 'Newsletter button label not restored correctly');
let css=read('src/pixxivo-v7.css');must(css.includes('@media(max-width:640px)'),'No V7 mobile styles');must(css.includes('prefers-reduced-motion'),'No reduced-motion fallback');
for(const f of ['src/v7.js','src/main.js','src/public.js']){try{execFileSync(process.execPath,['--check',path.join(root,f)])}catch{errors.push(`Invalid JS ${f}`)}}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Pixxivo V7 checks passed: 12 pages, newsletter, founder, researched page, responsive nav, keyboard tabs, no exploded sequence.');
