import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const issues=[];
const need=(yes,desc)=>{if(!yes)issues.push(desc);};
const p=JSON.parse(read('package.json'));
const sql=read('supabase/security_hardening.sql');
const client=read('src/supabaseClient.js');
const headers=read('public/_headers');
const common=read('supabase/functions/_shared/http.ts');
const studio=read('src/studio.js');
need(p.scripts.prebuild==='npm run security:headers','Header generation missing from build');
need(read('vite.config.js').includes('sourcemap:false'),'Source maps not explicitly disabled');
need(client.includes('window.sessionStorage')&&!client.includes('storage: window.localStorage'),'Admin auth storage is not session-scoped');
need(studio.includes('getAuthenticatorAssuranceLevel')&&studio.includes('challengeAndVerify'),'MFA enrollment/challenge missing');
need(sql.includes("'aal2'")&&sql.includes('is_studio_admin'),'RLS MFA gate missing');
need(sql.includes('consume_public_limit')&&sql.includes('name like \'covers/%\''),'Rate limiter/storage policy missing');
need(common.includes('verifyCaptcha')&&common.includes('TURNSTILE_SECRET_KEY')&&common.includes('RATE_LIMIT_PEPPER'),'Public form protection absent');
for(const f of ['newsletter-subscribe','contact-email']){
 const data=read(`supabase/functions/${f}/index.ts`);
 need(data.includes('enforceRateLimit')&&data.includes('verifyCaptcha'),'Missing server throttling and challenge in '+f);
}
need(headers.includes('Content-Security-Policy:')&&headers.includes("object-src 'none'")&&!headers.includes("'unsafe-inline' https://challenges.cloudflare.com"),'CSP not emitted');
need(headers.includes('Strict-Transport-Security:'),'Missing HTTPS HSTS');
need(read('src/site-links.js').includes('VITE_PIXXIVO_INSTAGRAM_URL'),'Instagram configuration missing');
need(read('supabase/functions/contact-email/index.ts').includes("to='contact@pixxivo.com'"),'Contact destination wrong');
const scan=[...fs.readdirSync(path.join(root,'src')).filter(x=>x.endsWith('.js')).map(x=>'src/'+x),...fs.readdirSync(root).filter(x=>x.endsWith('.html'))];
for(const f of scan){
 const t=read(f);
 if(/(?:SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|TURNSTILE_SECRET_KEY)\s*[:=]\s*['"`][a-z0-9]{20,}/i.test(t))issues.push('Potential embedded secret in '+f);
}
if(issues.length){console.error(issues.join('\n'));process.exit(1)}
console.log('Security source preflight passed (NOT a deployed security/penetration test).');
