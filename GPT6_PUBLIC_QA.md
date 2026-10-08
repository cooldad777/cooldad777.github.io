# GPT-6 independent public candidate — QA and unresolved gates
Date: 2026-10-08. Preview-only; not a production release.

## Checks actually completed through GitHub source readback
- Confirmed immutable pre-vNext base and independent branch topology: candidate ahead, not behind; Sol and Astra were not written to.
- Re-read authored homepage, REWIND, boundary lab, script/CSS, modified navigation, portfolio, Convergence and Human Signal.
- New JavaScript parsed via a JavaScript Function constructor without syntax errors: `assets/gpt6-fieldguide.js`, `assets/navigation.js`.
- CSS opening/closing brace counts balanced for `assets/gpt6-fieldguide.css` and `assets/gpt6-bridge.css`.
- Checked new pages for duplicate IDs, viewport, skip navigation, and script link; one raw Markdown emphasis error on REWIND was detected and corrected.
- Verified existence of 15 route/script/style destinations used by the three newly authored HTML pages; verified original `assets/favicon.png`, `assets/star.png`, `assets/forest.jpg`, and `assets/amp-bg.jpg` as GitHub file objects.
- Historical REWIND commits: verified `a12edff4383e7fa5bf28e38eb95721ea38d38066` is an ancestor (7 commits behind) of `9acfe3f2d796522d65b6c54f95e50b2ba7c770c0`; both commit messages/dates retrieved.
- Public Chronicle underlying records and SEER synthetic fixtures not modified. Code changes are limited to the manifest from GitHub compare.

## Added but NOT RUN in a full repository checkout
`node scripts/verify-gpt6-public.mjs` — zero-dependency HTML link/ID and JS syntax/CSS balance validator. Run it on a full checkout and record stdout + commit SHA.

## Still required before approval / promotion
- Open actual preview on iPhone Safari at 320/375/390/430px and desktop/tablet at 768/1440px. Check no overflow, text, image focal point, reduced motion, keyboard/focus, VoiceOver and menu Escape/focus return.
- Run full repository static QA harness above, link validator, real browser JS console/network tests, axe accessibility scans (including expanded states), and no-JavaScript mobile navigation checks.
- Exercise Convergence four modes and data source/date labels; Lenses views and local-note persistence; SEER scenario release gate; GROUNDED anchors; music opt-in and external media.
- Independently assess first-screen comprehension, quality of copy, aesthetic distinction from Sol/Astra, mobile curiosity, and REWIND's resolution.
- Validate no unexpected auto-preview/public exposure in deployment settings. No automatic production deployment has been requested or initiated in this session.

## Known limitations
The candidate is independently implemented but **not blind**. Historical REWIND is a source trail, not full historical site playback. No performance scores, screenshot audits, live browser tests, native phone checks, or external source validation are claimed here. Some older routes retain prior CSS and behaviors; their regression status is unverified in a running browser.
