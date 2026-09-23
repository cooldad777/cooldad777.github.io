# Faded Dependence

Allotted **screen time** that fades — not a focus or productivity timer. You burn down a short allotment (default **5 minutes**). Near the end the UI fades. More time only if you complete an annoying finger pattern. Miss, bail, time out, or end early → a **1-minute hard lock** in-app, then a calm rest screen.

Built for a water-damaged iPhone that dies about every five minutes: light animations, large taps, offline after first load, no accounts.

## Honest limit

A web app **cannot** OS-lock an iPhone. Home and app switch still work. The in-app lock is meant to feel absolute (no escape UI for that minute). For a stronger boundary on iOS, Safari → Accessibility → **Guided Access** can pin the session to this app — optional, not nagged in the UI.

## Install on iPhone (Safari)

1. Open this app in **Safari** (not Chrome).
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Confirm the name **Faded Dependence**, then **Add**.
5. Launch from the home screen icon (standalone, status bar translucent).

Serve over `http://` on your LAN or `https://` in production. `file://` will not register the service worker.

Live (GitHub Pages): `https://cooldad777.github.io/faded-dependence/`

### Local preview

```bash
cd /workspace/faded-dependence
python3 -m http.server 8765
```

Then open `http://<your-mac-or-box-ip>:8765` in Safari (or use a tunnel). On the same machine: `http://127.0.0.1:8765`.

## Behavior

1. **Idle** — set allotted minutes; tagline is screen-time / dependence friction.
2. **Screen time** — countdown while you *use* the phone; phase label “Screen time”, then “Fading”.
3. **Pattern** — “Need more screen time?” Trace nodes or **Put it down**.
4. **Hard lock (60s)** — dramatic Locked + ring countdown; settings / New Session hidden; taps ignored. Fail, timeout, give-up, and **End session** all enter this lock.
5. **Rest** — “Phone can wait.” New session available; starting again still requires the pattern.

## Features

- Session length slider **1–10** minutes; chips for **3** and **5**
- Fade lead-in (opacity, blur, desaturation, vignette) via rAF
- Glowing-node finger pattern with premium trail
- 1-minute hard lock with aurora + subtle starfield (respects reduced motion)
- Settings (localStorage): default minutes, fade lead-in, +minutes on success, vibrate, respect `prefers-reduced-motion`
- PWA: `manifest.webmanifest`, Apple metas, icons, offline service worker shell

## Files

| Path | Role |
|------|------|
| `index.html` | Shell + structure |
| `styles.css` | Dark calm system-font UI |
| `app.js` | Timer, fade, pattern, hard lock, rest, settings |
| `sw.js` | Offline cache |
| `manifest.webmanifest` | Install metadata |
| `icons/` | SVG + PNG icons |
| `ios/` | Future SwiftUI stub note (not deployed to Pages) |

No backend, analytics, or build step. Do not couple this to the see-r public site or Chronicle.
