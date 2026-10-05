# SEE,R Formatting Editor Audit

**Status:** standing review document
**Scope:** current public GitHub Pages surfaces
**Rule:** copy is not finished until the story survives phone, tablet, desktop, keyboard, reduced-motion, and long-content stress.

## Site-wide formatting findings

### Fixed in this pass
- Added a shared progressive-enhancement layer for typography, overflow protection, glass hierarchy, touch behavior, focus states, embeds, section rhythm, and motion.
- Added IntersectionObserver reveals that only activate after JavaScript is live. Content remains visible without JavaScript.
- Added subtle pointer-light glass response on explanatory cards for fine-pointer devices only.
- Added reduced-motion behavior that removes reveal/parallax/lift while preserving all content.
- Added mobile guards for long text, buttons, cards, embeds, and prose width.
- Added smooth native expansion where the browser supports it.
- Added subtle hero movement and Convergence state transitions only when motion is allowed.

## Page-by-page formatting desk

| Page | Surface role | Formatting decision |
| --- | --- | --- |
| / | Public front door | Keep the forest as the single immersive visual opening. Everything after it is bright, editorial, spacious, and progressively revealed. No pseudo-data graphics. |
| /seersolutions/ | Commercial surface | Preserve the approved clean SaaS structure. Add only subtle glass lighting, section reveals, and touch/overflow hardening. Do not turn it into a portfolio experiment. |
| /portfolio/ | Public shelf | Cards get lighter depth, staggered reveal, and stronger mobile rhythm. Keep hierarchy sparse rather than adding more cards. |
| /adventure/ | Music | Embedded media is the hero content. Give video frames depth and room; do not overlay business/AI animation on the music. |
| /grounded/ | Formation | Preserve the real-room feel. Motion stays extremely restrained. Scripture/Willard should not animate theatrically. |
| /anti-attachment/ | Human-boundary prototype | Surface the boundary profile first; reflection/research depth may expand below. Keep the interface calm, not alarmist. |
| /seersolutions/s33r/ | Research front door | Light research-lab glass, two clear tracks, conceptual fork motion only where it demonstrates divergence. |
| /seersolutions/s33r/method.html | Deep method | Surface four families first. Twelve definitions belong one layer deeper in an expanding detail section. |
| /seersolutions/s33r/scenario.html | Research demonstration | Keep “illustrative, not a result” visually dominant. Reveal response slots as a comparison, not a leaderboard. |
| /convergence/ | Deep worldview map | Plain-language on-ramp first. Deep map should feel like entering a tool, not landing in one. State transitions animate lightly. |
| /lenses/ | Companion thinking tool | Each lens is a readable pair: what it sees / what it may miss. Cards get light depth, not dashboard styling. |
| /chronicle/ | Provenance record | Timeline rhythm over visual effects. Reveal entries gently; keep timestamps legible and stable. |
| /ai-tracker/ | Backstage Build Log | Raw process stays inside expansion. Public reader should not be confronted with the full log by default. |
| /open-fruit/ | Collaboration experiment | Forms and role cards must be touch-safe. Economics remain clearly illustrative. Fixed plant button must not cover final content on small screens. |
| /faded-dependence/ | Standalone app | Intentionally exempt from the white editorial shell. Its dark/fading visual state is functional storytelling. Audit it as an app, not as a content page. |
| /garden/ | Redirect | No design investment. Preserve redirect clarity only. |
| /consulting/, /seer-ai-consulting/, /solutions/ | Legacy redirects | No design investment. Keep canonical redirect behavior. |
| /index-preview.html | Historical preview | Not part of the public design system. Preserve as a historical artifact unless intentionally removed later. |
| /assets/bed-audio-selftest.html | Internal/self-test | Not a public story page. Exempt from editorial styling. |

## Permanent formatting test

Before a page ships:
1. Check 320px, 375px, 390px, 430px, tablet, and desktop.
2. Check nav open/close and keyboard focus.
3. Check long links, code, quotes, and headings for overflow.
4. Check every embed at phone width.
5. Check reduced-motion mode.
6. Check that no content is invisible if JavaScript fails.
7. Check that expansion does not hide the page's core answer.
8. Check that a visual or animation explains something rather than merely decorating it.
9. Check that the last meaningful control is not covered by fixed UI.
10. Remove one element if the page still feels busy.
