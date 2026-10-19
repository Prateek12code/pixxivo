# Pixxivo V11 — Focused Polish

This is the **full Vite + Vanilla JavaScript** project carried forward from V10.1.

## Changed

- **Loader:** preserved the actual original five PX SVG paths, white tracing and solid white fill, black background. Replaced the vertical upward slide with a soft crossfade: the PX subtly scales and blurs as the styled page comes into view. No green glow, curtain doors, or vertical exit.
- **Internal navigation:** a brief monochrome opacity handoff; the long trace plays only for the first session visit. Reduced-motion users bypass effects.
- **Merged Journal / hardware archive:** six existing objects now have shareable URLs and an in-dialog Copy Link action (e.g. `/journal.html?object=board#hardware`), without introducing new pages or repetitive sections.

## Preserved

Homepage, X1, Research, founder section, Dispatch/newsletter, Studio and Supabase backend files, mobile layouts, original PCB/prototype photos, and the Journal/Lab merge.

## Test status

All source-check commands in `scripts/` passed, including `npm run check:v11-refined`.
The loader was checked in headless Chromium at 390px and 1440px; both completed successfully with zero JavaScript page errors. This was an **isolated loader test**, not a whole-site browser or network-service test.

The full Vite production build could not be completed here because the required npm packages are not available in the offline dependency cache (`ENOTCACHED`). Run on your laptop before publishing:

```bash
npm install
npm run check:v11-refined
npm run build
npm run dev
```

Run a mobile Safari/Chrome review, and verify real email subscriptions, unsubscribe, Studio authentication/authorizations, email delivery and contact forms using your own deployment before making the site public. No live Pixxivo domain files were changed.

### Instagram account update
- Added verified-by-owner Pixxivo Instagram link `https://www.instagram.com/pixxivo/` to public-page footers and default configuration.
