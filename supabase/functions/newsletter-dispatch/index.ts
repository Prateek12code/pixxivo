import {createClient} from 'npm:@supabase/supabase-js@2';
import {cors,respond} from '../_shared/http.ts';
const escape=(str:string)=>str.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]!));
Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response(null,{headers:cors(req)});
  if(req.method!=='POST') return respond(req,{error:'Method not allowed'},405);
  const url=Deno.env.get('SUPABASE_URL');const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const resend=Deno.env.get('RESEND_API_KEY');const secret=Deno.env.get('NEWSLETTER_DISPATCH_SECRET');
  if(!url||!key||!resend) return respond(req,{error:'Sending is not configured.'},503);
  const db=createClient(url,key,{auth:{persistSession:false}});
  try{
    const cronToken=req.headers.get('x-cron-secret');
    let allowed=Boolean(secret && cronToken && secret===cronToken);
    if(!allowed){
      const jwt=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');
      if(jwt){
        const {data:{user}}=await db.auth.getUser(jwt);
        const payload=jwt.split('.')[1];let isMfa=false;try{isMfa=JSON.parse(atob(payload.replace(/-/g,'+').replace(/_/g,'/'))).aal==='aal2';}catch{}
        if(user&&isMfa){const {data}=await db.from('studio_admins').select('user_id').eq('user_id',user.id).maybeSingle();allowed=Boolean(data);}
      }
    }
    if(!allowed) return respond(req,{error:'Forbidden'},403);
    const {data:claimed,error}=await db.rpc('claim_newsletter_deliveries',{batch_limit:10});
    if(error) throw error;
    let sent=0,failed=0;
    for(const delivery of (claimed||[])){
      // Respect a subscriber's unsubscribe even if a delivery was already queued.
      const {data:subscriber}=await db.from('newsletter_subscribers').select('status').eq('email',delivery.subscriber_email).maybeSingle();
      if(subscriber?.status!=='active'){
        await db.from('newsletter_deliveries').update({status:'failed',last_error:'Subscriber unsubscribed',attempts:3}).eq('id',delivery.delivery_id);
        continue;
      }
      const article=`https://pixxivo.com/post.html?slug=${encodeURIComponent(delivery.post_slug)}`;
      const unsubscribe=`https://pixxivo.com/unsubscribe.html?token=${delivery.unsubscribe_token}`;
      const title=escape(delivery.post_title);const excerpt=escape(delivery.post_excerpt||'Read our latest development note.');
      const html=`<!doctype html><html><body style="margin:0;padding:36px 12px;background:#0b0b0b;color:#f5f5ed;font-family:Arial,sans-serif"><div style="max-width:580px;margin:auto;border:1px solid #404a30;padding:36px"><p style="color:#ccff00;letter-spacing:.25em;font-size:12px">PIXXIVO / DISPATCH</p><h1 style="font-size:34px;line-height:1.1">${title}</h1><p style="color:#cdd0c3;font-size:17px;line-height:1.65">${excerpt}</p><p style="margin:34px 0"><a href="${article}" style="background:#ccff00;color:#111;text-decoration:none;padding:14px 22px;border-radius:50px">Read the full update ↗</a></p><hr style="border:0;border-top:1px solid #3d4637;margin:34px 0"><p style="font-size:12px;color:#a69ca6;line-height:1.7">You're receiving Pixxivo engineering updates because this address subscribed.<br><a style="color:#ccff00" href="${unsubscribe}">Unsubscribe instantly</a> · Pixxivo, India<br>Research concepts only — not medical advice.</p></div></body></html>`;
      try{
        const response=await fetch('https://api.resend.com/emails',{
          method:'POST',headers:{authorization:`Bearer ${resend}`,'content-type':'application/json'},
          body:JSON.stringify({from:Deno.env.get('NEWSLETTER_FROM')||'Pixxivo <updates@pixxivo.com>',to:[delivery.subscriber_email],subject:`Pixxivo Dispatch — ${delivery.post_title}`,html,
            headers:{'List-Unsubscribe':`<${unsubscribe}>`}})
        });
        if(!response.ok) throw new Error(`Resend delivery failed: ${response.status}`);
        await db.from('newsletter_deliveries').update({status:'sent',sent_at:new Date().toISOString(),last_error:null}).eq('id',delivery.delivery_id);
        sent++;
      }catch(e){console.warn('Dispatch delivery failed without logging subscriber or provider payload');await db.from('newsletter_deliveries').update({status:'failed',last_error:String(e).slice(0,240)}).eq('id',delivery.delivery_id);failed++;}
      // Resend commonly allows 2 requests/sec; keep safely below the limit.
      await new Promise(resolve=>setTimeout(resolve,650));
    }
    const {data:campaigns}=await db.from('newsletter_campaigns').select('id').in('status',['queued','sending']);
    for(const cmp of campaigns||[]){
      const {data:pendingDeliveries}=await db.from('newsletter_deliveries').select('status,attempts').eq('campaign_id',cmp.id);
      const count=(pendingDeliveries||[]).filter(d=>d.status==='queued'||d.status==='sending'||(d.status==='failed'&&d.attempts<3)).length;
      if(count===0) await db.from('newsletter_campaigns').update({status:'sent',completed_at:new Date().toISOString()}).eq('id',cmp.id);
      else await db.from('newsletter_campaigns').update({status:'sending'}).eq('id',cmp.id);
    }
    return respond(req,{ok:true,sent,failed,remaining:'Use the dashboard counts or let cron continue.'});
  }catch{return respond(req,{error:'Newsletter processing failed.'},500);}
});
