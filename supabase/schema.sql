-- ============================================================
-- PIXXIVO DATABASE
-- Overhaul v2
--
-- Features:
--   - No OTP required for supporters
--   - Private supporter emails
--   - Newsletter subscriptions
--   - Public Signal Wall
--   - Builder Logs
--   - X1 development status
--   - Contact messages
--   - Safe public RPC functions
--
-- IMPORTANT:
-- Run this in Supabase SQL Editor.
-- ============================================================


-- ============================================================
-- EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 1. MIGRATE EXISTING SUPPORTERS TABLE
-- ============================================================

-- Your old supporters table used:
--
-- user_id -> auth.users
--
-- That forced visitors to verify their email / OTP.
--
-- We first copy their emails into the supporters table,
-- then remove the auth dependency.


alter table public.supporters
add column if not exists email text;


-- Copy email from existing Supabase Auth users
update public.supporters s
set email = lower(trim(u.email))
from auth.users u
where s.user_id = u.id
and s.email is null;


-- Remove OLD auth-based RLS policies
drop policy if exists
"Public can read verified supporters"
on public.supporters;

drop policy if exists
"Authenticated users can create own supporter"
on public.supporters;

drop policy if exists
"Authenticated users can update own supporter"
on public.supporters;


-- Remove auth relationship
alter table public.supporters
drop constraint if exists supporters_user_id_fkey;

alter table public.supporters
drop constraint if exists supporters_user_id_key;


-- Remove the old user_id column
alter table public.supporters
drop column if exists user_id;


-- ============================================================
-- SUPPORTERS TABLE UPDATE
-- ============================================================

alter table public.supporters
alter column email set not null;


-- Existing supporters used "verified".
-- We are keeping that status name so old entries keep working.

alter table public.supporters
alter column status set default 'verified';


-- Ensure email is stored only once
create unique index if not exists supporters_email_unique
on public.supporters (lower(email));


-- Helpful indexes
create index if not exists supporters_created_at_idx
on public.supporters (created_at desc);

create index if not exists supporters_status_idx
on public.supporters (status);


-- ============================================================
-- 2. NEWSLETTER SUBSCRIBERS
-- ============================================================

create table if not exists public.newsletter_subscribers (

    id uuid primary key default gen_random_uuid(),

    email text not null,

    display_name text,

    status text not null default 'active',

    source text not null default 'website',

    unsubscribe_token uuid
        not null
        default gen_random_uuid(),

    subscribed_at timestamptz
        not null
        default now(),

    unsubscribed_at timestamptz,

    updated_at timestamptz
        not null
        default now(),

    constraint newsletter_email_len
        check (
            char_length(email)
            between 5 and 160
        ),

    constraint newsletter_name_len
        check (
            display_name is null
            or char_length(display_name)
            between 1 and 60
        ),

    constraint newsletter_status_check
        check (
            status in (
                'active',
                'unsubscribed',
                'blocked'
            )
        )
);


create unique index if not exists newsletter_email_unique
on public.newsletter_subscribers (lower(email));


create unique index if not exists newsletter_unsubscribe_token_unique
on public.newsletter_subscribers (unsubscribe_token);


create index if not exists newsletter_status_idx
on public.newsletter_subscribers (status);


create index if not exists newsletter_created_at_idx
on public.newsletter_subscribers (subscribed_at desc);



-- ============================================================
-- 3. BUILD LOGS
-- ============================================================

create table if not exists public.build_logs (

    id uuid primary key default gen_random_uuid(),

    slug text not null unique,

    title text not null,

    summary text not null,

    body text,

    category text not null default 'GENERAL',

    image_url text,

    status text not null default 'draft',

    send_newsletter boolean not null default false,

    newsletter_sent boolean not null default false,

    newsletter_sent_at timestamptz,

    created_at timestamptz
        not null
        default now(),

    updated_at timestamptz
        not null
        default now(),

    published_at timestamptz,

    constraint build_log_title_len
        check (
            char_length(title)
            between 2 and 160
        ),

    constraint build_log_slug_len
        check (
            char_length(slug)
            between 2 and 180
        ),

    constraint build_log_summary_len
        check (
            char_length(summary)
            between 2 and 500
        ),

    constraint build_log_category_check
        check (
            category in (
                'HARDWARE',
                'SOFTWARE',
                'DESIGN',
                'RESEARCH',
                'TESTING',
                'MANUFACTURING',
                'GENERAL'
            )
        ),

    constraint build_log_status_check
        check (
            status in (
                'draft',
                'published',
                'archived'
            )
        )
);


