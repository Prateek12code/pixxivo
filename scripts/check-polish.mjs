import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const errors=[];
const must=(condition,message)=>{if(!condition)errors.push(message)};
for(const page of ['index','x1','journal','research','dispatch']){
 const html=read(`${page}.html`);
 must(html.includes('/src/pixxivo-v4.css'),`${page}: polish stylesheet missing`);
 must(!html.includes('Engineered to be understood'),`${page}: retired editorial headline is still present`);
 must(!html.includes('PX / R&D'),`${page}: retired PX/R&D dial is still present`);
 must(html.includes('<main>')||html.includes('<main '),`${page}: missing main landmark`);
}
const home=read('index.html');
for(const marker of ['data-hero-inspect','data-explorer-rotate','data-dispatch-view','data-newsletter-form','px4-manifesto'])must(home.includes(marker),`Home missing ${marker}`);
const research=read('research.html');
for(const marker of ["px7-r-dossier", "bte-assembled.webp", "bte-detail.webp"])must(research.includes(marker), `Research missing V6 concept asset/interaction ${marker}`);
const x1=read('x1.html');for(let i=0;i<3;i++)must(x1.includes(`data-deck-jump="${i}"`),`X1 missing jump button ${i}`);
const motion=read('src/motion.js');
const deck=motion.slice(motion.indexOf('function initX1Deck()'),motion.indexOf('function initExplorer()'));
must(!deck.includes('pin, pinSpacing'), 'X1 card deck still uses nested pin');
must(deck.includes("end:'bottom bottom'"), 'X1 card deck does not use intrinsic sticky stage');
const css=read('src/pixxivo-v4.css');
must(css.includes('position:sticky'), 'Sticky deck styling missing');
for(const n of ['index','journal','research','dispatch'])must(read(`${n}.html`).includes('href="/dispatch.html"'), `${n}: dispatch navigation missing`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
console.log('Pixxivo v4 polish checks passed: original palette, hero, deck, explorer, Dispatch, Journal and Research.');
