# ASTRA PUBLIC QA

Preview-only candidate. Automated checks inform review; they are not an accessibility certification or a substitute for testing on Ryan's actual phone.

## Completed checks

| Check | Result |
| --- | --- |
| 15 active routes × 6 widths: 320, 375, 390, 430, 768, 1440px | 90 browser layout checks passed; no horizontal page overflow |
| Browser page errors | None across the checked routes |
| Missing local HTTP resources | None across the checked routes |
| Axe WCAG 2 A/AA and WCAG 2.1 AA tags, desktop initial states | No reported violations after corrections |
| Additional mobile Convergence eschatology, exponential and Signals states | No reported violations after label corrections |
| Additional Lenses comparison and matrix states | No reported violations |
| Menu opening, Escape closing and focus return | Passed |
| Search input and matching project results | Passed |
| Human Signal work-scope and correction states | Passed; fixed fictional examples, no network inference |
| Research source disclosure and Rewind transition disclosure | Passed |
| SEER missing-definition gate | Preparation is disabled until the definition is restored |
| SEER rework scenario and review summary | Synthetic total remains 18; summary is explicitly synthetic |
| Convergence arrow-key mode selection and dated Signals label | Passed |
| Lenses mobile comparison default, keyboard view selection and local note persistence | Passed |
| Portfolio unrelated click | Audio stays paused |
| Chronicle match/no-match filtering | Passed |
| Reduced motion | CSS scrolling resolves to auto; content remains visible |
| No-JavaScript home, Rewind, research, Chronicle and portfolio | Core content and links visible; explicit fallback navigation added |
| Static local links across 22 HTML pages | No active-page errors; five pre-existing historical-preview fragments documented below |
| Rewind integrity | All three excerpts exactly match their source blobs; all selected commits are baseline ancestors |
| Chronicle and HS-001 JSON integrity | Byte-identical to the baseline |
| Existing S33R validator | Passed; sales-link requirement removed from research pages; professional booking check retained |
| All JavaScript syntax; Git whitespace checks | Passed |

Machine-readable results: `astra-review/browser-report.json`, `astra-review/mode-report.json`.

## Visual inspection

Reviewed rendered full-page desktop and phone screenshots of the homepage, research, Rewind, SEER and Lenses. Corrected the shared footer contrast, retained-tool label contrast, audio overflow and mobile Lenses default. Preserved the forest photo, star, music image and established professional demo. Native details, simple focusable controls and static links supply progressive disclosure; content is not hidden pending animation.

## Reproduce

Static site; no product build or runtime dependencies added. Serve the repository root with a local HTTP server, for example `python -m http.server 8765`. Do not deploy.

Integrity checks:

```sh
python scripts/validate-public.py
node scripts/validate-s33r.mjs
git diff --check
```

Browser checks use the supplied `scripts/qa-public.cjs`, with Playwright available in Node's module path and an optional axe-core script:

```sh
ASTRA_CHROMIUM=/path/to/chromium ASTRA_AXE=/path/to/axe.min.js ASTRA_QA_OUTPUT=/tmp/astra-public-qa node scripts/qa-public.cjs
```

The QA server binds to loopback and blocks external browser requests intentionally. Browser tools were installed only in scratch, not in the product repository. Browser installation and preview-service failures were resolved using a local Chromium runtime. After the session resumed, a truncated runtime binary was re-expanded before completing the final mode checks.

## Known limits and remaining checks

- Actual iOS Safari, VoiceOver, audible playback and external YouTube playback were not verified. Embeds, email and scheduling endpoints were intentionally not exercised externally.
- The historical `index-preview.html` remains untouched and unpromoted. Its five old Lenses fragments (`lewis`, `empirical`, `moonshot`, `reformed`, `local`) already lacked matching targets; the static checker reports these separately. Active navigation has no broken local destinations.
- Not every combination of all legacy tool controls was exercised. Primary states, view switches, source disclosures and critical decision gates were covered.
- No laboratory performance score or field user study was collected. New pages use static HTML/CSS and small local scripts; existing images are reused and the lower music image loads lazily. No framework, inference service, analytics or tracking was added.
- Faded Dependence's timer logic is untouched. Setup contrast and zoom permission changed, with an offline-cache version bump so future deployment can serve the corrections.
- Rewind is intentionally a source reader, not full historical rendering. The current candidate needs Ryan's subjective approval of this choice and the new homepage headline.

## Independence

Checked out only `public-vnext-astra`, verified the starting SHA, and inspected only its frozen baseline and ancestors. PRE was committed locally as `a4a203be3ec9b37b25b4336b07a151d3971830c7` before product edits. The connector imports that exact PRE tree separately because shell Git push credentials are unavailable. No independent Sol candidate was inspected, and no main or production action was performed.
