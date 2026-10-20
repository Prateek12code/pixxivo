// PIXXIVO V12 / Lightweight page views. No cookies, IP or user-agent persistence.
import {createClient} from 'npm:@supabase/supabase-js@2';
import {cors,respond,validOrigin,readJSON,enforceRateLimit} from '../_shared/http.ts';

const pages = new Set([
  '/', '/index.html', '/x1.html', '/research.html', '/journal.html',
  '/dispatch.html', '/contact.html', '/privacy.html', '/terms.html',
  '/lab.html', '/support.html'
]);

Deno.serve(async (req:Request) => {
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:cors(req)});
  if (req.method !== 'POST') return respond(req,{error:'Method not allowed'},405);
  if (!validOrigin(req)) return respond(req,{error:'Origin not allowed'},403);
  try {
    const {path} = await readJSON(req,512) as {path?:unknown};
    if (typeof path !== 'string' || path.length > 160 ||
        !(pages.has(path) || /^\/post\.html\?slug=[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path))) {
      return respond(req,{error:'Invalid path'},400);
    }
    // Limit obvious rapid-fire requests; hash/salt handled by existing security code.
    // No visitor identity is stored in site_pageviews_daily.
    const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (ip && !(await enforceRateLimit(req,'pageview',ip,80))) {
      return respond(req,{error:'Rate limited'},429);
    }
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return respond(req,{error:'Analytics unavailable'},503);
    const db = createClient(url,key,{auth:{persistSession:false}});
    const {error} = await db.rpc('record_site_pageview',{p_path:path});
    if (error) throw error;
    return respond(req,{ok:true});
  } catch {
    return respond(req,{error:'Analytics unavailable'},503);
  }
});