create index if not exists build_logs_status_idx
on public.build_logs (status);


create index if not exists build_logs_published_at_idx
on public.build_logs (published_at desc);


create index if not exists build_logs_category_idx
on public.build_logs (category);



-- ============================================================
-- 4. X1 DEVELOPMENT STATUS
-- ============================================================

create table if not exists public.development_status (

    id uuid primary key default gen_random_uuid(),

    item_key text not null unique,

    label text not null,

    status text not null default 'upcoming',

    description text,

    sort_order integer not null default 0,

    updated_at timestamptz
        not null
        default now(),

    constraint development_label_len
        check (
            char_length(label)
            between 2 and 100
        ),

    constraint development_status_check
        check (
            status in (
                'complete',
                'testing',
                'development',
                'research',
                'upcoming',
                'paused'
            )
        )
);


create index if not exists development_status_sort_idx
on public.development_status (sort_order);



-- ============================================================
-- 5. CONTACT MESSAGES
-- ============================================================

create table if not exists public.contact_messages (

    id uuid primary key default gen_random_uuid(),

    name text not null,

    email text not null,

    reason text not null,

    message text not null,

    status text not null default 'new',

    created_at timestamptz
        not null
        default now(),

    constraint contact_name_len
        check (
            char_length(name)
            between 2 and 60
        ),

    constraint contact_email_len
        check (
            char_length(email)
            between 5 and 120
        ),

    constraint contact_reason_len
        check (
            char_length(reason)
            between 2 and 80
        ),

    constraint contact_message_len
        check (
            char_length(message)
            between 10 and 2000
        )
);



-- ============================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.supporters
enable row level security;

alter table public.newsletter_subscribers
enable row level security;

alter table public.build_logs
enable row level security;

alter table public.development_status
enable row level security;

alter table public.contact_messages
enable row level security;



-- ============================================================
-- 7. REMOVE DIRECT PUBLIC ACCESS TO PRIVATE DATA
-- ============================================================

-- IMPORTANT:
--
-- Visitors should NEVER directly SELECT supporters
-- because the table contains their emails.
--
-- The public website gets safe data using RPC functions.


revoke all
on table public.supporters
from anon;

revoke all
on table public.newsletter_subscribers
from anon;


-- Authenticated normal users don't need these either.
-- Admin operations will later happen through our secure
-- Supabase Edge Function.

revoke all
on table public.supporters
from authenticated;

revoke all
on table public.newsletter_subscribers
from authenticated;



-- ============================================================
-- 8. PUBLIC BUILD LOG READ POLICY
-- ============================================================

drop policy if exists
"Public can read published build logs"
on public.build_logs;


create policy
"Public can read published build logs"
on public.build_logs
for select
to anon, authenticated
using (
    status = 'published'
);



-- ============================================================
-- 9. PUBLIC DEVELOPMENT STATUS READ POLICY
-- ============================================================

drop policy if exists
"Public can read development status"
on public.development_status;


create policy
"Public can read development status"
on public.development_status
for select
to anon, authenticated
using (true);



-- ============================================================
-- 10. CONTACT FORM POLICY
-- ============================================================

drop policy if exists
"Anyone can submit contact messages"
on public.contact_messages;


create policy
"Anyone can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);



-- ============================================================
-- 11. EMAIL VALIDATOR
-- ============================================================

create or replace function public.is_valid_email(
    input_email text
)
returns boolean
language sql
immutable
as $$

    select
        input_email is not null

        and char_length(trim(input_email))
            between 5 and 160

        and trim(input_email)
            ~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$';

$$;



-- ============================================================
-- 12. CLEAN TEXT FUNCTION
-- ============================================================

