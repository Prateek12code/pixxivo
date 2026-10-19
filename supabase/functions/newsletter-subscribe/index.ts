import {createClient} from 'npm:@supabase/supabase-js@2';
import {cors,respond,validOrigin,readJSON,verifyCaptcha,enforceRateLimit} from '../_shared/http.ts';
const emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return respond(req,{error:'Method not allowed'},405);
  if(!validOrigin(req))return respond(req,{error:'Origin not allowed'},403);
  try{
    const body=await readJSON(req);const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
    if(typeof body.website==='string'&&body.website)return respond(req,{ok:true});
    if(email.length>254||!emailRe.test(email))return respond(req,{error:'Enter a valid email.'},400);
    if(!await enforceRateLimit(req,'subscribe',email,3))return respond(req,{error:'Too many requests. Try later.'},429);
    if(!await verifyCaptcha(req,body.turnstileToken))return respond(req,{error:'Security check failed.'},403);
    const url=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url||!key)return respond(req,{error:'Newsletter unavailable.'},503);
    const db=createClient(url,key,{auth:{persistSession:false}});
    const {data,error}=await db.from('newsletter_subscribers').select('id,status').eq('email',email).maybeSingle();
    if(error)throw error;
    if(!data){const {error:insertError}=await db.from('newsletter_subscribers').insert({email,source:'website'});if(insertError&&insertError.code!=='23505')throw insertError;}
    return respond(req,{ok:true,message:'If this address is eligible, it has been added to Dispatch.'});
  }catch{return respond(req,{error:'Service unavailable. Try again later.'},503);}
});
