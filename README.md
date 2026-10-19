# Pixxivo V11 — Focused refinement

Based on V10.1; Vite + vanilla JavaScript, existing design and Supabase services preserved.

- **Loader:** real white PX outline tracing and white fill on black, then a short cinematic **crossfade** with a modest settle/blur of the logo. No upward screen motion, no green effect. Internal page links get a much shorter monochrome fade handoff; reduced-motion users get an essentially immediate reveal. Critical CSS remains inline in each HTML head to avoid the unstyled-content flash.
- **Journal:** each of the six existing hardware archive items has a permanent shareable link (example: `/journal.html?object=board#hardware`). The modal opens automatically for valid links and includes a Copy Link button. No new page or invented data is added.
- Other existing X1, Research, Journal, Dispatch, Studio, loader SVG, and backend behavior is preserved.

## Run and check

```bash
npm install
npm run dev
npm run check:v11-refined
npm run build
```

**Deployment:** the build and real Supabase/Resend delivery must be tested with your own credentials before publishing. Never expose service-role or email secrets in VITE_ variables. Review mobile Safari/Chrome and reduced-motion settings. The original README follows.

---

# Pixxivo Classic PX Loader Update (V10.1)

This version **only changes the loading experience**, building on V10. The merged Journal + Hardware Archive, Studio, newsletter, Research, X1 and all other content are unchanged.

- **First visit in a session:** solid near-black background, the real original Pixxivo PX logo paths trace in white and become fully white. After a brief hold, the screen slides upwards to reveal the *styled* page. No lime/green loader lighting, split doors, or corner-to-nav movement.
- **Other page visits:** a quick, fully white PX mark on black and short vertical handoff, without replaying the tracing sequence.
- **FOUC prevention:** small critical loader CSS and SVG are inline in the document head/body before external stylesheet loads, and the loader releases after `DOMContentLoaded`.
- **Accessibility:** respects reduced-motion and no-JavaScript, with fail-open recovery and back/forward navigation cleanup.

Run `npm install`, `npm run dev`, `npm run check:v11` and `npm run build` before deploying. No frontend framework beyond Vite + vanilla JS was added.

---

# Pixxivo V10 — One Journal, One Lab, One PX Reveal

This release builds directly on Pixxivo V9 and keeps **Vite + vanilla JavaScript**, original warm-white / graphite / neon-lime / electric-blue branding, X1, Research, Dispatch, contact and the private Studio backend.

## The changes

- **Journal and Lab are now one page:** `/journal.html#hardware` is the interactive hardware archive (six original inspectable objects, category filters and dialogs) and `/journal.html#entries` is the dated article feed supplied by Pixxivo Studio. The repetitive Journal methodology block was removed. `/lab.html` redirects to Journal for bookmarks, and the old standalone Lab entry is removed from navigation and the sitemap.
- **Two distinct loading experiences:** the opening encounter traces the **actual Pixxivo five-path logo** and moves it into the site's navigation as two black-and-lime shutter panels reveal the page. Internal navigation uses a much shorter, lightweight shutter, without repeating the theatrical sequence.
- **No flash of unstyled content:** essential loader styles and the SVG live in the initial HTML, before external styles and modules. The understated black overlay opens only after the DOM and rendering styles are ready. It has a 4.5-second JavaScript fail-open, a separate 6.5-second inline fallback, a no-JavaScript option, support for reduced-motion users and back/forward navigation recovery.
- **Responsive Journal:** hardware filters, cards, mobile dialog presentation and the Journal post feed continue to use the V8/V9 components, with a new small entry navigator for jumping between archive and published updates.

The loader design takes inspiration from editorial Awwwards-style transitions, but its implementation and SVG use Pixxivo's own code and logo, not copied website source. The exact Neoleaf and DB DSGN reference pages were unavailable to inspect directly.

## Testing and publishing

```bash
npm install
npm run check
npm run check:motion
npm run check:polish
npm run check:v6
npm run check:v7
npm run check:v8
npm run check:v9
npm run check:v10
npm run build
npm run preview
```

Verify the homepage opener in a fresh browser session and click between X1, Journal and Research to test short transitions. Test Journal hardware popups, filters, Studio publishing, newsletter signup, unsubscribe and mobile menu. Run a real production build and test on a phone before uploading `dist/` to your hosting provider. Supabase and Resend credentials remain external; this ZIP contains no live credentials. The live domain is not deployed by this package.

