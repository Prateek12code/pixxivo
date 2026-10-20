/** Additive integration for the existing Pixxivo vanilla-JS project.
 * Re-runnable and intentionally fails if the original app differs unexpectedly.
 */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join,resolve} from 'node:path';
const root=resolve(process.cwd());
const studioPath=join(root,'src/studio.js');
const mainPath=join(root,'src/main.js');
for(const file of ['src/studio-v12.js','src/studio-v12.css','src/analytics-tracker.js','supabase/studio_analytics.sql','supabase/functions/site-view/index.ts', 'src/studio.js','src/main.js']){
  if(!existsSync(join(root,file)))throw new Error(`Missing ${file}. Copy the V12 files into your Pixxivo project root first.`);
}
let studio=readFileSync(studioPath,'utf8'),main=readFileSync(mainPath,'utf8');
if(!studio.includes("import './studio-original.css';"))throw new Error('Studio CSS import not found; integration halted before changing anything.');
if(!studio.includes('bind();checkAuth();')&&!studio.includes('bind();initStudioV12({supabase});checkAuth();'))throw new Error('Studio initialization marker not found; integration halted before changing anything.');
if(!main.includes('import "./style.css";'))throw new Error('Main stylesheet import not found; integration halted before changing anything.');
if(!studio.includes("import './studio-v12.css';")){
 studio=studio.replace("import './studio-original.css';", "import './studio-original.css';\nimport './studio-v12.css';\nimport {initStudioV12} from './studio-v12.js';");
}
if(!studio.includes('bind();initStudioV12({supabase});checkAuth();'))studio=studio.replace('bind();checkAuth();','bind();initStudioV12({supabase});checkAuth();');
if(!main.includes('import "./analytics-tracker.js";'))main=main.replace('import "./style.css";','import "./style.css";\nimport "./analytics-tracker.js";');
writeFileSync(studioPath,studio);writeFileSync(mainPath,main);
const privacyPath=join(root,'privacy.html');
if(existsSync(privacyPath)){
 let privacy=readFileSync(privacyPath,'utf8');
 if(!privacy.includes('Anonymous page-view metrics')&&privacy.includes('<h2>6. Updates</h2>')){
  privacy=privacy.replace('<h2>6. Updates</h2>','<h2>6. Anonymous page-view metrics</h2><p>Our website counts page views by page and day to understand which content readers visit. These aggregate metrics use no analytics cookies, account identifiers or visitor fingerprints. Limited network information may be processed briefly by our hosting and security services to prevent abuse; no raw IP addresses are stored in the page-view metrics table. You can opt out with your browser’s Do Not Track setting where supported.</p><h2>7. Updates</h2>');
  privacy=privacy.replace('Last updated: 12 October 2026.', 'Last updated: 20 October 2026.');
  writeFileSync(privacyPath,privacy);
 }
}
console.log('✓ Pixxivo Studio V12 integrated. Next: run SQL, deploy site-view function, npm run build.');
