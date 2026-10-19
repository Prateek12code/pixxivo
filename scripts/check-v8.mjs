import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const issues=[];
const check=(condition,message)=>{if(!condition)issues.push(message)};
for(const name of ['index','x1','research','journal','dispatch','contact','post','privacy','terms','unsubscribe','support']){
 const source=read(`${name}.html`);
 check(source.includes('/src/pixxivo-v8.css'),`${name} lacks V8 responsive stylesheet`);
 check(source.includes('/src/v8.js'),`${name} lacks V8 interaction script`);
 check(!source.includes('href="/lab.html"'),`${name} still links to old Lab page`);
 for(const match of source.matchAll(/(?:src|href)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)){
  const uri=match[1];if(uri==='/')continue;
  const file=uri.startsWith('/assets/')?path.join(root,'public',uri.slice(1)):path.join(root,uri.slice(1));
  check(fs.existsSync(file),`${name} missing local resource ${uri}`);
 }
}
const home=read('index.html'),x1=read('x1.html'),lab=read('journal.html');
if(read('package.json').includes('\"version\": \"8.0.0\"'))check(home.includes('data-px8-compare-slider'),'V8 comparison slider missing');
for(const marker of ['data-px8-inspect-zoom','data-px8-founder-item="2"','px8-lab-preview','data-px8-lab-status'])check(home.includes(marker),`Home missing ${marker}`);
for(const marker of ['px8-x1-hero','data-px8-x1-mode="prototype"','data-px8-sensing','data-px8-intensity','data-px8-motion','data-px8-scope'])check(x1.includes(marker),`X1 missing ${marker}`);
for(const marker of ['data-px8-lab-dialog','data-px8-lab-grid','data-px8-filter="all"','data-px8-filter="research"','data-px8-object="board"'])check(lab.includes(marker),`Lab missing ${marker}`);
check(!/service_role|sb_secret_|resend_[a-z0-9]+/i.test(read('src/v8.js')),'Secret key may have been embedded');
check(read('src/pixxivo-v8.css').includes('prefers-reduced-motion'),'Reduced motion styling missing');
try{execFileSync(process.execPath,['--check',path.join(root,'src/v8.js')])}catch{issues.push('V8 JavaScript syntax failure')}
check(read('lab.html').includes('journal.html#hardware'),'Old Lab path does not redirect to Journal hardware section');
if(issues.length){console.error(issues.join('\n'));process.exit(1)}
console.log('Pixxivo V8 preflight passed: Journal includes the Lab, Inspector, X1 hero, Sensing demo, assets and mobile CSS.');
