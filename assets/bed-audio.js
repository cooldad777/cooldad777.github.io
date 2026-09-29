/**
 * SEE, R — Portfolio bed audio (sitewide chrome)
 * Settled: PORTFOLIO-AUDIO.md · HUB-IA-2026-09-29.md
 * No Spotify. sessionStorage persistence. Duck /faded-dependence/ (+ future /halo-cut/).
 * Volume via Web Audio GainNode (iOS Safari ignores HTMLMediaElement.volume).
 */
(function () {
  'use strict';

  var KEYS = {
    started: 'seer_bed_started',
    playing: 'seer_bed_playing',
    paused: 'seer_bed_global_pause',
    vol: 'seer_bed_vol',
    pos: 'seer_bed_pos',
    visited: 'seer_bed_portfolio_visit'
  };
  var DEFAULT_VOL = 0.72;
  /** Soft start so bed doesn't startle; ~4.5s to preferred volume (Settled). */
  var FADE_IN_MS = 4500;
  var fadeRaf = null;
  var DUCK_RE = /\/faded-dependence(\/|$)|\/halo-cut(\/|$)/i;

  /* —— Web Audio graph (GainNode) —— */
  var audioCtx = null;
  var mediaSource = null;
  var gainNode = null;
  var graphReady = false;
  var useGain = false; /* true once graph is wired; false = fallback to audio.volume */

  function AudioContextCtor() {
    return window.AudioContext || window.webkitAudioContext || null;
  }

  function setOutputLevel(level) {
    level = Math.max(0, Math.min(1, level));
    if (useGain && gainNode && audioCtx) {
      try {
        var t = audioCtx.currentTime;
        /* Cancel any AudioParam automation, then set immediately.
           Prefer .value= so gain.value reads back right away (setValueAtTime alone
           can lag until the next render quantum in Chromium). */
        gainNode.gain.cancelScheduledValues(t);
        gainNode.gain.value = level;
        gainNode.gain.setValueAtTime(level, t);
      } catch (e) {
        try { gainNode.gain.value = level; } catch (e2) {}
      }
      /* Element volume stays at 1 so GainNode is the only attenuator. */
      audio.volume = 1;
    } else {
      audio.volume = level;
    }
  }

  function getOutputLevel() {
    if (useGain && gainNode) {
      try { return gainNode.gain.value; } catch (e) { return vol; }
    }
    return audio.volume;
  }

  /**
   * Create AudioContext + MediaElementSource + GainNode once.
   * Must run inside a user-gesture for iOS; createMediaElementSource may only be called once per element.
   */
  function ensureGraph() {
    if (graphReady) return useGain;
    var Ctor = AudioContextCtor();
    if (!Ctor) {
      graphReady = true;
      useGain = false;
      return false;
    }
    try {
      if (!audioCtx) audioCtx = new Ctor();
      if (!mediaSource) {
        mediaSource = audioCtx.createMediaElementSource(audio);
      }
      if (!gainNode) {
        gainNode = audioCtx.createGain();
        gainNode.gain.value = 0;
        mediaSource.connect(gainNode);
        gainNode.connect(audioCtx.destination);
      }
      audio.volume = 1;
      useGain = true;
      graphReady = true;
      return true;
    } catch (e) {
      /* createMediaElementSource already used, or AudioContext failed */
      graphReady = true;
      useGain = !!(gainNode && audioCtx);
      return useGain;
    }
  }

  function resumeCtx() {
    if (audioCtx && audioCtx.state === 'suspended') {
      try { return audioCtx.resume(); } catch (e) { return Promise.resolve(); }
    }
    return Promise.resolve();
  }

  function assetBase() {
    var scripts = document.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || '';
      if (/bed-audio\.js/.test(src)) {
        return src.replace(/bed-audio\.js(\?.*)?$/, '');
      }
    }
    return 'assets/';
  }

  function ssGet(k) {
    try { return sessionStorage.getItem(k); } catch (e) { return null; }
  }
  function ssSet(k, v) {
    try { sessionStorage.setItem(k, String(v)); } catch (e) {}
  }

  function isDuckZone() {
    return DUCK_RE.test(location.pathname || '') || DUCK_RE.test(location.href || '');
  }

  function isPortfolioPage() {
    var p = location.pathname || '';
    return /\/portfolio\/?$/.test(p) || /\/portfolio\/index\.html$/.test(p);
  }

  var base = assetBase();
  var audioSrc = base + 'audio/portfolio-bed.m4a';

  var audio = document.createElement('audio');
  audio.id = 'seer-bed-audio';
  audio.setAttribute('playsinline', '');
  audio.setAttribute('preload', 'metadata');
  audio.crossOrigin = 'anonymous';
  audio.loop = true;
  audio.src = audioSrc;

  var started = ssGet(KEYS.started) === '1';
  var globalPause = ssGet(KEYS.paused) === '1';
  var wantPlay = ssGet(KEYS.playing) === '1';
  var vol = parseFloat(ssGet(KEYS.vol));
  if (isNaN(vol) || vol < 0 || vol > 1) vol = DEFAULT_VOL;
  /* Initial element volume; once graph is active, element stays at 1. */
  audio.volume = vol;

  var pos = parseFloat(ssGet(KEYS.pos));
  if (!isNaN(pos) && pos > 0) {
    audio.addEventListener('loadedmetadata', function once() {
      try {
        if (pos < audio.duration) audio.currentTime = pos;
      } catch (e) {}
      audio.removeEventListener('loadedmetadata', once);
    });
  }

  if (isPortfolioPage()) ssSet(KEYS.visited, '1');
  var visitedPortfolio = ssGet(KEYS.visited) === '1' || isPortfolioPage();

  /* —— Control chrome —— */
  var root = document.createElement('div');
  root.id = 'seer-bed';
  root.className = 'seer-bed';
  root.setAttribute('role', 'region');
  root.setAttribute('aria-label', 'Portfolio music');
  root.innerHTML =
    '<button type="button" class="seer-bed-toggle" aria-label="Play music" title="Play">' +
      '<svg class="icon-play" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path fill="currentColor" d="M3 1.5v11l9-5.5z"/></svg>' +
      '<svg class="icon-pause" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" hidden><rect x="2.5" y="2" width="3" height="10" rx="0.5" fill="currentColor"/><rect x="8.5" y="2" width="3" height="10" rx="0.5" fill="currentColor"/></svg>' +
    '</button>' +
    '<input type="range" class="seer-bed-vol" min="0" max="1" step="0.01" value="' + vol + '" aria-label="Volume" />' +
    '<span class="seer-bed-hint" hidden>Tap to play</span>';

  function showControl(force) {
    var show = force || started || visitedPortfolio;
    root.hidden = !show;
    if (isPortfolioPage() && !started) {
      root.classList.add('seer-bed--invite');
      var hint = root.querySelector('.seer-bed-hint');
      if (hint) hint.hidden = false;
    } else {
      root.classList.remove('seer-bed--invite');
      var h = root.querySelector('.seer-bed-hint');
      if (h) h.hidden = true;
    }
  }

  function syncUI() {
    var playing = !audio.paused && !audio.ended;
    var btn = root.querySelector('.seer-bed-toggle');
    var playIcon = root.querySelector('.icon-play');
    var pauseIcon = root.querySelector('.icon-pause');
    if (btn) {
      btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
      btn.title = playing ? 'Pause' : 'Play';
    }
    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;
    var slider = root.querySelector('.seer-bed-vol');
    if (slider && fadeRaf == null && Math.abs(parseFloat(slider.value) - vol) > 0.01) {
      slider.value = String(vol);
    }
  }

  function persistPos() {
    try {
      if (!isNaN(audio.currentTime)) ssSet(KEYS.pos, audio.currentTime.toFixed(2));
    } catch (e) {}
  }

  var unlockArmed = false;
  var unlockHandlers = [];

  function cancelFade() {
    if (fadeRaf != null) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
    if (useGain && gainNode && audioCtx) {
      try {
        gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
      } catch (e) {}
    }
  }

  /** Ease-out cubic. fromOverride forces start level (iOS often ignores volume set before play). */
  function fadeInTo(target, ms, fromOverride) {
    cancelFade();
    var from = (typeof fromOverride === 'number') ? fromOverride : getOutputLevel();
    if (ms <= 0) {
      setOutputLevel(target);
      return;
    }
    setOutputLevel(from);
    var start = performance.now();
    var sliderEl = root.querySelector('.seer-bed-vol');
    if (sliderEl) sliderEl.value = String(target);
    function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      var e = 1 - Math.pow(1 - t, 3);
      var dest = vol; /* live preferred volume — slider can change mid-fade */
      setOutputLevel(from + (dest - from) * e);
      if (t < 1) {
        fadeRaf = requestAnimationFrame(frame);
      } else {
        fadeRaf = null;
        setOutputLevel(dest);
      }
    }
    fadeRaf = requestAnimationFrame(frame);
  }

  function disarmUnlock() {
    unlockArmed = false;
    for (var i = 0; i < unlockHandlers.length; i++) {
      var h = unlockHandlers[i];
      document.removeEventListener(h.type, h.fn, h.opts);
    }
    unlockHandlers = [];
  }

  /** iOS blocks autoplay until a real gesture; pull-to-refresh was accidentally that gesture. */
  function armUnlock() {
    if (unlockArmed || globalPause || isDuckZone()) return;
    unlockArmed = true;
    var unlock = function (ev) {
      if (globalPause || isDuckZone()) return;
      if (!audio.paused) {
        disarmUnlock();
        return;
      }
      /* Never steal slider/toggle — those have their own handlers. */
      if (ev && ev.target && root.contains(ev.target)) return;
      tryPlay({ fade: true }).then(function (ok) {
        if (ok) disarmUnlock();
      });
    };
    var specs = [
      { type: 'touchstart', opts: { capture: true, passive: true } },
      { type: 'pointerdown', opts: { capture: true } },
      { type: 'click', opts: { capture: true } },
      { type: 'keydown', opts: { capture: true } }
    ];
    for (var i = 0; i < specs.length; i++) {
      (function (spec) {
        var fn = function (ev) { unlock(ev); };
        unlockHandlers.push({ type: spec.type, fn: fn, opts: spec.opts });
        document.addEventListener(spec.type, fn, spec.opts);
      })(specs[i]);
    }
  }

  function tryPlay(opts) {
    opts = opts || {};
    var doFade = opts.fade !== false;
    if (isDuckZone()) return Promise.resolve(false);
    if (globalPause) return Promise.resolve(false);
    var fromPaused = audio.paused;

    /* Build graph + resume ctx inside the same user gesture as play. */
    ensureGraph();
    var resumeP = resumeCtx();

    /* Zero gain synchronously before play so the first buffer is silent on fade-in. */
    if (doFade && fromPaused) {
      cancelFade();
      setOutputLevel(0);
    }

    return resumeP.then(function () {
      return audio.play();
    }).then(function () {
      started = true;
      wantPlay = true;
      ssSet(KEYS.started, '1');
      ssSet(KEYS.playing, '1');
      ssSet(KEYS.paused, '0');
      showControl(true);
      disarmUnlock();
      if (doFade && fromPaused) {
        setOutputLevel(0);
        requestAnimationFrame(function () {
          setOutputLevel(0);
          fadeInTo(vol, FADE_IN_MS, 0);
        });
      } else {
        setOutputLevel(vol);
      }
      syncUI();
      return true;
    }).catch(function () {
      /* Stay silent until gesture — do NOT jump to full vol here. */
      syncUI();
      armUnlock();
      return false;
    });
  }

  function pauseGlobal() {
    cancelFade();
    disarmUnlock();
    globalPause = true;
    wantPlay = false;
    ssSet(KEYS.paused, '1');
    ssSet(KEYS.playing, '0');
    audio.pause();
    persistPos();
    syncUI();
  }

  function pauseDuck() {
    cancelFade();
    audio.pause();
    persistPos();
    syncUI();
  }

  function resumeIfAllowed() {
    if (globalPause) return;
    if (!started && !wantPlay) return;
    if (isDuckZone()) return;
    wantPlay = true;
    ssSet(KEYS.playing, '1');
    tryPlay();
  }

  var toggle = root.querySelector('.seer-bed-toggle');
  toggle.addEventListener('pointerdown', function (ev) { ev.stopPropagation(); });
  toggle.addEventListener('click', function (ev) {
    ev.stopPropagation();
    if (!audio.paused) {
      pauseGlobal();
      return;
    }
    globalPause = false;
    ssSet(KEYS.paused, '0');
    if (isDuckZone()) {
      /* stay paused in duck zone but clear global pause for later resume */
      syncUI();
      return;
    }
    tryPlay({ fade: true });
  });

  var slider = root.querySelector('.seer-bed-vol');
  slider.addEventListener('pointerdown', function (ev) {
    ev.stopPropagation();
    cancelFade();
    ensureGraph();
    resumeCtx();
  });
  slider.addEventListener('touchstart', function (ev) {
    ev.stopPropagation();
    cancelFade();
    ensureGraph();
    resumeCtx();
  }, { passive: true });
  slider.addEventListener('input', function () {
    cancelFade();
    ensureGraph();
    resumeCtx();
    vol = parseFloat(slider.value);
    if (isNaN(vol)) vol = DEFAULT_VOL;
    setOutputLevel(vol);
    ssSet(KEYS.vol, vol.toFixed(2));
    if (audio.paused && !globalPause && !isDuckZone()) {
      tryPlay({ fade: false });
    }
  });

  audio.addEventListener('play', syncUI);
  audio.addEventListener('pause', syncUI);
  audio.addEventListener('timeupdate', function () {
    if (!audio.paused) persistPos();
  });
  window.addEventListener('pagehide', persistPos);
  window.addEventListener('beforeunload', persistPos);

  /* Test-only helpers (public for now). */
  window.__seerBedTest = {
    getVol: function () { return vol; },
    setVol: function (v) {
      v = parseFloat(v);
      if (isNaN(v) || v < 0 || v > 1) return;
      cancelFade();
      vol = v;
      setOutputLevel(vol);
      ssSet(KEYS.vol, vol.toFixed(2));
      var s = root.querySelector('.seer-bed-vol');
      if (s) s.value = String(vol);
    },
    getGain: function () { return getOutputLevel(); },
    isPlaying: function () { return !audio.paused && !audio.ended; },
    hasGraph: function () { return !!(useGain && gainNode && audioCtx); },
    fadeMs: FADE_IN_MS
  };

  function mount() {
    document.body.appendChild(audio);
    document.body.appendChild(root);
    showControl(false);

    if (isDuckZone()) {
      pauseDuck();
      showControl(started || visitedPortfolio);
      syncUI();
      return;
    }

    if (isPortfolioPage()) {
      showControl(true);
      /* Arm unlock first so the first finger-down starts + fades (no pull-refresh needed). */
      armUnlock();
      tryPlay({ fade: true }).then(function (ok) {
        if (!ok) showControl(true);
        syncUI();
      });
      return;
    }

    if (started && wantPlay && !globalPause) {
      armUnlock();
      tryPlay({ fade: true });
    } else if (visitedPortfolio && !globalPause) {
      showControl(true);
      armUnlock();
    }
    syncUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
