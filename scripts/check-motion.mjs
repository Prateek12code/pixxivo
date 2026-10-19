import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), 'utf8');
const home = read('index.html');
const x1 = read('x1.html');
const js = read('src/motion.js');
const css = read('src/pixxivo-motion.css');
const pages = ['index', 'x1', 'research', 'journal', 'post', 'contact'];
const issues = [];
for (const p of pages) {
  const text = read(`${p}.html`);
  if (!text.includes('/src/motion.js')) issues.push(`${p}: motion module missing`);
  if (!text.includes('/src/pixxivo-motion.css')) issues.push(`${p}: motion stylesheet missing`);
}
const mustHave = [
  ['index.html', home, ['data-px-cinema', 'px-explorer__media','data-hotspot="0"','px-voices__fire']],
  ['x1.html', x1, ['data-px-deck','px-gallery-track','data-gallery-step="1"','px-voices__fire']],
  ['src/motion.js', js, ['desktopStoryboard', 'ScrollTrigger', 'prefers-reduced-motion', 'initExplorer', 'initMovingNotes', 'initGallery']],
  ['src/pixxivo-motion.css', css, ['pxm-aurora', 'pxm-scroll-voices','prefers-reduced-motion','max-width:850px']]
];
for (const [file, content, required] of mustHave) {
  for (const term of required) if (!content.includes(term)) issues.push(`${file}: missing ${term}`);
}
for (const [f, num, count] of [
  ['cinema chapter', (home.match(/class="px-cinema__chapter(?:\s|")/g)||[]).length, 4],
  ['cinema visual', (home.match(/class="px-cinema__art(?:\s|")/g)||[]).length, 4],
  ['deck card', (x1.match(/class="px-deck__card px-deck__card/g)||[]).length, 3],
  ['interactive hotspot', (home.match(/class="px-hotspot/g)||[]).length, 3]
]) if (num !== count) issues.push(`${f}: expected ${count}, found ${num}`);
try { execFileSync(process.execPath, ['--check', new URL('src/motion.js',root).pathname]); }
catch {issues.push('Motion JavaScript has invalid syntax');}
if (issues.length) { console.error(issues.join('\n'));process.exit(1);}
console.log('Pixxivo Motion preflight passed: responsive scroll stages, assets and module links.');