create or replace function public.clean_public_text(
    input_text text,
    max_length integer
)
returns text
language sql
immutable
as $$

    select
        left(
            regexp_replace(
                trim(coalesce(input_text, '')),
                '\s+',
                ' ',
                'g'
            ),
            max_length
        );

$$;



-- ============================================================
-- 13. JOIN PIXXIVO
--
-- Replaces the entire OTP system.
--
-- Visitor:
--
-- Name
-- Email
-- Message
-- Newsletter checkbox
--
-- -> one request
-- -> done
-- ============================================================

create or replace function public.join_pixxivo(

    p_email text,

    p_display_name text,

    p_message text default null,

    p_is_anonymous boolean default false,

    p_newsletter boolean default true

)
returns jsonb

language plpgsql

security definer

set search_path = public

as $$

declare

    clean_email text;

    clean_name text;

    clean_message text;

    supporter_record public.supporters;

    existing_status text;

begin

    -- ------------------------------------------
    -- Clean input
    -- ------------------------------------------

    clean_email :=
        lower(
            trim(
                coalesce(
                    p_email,
                    ''
                )
            )
        );


    clean_name :=
        public.clean_public_text(
            p_display_name,
            40
        );


    clean_message :=
        nullif(
            public.clean_public_text(
                p_message,
                120
            ),
            ''
        );


    -- ------------------------------------------
    -- Validate
    -- ------------------------------------------

    if not public.is_valid_email(clean_email) then

        raise exception
            'Please enter a valid email address.';

    end if;


    if char_length(clean_name) < 2 then

        raise exception
            'Please enter your name.';

    end if;


    -- ------------------------------------------
    -- Check if supporter already exists
    -- ------------------------------------------

    select status

    into existing_status

    from public.supporters

    where lower(email) = clean_email

    limit 1;


    -- Never allow public request to restore
    -- someone manually blocked by admin.

    if existing_status = 'blocked' then

        raise exception
            'Unable to join using this email address.';

    end if;


    -- ------------------------------------------
    -- Insert or update supporter
    -- ------------------------------------------

    insert into public.supporters (

        email,

        display_name,

        message,

        is_anonymous,

        status,

        updated_at

    )

    values (

        clean_email,

        clean_name,

        clean_message,

        coalesce(
            p_is_anonymous,
            false
        ),

        'verified',

        now()

    )

    on conflict (email)

    do update set

        display_name =
            excluded.display_name,

        message =
            excluded.message,

        is_anonymous =
            excluded.is_anonymous,

        updated_at =
            now()

    returning *
    into supporter_record;


    -- ------------------------------------------
    -- Newsletter
    -- ------------------------------------------

    if coalesce(
        p_newsletter,
        true
    ) then


        insert into public.newsletter_subscribers (

            email,

            display_name,

            status,

            source,

            subscribed_at,

            unsubscribed_at,

            updated_at

        )

        values (

            clean_email,

            clean_name,

            'active',

            'signal-wall',

            now(),

            null,

            now()

        )

        on conflict (email)

        do update set

            display_name =
                excluded.display_name,

            status =
                case

                    -- Don't let public signup unblock
                    -- manually blocked addresses.

                    when newsletter_subscribers.status = 'blocked'
                        then 'blocked'

                    else 'active'

                end,

            unsubscribed_at =
                case

                    when newsletter_subscribers.status = 'blocked'
                        then newsletter_subscribers.unsubscribed_at

                    else null

                end,

            updated_at =
                now();

    end if;


    -- ------------------------------------------
    -- Return safe result
    -- ------------------------------------------

    return jsonb_build_object(

        'success',
        true,

        'supporter_id',
        supporter_record.id,

        'newsletter',
        coalesce(
            p_newsletter,
            true
        ),

        'message',
        'You are in.'

    );

end;

$$;



-- ============================================================
-- 14. NEWSLETTER-ONLY SIGNUP
-- ============================================================

create or replace function public.subscribe_newsletter(

    p_email text,

    p_display_name text default null,

    p_source text default 'website'

)
returns jsonb

language plpgsql

security definer

set search_path = public

as $$

declare

    clean_email text;

    clean_name text;

    clean_source text;

    current_status text;

