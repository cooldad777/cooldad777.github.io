# Faded Dependence — Grok Build / bot handoff

**Owner:** Ryan See (SEE, R)  
**Status:** PWA live; hub linked; native Screen Time app + belief splash still to build  
**Live app:** https://cooldad777.github.io/faded-dependence/  
**Hub splash:** https://cooldad777.github.io/ (section **Faded Dependence** + nav/footer)

---

## 1. What this is

**Faded Dependence** is allotted **screen time**, not a focus/productivity timer.  
Goal: reduce phone dependence (Anti-Attachment / Seer ethos).  
Session fades; more minutes only via an annoying finger pattern; miss/bail/end → hard in-app lock; then rest.

Public speech: no phone number, no employer names, Kennesaw OK if needed elsewhere. Do not paste private vault material onto the public hub.

---

## 2. Links & paths

| What | Where |
|------|--------|
| Live PWA | https://cooldad777.github.io/faded-dependence/ |
| Hub repo | `cooldad777/cooldad777.github.io` → folder `faded-dependence/` |
| Working copy (agent box) | `/workspace/faded-dependence/` |
| Hub working copy | `/workspace/_hub/` |
| iOS stub | `/workspace/faded-dependence/ios/` (scaffold / README) |

Install on iPhone: Safari → Share → **Add to Home Screen**. Hard-refresh or re-add icon after cache bumps (`sw.js` cache name).

---

## 3. Current PWA behavior (shipped)

- Slider **1–10 min**; chips **3** & **5**
- Phases: **Screen time** → **Fading** → pattern (“Need more screen time?”) → **Locked** (60s) → **Rest**
- Hard lock triggers: pattern fail, timeout, **Put it down**, **End session**
- During lock: no settings / no new session; countdown ring; aurora/stars (respect reduced motion)
- Settings in `localStorage` (default minutes, fade lead-in, bonus minutes, vibrate, reduced motion)
- Offline shell via service worker

### Verses already on fade / lock / rest

| Moment | Text | Cite |
|--------|------|------|
| **Fading** | “In returning and rest you shall be saved; in quietness and in trust shall be your strength.” | Isaiah 30:15 |
| **Locked** | “All things are lawful for me, but I will not be dominated by anything.” | 1 Corinthians 6:12 |
| **Rest** | “Be still, and know that I am God.” | Psalm 46:10 |

---

## 4. Honest platform limits

- A **PWA cannot** OS-lock the iPhone or reboot it. Home / app switch still work.
- Apps that “really lock” (Opal, Screen Time, one sec) use Apple **FamilyControls / ManagedSettings / DeviceActivity** in a **native** app + Apple entitlement approval.
- **No App Store app can reboot an iPhone.** Creative “reboot” = hard session reset, shield other apps, optional Shortcuts Lock Screen tip, Guided Access for true kiosk (user-enabled).

---

## 5. BUILD NEXT — Belief / Convergence splash (Ryan’s idea)

**Put this on the app’s opening splash** (before or instead of jumping straight into the timer setup).

### Flow

1. **Worldview by world population**  
   Opening experience: “What do people believe?” — approximate share of world population by major worldviews/religions (Christian, Muslim, Hindu, Buddhist, unaffiliated, folk, Jewish, other — use reputable rounded stats; cite source in a tiny footnote). Visual: layered map / stacked bars / soft globes — calm, not debate-club.

2. **Layer Ryan’s Convergence view**  
   Tie to the public Convergence project: shared moral intuition and longing across traditions without mushy syncretism; Lewis / Willard–friendly; Christian home base for Ryan while mapping the world honestly. One short line of ethos, not a sermon.

3. **Rotating inspiration tied to worldview**  
   After the user taps a tradition (or “explore all”), play a **random/playlist** of short lines:
   - Scripture from that tradition where appropriate  
   - and/or famous philosophers / sages that *correspond* without false equivalence  
   Rotate during **idle splash**, optionally during **fading** and **rest** (keep lock verse as the dependence line unless user opted into worldview playlist).

4. **Then** continue into allotted screen-time setup (existing timer UI).

### Design constraints

- Membrane-safe; never mock faiths; no “gotcha” conversion UX.
- Prefer quiet typography; works offline (bundle quote JSON).
- ADD-friendly: one clear CTA — “Choose a lens” → “Begin screen time”.
- Optional persist last lens in `localStorage`.

### Suggested data shape

```json
{
  "id": "christian",
  "label": "Christian",
  "populationShareApprox": 0.31,
  "sourceNote": "Pew-style rounded global share",
  "quotes": [
    { "text": "…", "attribution": "Isaiah 30:15", "kind": "scripture" },
    { "text": "…", "attribution": "C. S. Lewis", "kind": "philosopher" }
  ]
}
```

### Definition of done (belief splash)

- [ ] Splash shows population-layered worldviews  
- [ ] Convergence one-liner present  
- [ ] Random rotating quotes filter by selected (or all) lens  
- [ ] CTA into existing screen-time session  
- [ ] Offline + reduced-motion OK  
- [ ] Deployed to `faded-dependence/` on Pages  

---

## 6. BUILD NEXT — Native iOS ($0.99) real shields

1. Apple Developer Program ($99/yr)  
2. Xcode on Mac; bundle id e.g. `com.cooldad777.fadeddependence`  
3. SwiftUI shell (WKWebView of local PWA **or** native reimplementation)  
4. Request **Family Controls** entitlement; `AuthorizationCenter` request  
5. `ManagedSettings` shields when lock triggers; clear shields after lock/rest rules  
6. App Store Connect: paid **$0.99**, privacy nutrition, screenshots  
7. TestFlight → review  

Scaffold notes live under `ios/`. Do not claim shields work until entitlement + device test.

---

## 7. What NOT to do

- Reframe as focus / pomodoro / productivity  
- Claim the web app OS-locks or reboots the phone  
- Dump private `see-r-os` vault onto the public hub  
- Add 30 random “AI agent” folders with no Settled spine  
- Preachy wall of text on splash — keep it visual + short quotes  

---

## 8. Token routing note (for Ryan)

- **Chief of Staff / this bot:** judgment, hub link, handoffs, membrane, “what to build”  
- **Grok Build / another build bot:** belief splash UI + quote pack + native Screen Time implementation (token-heavy UI)  
- Either can ship; splash link + this handoff are already done here so Build doesn’t re-discover context  

---

## 9. Quick smoke checklist

1. Open https://cooldad777.github.io/ — see **Faded Dependence** section + nav  
2. Open https://cooldad777.github.io/faded-dependence/ — run 1-min session; confirm Isaiah on fade, 1 Cor on lock, Psalm on rest  
3. Re-add Home Screen icon after SW cache bump  

---

*Handoff written for bot continuation. Prefer Settled-style edits if you later add a Settled sheet for this app’s public copy.*
