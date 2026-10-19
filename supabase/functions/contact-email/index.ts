import {cors,respond,validOrigin,readJSON,verifyCaptcha,enforceRateLimit} from '../_shared/http.ts';
const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
 if(req.method!=='POST')return respond(req,{error:'Method not allowed'},405);
 if(!validOrigin(req))return respond(req,{error:'Origin not allowed'},403);
 try{
  const b=await readJSON(req,5500),name=clean(b.name,60),email=clean(b.email,120).toLowerCase(),reason=clean(b.reason,80),message=clean(b.message,2000);
  if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||reason.length<2||message.length<10)return respond(req,{error:'Invalid form.'},400);
  if(!await enforceRateLimit(req,'contact',email,3))return respond(req,{error:'Too many requests. Try later.'},429);
  if(!await verifyCaptcha(req,b.turnstileToken))return respond(req,{error:'Security check failed.'},403);
  const api=Deno.env.get('RESEND_API_KEY');if(!api)return respond(req,{error:'Contact email unavailable.'},503);
  const from=Deno.env.get('CONTACT_FROM_EMAIL')||'Pixxivo <contact@pixxivo.com>',to='contact@pixxivo.com';
  const html=`<div style="font-family:Arial,sans-serif;padding:28px"><h1>New Pixxivo contact message</h1><p><b>Name:</b> ${esc(name)}</p><p><b>Email:</b> ${esc(email)}</p><p><b>Topic:</b> ${esc(reason)}</p><hr><p style="white-space:pre-wrap">${esc(message)}</p></div>`;
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${api}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],reply_to:email,subject:`Pixxivo enquiry: ${reason.replace(/[\r\n]/g,' ')}`,html})});
  if(!r.ok)throw new Error('Email provider failed');
  return respond(req,{ok:true});
 }catch{return respond(req,{error:'Unable to send message right now.'},503);}
});
