import {createClient} from 'npm:@supabase/supabase-js@2';
import {cors,respond,validOrigin} from '../_shared/http.ts';
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response(null,{headers:cors(req)});
  if(req.method!=='POST') return respond(req,{error:'Method not allowed'},405);
  if(!validOrigin(req)) return respond(req,{error:'Origin not allowed'},403);
  try{
    const {token}=await req.json();
    if(typeof token!=='string'||!/^[a-f0-9-]{36}$/i.test(token)) return respond(req,{error:'Invalid link.'},400);
    const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
    const {error}=await db.from('newsletter_subscribers').update({status:'unsubscribed',updated_at:new Date().toISOString()}).eq('unsubscribe_token',token);
    if(error) throw error;
    return respond(req,{ok:true});
  }catch{return respond(req,{error:'Could not update preferences.'},500);}
});
