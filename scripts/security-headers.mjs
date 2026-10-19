import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const hashes=new Set();
for(const file of fs.readdirSync(root).filter(n=>n.endsWith('.html'))){
 const html=fs.readFileSync(path.join(root,file),'utf8');
 for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   const attrs=m[1],source=m[2];
   if(source.trim()&&!/\bsrc\s*=/.test(attrs)) hashes.add(`'sha256-${crypto.createHash('sha256').update(source,'utf8').digest('base64')}'`);
 }
}
const csp=["default-src 'self'","base-uri 'self'","object-src 'none'","frame-ancestors 'none'","form-action 'self'",`script-src 'self' https://challenges.cloudflare.com ${[...hashes].join(' ')}`,"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com","font-src 'self' data: https://fonts.gstatic.com","img-src 'self' data: blob: https:","media-src 'self' blob:","connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com","frame-src https://challenges.cloudflare.com","upgrade-insecure-requests"].join('; ');
const headers=`/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
/studio.html
  Cache-Control: no-store
  X-Robots-Tag: noindex, nofollow, noarchive
/unsubscribe.html
  Cache-Control: no-store
  Referrer-Policy: no-referrer
  X-Robots-Tag: noindex, nofollow
`;
fs.writeFileSync(path.join(root,'public/_headers'),headers);
console.log(`Generated CSP with ${hashes.size} hash permissions for source inline scripts.`);
