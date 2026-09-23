/**
 * Faded Dependence — allotted screen time → fade → pattern → hard lock → rest
 * Lightweight for fragile iPhone Safari / Add to Home Screen.
 * Honest limit: a web app cannot OS-lock iPhone (Home / app switch still work).
 */
(function () {
  "use strict";

  const STORAGE_KEY = "faded-dependence-settings-v1";
  const CIRC = 2 * Math.PI * 88;
  const LOCK_MS = 60 * 1000;

  const DEFAULTS = {
    defaultMinutes: 5,
    fadeLeadSeconds: 30,
    bonusMinutes: 2,
    vibrate: true,
    respectReducedMotion: true,
  };

  let settings = loadSettings();

  const el = {
    app: document.getElementById("app"),
    minutesSlider: document.getElementById("minutes-slider"),
    minutesValue: document.getElementById("minutes-value"),
    chips: document.querySelectorAll(".chip"),
    btnStart: document.getElementById("btn-start"),
    btnEnd: document.getElementById("btn-end"),
    btnSettings: document.getElementById("btn-settings"),
    btnNewSession: document.getElementById("btn-new-session"),
    btnPatternGiveup: document.getElementById("btn-pattern-giveup"),
    viewIdle: document.getElementById("view-idle"),
    viewActive: document.getElementById("view-active"),
    viewPattern: document.getElementById("view-pattern"),
    viewLock: document.getElementById("view-lock"),
    viewSleep: document.getElementById("view-sleep"),
    countdown: document.getElementById("countdown"),
    phaseLabel: document.getElementById("phase-label"),
    ringProgress: document.getElementById("ring-progress"),
    patternCanvas: document.getElementById("pattern-canvas"),
    patternSub: document.getElementById("pattern-sub"),
    patternHeading: document.getElementById("pattern-heading"),
    patternTimer: document.getElementById("pattern-timer"),
    lockCountdown: document.getElementById("lock-countdown"),
    lockRingProgress: document.getElementById("lock-ring-progress"),
    lockMessage: document.getElementById("lock-message"),
    verseFading: document.getElementById("verse-fading"),
    verseLock: document.getElementById("verse-lock"),
    verseSleep: document.getElementById("verse-sleep"),
    sleepClock: document.getElementById("sleep-clock"),
    settingsSheet: document.getElementById("settings-sheet"),
    settingsBackdrop: document.getElementById("settings-backdrop"),
    btnSettingsSave: document.getElementById("btn-settings-save"),
    btnSettingsClose: document.getElementById("btn-settings-close"),
    setDefaultMinutes: document.getElementById("set-default-minutes"),
    setFadeLead: document.getElementById("set-fade-lead"),
    setBonusMinutes: document.getElementById("set-bonus-minutes"),
    setVibrate: document.getElementById("set-vibrate"),
    setReduced: document.getElementById("set-reduced"),
    toast: document.getElementById("toast"),
    stars: document.getElementById("stars"),
  };

  el.ringProgress.style.strokeDasharray = String(CIRC);
  el.lockRingProgress.style.strokeDasharray = String(CIRC);

  let sessionMinutes = settings.defaultMinutes;
  let remainingMs = 0;
  let totalMs = 0;
  let rafId = 0;
  let lastTick = 0;
  let phase = "idle";
  let patternMode = "keep";
  let sleepClockId = 0;
  let patternDeadline = 0;
  let patternRaf = 0;
  let patternExpected = 0;
  /** @type {{x:number,y:number,el:HTMLElement}[]} */
  let patternNodes = [];
  let trailPath = null;
  let pointerActive = false;
  let toastTimer = 0;
  let patternHandlers = null;
  let lockRemainingMs = 0;
  let lockTotalMs = LOCK_MS;
  let lockRaf = 0;
  let lockLastTick = 0;
  let starsCtx = null;
  let stars = [];
  let starsRaf = 0;
  let starsRunning = false;

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }

  function prefersReduced() {
    if (!settings.respectReducedMotion) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function applyReducedFlag() {
    el.app.dataset.reduced = prefersReduced() ? "1" : "0";
  }

  function vibrate(pattern) {
    if (!settings.vibrate || !navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }

  function showToast(msg, ms) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.toast.hidden = true;
    }, ms || 2200);
  }

  function setView(name) {
    el.viewIdle.hidden = name !== "idle";
    el.viewActive.hidden = name !== "active";
    el.viewPattern.hidden = name !== "pattern";
    el.viewLock.hidden = name !== "lock";
    el.viewSleep.hidden = name !== "sleep";
    el.app.dataset.state = name === "active" ? "active" : name;

    if (name === "lock" || name === "sleep") {
      startStars();
    } else {
      stopStars();
    }

    if (name === "lock") {
      closeSettings();
    }
  }

  function resetFadeVars() {
    var root = document.documentElement;
    root.style.setProperty("--fade-opacity", "1");
    root.style.setProperty("--fade-blur", "0px");
    root.style.setProperty("--fade-sat", "1");
    root.style.setProperty("--vignette", "0");
  }

  function applyFadeProgress(t) {
    // Richer fade: opacity, blur, desat, vignette via rAF
    var reduced = prefersReduced();
    var ease = t * t * (3 - 2 * t); // smoothstep
    var opacity = 1 - ease * 0.78;
    var blur = reduced ? 0 : ease * 8;
    var sat = 1 - ease * 0.92;
    var vig = ease * 0.82;
    var root = document.documentElement;
    root.style.setProperty("--fade-opacity", String(opacity));
    root.style.setProperty("--fade-blur", blur.toFixed(2) + "px");
    root.style.setProperty("--fade-sat", sat.toFixed(3));
    root.style.setProperty("--vignette", vig.toFixed(3));
  }

  function updateSliderUI(mins) {
    sessionMinutes = mins;
    el.minutesSlider.value = String(mins);
    el.minutesValue.textContent = String(mins);
    el.minutesSlider.setAttribute("aria-valuenow", String(mins));
    var pct = ((mins - 1) / 9) * 100;
    el.minutesSlider.style.setProperty("--slider-pct", pct + "%");
    el.chips.forEach(function (c) {
      c.classList.toggle("is-active", Number(c.dataset.minutes) === mins);
    });
  }

  el.minutesSlider.addEventListener("input", function () {
    updateSliderUI(Number(el.minutesSlider.value));
  });

  el.chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      updateSliderUI(Number(chip.dataset.minutes));
    });
  });

  function formatTime(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function updateRing() {
    var p = totalMs > 0 ? remainingMs / totalMs : 0;
    el.ringProgress.style.strokeDashoffset = String(CIRC * (1 - p));
    el.countdown.textContent = formatTime(remainingMs);
    el.countdown.setAttribute("datetime", "PT" + Math.ceil(remainingMs / 1000) + "S");
  }


  function showFadingVerse(show) {
    if (!el.verseFading) return;
    el.verseFading.hidden = !show;
    el.verseFading.setAttribute("aria-hidden", show ? "false" : "true");
  }

  function enterFading() {
    if (phase === "fading") return;
    phase = "fading";
    el.app.dataset.phase = "fading";
    el.phaseLabel.textContent = "Fading";
    showFadingVerse(true);
    vibrate([30, 40, 30]);
  }

  function tick(now) {
    if (!lastTick) lastTick = now;
    var dt = now - lastTick;
    lastTick = now;
    remainingMs = Math.max(0, remainingMs - dt);

    var leadMs = Math.min(settings.fadeLeadSeconds * 1000, Math.max(5000, totalMs * 0.85));
    if (remainingMs <= leadMs && remainingMs > 0) {
      enterFading();
      var t = 1 - remainingMs / leadMs;
      applyFadeProgress(Math.min(1, Math.max(0, t)));
    } else if (remainingMs > leadMs) {
      if (phase === "fading") showFadingVerse(false);
      phase = "screentime";
      el.app.dataset.phase = "screentime";
      el.phaseLabel.textContent = "Screen time";
      resetFadeVars();
    }

    updateRing();

    if (remainingMs <= 0) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      applyFadeProgress(1);
      startPatternChallenge("keep");
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function startSession(minutes) {
    cancelAnimationFrame(rafId);
    cancelAnimationFrame(lockRaf);
    clearPattern();
    stopSleepClock();
    resetFadeVars();
    el.app.classList.remove("is-reviving");

    totalMs = minutes * 60 * 1000;
    remainingMs = totalMs;
    lastTick = 0;
    phase = "screentime";
    el.app.dataset.phase = "screentime";
    el.phaseLabel.textContent = "Screen time";
    showFadingVerse(false);
    setView("active");
    updateRing();
    vibrate(20);
    rafId = requestAnimationFrame(tick);
  }

  function clearPattern() {
    cancelAnimationFrame(patternRaf);
    patternRaf = 0;
    pointerActive = false;
    patternExpected = 0;
    patternNodes = [];
    trailPath = null;
    var canvas = el.patternCanvas;
    if (canvas && patternHandlers) {
      canvas.removeEventListener("pointerdown", patternHandlers.down);
      canvas.removeEventListener("pointermove", patternHandlers.move);
      canvas.removeEventListener("pointerup", patternHandlers.up);
      canvas.removeEventListener("pointercancel", patternHandlers.up);
      patternHandlers = null;
    }
    if (canvas) canvas.innerHTML = "";
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function buildPattern() {
    clearPattern();
    var canvas = el.patternCanvas;
    var size = canvas.clientWidth || 300;
    var pad = 36;
    var count = 4 + Math.floor(Math.random() * 2);
    var pts = [];
    var attempts = 0;
    while (pts.length < count && attempts < 80) {
      attempts++;
      var x = rand(pad, size - pad);
      var y = rand(pad, size - pad);
      if (pts.every(function (p) { return Math.hypot(p.x - x, p.y - y) > 70; })) {
        pts.push({ x: x, y: y });
      }
    }
    while (pts.length < count) {
      var i = pts.length;
      pts.push({
        x: pad + ((size - 2 * pad) * (i + 0.5)) / count,
        y: size / 2 + (i % 2 === 0 ? -40 : 40),
      });
    }

    var trailSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    trailSvg.classList.add("pattern-trail");
    trailSvg.setAttribute("viewBox", "0 0 " + size + " " + size);
    // Soft glow underlay
    var glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    glowPath.setAttribute("fill", "none");
    glowPath.setAttribute("stroke", "rgba(126,184,255,0.2)");
    glowPath.setAttribute("stroke-width", "8");
    glowPath.setAttribute("stroke-linecap", "round");
    glowPath.setAttribute("stroke-linejoin", "round");
    trailPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    trailPath.setAttribute("fill", "none");
    trailPath.setAttribute("stroke", "rgba(126,184,255,0.75)");
    trailPath.setAttribute("stroke-width", "3");
    trailPath.setAttribute("stroke-linecap", "round");
    trailPath.setAttribute("stroke-linejoin", "round");
    trailPath._glow = glowPath;
    trailSvg.appendChild(glowPath);
    trailSvg.appendChild(trailPath);
    canvas.appendChild(trailSvg);

    patternNodes = pts.map(function (p, idx) {
      var node = document.createElement("div");
      node.className = "pattern-node" + (idx === 0 ? " is-next" : "");
      node.style.left = p.x + "px";
      node.style.top = p.y + "px";
      node.textContent = String(idx + 1);
      canvas.appendChild(node);
      return { x: p.x, y: p.y, el: node };
    });

    patternExpected = 0;
    bindPatternPointers();
  }

  function nodeHit(clientX, clientY, idx) {
    var node = patternNodes[idx];
    if (!node) return false;
    var rect = el.patternCanvas.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    return Math.hypot(x - node.x, y - node.y) <= 34;
  }

  function updateTrail(clientX, clientY) {
    if (!trailPath || patternExpected === 0) return;
    var rect = el.patternCanvas.getBoundingClientRect();
    var x = clientX - rect.left;
    var y = clientY - rect.top;
    var d = "";
    for (var i = 0; i < patternExpected; i++) {
      var n = patternNodes[i];
      d += (i === 0 ? "M" : "L") + n.x + " " + n.y + " ";
    }
    d += "L" + x + " " + y;
    trailPath.setAttribute("d", d);
    if (trailPath._glow) trailPath._glow.setAttribute("d", d);
  }

  function finalizeTrail() {
    if (!trailPath) return;
    var d = "";
    for (var i = 0; i < patternExpected; i++) {
      var n = patternNodes[i];
      d += (i === 0 ? "M" : "L") + n.x + " " + n.y + " ";
    }
    d = d.trim();
    trailPath.setAttribute("d", d);
    if (trailPath._glow) trailPath._glow.setAttribute("d", d);
  }

  function onNodeReached(idx) {
    var node = patternNodes[idx];
    node.el.classList.remove("is-next", "is-miss");
    node.el.classList.add("is-done");
    patternExpected = idx + 1;
    vibrate(12);
    if (patternExpected < patternNodes.length) {
      patternNodes[patternExpected].el.classList.add("is-next");
    } else {
      onPatternSuccess();
    }
  }

  function bindPatternPointers() {
    var canvas = el.patternCanvas;

    function onDown(e) {
      e.preventDefault();
      pointerActive = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
      if (nodeHit(e.clientX, e.clientY, patternExpected)) {
        onNodeReached(patternExpected);
        updateTrail(e.clientX, e.clientY);
      }
    }

    function onMove(e) {
      if (!pointerActive) return;
      e.preventDefault();
      updateTrail(e.clientX, e.clientY);
      if (patternExpected < patternNodes.length && nodeHit(e.clientX, e.clientY, patternExpected)) {
        onNodeReached(patternExpected);
      }
    }

    function onUp() {
      pointerActive = false;
      finalizeTrail();
      if (patternExpected > 0 && patternExpected < patternNodes.length) {
        var next = patternNodes[patternExpected];
        next.el.classList.add("is-miss");
        setTimeout(function () {
          next.el.classList.remove("is-miss");
        }, 400);
      }
    }

    patternHandlers = { down: onDown, move: onMove, up: onUp };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
  }

  function patternTick(now) {
    var left = Math.max(0, patternDeadline - now);
    el.patternTimer.textContent = formatTime(left);
    if (left <= 0) {
      onPatternFail();
      return;
    }
    patternRaf = requestAnimationFrame(patternTick);
  }

  function startPatternChallenge(mode) {
    patternMode = mode;
    cancelAnimationFrame(rafId);
    rafId = 0;
    phase = "pattern";
    el.app.dataset.state = "pattern";
    setView("pattern");

    if (mode === "unlock") {
      el.patternHeading.textContent = "Start again?";
      el.patternSub.textContent = "Trace the path to unlock more screen time — or put it down.";
    } else {
      el.patternHeading.textContent = "Need more screen time?";
      el.patternSub.textContent = "Trace the path to unlock more — or put it down.";
    }

    requestAnimationFrame(function () {
      buildPattern();
      var timeoutMs = mode === "unlock" ? 20000 : 14000;
      patternDeadline = performance.now() + timeoutMs;
      el.patternTimer.textContent = formatTime(timeoutMs);
      vibrate([40, 60, 40]);
      patternRaf = requestAnimationFrame(patternTick);
    });
  }

  function onPatternSuccess() {
    var mode = patternMode;
    clearPattern();
    vibrate([20, 30, 40]);
    if (mode === "unlock") {
      resetFadeVars();
      startSession(sessionMinutes);
      showToast("Screen time started");
      return;
    }
    var bonus = settings.bonusMinutes;
    remainingMs = bonus * 60 * 1000;
    totalMs = remainingMs;
    lastTick = 0;
    phase = "screentime";
    el.app.dataset.phase = "screentime";
    el.phaseLabel.textContent = "More time";
    showFadingVerse(false);
    resetFadeVars();
    el.app.classList.add("is-reviving");
    setView("active");
    updateRing();
    showToast("+" + bonus + " min — earned");
    setTimeout(function () {
      el.app.classList.remove("is-reviving");
      if (phase === "screentime" || phase === "fading") {
        el.phaseLabel.textContent = phase === "fading" ? "Fading" : "Screen time";
      }
    }, 1600);
    rafId = requestAnimationFrame(tick);
  }

  function onPatternFail() {
    clearPattern();
    enterHardLock();
  }

  /* ——— 1-minute hard lock ——— */
  function enterHardLock() {
    clearPattern();
    cancelAnimationFrame(rafId);
    rafId = 0;
    cancelAnimationFrame(lockRaf);
    stopSleepClock();
    closeSettings();

    phase = "lock";
    lockTotalMs = LOCK_MS;
    lockRemainingMs = LOCK_MS;
    lockLastTick = 0;
    resetFadeVars();
    document.documentElement.style.setProperty("--vignette", "0.88");
    showFadingVerse(false);
    setView("lock");
    el.app.dataset.state = "lock";
    el.app.dataset.phase = "lock";
    if (el.verseLock) {
      el.verseLock.hidden = false;
      el.verseLock.setAttribute("aria-hidden", "false");
    }
    updateLockUI();
    vibrate([80, 40, 80]);
    lockRaf = requestAnimationFrame(lockTick);
  }

  function updateLockUI() {
    var p = lockTotalMs > 0 ? lockRemainingMs / lockTotalMs : 0;
    el.lockRingProgress.style.strokeDashoffset = String(CIRC * (1 - p));
    el.lockCountdown.textContent = formatTime(lockRemainingMs);
    el.lockCountdown.setAttribute("datetime", "PT" + Math.ceil(lockRemainingMs / 1000) + "S");
  }

  function lockTick(now) {
    if (!lockLastTick) lockLastTick = now;
    var dt = now - lockLastTick;
    lockLastTick = now;
    lockRemainingMs = Math.max(0, lockRemainingMs - dt);
    updateLockUI();

    if (lockRemainingMs <= 0) {
      cancelAnimationFrame(lockRaf);
      lockRaf = 0;
      enterRest();
      return;
    }
    lockRaf = requestAnimationFrame(lockTick);
  }

  function enterRest() {
    cancelAnimationFrame(lockRaf);
    lockRaf = 0;
    clearPattern();
    cancelAnimationFrame(rafId);
    rafId = 0;
    phase = "sleep";
    resetFadeVars();
    document.documentElement.style.setProperty("--vignette", "0.55");
    setView("sleep");
    el.app.dataset.state = "sleep";
    el.app.dataset.phase = "sleep";
    if (el.verseSleep) {
      el.verseSleep.hidden = false;
      el.verseSleep.setAttribute("aria-hidden", "false");
    }
    updateSleepClock();
    stopSleepClock();
    sleepClockId = setInterval(updateSleepClock, 1000);
    vibrate([40]);
  }

  function updateSleepClock() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    h = h % 12 || 12;
    el.sleepClock.textContent = h + ":" + String(m).padStart(2, "0");
    el.sleepClock.setAttribute("datetime", now.toISOString());
  }

  function stopSleepClock() {
    if (sleepClockId) {
      clearInterval(sleepClockId);
      sleepClockId = 0;
    }
  }

  /* ——— Starfield (tiny canvas; skipped when reduced motion) ——— */
  function initStars() {
    if (!el.stars) return;
    starsCtx = el.stars.getContext("2d");
    resizeStars();
  }

  function resizeStars() {
    if (!el.stars || !starsCtx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth;
    var h = window.innerHeight;
    el.stars.width = Math.floor(w * dpr);
    el.stars.height = Math.floor(h * dpr);
    el.stars.style.width = w + "px";
    el.stars.style.height = h + "px";
    starsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var count = Math.min(48, Math.floor((w * h) / 18000));
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.5 + 0.15,
        s: Math.random() * 0.4 + 0.1,
        p: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawStars(now) {
    if (!starsRunning || !starsCtx || prefersReduced()) {
      starsRaf = 0;
      return;
    }
    var w = window.innerWidth;
    var h = window.innerHeight;
    starsCtx.clearRect(0, 0, w, h);
    var t = now * 0.001;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var tw = s.a * (0.55 + 0.45 * Math.sin(t * s.s + s.p));
      starsCtx.beginPath();
      starsCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      starsCtx.fillStyle = "rgba(200, 210, 240," + tw.toFixed(3) + ")";
      starsCtx.fill();
    }
    starsRaf = requestAnimationFrame(drawStars);
  }

  function startStars() {
    if (prefersReduced()) {
      stopStars();
      return;
    }
    if (!starsCtx) initStars();
    resizeStars();
    if (!starsRunning) {
      starsRunning = true;
      starsRaf = requestAnimationFrame(drawStars);
    }
  }

  function stopStars() {
    starsRunning = false;
    if (starsRaf) {
      cancelAnimationFrame(starsRaf);
      starsRaf = 0;
    }
    if (starsCtx && el.stars) {
      starsCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  window.addEventListener("resize", function () {
    if (starsRunning) resizeStars();
  });

  function openSettings() {
    if (phase === "lock") return;
    el.setDefaultMinutes.value = String(settings.defaultMinutes);
    el.setFadeLead.value = String(settings.fadeLeadSeconds);
    el.setBonusMinutes.value = String(settings.bonusMinutes);
    el.setVibrate.checked = settings.vibrate;
    el.setReduced.checked = settings.respectReducedMotion;
    el.settingsSheet.hidden = false;
  }

  function closeSettings() {
    el.settingsSheet.hidden = true;
  }

  function persistSettingsFromForm() {
    var dm = Number(el.setDefaultMinutes.value);
    var fl = Number(el.setFadeLead.value);
    var bm = Number(el.setBonusMinutes.value);
    if (!Number.isFinite(dm)) dm = DEFAULTS.defaultMinutes;
    if (!Number.isFinite(fl)) fl = DEFAULTS.fadeLeadSeconds;
    if (!Number.isFinite(bm)) bm = DEFAULTS.bonusMinutes;
    settings.defaultMinutes = Math.min(10, Math.max(1, Math.round(dm)));
    settings.fadeLeadSeconds = Math.min(120, Math.max(5, Math.round(fl)));
    settings.bonusMinutes = Math.min(10, Math.max(1, Math.round(bm)));
    settings.vibrate = !!el.setVibrate.checked;
    settings.respectReducedMotion = !!el.setReduced.checked;
    saveSettings();
    applyReducedFlag();
    if (phase === "idle") updateSliderUI(settings.defaultMinutes);
    showToast("Settings saved");
    closeSettings();
  }

  el.btnStart.addEventListener("click", function () {
    startSession(sessionMinutes);
  });

  // End session → hard lock (same cost as failing the pattern)
  el.btnEnd.addEventListener("click", function () {
    cancelAnimationFrame(rafId);
    rafId = 0;
    clearPattern();
    enterHardLock();
  });

  el.btnPatternGiveup.addEventListener("click", function () {
    onPatternFail();
  });

  el.btnNewSession.addEventListener("click", function () {
    if (phase === "lock") return;
    stopSleepClock();
    startPatternChallenge("unlock");
  });

  el.btnSettings.addEventListener("click", openSettings);
  el.btnSettingsClose.addEventListener("click", closeSettings);
  el.settingsBackdrop.addEventListener("click", closeSettings);
  el.btnSettingsSave.addEventListener("click", persistSettingsFromForm);

  // During hard lock: swallow taps that might dismiss / navigate UI
  el.viewLock.addEventListener(
    "pointerdown",
    function (e) {
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      lastTick = 0;
      lockLastTick = 0;
    } else if (phase === "screentime" || phase === "fading") {
      lastTick = 0;
    } else if (phase === "lock") {
      lockLastTick = 0;
    }
    if (!document.hidden && phase === "sleep") updateSleepClock();
  });

  function init() {
    applyReducedFlag();
    updateSliderUI(settings.defaultMinutes);
    resetFadeVars();
    setView("idle");
    el.app.dataset.phase = "idle";
    initStars();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(function () {
        /* optional */
      });
    }
  }

  init();
})();
