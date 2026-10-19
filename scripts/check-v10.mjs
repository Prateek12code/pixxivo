import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');const fail=[];const assert=(x,m)=>{if(!x)fail.push(m)};
const pages=['index','x1','journal','research','dispatch','contact','post','privacy','terms','unsubscribe','support','studio'];
for(const name of pages){const h=read(name+'.html');assert(h.includes('id="px11-critical"'),name+' missing critical pre-render CSS');assert(h.includes('class="px11-boot"'),name+' missing static initial loader');assert(h.includes('/assets/px11-boot.js'),name+' missing boot script');assert(h.includes('/src/pixxivo-v10.css'),name+' missing V10 CSS');assert(!h.includes('href="/lab.html"'),name+' has old Lab link');}
const j=read('journal.html');for(const m of ['id="hardware"','id="entries"','data-px8-lab-grid','data-px8-lab-dialog','data-px8-filter="research"','data-journal-posts'])assert(j.includes(m),'Merged Journal missing '+m);
assert(read('lab.html').includes('url=/journal.html#hardware'),'Old lab URL missing redirect');
assert(!read('public/sitemap.xml').includes('lab.html'),'Sitemap still lists old Lab page');
assert(!j.includes('>Lab</a>'),'Merged Journal still shows a redundant Lab navigation link');
assert(j.includes('px11-mark') && j.includes('px11-boot__center'),'Original PX SVG loader missing');
assert(read('public/assets/px11-boot.js').includes('px11-revealing'),'PX reveal transition missing');
const boot=read('public/assets/px11-boot.js');for(const m of ['DOMContentLoaded','pageshow','px11-ready','matchMedia','location.assign'])assert(boot.includes(m),'Boot missing '+m);
for(const f of ['src/v9.js','src/v8.js','public/assets/px11-boot.js'])try{execFileSync(process.execPath,['--check',path.join(root,f)])}catch{fail.push('Syntax error '+f)}
if(fail.length){console.error(fail.join('\n'));process.exit(1)}console.log('Pixxivo V10 checks passed: Lab+Journal merged, legacy links redirect, original PX classic SVG loader and mobile CSS.');
