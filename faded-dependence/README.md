# Faded Dependence

A calm Progressive Web App that helps lessen phone dependence. You set a short session (default **5 minutes**). Near the end, the UI gently fades. To keep using the phone you must complete an **annoying finger pattern**. Fail or give up → a quiet sleep lock.

Built for a water-damaged iPhone that dies about every five minutes: light animations, large taps, offline after first load, no accounts.

## Install on iPhone (Safari)

1. Open this app in **Safari** (not Chrome).
2. Tap the **Share** button.
3. Tap **Add to Home Screen**.
4. Confirm the name **Faded Dependence**, then **Add**.
5. Launch from the home screen icon (standalone, status bar translucent).

Serve over `http://` on your LAN or `https://` in production. `file://` will not register the service worker.

### Local preview

```bash
cd /workspace/faded-dependence
python3 -m http.server 8765
```

Then open `http://<your-mac-or-box-ip>:8765` in Safari (or use a tunnel). On the same machine: `http://127.0.0.1:8765`.

## Features

- Session length slider **1–10** minutes; chips for **3** and **5**
- Start / End session
- Countdown + circular progress ring
- Fade lead-in (opacity, blur, desaturation, vignette) before zero
- Sequenced glowing-node finger pattern (touch/pointer, iOS Safari)
- Sleep lock: dim clock + gentle message
- New session from sleep requires a short unlock pattern
- Settings (localStorage): default minutes, fade lead-in, +minutes on success, vibrate, respect `prefers-reduced-motion`
- PWA: `manifest.webmanifest`, Apple metas, icons, offline service worker shell

## Files

| Path | Role |
|------|------|
| `index.html` | Shell + structure |
| `styles.css` | Dark calm system-font UI |
| `app.js` | Timer, fade, pattern, sleep, settings |
| `sw.js` | Offline cache |
| `manifest.webmanifest` | Install metadata |
| `icons/` | SVG + PNG icons |
| `ios/` | Future SwiftUI stub note |

No backend, analytics, or build step. Do not couple this to the see-r public site or Chronicle.
