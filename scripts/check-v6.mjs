import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const needs=(ok,msg)=>{if(!ok)errors.push(msg)};
const errors=[];
const pages=['index','x1','research','journal','dispatch','post','contact','studio','support','privacy','terms','unsubscribe'];
for(const page of pages){
 const html=read(page+'.html');
 needs(html.includes('/src/pixxivo-v6.css'),`${page}: missing V6 CSS`);
 if(['index','research'].includes(page))needs(html.includes('/src/v6.js'),`${page}: missing V6 JS`);
}
const home=read('index.html');const research=read('research.html');const css=read('src/pixxivo-v6.css');const js=read('src/v6.js');
for(const token of ['data-infinite-marquee','data-marquee-set','data-px6-system','data-system-step="0"','data-system-step="3"','px6-voices','bte-assembled.webp'])needs(home.includes(token),`home: missing ${token}`);
needs((home.match(/class="marquee__set"/g)||[]).length===1,'Marquee must start with a single source set so JS can duplicate at viewport width');
needs(!home.includes('aria-label="Conceptual behind-the-ear wearable line-art illustration"'),'Home still has old illustrative ear artwork');
for(const token of ['px7-r-hero','px7-r-dossier','bte-assembled.webp','CONCEPT'])needs(research.includes(token),`Research missing ${token}`);
for(const bad of ['v5-device__hook','v5-layer--hook','px4-research-silhouette','px4-ear-outline'])needs(!research.includes(bad),`Research contains retired CSS/SVG illustration ${bad}`);
for(const asset of ['bte-assembled.webp','bte-exploded.webp','bte-detail.webp'])needs(fs.statSync(path.join(root,'public/assets',asset)).size > 10000,`Missing or empty ${asset}`);
for(const token of ['infiniteMarquee','getBoundingClientRect().width','systemFocus','prefers-reduced-motion'])needs(js.includes(token),`V6 interaction missing ${token}`);
needs(css.includes('@media(max-width:620px)'),'V6 lacks mobile rules');
needs(css.includes('@media(prefers-reduced-motion:reduce)'),'V6 lacks reduced motion support');
try {execFileSync(process.execPath,['--check',path.join(root,'src/v6.js')],{stdio:'pipe'})}catch{errors.push('V6 JS invalid syntax')}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log(`Pixxivo V6 compatibility preflight passed (${pages.length} pages, preserved assets, marquee and system viewer).`);
