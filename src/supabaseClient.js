import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const hasSupabaseConfig = Boolean(url && key && /^https:\/\/[^/]+\.supabase\.co\/?$/.test(url) && !url.includes('YOUR_PROJECT_ID') && !key.includes('YOUR_'));
export const supabase = hasSupabaseConfig ? createClient(url, key, {
  auth: {persistSession:true,storage: window.sessionStorage,storageKey:'pixxivo-studio-session',autoRefreshToken:true,detectSessionInUrl:false},
}) : null;
if (!hasSupabaseConfig) console.info('Pixxivo: Supabase is not configured. Public design pages remain available; forms/auth require .env setup.');
