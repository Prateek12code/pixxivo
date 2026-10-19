import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const problems=[];
function check(v,msg){if(!v)problems.push(msg)}
const pages=['index','x1','research','journal','dispatch','contact','post','privacy','terms','unsubscribe','support'];
for(const name of pages){
 const html=read(`${name}.html`);
 check(html.includes('/src/pixxivo-v9.css'),`${name} missing shared polish CSS`);
 check(html.includes('/src/v9.js'),`${name} missing shared transition module`);
 check(!html.includes('class="loader"'),`${name} has obsolete loader`);
}
const home=read('index.html');
check(!home.includes('data-px8-compare-slider'),'Unwanted comparison slider still active');
check(!home.includes('id="hardware-evolution"'),'Redundant comparison section remains');
check(!home.includes('class="section px-journal-preview"'),'Duplicate Journal preview remains');
check(!home.includes('class="final-cta"'),'Duplicate last CTA remains');
for(const marker of ['data-px8-inspect-zoom','data-system-step="0"','px8-lab-preview','px7-founder','px4-dispatch'])check(home.includes(marker),`Homepage lost ${marker}`);
for(const marker of ['data-px9-scenario="clear"','data-px9-scenario="motion"','data-px9-scenario="dim"'])check(read('x1.html').includes(marker),`X1 experiment missing ${marker}`);
check(read('journal.html').includes('data-px8-lab-dialog'),'Merged Journal lost native Lab dialog');
const css=read('src/pixxivo-v9.css');
for(const marker of ['margin:auto!important','scrollbar-width:none','max-height:calc(100dvh','prefers-reduced-motion'])check(css.includes(marker),`Dialog/mobile styling missing ${marker}`);
check(read('src/px9-mark.js').match(/<path /g)?.length===5,'Original five-path Pixxivo SVG not preserved');
check(!read('src/main.js').includes('function runFullHomeLoader'),'Obsolete long loader still present');
check(read('public/assets/px11-boot.js').includes('DOMContentLoaded'),'Pre-style loader bootstrap missing');
for(const js of ['src/v9.js','src/px9-mark.js','src/main.js','src/v8.js']){
 try{execFileSync(process.execPath,['--check',path.join(root,js)],{stdio:'pipe'})}
 catch(e){problems.push(`Syntax error ${js}: ${e.stderr?.toString()}`)}
}
if(problems.length){console.error(problems.join('\n'));process.exit(1)}
console.log(`Pixxivo V9 preflight passed: ${pages.length} pages; removed comparison/duplicates; pre-style SVG loader intro; responsive lab modal; sensing scenarios.`);