---

# Pixxivo V9 — Publishing Polish

This release continues the original Pixxivo visual identity and V8 Open Lab source. It uses **Vite + vanilla JavaScript** (no React). Existing Supabase Studio, Journal and Dispatch backend files are unchanged.

## V9 changes

- Removed the homepage prototype-versus-PCB image comparison slider completely. The existing inspector and Open Lab still explain the hardware.
- Removed two redundant homepage sections: the duplicate Journal preview after the moving notes and the final newsletter CTA after Dispatch.
- Fixed the Open Lab popups with explicit viewport centering, responsive inner scrolling, no exposed scrollbar track, better mobile spacing and Escape-to-close via native `<dialog>`.
- Replaced the inconsistent old loader elements with a **one-time session intro** that traces the actual five-path original Pixxivo SVG mark. Subsequent public page navigation uses fast browser-native cross-document View Transitions where supported, otherwise normal instant navigation. Reduced-motion preferences skip the animation.
- Added three working presets to the simulated X1 sensing lab (Stable / In Motion / Low Light). These change only synthetic math visualizations and make **no medical claims**.
- Improved the Journal's archive utility strip and empty state without inventing posts.
- Applied mobile-safe dialog styles for 320px to desktop widths.

## Run and validate

```bash
npm install
npm run dev
npm run check:v9
npm run build
```

The existing V8 verification scripts are available too. This environment could run source checks but could not install the packages in npm's offline cache, so **`npm run build` is still a required local release gate**. Connect your real Supabase project and email service, configure the `.env` template, and test a real newsletter signup, admin post, email delivery, contact form and unsubscribe before publishing. Do not put Supabase service role or Resend private API secrets in `VITE_` environment variables.

## Design QA

The native Lab dialog was checked with an inline browser-layout harness at 320, 375, 390, 768, 1024, and 1440px and stayed centered. Full-site browser navigation was blocked in the build environment. Please visually review the complete site on real mobile devices before launch, especially navigation, long research entries, Lab galleries and dialogs.

---

# Pixxivo V6 — Research / Interaction Polish

This is an incremental upgrade of the existing original-style Pixxivo website (warm off-white, graphite, neon lime, electric blue). **No React.** Vite + vanilla JavaScript + GSAP / ScrollTrigger remain in use.

## Run

```bash
npm install
npm run dev
```

Then visit `http://localhost:5173/` and `http://localhost:5173/research.html`. To check the release:

```bash
npm run check
npm run check:motion
npm run check:polish
npm run check:v6
npm run build
```

## What changed

- **Research completely rewritten** as an editorial, image-based product concept reveal: two matching studio-rendered views (`bte-assembled.webp` and `bte-exploded.webp`) plus a scroll-driven transition, mobile-safe static alternatives, research constraints, and honest concept labelling. The old CSS ear/device diagrams are no longer in Research or the homepage preview.
- **Homepage principle pills:** `src/v6.js` measures the viewport and repeats the original pill set until one pattern exceeds the viewport, then creates a second identical set. The exact `-50%` loop boundary is gapless on different screen sizes.
- **X1 system focus:** the previous six-card bento is now a working 4-step gallery with synchronized real asset views and detailed readouts.
- **Workbench rail:** note cards now include original prototype/PCB photography and meaningful links. Duplicated cards in the animated rail are inert for keyboard navigation.
- **Typography and responsive polish:** wider letter-spacing on heavy card/poster headlines, mobile layouts, keyboard focus rings, and reduced-motion support.

## Key source files

- `src/pixxivo-v6.css`: V6 page and component styling
- `src/v6.js`: seamless marquee, system viewer, and scroll assembly logic
- `research.html`: rewritten Research experience
- `index.html`: rebuilt homepage sections
- `public/assets/bte-*.webp`: locally included **fictional concept renders**, not device photos or manufacturing geometry
- `scripts/check-v6.mjs`: source integrity checks

## Research note

The wearable is a **concept only**. The images depict an imagined enclosure and internal architecture. No physical measurements, PCB fit, signal feasibility, safety, diagnostic accuracy, or clinical validation are asserted by the renders. Do not use imagery as engineering drawings.

