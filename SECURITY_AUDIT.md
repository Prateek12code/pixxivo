# Pixxivo Security Review — source audit, 18 October 2026

**Scope:** V11 frontend, Supabase SQL and four Edge Functions. This is NOT a penetration test of the deployed site, and **not** a certification of production readiness. All protected settings in the dashboard, live RLS permissions, DNS, storage bytes and provider configuration must be checked on your own deployment.

| # | Area | Source findings and status |
|---|---|---|
| 1 | SQL injection | Client uses Supabase query builder; server uses parameterized filters. No dynamic raw-SQL endpoints found. Verify any legacy SQL deployed. |
| 2 | XSS | Journal Markdown escapes input, secure URL protocols, Studio escapes dynamic values. Added CSP hashes and no inline-script exception. Run browser DOM XSS tests on live build. |
| 3 | CSRF | Public APIs validate Origin and require Turnstile; admin requests use Bearer auth, not cookies. Non-browser calls still possible: server-side rate limiting and MFA matter. |
| 4 | File uploads | Admin-only storage policies, image MIME/size limit, covers prefix/extension checks; added client magic-byte check. Storage does NOT perform malware scanning; verify media processing requirements before accepting user uploads. |
| 5 | IDOR/BOLA | Admin allowlist and RLS; tightened with database-enforced MFA AAL2. Verify actual deployed policies using a non-admin account. |
| 6 | Rate limiting | Added Postgres-backed throttle RPC for public form requests keyed by HMAC(identity), plus Turnstile. Run security_hardening.sql before deploying functions; put Cloudflare edge WAF on public endpoints if available. IP limit requires trusted upstream proxy. |
| 7 | JWT secrets | No signing keys checked into source. Supabase manages JWT signing. Rotate any previously leaked service-role or signing keys in Supabase dashboard. |
| 8 | API secrets | No embedded service-role/Resend keys identified. VITE_SUPABASE_ANON_KEY is designed to be public. NEVER put private keys in any VITE_ value. |
| 9 | Password hashing | Supabase Auth handles passwords; no app-side hashing or custom password database. Actual project password configuration not remotely verified. |
| 10 | MFA | Added TOTP setup/challenge UI, and server RLS requires JWT aal2 for any Studio authorization. Enroll second factor for recovery. |
| 11 | CORS | Restricted to configured site origins, no wildcard credentialed access, disallowed origins receive no ACAO. Origin isn't authentication. |
| 12 | Auth token storage | Changed from persistent localStorage to sessionStorage. Browser XSS can still read sessionStorage; for strongest protection use a server-mediated HttpOnly cookie architecture. |
| 13 | Client permissions | Studio UI role checks are NOT the boundary; RLS and Edge verification enforce access. |
| 14 | Row-level security | Present in supplied schema and new migration. Live database, legacy tables, exposed schemas, and storage policies MUST be verified manually. |
| 15 | Webhook signatures | No inbound third-party webhook handler found. Cron worker uses a long random shared secret and MFA-bearing admin sessions. Any future Resend webhooks must verify signatures BEFORE parsing events. |
| 16 | SSRF | All Edge fetch destinations are static provider endpoints. No arbitrary remote URL fetch found. |
| 17 | Source maps | Explicit production sourcemap:false; check deployed /assets/*.map responses are 404. |
| 18 | Default credentials | No checked-in default login. Admin allowlist is set by actual Supabase Auth UUID. |
| 19 | Logs | Removed public-edge exception dumps where unnecessary; no email/request body logging in new form functions. Supabase/provider logs still require operational review. |
| 20 | Dependencies | Package versions are ranges without lockfile. Cannot certify current advisories offline. Run npm install, npm audit --audit-level=high and retain package-lock.json. GitHub Dependabot config included. |
| 21 | Security headers | Added CSP hash allowlist for inline loader and JSON-LD, nosniff, deny framing, restrictive referrer/permissions, and HSTS on HTTPS. Header file applies to Cloudflare Pages; other platforms require equivalent settings. |
| 22 | Bot abuse | Forms fail CLOSED if Turnstile server secret or rate limit pepper is missing. This means forms cannot send until secrets are configured. |
| 23 | Session safety | Admin auth uses session storage per tab rather than long-lived browser localStorage; logout ends Supabase session. Protect your device and use MFA. |
| 24 | Email security | Provider API key only in Edge secrets; sender domain requires verified SPF/DKIM/DMARC; unsubscribe link uses bearer token. Avoid leaking unsubscribe tokens to analytics/referrers. |
| 25 | Backups | Establish backups and restore tests. Supabase Free cannot guarantee availability and may pause with low activity. |

## Deployment gate (required before public launch)
1. Set local `.env` with only public Supabase URL/publishable key, Turnstile site key and a verified Instagram profile URL. Never commit `.env`.
2. In the Supabase SQL editor, run `supabase/pixxivo_studio.sql` once on an appropriate new project, followed by **`supabase/security_hardening.sql`**. If schema already exists, apply hardening only after backing up and checking diffs.
3. Add only YOUR Supabase Auth user UUID to `studio_admins`. Disable public account registration in Auth; use a strong, unique password, enable TOTP MFA in Studio, and enroll a backup factor. Review Supabase Auth password protections and breached-password checking.
4. Configure function secrets `TURNSTILE_SECRET_KEY`, `RATE_LIMIT_PEPPER` (random 32+ chars), `RESEND_API_KEY`, `NEWSLETTER_DISPATCH_SECRET` (random 32+ chars), `NEWSLETTER_ALLOWED_ORIGINS` with your real origins, `CONTACT_FROM_EMAIL`, `NEWSLETTER_FROM`. Configure provider domain authentication. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provisioned in hosted function environment.
5. Deploy functions based on `supabase/config.toml` with correct JWT checks; public endpoints intentionally use verify_jwt=false AND their own controls; dispatch requires cron secret or a valid AAL2 admin session.
6. Test invalid request origins, missing CAPTCHA, CAPTCHA timeout, throttling, a nonexistent user, a non-admin signed-in user, an admin without MFA, and a verified admin. Test file upload rejects SVG/executable and spoofed MIME.
7. Verify production headers, no service keys in frontend bundles, no source maps, all assets 200, and mobile navigation/loader functionality. CSP hash list is generated by `npm run security:headers` and before each build.
8. Test newsletter double-subscription, unsubscribe, cron job, email retries, contact form, and deletion behavior. Record consent and comply with applicable email/privacy obligations.
9. Run `npm ci` (after generating and committing lockfile) and `npm audit --audit-level=high` with network access. Avoid claiming audit passed when registry is unavailable.
10. Create backups and test restoration. For guaranteed non-pausing, use an eligible paid Supabase plan; free-plan keepalive cannot guarantee service.

**Instagram:** Official Pixxivo handle was not confirmed. `VITE_PIXXIVO_INSTAGRAM_URL` is blank by design; after you verify the account, the footer link appears automatically. `contact@pixxivo.com` is the official contact destination in this project.
