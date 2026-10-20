-- PIXXIVO STUDIO / V12 :: Privacy-minded page-view analytics
-- Additive migration. Does not modify existing subscribers, posts, or auth policies.
-- Counts begin only after site-view Edge Function + public tracker are deployed.

create table if not exists public.site_pageviews_daily (
  day date not null,
  path text not null check (length(path) between 1 and 160),
  views bigint not null default 0 check (views >= 0),
  primary key (day, path)
);
create index if not exists site_pageviews_path_idx
  on public.site_pageviews_daily(path, day desc);
alter table public.site_pageviews_daily enable row level security;
revoke all on public.site_pageviews_daily from public, anon, authenticated;

-- Called only by the site-view Edge Function under its SERVICE ROLE.
create or replace function public.record_site_pageview(p_path text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.role()) <> 'service_role' then
    raise exception 'Forbidden';
  end if;
  if p_path is null or not (
    p_path = any(array[
      '/', '/index.html', '/x1.html', '/research.html',
      '/journal.html', '/dispatch.html', '/contact.html',
      '/privacy.html', '/terms.html', '/lab.html', '/support.html'
    ]) or p_path ~ '^/post\.html\?slug=[a-z0-9]+(-[a-z0-9]+)*$'
  ) or length(p_path) > 160 then
    raise exception 'Invalid page';
  end if;
  insert into public.site_pageviews_daily(day, path, views)
  values ((now() at time zone 'Asia/Kolkata')::date, p_path, 1)
  on conflict (day, path) do update
    set views = public.site_pageviews_daily.views + 1;
end;
$$;
revoke all on function public.record_site_pageview(text) from public, anon, authenticated;
grant execute on function public.record_site_pageview(text) to service_role;

-- Studio-only aggregated read API. NEVER grants direct reads on the underlying table.
-- is_studio_admin() checks both admin allowlist and verified MFA (aal2).
create or replace function public.studio_site_analytics(p_days integer default 30)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  d integer := greatest(7, least(coalesce(p_days,30),90));
  today_ist date := (now() at time zone 'Asia/Kolkata')::date;
  current_total bigint;
  previous_total bigint;
  all_time bigint;
  today_total bigint;
  daily_data jsonb;
  page_data jsonb;
begin
  if not (select public.is_studio_admin()) then
    raise exception 'Forbidden';
  end if;
  select coalesce(sum(views), 0) into current_total
    from public.site_pageviews_daily where day between today_ist - (d-1) and today_ist;
  select coalesce(sum(views), 0) into previous_total
    from public.site_pageviews_daily where day between today_ist - (d*2-1) and today_ist - d;
  select coalesce(sum(views), 0) into all_time from public.site_pageviews_daily;
  select coalesce(sum(views), 0) into today_total from public.site_pageviews_daily where day = today_ist;
  select coalesce(jsonb_agg(jsonb_build_object('day', s.day::date, 'views', coalesce(v.views,0)) order by s.day), '[]'::jsonb)
    into daily_data
    from generate_series(today_ist-(d-1), today_ist, interval '1 day') as s(day)
    left join (
      select day, sum(views) views from public.site_pageviews_daily
      where day between today_ist-(d-1) and today_ist group by day
    ) v on v.day = s.day::date;
  select coalesce(jsonb_agg(jsonb_build_object('path', t.path, 'views', t.views) order by t.views desc, t.path), '[]'::jsonb)
    into page_data
    from (
      select path, sum(views) views from public.site_pageviews_daily
      where day between today_ist-(d-1) and today_ist
      group by path order by views desc, path limit 12
    ) t;
  return jsonb_build_object(
    'period_days',d,'today',today_total,'period',current_total,
    'previous_period',previous_total,'all_time',all_time,
    'daily',daily_data,'pages',page_data,'timezone','Asia/Kolkata'
  );
end;
$$;
revoke all on function public.studio_site_analytics(integer) from public, anon;
grant execute on function public.studio_site_analytics(integer) to authenticated;