begin

    clean_email :=
        lower(
            trim(
                coalesce(
                    p_email,
                    ''
                )
            )
        );


    clean_name :=
        nullif(
            public.clean_public_text(
                p_display_name,
                60
            ),
            ''
        );


    clean_source :=
        nullif(
            public.clean_public_text(
                p_source,
                40
            ),
            ''
        );


    if clean_source is null then
        clean_source := 'website';
    end if;


    if not public.is_valid_email(clean_email) then

        raise exception
            'Please enter a valid email address.';

    end if;


    select status

    into current_status

    from public.newsletter_subscribers

    where lower(email) = clean_email

    limit 1;


    if current_status = 'blocked' then

        raise exception
            'Unable to subscribe using this email address.';

    end if;


    insert into public.newsletter_subscribers (

        email,

        display_name,

        status,

        source,

        subscribed_at,

        unsubscribed_at,

        updated_at

    )

    values (

        clean_email,

        clean_name,

        'active',

        clean_source,

        now(),

        null,

        now()

    )

    on conflict (email)

    do update set

        display_name =
            coalesce(
                excluded.display_name,
                newsletter_subscribers.display_name
            ),

        status =
            'active',

        source =
            excluded.source,

        unsubscribed_at =
            null,

        updated_at =
            now();


    return jsonb_build_object(

        'success',
        true,

        'message',
        'Subscribed to Pixxivo updates.'

    );

end;

$$;



-- ============================================================
-- 15. PUBLIC SIGNAL WALL
--
-- IMPORTANT:
-- This function intentionally returns NO EMAIL.
-- ============================================================

create or replace function public.get_signal_wall()

returns table (

    id uuid,

    signal_number bigint,

    display_name text,

    message text,

    is_anonymous boolean,

    created_at timestamptz

)

language sql

security definer

set search_path = public

as $$

    select

        s.id,

        row_number() over (
            order by s.created_at asc
        ) as signal_number,

        case

            when s.is_anonymous
                then 'Anonymous Supporter'

            else s.display_name

        end as display_name,

        s.message,

        s.is_anonymous,

        s.created_at

    from public.supporters s

    where s.status = 'verified'

    order by s.created_at desc;

$$;



-- ============================================================
-- 16. SUPPORTER STATS
-- ============================================================

create or replace function public.get_signal_stats()

returns table (

    total_supporters bigint

)

language sql

security definer

set search_path = public

as $$

    select

        count(*)::bigint

            as total_supporters

    from public.supporters

    where status = 'verified';

$$;



-- ============================================================
-- 17. GET LATEST BUILD LOGS
-- ============================================================

create or replace function public.get_build_logs(

    p_limit integer default 20,

    p_category text default null

)

returns table (

    id uuid,

    slug text,

    title text,

    summary text,

    body text,

    category text,

    image_url text,

    published_at timestamptz,

    created_at timestamptz

)

language sql

security definer

set search_path = public

as $$

    select

        b.id,

        b.slug,

        b.title,

        b.summary,

        b.body,

        b.category,

        b.image_url,

        b.published_at,

        b.created_at

    from public.build_logs b

    where

        b.status = 'published'

        and (

            p_category is null

            or upper(b.category)
                = upper(p_category)

        )

    order by

        b.published_at desc nulls last,

        b.created_at desc

    limit greatest(
        1,
        least(
            coalesce(
                p_limit,
                20
            ),
            100
        )
    );

$$;



-- ============================================================
-- 18. GET SINGLE BUILD LOG
-- ============================================================

create or replace function public.get_build_log(

    p_slug text

)

returns table (

    id uuid,

    slug text,

    title text,

    summary text,

    body text,

    category text,

    image_url text,

    published_at timestamptz,

    created_at timestamptz

)

language sql

security definer

set search_path = public

as $$

    select

        b.id,

        b.slug,

        b.title,

        b.summary,

        b.body,

        b.category,

        b.image_url,

        b.published_at,

        b.created_at

    from public.build_logs b

    where

        b.status = 'published'

        and b.slug = p_slug

    limit 1;

$$;



-- ============================================================
-- 19. GET DEVELOPMENT STATUS
-- ============================================================

create or replace function public.get_development_status()

