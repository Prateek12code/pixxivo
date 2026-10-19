import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=['index','x1','journal','research','dispatch','contact','post','privacy','terms','unsubscribe','support','studio'];
const errors=[];
for(const page of pages){const html=read(page+'.html');for(const token of ['id="px11-critical"','class="px11-boot"','class="px11-mark"','/assets/px11-boot.js'])if(!html.includes(token))errors.push(page+' missing '+token);if(html.includes('px10-boot'))errors.push(page+' legacy green curtain present');}
const index=read('index.html');
const logo=index.match(/<svg[^>]+class="px11-mark"[^>]*>[\s\S]*?<\/svg>/)?.[0]||'';
if((logo.match(/<path\b/g)||[]).length!==5)errors.push('Not using all five original Pixxivo SVG paths');
const css=index.match(/<style id="px11-critical">[\s\S]*?<\/style>/)?.[0]||'';
for(const token of ['@keyframes px11-trace','@keyframes px11-fill','fill:#fff','background:#080808','px11-revealing'])if(!css.includes(token))errors.push('Loader style missing '+token);
if(/#ccff00|green|lime|aurora|px10-boot__door/i.test(css))errors.push('Green or split door styling remains in loader');
const js=read('public/assets/px11-boot.js');
for(const token of ['DOMContentLoaded','pageshow','sessionStorage','prefers-reduced-motion','location.assign','px11-ready'])if(!js.includes(token))errors.push('Missing '+token);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('V11 classic PX loader checks passed: real paths, white trace/fill, black background, graceful navigation.');
