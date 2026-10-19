import {createClient} from 'npm:@supabase/supabase-js@2';
export const baseHeaders:Record<string,string> = {
  'content-type':'application/json; charset=utf-8',
  'cache-control':'no-store',
  'x-content-type-options':'nosniff',
  'access-control-allow-methods':'POST, OPTIONS',
  'access-control-allow-headers':'authorization, apikey, content-type, x-client-info, x-cron-secret',
};
const allowed=()=> (Deno.env.get('NEWSLETTER_ALLOWED_ORIGINS')||'https://pixxivo.com,https://www.pixxivo.com').split(',').map(s=>s.trim()).filter(Boolean);
export function validOrigin(req:Request){const origin=req.headers.get('origin');return !origin||allowed().includes(origin);}
export function cors(req:Request){const origin=req.headers.get('origin');return {
  ...baseHeaders,
  ...(origin&&allowed().includes(origin)?{'access-control-allow-origin':origin}:{}),
  'vary':'Origin'
};}
export function respond(req:Request,body:Record<string,unknown>,status=200){return new Response(JSON.stringify(body),{status,headers:cors(req)});}
export async function readJSON(req:Request,max=5000){
 const len=Number(req.headers.get('content-length')||0);
 if(len>max)throw new Error('Payload too large');
 const raw=await req.text();if(raw.length>max)throw new Error('Payload too large');
 return JSON.parse(raw);
}
export async function verifyCaptcha(req:Request,token:unknown){
 const secret=Deno.env.get('TURNSTILE_SECRET_KEY');
 // Production is fail-closed. Configure BOTH Vite site key and function secret.
 if(!secret)throw new Error('Turnstile not configured');
 if(typeof token!=='string'||token.length>2048||!token)return false;
 const form=new FormData();form.set('secret',secret);form.set('response',token);
 const ip=req.headers.get('cf-connecting-ip');if(ip)form.set('remoteip',ip);
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),5000);
 try{
  const res=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form,signal:controller.signal});
  if(!res.ok)return false;const result=await res.json();
  return result.success===true && ['pixxivo.com','www.pixxivo.com','localhost'].includes(result.hostname);
 }finally{clearTimeout(timer);}
}
async function limitHash(id:string){
 const pepper=Deno.env.get('RATE_LIMIT_PEPPER');if(!pepper||pepper.length<32)throw new Error('Rate limiter not configured');
 const data=new TextEncoder().encode(id),k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,data)),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function enforceRateLimit(req:Request,category:string,identity:string,perWindow=5){
 const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)throw new Error('Backend not configured');
 const db=createClient(url,key,{auth:{persistSession:false}});
 const identities=[category+':'+identity];
 // CF-Connecting-IP is only trustworthy if your upstream proxy overwrites it.
 const ip=req.headers.get('cf-connecting-ip');if(ip&&ip.length<60)identities.push(category+':ip:'+ip);
 for(const ident of identities){
  const hashed=await limitHash(ident);
  const {data,error}=await db.rpc('consume_public_limit',{p_hash:hashed,p_limit:ident.includes(':ip:')?15:perWindow,p_window_seconds:600});
  if(error)throw error;
  if(data!==true)return false;
 }
 return true;
}
