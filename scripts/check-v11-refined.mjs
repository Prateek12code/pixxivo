import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');const fail=[];
const pages=['index','x1','journal','research','dispatch','contact','post','privacy','terms','unsubscribe','support','studio'];
for(const page of pages){const h=read(page+'.html'),css=h.match(/<style id="px11-critical">([\s\S]*?)<\/style>/)?.[1]||'';if(!css.includes('opacity:0;transform:scale(1.025)'))fail.push(`${page}: crossfade missing`);if(css.includes('translate3d(0,-102%')||css.includes('translate3d(0,105%'))fail.push(`${page}: legacy vertical curtain remains`);if(!css.includes('@keyframes px11-trace')||!css.includes('fill:#fff'))fail.push(`${page}: PX SVG trace and fill missing`)}
const j=read('journal.html');for(const s of ['data-px8-lab-dialog','data-px11-copy-object','/src/pixxivo-v11.css'])if(!j.includes(s))fail.push('Journal missing '+s);
const logic=read('src/v8.js');for(const s of ["searchParams.set('object'","history.pushState","navigator.clipboard","new URLSearchParams(location.search).get('object')"])if(!logic.includes(s))fail.push('Shareable hardware dialog missing '+s);
for(const p of ['src/v8.js','public/assets/px11-boot.js'])try{execFileSync(process.execPath,['--check',path.join(root,p)])}catch{fail.push('JavaScript syntax error '+p)}
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log('Pixxivo V11 refined checks passed: white PX crossfade, no sliding curtain, shareable Journal hardware.');
