-- WARNING: destructive reset for Pixxivo website content only.
-- Run this in the Supabase SQL Editor only after taking a backup.
-- It clears journal posts, newsletter campaigns/deliveries/subscribers,
-- rate-limit rows, and uploaded journal media objects.

begin;

-- Delete storage objects for the journal media bucket.
delete from storage.objects where bucket_id = 'journal-media';

-- Clear dependent rows first.
truncate table
  public.newsletter_deliveries,
  public.newsletter_campaigns,
  public.journal_posts,
  public.newsletter_subscribers,
  public.public_request_limits
restart identity cascade;

-- Keep studio_admins so your admin access still works.
-- Uncomment the next line only if you intentionally want to remove admin bindings too.
-- truncate table public.studio_admins restart identity cascade;

commit;
