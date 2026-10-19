-- Run once AFTER completing the secrets and Edge Function deployment steps in README.
-- REQUIRED: enter these values in Supabase Vault first, then replace nothing here:
-- select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co/functions/v1/newsletter-dispatch','pixxivo_dispatch_url');
-- select vault.create_secret('YOUR_LONG_RANDOM_NEWSLETTER_DISPATCH_SECRET','pixxivo_dispatch_secret');
-- IMPORTANT: these are deliberately COMMENTS, not live placeholder credentials.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
select cron.schedule(
  'pixxivo-scheduled-article-publish',
  '* * * * *',
  $$ select public.publish_scheduled_posts(); $$
);
select cron.schedule(
  'pixxivo-newsletter-dispatch',
  '* * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name='pixxivo_dispatch_url' limit 1),
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',
      (select decrypted_secret from vault.decrypted_secrets where name='pixxivo_dispatch_secret' limit 1)),
    body := '{}'::jsonb
  );
  $$
);
-- Check jobs under Database > Cron in Supabase dashboard.