returns table (

    item_key text,

    label text,

    status text,

    description text,

    sort_order integer,

    updated_at timestamptz

)

language sql

security definer

set search_path = public

as $$

    select

        d.item_key,

        d.label,

        d.status,

        d.description,

        d.sort_order,

        d.updated_at

    from public.development_status d

    order by

        d.sort_order asc,

        d.label asc;

$$;



-- ============================================================
-- 20. NEWSLETTER UNSUBSCRIBE
-- ============================================================

create or replace function public.unsubscribe_newsletter(

    p_token uuid

)

returns jsonb

language plpgsql

security definer

set search_path = public

as $$

declare

    affected_rows integer;

begin

    update public.newsletter_subscribers

    set

        status = 'unsubscribed',

        unsubscribed_at = now(),

        updated_at = now()

    where

        unsubscribe_token = p_token

        and status <> 'blocked';


    get diagnostics
        affected_rows = row_count;


    if affected_rows = 0 then

        return jsonb_build_object(

            'success',
            false,

            'message',
            'Subscription not found.'

        );

    end if;


    return jsonb_build_object(

        'success',
        true,

        'message',
        'You have been unsubscribed.'

    );

end;

$$;



-- ============================================================
-- 21. GRANT SAFE RPC ACCESS
-- ============================================================

grant execute
on function public.join_pixxivo(
    text,
    text,
    text,
    boolean,
    boolean
)
to anon, authenticated;


grant execute
on function public.subscribe_newsletter(
    text,
    text,
    text
)
to anon, authenticated;


grant execute
on function public.get_signal_wall()
to anon, authenticated;


grant execute
on function public.get_signal_stats()
to anon, authenticated;


grant execute
on function public.get_build_logs(
    integer,
    text
)
to anon, authenticated;


grant execute
on function public.get_build_log(
    text
)
to anon, authenticated;


grant execute
on function public.get_development_status()
to anon, authenticated;


grant execute
on function public.unsubscribe_newsletter(
    uuid
)
to anon, authenticated;



-- ============================================================
-- 22. SEED X1 DEVELOPMENT STATUS
--
-- Safe to run multiple times.
-- ============================================================

insert into public.development_status (

    item_key,

    label,

    status,

    description,

    sort_order

)

values

(
    'research',
    'Research',
    'complete',
    'Initial sensing architecture and feasibility exploration.',
    10
),

(
    'optical-architecture',
    'Optical architecture',
    'complete',
    'Initial spectral sensing architecture established.',
    20
),

(
    'electronics-v1',
    'Electronics V1',
    'complete',
    'First custom electronics revision completed.',
    30
),

(
    'electronics-v2',
    'Electronics V2',
    'testing',
    'Current board revision is undergoing validation and testing.',
    40
),

(
    'industrial-design',
    'Industrial design',
    'development',
    'Enclosure and physical interaction design are being refined.',
    50
),

(
    'calibration-dataset',
    'Calibration dataset',
    'development',
    'Collection and calibration workflow is under development.',
    60
),

(
    'pilot',
    'Pilot',
    'upcoming',
    'Pilot validation comes after hardware and calibration readiness.',
    70
)

on conflict (item_key)

do nothing;



-- ============================================================
-- 23. UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function public.set_updated_at()

returns trigger

language plpgsql

as $$

begin

    new.updated_at = now();

    return new;

end;

$$;



-- ============================================================
-- 24. UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists
supporters_set_updated_at
on public.supporters;


create trigger
supporters_set_updated_at

before update
on public.supporters

for each row

execute function
public.set_updated_at();



drop trigger if exists
newsletter_set_updated_at
on public.newsletter_subscribers;


create trigger
newsletter_set_updated_at

before update
on public.newsletter_subscribers

for each row

execute function
public.set_updated_at();



drop trigger if exists
build_logs_set_updated_at
on public.build_logs;


create trigger
build_logs_set_updated_at

before update
on public.build_logs

for each row

execute function
public.set_updated_at();



drop trigger if exists
development_status_set_updated_at
on public.development_status;


create trigger
development_status_set_updated_at

before update
on public.development_status

for each row

execute function
public.set_updated_at();



-- ============================================================
-- DONE
-- ============================================================