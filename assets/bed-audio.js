/**
 * SEE, R — Portfolio bed audio (sitewide chrome)
 * Settled: PORTFOLIO-AUDIO.md · HUB-IA-2026-09-29.md
 * No Spotify. sessionStorage persistence. Duck /faded-dependence/ (+ future /halo-cut/).
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
  audio.loop = true;
  audio.src = audioSrc;

  var started = ssGet(KEYS.started) === '1';
  var globalPause = ssGet(KEYS.paused) === '1';
  var wantPlay = ssGet(KEYS.playing) === '1';
  var vol = parseFloat(ssGet(KEYS.vol));
  if (isNaN(vol) || vol < 0 || vol > 1) vol = DEFAULT_VOL;
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


  function cancelFade() {
    if (fadeRaf != null) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
  }

  /** Ease-out cubic from current volume to target over ms. Slider stays at target. */
  function fadeInTo(target, ms) {
    cancelFade();
    if (ms <= 0) {
      audio.volume = target;
      return;
    }
    var from = audio.volume;
    var start = performance.now();
    var sliderEl = root.querySelector('.seer-bed-vol');
    if (sliderEl) sliderEl.value = String(target);
    function frame(now) {
      var t = Math.min(1, (now - start) / ms);
      var e = 1 - Math.pow(1 - t, 3);
      audio.volume = from + (target - from) * e;
      if (t < 1) {
        fadeRaf = requestAnimationFrame(frame);
      } else {
        fadeRaf = null;
        audio.volume = target;
      }
    }
    fadeRaf = requestAnimationFrame(frame);
  }

  function tryPlay() {
    if (isDuckZone()) return Promise.resolve(false);
    if (globalPause) return Promise.resolve(false);
    var fromPaused = audio.paused;
    if (fromPaused) audio.volume = 0;
    return audio.play().then(function () {
      started = true;
      wantPlay = true;
      ssSet(KEYS.started, '1');
      ssSet(KEYS.playing, '1');
      ssSet(KEYS.paused, '0');
      showControl(true);
      if (fromPaused) fadeInTo(vol, FADE_IN_MS);
      else audio.volume = vol;
      syncUI();
      return true;
    }).catch(function () {
      audio.volume = vol;
      syncUI();
      return false;
    });
  }

  function pauseGlobal() {
    cancelFade();
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
  toggle.addEventListener('click', function () {
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
    tryPlay();
  });

  var slider = root.querySelector('.seer-bed-vol');
  slider.addEventListener('input', function () {
    cancelFade();
    vol = parseFloat(slider.value);
    if (isNaN(vol)) vol = DEFAULT_VOL;
    audio.volume = vol;
    ssSet(KEYS.vol, vol.toFixed(2));
  });

  audio.addEventListener('play', syncUI);
  audio.addEventListener('pause', syncUI);
  audio.addEventListener('timeupdate', function () {
    if (!audio.paused) persistPos();
  });
  window.addEventListener('pagehide', persistPos);
  window.addEventListener('beforeunload', persistPos);

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
      /* Try play on Portfolio entry; browsers may block without gesture */
      tryPlay().then(function (ok) {
        if (!ok) {
          showControl(true);
          /* First tap/click/key anywhere unlocks bed (autoplay policy) */
          var unlock = function () {
            document.removeEventListener('pointerdown', unlock, true);
            document.removeEventListener('keydown', unlock, true);
            if (globalPause) return;
            tryPlay();
          };
          document.addEventListener('pointerdown', unlock, true);
          document.addEventListener('keydown', unlock, true);
        }
        syncUI();
      });
      return;
    }

    if (started && wantPlay && !globalPause) {
      tryPlay();
    }
    syncUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