## Live services

The original Supabase Studio / newsletter / journal source is preserved. Copy `.env.example` to `.env`, fill in project settings, apply the SQL and deploy the Edge Functions per the existing instructions below. Studio and email delivery are not activated by simply running the frontend.

---

# PIXXIVO / MOTION EDITION + STUDIO

**Source of truth:** the provided `pixxivo-main (1).zip` (the same visual language as [pixxivo.com](https://pixxivo.com)). This project is built directly on that HTML, CSS, JavaScript, logo, X1 imagery, and animated PX loader. The original cream / black / neon lime / electric blue brand palette has **not** been replaced. No pink theme. No React, Next.js, Tailwind, UI framework or paid frontend service.

## What's inside

| Path | Purpose |
|---|---|
| `/` | Original Pixxivo homepage and hero, with research, latest posts, and Dispatch inserted using existing layout patterns |
| `/x1.html` | Original X1 prototype page and media, updated links |
| `/contact.html` | Original contact layout, server-side email delivery |
| `/journal.html` | Public category-filtered build journal and newsletter signup |
| `/post.html?slug=your-post` | Individual public journal article, escaped Markdown rendering |
| `/research.html` | Behind-the-ear **research concept**, illustrated and appropriately labeled |
| `/studio.html` | Private Pixxivo Studio: sign-in, overview, posts, editor, scheduling, cover image upload, subscribers, delivery queue, settings |
| `/unsubscribe.html?token=...` | Email unsubscribe, no account needed |
| `/privacy.html`, `/terms.html` | Starter legal copy; review and adapt before launch |
| `/support.html` | Redirect from the old Signal Wall to the Journal |

The **public Hype button, supporter counter, Signal Wall form, email OTP, and OTP return flow are removed from active pages and JavaScript**. The replacement is a simple email signup. Subscriber accounts are **not** created.

The original `src/style.css` is preserved, and visual additions are isolated in `src/pixxivo-extended.css`, `src/pixxivo-motion.css`, and `src/studio-original.css`. The original `src/main.js` scroll and PX loader animations remain in use. `src/motion.js` holds all new interaction logic. The animation patterns were informed by the TechGeeks product pages, but no TechGeeks code, content, or images were copied.

## Start locally

Requirements: Node.js 20.19+ or 22.12+, npm.

```bash
npm install
npm run dev
```

Then visit `http://localhost:5173/` and `http://localhost:5173/studio.html`.

For production:

```bash
npm run check
npm run check:motion
npm run build
npm run preview
```

`dist/` is the deployable output. The `npm run check` script checks all eleven HTML documents, local asset links, JavaScript syntax and required backend files. The complete production build **must be run on your computer** before deployment; dependencies could not be fetched in the artifact-building environment.

## Configure Supabase

1. Copy `.env.example` to `.env`. Windows PowerShell: `Copy-Item .env.example .env`.
2. Fill in only client-safe values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
VITE_TURNSTILE_SITE_KEY=YOUR_PUBLIC_TURNSTILE_SITE_KEY
```

3. Open your existing Supabase project's **SQL Editor** and run `supabase/pixxivo_studio.sql`. This is additive; it does not delete your old Pixxivo data. It creates `studio_admins`, `journal_posts`, `newsletter_subscribers`, `newsletter_campaigns`, `newsletter_deliveries`, the media bucket, RLS policies, post publication triggers and delivery queue procedures.
4. In **Authentication → Users**, create a private admin user using an email/password you control. Disable public self-signup if this is only for Studio. Use a strong password and configure MFA where supported. Copy your auth user's **UUID** and run:

```sql
insert into public.studio_admins (user_id)
values ('YOUR_REAL_AUTH_USER_UUID');
```

5. Sign in at `/studio.html` using that account. You can draft, preview, schedule or publish an article. Only admin UUIDs in `studio_admins` can create or edit journal posts, list subscribers or upload journal media. Supabase **Row-Level Security enforces this on the server**, not just in the UI.

**Do not place your Supabase service-role key, Resend API key, cron secret, password or Turnstile private secret in `.env` or any `VITE_` variable.** Vite sends client-side environment values to browsers.

## Configure real newsletters and contact email

You need a Resend account with a verified sender domain (DNS / DKIM / SPF) and Cloudflare Turnstile (public site key in `.env`, secret in Supabase).

Set these values as **Supabase Edge Function secrets**:

```text
RESEND_API_KEY=<PRIVATE_RESEND_API_KEY>
NEWSLETTER_FROM=Pixxivo <updates@pixxivo.com>
CONTACT_FROM_EMAIL=Pixxivo <contact@pixxivo.com>
CONTACT_TO_EMAIL=contact@pixxivo.com
TURNSTILE_SECRET_KEY=<PRIVATE_TURNSTILE_SECRET>
NEWSLETTER_ALLOWED_ORIGINS=https://pixxivo.com,https://www.pixxivo.com,http://localhost:5173
NEWSLETTER_DISPATCH_SECRET=<A_LONG_RANDOM_PRIVATE_STRING>
```

Check that Supabase's managed `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are available to your hosted functions. Deploy the functions:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy newsletter-subscribe --no-verify-jwt
npx supabase functions deploy newsletter-unsubscribe --no-verify-jwt
npx supabase functions deploy newsletter-dispatch --no-verify-jwt
npx supabase functions deploy contact-email --no-verify-jwt
```

The subscribe/unsubscribe functions intentionally accept public requests but validate them server-side. The dispatch function checks an authenticated Studio admin token or a private cron secret. All subscribers remain in a protected database table; the public website can only read published articles.

The subscribed email does **not** require OTP verification. Enable Turnstile, hosting-side rate limits and spam monitoring before opening the signup form publicly. Include a privacy policy and an easy unsubscribe flow (both are included as starter pages). Only import consenting subscribers into the list.

## Automatic post publishing and email delivery

When you publish an article with **Notify newsletter subscribers** selected, SQL triggers create a campaign and persist a delivery row for each active subscriber. Studio attempts to process an initial batch and the scheduled worker completes the rest. The worker stores processing state and retries failures; it uses Resend on the server, never from the browser.

To enable automatic jobs after you close your browser, create **two Supabase Vault** secrets through SQL Editor (use your actual values; do not commit them):

```sql
select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co/functions/v1/newsletter-dispatch', 'pixxivo_dispatch_url');
select vault.create_secret('SAME_LONG_PRIVATE_DISPATCH_SECRET', 'pixxivo_dispatch_secret');
```

Then execute `supabase/cron_setup.sql` in SQL Editor. It configures jobs for due posts and up to 10 queued email deliveries per worker run. Check your jobs in Supabase Database → Cron.

Before launch, test with an email address you control: subscribe → see subscriber in Studio → write real post → publish with newsletter enabled → inspect Resend → click article link → unsubscribe → verify no more deliveries. Sending accepted by Resend does not guarantee inbox delivery; wire delivery/bounce webhooks separately if you need accurate inbox metrics.

## Deployment

Cloudflare Pages works well for this static multi-page Vite site:

- Build command: `npm run build`
- Output directory: `dist`
- Add the three **public** `VITE_...` keys in Cloudflare Pages build settings, then redeploy.
- Do **not** expose `/studio.html` through search results. Private access is enforced by Supabase authentication and RLS; the page itself can remain publicly reachable.
- `_headers` provides browser-security headers and noindex/no-cache directives for administrative links.
- If you later use pretty URLs (`/studio`, `/journal`), add appropriate static-hosting rewrites. This source works immediately with the explicit `.html` paths shown above.

### Behind-the-ear concept

The research page includes **original-style lime-on-black schematic artwork** created as an *illustrative form study*. It is not final CAD, not a real prototype image, and not a medical claim. Replace it with actual industrial-design renders after geometry, fit, heat and sensor feasibility are assessed. Be particularly cautious with glucose or hemoglobin claims until independently validated.

### Important launch state

This ZIP contains actual source code and backend definitions. It has **not** modified `pixxivo.com`, and it has **not** been connected to your private Supabase or Resend account. Frontend source/static checks passed; live integrations, visual QA with a complete dependency build, contact delivery, and scheduled newsletter sends require the above deployment and user-owned credentials.

## Motion Edition / What's new in 3.0

**Brand fidelity:** warm white `#fbf8ef`, almost black `#080808`, neon lime `#ccff00`, and electric blue `#1d5cff` remain unchanged. All original media, PX intro loader, floating navigation, and X1 visuals were retained. This is not a replacement theme.

- **Home / motion intro:** lime editorial feature with moving industrial rings and oversized type, directly after the existing ticker.
- **Home / pinned four-chapter X1 story:** native wheel scroll drives a GSAP ScrollTrigger timeline, holding the visual stage while four prototype, PCB, experience and validation chapters transition. It's not an inner `overflow:scroll` trap.
- **Home / interactive PCB:** three keyboard-accessible markers explain electronics, sensing and physical packaging using real supplied PCB imagery. Descriptions are goals/areas of exploration, not claims of validated component performance.
- **Home and X1 / lime aurora:** slow CSS-animated green plasma behind an infinite engineering-note rail. These are explicitly **not customer testimonials**. Mouse hover or keyboard focus pauses the rail; small screens show swipeable cards.
- **X1 / stacked cards:** three oversized chapter cards rise as the page scrolls while the call-to-action shifts position and returns, inspired by the reference sites' pinned product storytelling. Nothing is being sold; CTA leads to the Journal.
- **X1 / horizontally navigable real media:** buttons, mouse drag, native touch swipe, ArrowLeft/ArrowRight keys. Video remains directly usable.
- **All public pages:** discrete page reading-progress indicator. No changes to private Studio's UX or Supabase security.

### Editing animation parameters

| Desired adjustment | File | Setting |
|---|---|---|
| Pinned home chapter duration | `src/motion.js` | `initX1Cinema` / `end` formula (`3.1 * viewport`) |
| Stacked X1 card duration | `src/motion.js` | `initX1Deck` / `end` formula (`2.65 * viewport`) |
| Notes rail speed | `src/pixxivo-motion.css` | `.px-voices__track` animation `37s` |
| Lime aurora speed | `src/pixxivo-motion.css` | `.px-voices__fire span` animation `25s`, `33s`, `39s` |
| Brand colors | `src/style.css` | existing `--lime`, `--blue`, `--bg`, `--ink` variables |
| Breakpoint where pins become regular cards | CSS and JS | `850px` / `min-width: 851px` |

### Important accessibility and performance notes

Desktop pins only run above 850px if **Reduce Motion** is not enabled. Mobile and reduced-motion visitors get fully readable content without pinning. Hover/drag are never required to reach important information. Images and video are kept in your existing asset folder, with the media archive video now using `preload="none"`. Test the desktop and mobile experience after deployment using real hardware. Advanced scroll timelines should be reviewed on Safari/iOS as well as Chrome; this package passed static checks but **could not complete a graphical browser or production Vite build in this execution environment**.

### What this release does not do

It does not scrape or clone proprietary TechGeeks animations, synthesize user reviews, alter real medical-sensing claims, send live emails without your Supabase/Resend configuration, or modify your deployed domain.

---

## PIX X1 / Motion Polish v4.0 — October 2026

This is a **polish release of the ORIGINAL Pixxivo project**, not a replacement design. The supplied v3 project is the direct source. Vite + vanilla JS + GSAP + Lenis + Supabase remain intact. Pink has not been introduced.

### What changed

- **Hero reworked:** new engineering-led typographic composition, framed *actual prototype photograph*, floating *transparent PCB render* and a `VIEW PCB` toggle that expands the circuit board without switching pages. The prototype photograph is intentionally presented as documentary photography rather than falsely pretending it is a cut-out image.
- **Removed intro type and PX/R&D dial:** replaced the “Engineered to be understood” heading with a strong non-stroked manifesto, `LESS PROMISE. MORE PROTOTYPE.`, and the `BUILD / TEST / REPEAT` technical sequence.
- **Visual rendering rules:** genuine alpha-transparent PCB renders float with real shadows; photographs get deliberate clipped/editorial frames, not awkward transparent PNG styling. Original media are unaltered.
- **PCB inspector:** improved detail readouts and progression with three clickable board views, preloaded original board assets, hover/selected states and a `MIRROR VIEW` control clearly distinguished from a real 3D back-side render.
- **X1 scroll deck corrected:** CSS sticky inner scene drives a GSAP timeline using the parent scroll range. It no longer uses `pin` inside an `overflow:hidden` ancestor. Manual `01/02/03` chapter-jump controls and reverse-scroll behavior were added. Phones and reduced-motion browsers display all cards normally.
- **Dispatch rebuilt:** homepage editorial poster now includes a real email signup and a prototype/PCB preview toggle; **new full `dispatch.html`** page with the existing Supabase newsletter form.
- **Journal:** editorial engineering-lab hero, original media and PCB imagery, much stronger archive/filter layout, and connection to the public journal table. No fake seeded posts or invented product claims.
- **Research:** dramatic concept-only behind-the-ear illustration, four interactive feasibility questions, and clear non-diagnostic labeling. The art is a CSS/SVG design study, not CAD or a validated wearable render.
- **Responsiveness:** updated small-screen rules, focus styles, reduced-motion protection and preserved existing Studio and backend workflows.

### Dev scripts

```bash
npm install
npm run dev
npm run check
npm run check:motion
npm run check:polish
npm run build
```

Routes: `/`, `/x1.html`, `/journal.html`, `/research.html`, `/dispatch.html`, `/studio.html`.

### Interaction tuning

- `src/pixxivo-v4.css` — new visuals and mobile breakpoints.
- `src/motion.js` → `initX1Deck()` — card timings, scene progression and jump buttons.
- `src/motion.js` → `initExplorer()` — real PCB views and focus descriptions.
- `src/motion.js` → `initV4Interactions()` — hero toggler, Dispatch preview, research question controller.
- `src/public.js` — untouched newsletter and journal integration.

### Read before launch

The existing Supabase configuration and Resend secrets still need to be configured in your environment. Nothing has been deployed to the live domain. Source link and syntax checks passed. A complete production dependency installation and graphical browser QA could not be completed here: Chromium navigation was blocked, and npm registry packages were unavailable offline. Run `npm run build` and test desktop, mobile and reduced-motion interactions in your own browser before updating pixxivo.com.

### Reference credits (ideas only; no copied code or assets)

- TechGeeks ARC-16 — technical chapter layout and compact hardware storytelling: https://techgeeks.store/arc-16-array-ir-sensor
- TechGeeks Spirit PCB — layered product photography and engineering-led composition: https://techgeeks.store/spirit-pcb-cum-chassis
- Teenage Engineering OP–1 field — tactile industrial typography and hardware details: https://teenage.engineering/products/op-1
- Nothing design ethos — revealing the engineering beneath products: https://in.nothing.tech/about
- Awwwards' 3D scroll inspiration — restrained depth and story cadence: https://www.awwwards.com/inspiration/3d-scroll-animation-0110-studio-portfolio-web

---

## Pixxivo V7 — research & experience refinement

This version builds directly on V6 and preserves the original Pixxivo brand system, public routes, Studio administration and Supabase/Resend backend files. It does **not** deploy to pixxivo.com automatically.

### Changes

- **Research:** Replaced the old assembled-to-exploded scroll segment with a research dossier: four keyboard- and tap-accessible questions, an industrial-design form study (using the existing concept renders), a transparent investigation sequence, and research-only disclaimers. No medical measurement claims are asserted.
- **Dispatch signup:** A combined email-field-and-action design with subtle affordances, responsive stacking and clearer subscription expectations. The same `data-newsletter-form` and backend subscription function remain in use.
- **Homepage:** Added a brief founder introduction for Prateek Shukla without inventing a founder portrait; actual PCB media is used instead.
- **Journal + Dispatch:** Reworked the lime CTA panels with balanced copy and two readable destination cards. No random oversized decorative arrow.
- **Navigation:** Refined floating desktop capsule and a clearer, numbered mobile navigation menu. Existing menu JS and navigation URLs are retained.
- **Spacing + lettering:** Cross-page vertical rhythm, large card headline tracking and mobile-specific typography fixes.

V7 sources are `src/pixxivo-v7.css`, `src/v7.js` and the updated public HTML pages. The older feature stylesheets are intentionally retained for the unchanged sections. `src/v6.js` continues to run the homepage marquee and X1 system viewer, but no longer initializes the removed Research assembly effect.

### Run & test

```bash
npm install
npm run dev
npm run check
npm run check:motion
npm run check:polish
npm run check:v6
npm run check:v7
npm run build
```

Preview `index.html`, `research.html`, `journal.html`, `dispatch.html` at narrow and wide sizes (e.g. 375px, 390px, 768px and 1440px). Confirm scroll behavior, menu open/close, Research arrow-key tabs, and newsletter submission after configuring your own Supabase/Turnstile credentials.

**Validation:** all five bundled source checks and a CSS syntax parse passed during packaging. A production Vite build could not be run here because npm dependencies were not available offline. Chromium browser screenshot QA was blocked for local URLs by the execution environment. The site needs visual testing on a real browser before publication. No private `.env` file is included in the ZIP.


## Pixxivo V8 — Open Lab Edition (Vite + Vanilla JS)

New: `lab.html` (interactive hardware archive), `src/v8.js` (Lab dialogs, zoom/pan PCB inspector, hardware-stage comparison, X1 hero image modes, founder workbench, synthetic sensing demo, read-only latest journal status), `src/pixxivo-v8.css` (responsive scenes, slow atmospheric gradients, adaptive navigation, optional cross-document View Transitions). The existing V7 site, Research, Studio, Supabase SQL and newsletter/email pipeline remain intact.

- Home: PCB hotspots from V6 still function. **ZOOM INTO PCB** opens a native accessible dialog; +/− buttons and pointer-drag pan are supported. The prototype-versus-PCB slider is explicitly a **development-stage comparison**, not an aligned revision slider. No unverified component pin mapping is asserted.
- X1: new dark product-led hero with hardware/prototype toggle; later sections unchanged. Synthetic Sensing Lab has adjustable illumination and motion noise, pause/play, reset, and an illustrative canvas trace. **No actual physiological measurements are used or claimed.**
- Lab: six objects using existing source assets, category filters, native `<dialog>` inspectors, and open-journal status populated from the latest public post when Supabase is configured. Displayed status falls back to a static factual description when offline.
- Navbar: adds Lab link and shrinks slightly after 80px scroll. Uses touch-friendly mobile menu. Navigation transitions use progressive `@view-transition` support, with reduced-motion settings respected.
- Design: restrained, slowly moving gradients; no WebGL, no high-frequency updates or live device telemetry; no fabricated customer testimonials. One very small Lab Easter egg is hidden in its status panel.

Run: `npm install`, `npm run dev`, `npm run build`. Validate source: `npm run check`, `npm run check:motion`, `npm run check:polish`, `npm run check:v6`, `npm run check:v7`, `npm run check:v8`. Full build requires installing npm packages. Never put service-role or Resend secret API keys in `VITE_` browser environment variables.

Image usage: the X1 prototype photographs and PCB renders are existing Pixxivo assets. Behind-the-ear imagery is an unvalidated design concept. Studio and newsletter require production Supabase, Resend and Turnstile configuration; the ZIP cannot provision external secrets for you.


## SECURITY HARDENING RELEASE / IMPORTANT
This ZIP is a **security-hardened source candidate**, NOT an automatically publishable or independently penetration-tested deployment.
Read `SECURITY_AUDIT.md` and execute the required `supabase/security_hardening.sql` migration in your project. Deploy the updated Edge Functions and configure the required secrets. In particular, public forms intentionally fail closed until Turnstile and database rate-limiting secrets are configured. The source alone cannot change the security of your live Supabase project.

Run `npm install`, `npm run security:headers`, `npm run security:check`, `npm run build`, and `npm audit --audit-level=high` with internet access, then test the production build at mobile and desktop sizes. Commit the generated `package-lock.json` before production deployments and use `npm ci` afterward.

Admin MFA is mandatory in database RLS after applying the security migration. On first sign-in, Studio presents a TOTP QR enrollment and a six-digit challenge; use an authenticator app and enroll a backup factor. Admin browser sessions now live in `sessionStorage` instead of long-term `localStorage`; server-side authorization is still enforced by the database, not the UI.

The contact email is `contact@pixxivo.com`. The official brand Instagram account is **[@pixxivo](https://www.instagram.com/pixxivo/)**. The link is included in each public footer and works without environment setup. `VITE_PIXXIVO_INSTAGRAM_URL` is an optional configuration override for future account changes; do not use the founder's personal account.

**Supabase inactivity:** the Free plan can pause projects after a low-activity 7-day window; paid plan projects are not automatically paused. For dependable availability upgrade to Pro rather than relying on artificial keepalive traffic. Configure backups and monitors as well.
