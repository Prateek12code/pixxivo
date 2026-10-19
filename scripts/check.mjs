import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index','x1','research','journal','dispatch','post','studio','contact','unsubscribe','support','privacy','terms'];
const errors=[];
for(const name of pages){
 const p=path.join(root,`${name}.html`);
 if(!fs.existsSync(p)){errors.push(`Missing ${p}`);continue;}
 const html=fs.readFileSync(p,'utf8');
 if(!/<title>[^<]+<\/title>/i.test(html))errors.push(`${name}: title missing`);
 if(!/<meta[^>]*name=["\']description["\']/i.test(html) && !['studio','support'].includes(name))errors.push(`${name}: description missing`);
 if((html.match(/<h1\b/gi)||[]).length!==1 && !['post','studio','support'].includes(name))errors.push(`${name}: expected one h1`);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)(?:[#?][^"]*)?"/g)){
  const url=match[1];const target=url==='/'?path.join(root,'index.html'):
   url.startsWith('/assets/')?path.join(root,'public',url.slice(1)):
   path.join(root,url.slice(1));
  if(!fs.existsSync(target))errors.push(`${name}: missing asset ${url}`);
 }
}
for(const name of fs.readdirSync(path.join(root,'src')).filter(f=>f.endsWith('.js'))){
 try{execFileSync(process.execPath,['--check',path.join(root,'src',name)],{stdio:'pipe'});}
 catch(err){errors.push(`${name}: ${err.stderr?.toString()}`);}
}
for(const f of ['supabase/pixxivo_studio.sql','supabase/cron_setup.sql','supabase/functions/newsletter-subscribe/index.ts','supabase/functions/newsletter-dispatch/index.ts'])if(!fs.existsSync(path.join(root,f)))errors.push(`Missing ${f}`);
if(errors.length){console.error(`Failed with ${errors.length} issues:`);console.error(errors.join('\n'));process.exit(1);}
console.log(`Pixxivo Studio preflight passed: ${pages.length} pages, all local links, JS syntax, and backend files.`);
