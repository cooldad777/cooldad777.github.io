/**
 * The Ensemble — public engagement puzzle (theater, not Fort Knox).
 * Daily seed from UTC date → deterministic fragments + final code.
 */
(function () {
  'use strict';

  var WORDS_A = ['TRUE', 'CLEAR', 'TAO', 'SEE', 'HONOR', 'LIGHT', 'FORM', 'SOBER'];
  var WORDS_B = ['CHECK', 'PROOF', 'SCALE', 'FACT', 'TRACE', 'METER', 'FIELD', 'GRAIN'];
  var WORDS_C = ['BUILD', 'SHIP', 'LIFT', 'SPARK', 'FORGE', 'RISE', 'OPEN', 'MAKE'];
  var SOFT_KEYS = ['see', 'through', 'real', 'beyond', 'order', 'tao', 'truth', 'clear', 'something', 'lens', 'honest'];

  function utcDateStr(d) {
    d = d || new Date();
    return d.getUTCFullYear() + '-' +
      String(d.getUTCMonth() + 1).padStart(2, '0') + '-' +
      String(d.getUTCDate()).padStart(2, '0');
  }

  function hash32(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function deriveDay(dateStr) {
    var seed = hash32('ensemble|' + dateStr + '|see-r');
    var rng = mulberry32(seed);
    var a = pick(rng, WORDS_A);
    var b = pick(rng, WORDS_B);
    var c = pick(rng, WORDS_C);
    var order = [0, 1, 2];
    for (var i = order.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = order[i];
      order[i] = order[j];
      order[j] = tmp;
    }
    var parts = [a, b, c];
    var phrase = order.map(function (ix) { return parts[ix]; }).join('·');
    var code6 = (hash32(phrase + '|' + dateStr) >>> 0).toString(36).toUpperCase().slice(0, 6).padEnd(6, 'X');

    var seq = [];
    for (var s = 0; s < 5; s++) seq.push(rng() > 0.45 ? 1 : 0);
    var nextBit = seq[3] ^ seq[4];
    var softKey = SOFT_KEYS[Math.floor(rng() * SOFT_KEYS.length)];

    return {
      dateStr: dateStr,
      fragments: { moral: a, empirical: b, moonshot: c },
      order: order,
      phrase: phrase,
      code6: code6,
      sequence: seq,
      nextBit: nextBit,
      softKey: softKey
    };
  }

  var day = deriveDay(utcDateStr());
  var state = {
    unlocked: { moral: false, empirical: false, moonshot: false },
    assembled: false
  };

  try {
    var saved = JSON.parse(sessionStorage.getItem('ensemble-' + day.dateStr) || 'null');
    if (saved && saved.unlocked) {
      state.unlocked = saved.unlocked;
      state.assembled = !!saved.assembled;
    }
  } catch (e) { /* ignore */ }

  function persist() {
    try {
      sessionStorage.setItem('ensemble-' + day.dateStr, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  function el(id) { return document.getElementById(id); }

  function setFrag(voice, text) {
    var node = el('frag-' + voice);
    if (!node) return;
    node.textContent = text;
    node.classList.add('revealed');
    node.setAttribute('aria-hidden', 'false');
  }

  function celebrate(node) {
    if (!node || !node.animate) return;
    node.animate(
      [
        { transform: 'scale(1)', filter: 'brightness(1)' },
        { transform: 'scale(1.03)', filter: 'brightness(1.08)' },
        { transform: 'scale(1)', filter: 'brightness(1)' }
      ],
      { duration: 520, easing: 'ease-out' }
    );
  }

  function showVictory(animateIn) {
    var panel = el('victory-panel');
    if (!panel) return;
    panel.hidden = false;
    var phrase = el('final-phrase');
    var code = el('final-code');
    var seed = el('seed-date');
    if (phrase) phrase.textContent = day.phrase;
    if (code) code.textContent = day.code6;
    if (seed) seed.textContent = day.dateStr + ' UTC';
    if (animateIn) celebrate(panel);
  }

  function updateProgress() {
    var n = (state.unlocked.moral ? 1 : 0) +
      (state.unlocked.empirical ? 1 : 0) +
      (state.unlocked.moonshot ? 1 : 0);
    var fill = el('progress-fill');
    var label = el('progress-label');
    if (fill) fill.style.width = ((n / 3) * 100) + '%';
    if (label) label.textContent = n + ' of 3 voices unlocked';
    document.querySelectorAll('.voice-card').forEach(function (card) {
      var v = card.getAttribute('data-voice');
      if (state.unlocked[v]) card.classList.add('is-unlocked');
    });
    var assemble = el('assemble-panel');
    if (assemble) {
      // Show assemble once moral + empirical are done (moonshot IS the order puzzle)
      assemble.hidden = !(state.unlocked.moral && state.unlocked.empirical);
    }
    document.dispatchEvent(new CustomEvent('ensemble:progress'));
    if (state.assembled) showVictory(false);
  }

  function unlock(voice) {
    if (state.unlocked[voice]) return;
    state.unlocked[voice] = true;
    setFrag(voice, day.fragments[voice]);
    persist();
    updateProgress();
    var card = document.querySelector('.voice-card[data-voice="' + voice + '"]');
    celebrate(card);
    if (document.startViewTransition) {
      try { document.startViewTransition(function () {}); } catch (e) { /* ignore */ }
    }
  }

  function initPattern() {
    var row = el('pattern-row');
    if (!row) return;
    row.innerHTML = '';
    day.sequence.forEach(function (bit) {
      var d = document.createElement('span');
      d.className = 'pattern-dot ' + (bit ? 'on' : 'off');
      d.setAttribute('aria-label', bit ? 'lit' : 'dim');
      row.appendChild(d);
    });
    var q = document.createElement('span');
    q.className = 'pattern-dot ask';
    q.textContent = '?';
    q.setAttribute('aria-label', 'next');
    row.appendChild(q);

    var choices = el('pattern-choices');
    if (!choices) return;
    choices.innerHTML = '';
    [0, 1].forEach(function (bit) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-outline-dark pattern-choice';
      btn.textContent = bit ? 'Lit' : 'Dim';
      btn.addEventListener('click', function () {
        var msg = el('pattern-msg');
        if (bit === day.nextBit) {
          if (msg) { msg.textContent = 'Pattern holds. Fragment revealed.'; msg.className = 'challenge-msg ok'; }
          unlock('moral');
          choices.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
        } else if (msg) {
          msg.textContent = 'Not that step — try the other.';
          msg.className = 'challenge-msg err';
        }
      });
      choices.appendChild(btn);
    });

    if (state.unlocked.moral) {
      setFrag('moral', day.fragments.moral);
      choices.querySelectorAll('button').forEach(function (b) { b.disabled = true; });
      var msg = el('pattern-msg');
      if (msg) { msg.textContent = 'Already unlocked this session.'; msg.className = 'challenge-msg ok'; }
    }
  }

  function initReflection() {
    var form = el('reflect-form');
    if (!form) return;
    var hintKey = el('soft-key-hint');
    if (hintKey) hintKey.textContent = day.softKey;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = el('reflect-input');
      var raw = (input && input.value || '').trim();
      var msg = el('reflect-msg');
      if (raw.length < 12) {
        if (msg) { msg.textContent = 'A little longer — one honest line.'; msg.className = 'challenge-msg err'; }
        return;
      }
      var lower = raw.toLowerCase();
      var hit = SOFT_KEYS.some(function (k) { return lower.indexOf(k) !== -1; });
      var honor = lower.indexOf(day.softKey) !== -1 || hit || raw.length >= 40;
      if (honor) {
        if (msg) { msg.textContent = 'Reflection received. Fragment revealed.'; msg.className = 'challenge-msg ok'; }
        unlock('empirical');
        if (input) input.disabled = true;
        var submit = form.querySelector('button[type="submit"]');
        if (submit) submit.disabled = true;
      } else if (msg) {
        msg.textContent = 'Close — try a line that touches seeing, truth, or looking through.';
        msg.className = 'challenge-msg err';
      }
    });

    if (state.unlocked.empirical) {
      setFrag('empirical', day.fragments.empirical);
      var input = el('reflect-input');
      if (input) { input.disabled = true; input.value = '(unlocked this session)'; }
      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      var msg = el('reflect-msg');
      if (msg) { msg.textContent = 'Already unlocked this session.'; msg.className = 'challenge-msg ok'; }
    }
  }

  function initOrder() {
    var tray = el('order-tray');
    var slots = el('order-slots');
    if (!tray || !slots) return;

    var labels = [
      { key: 0, text: day.fragments.moral, voice: 'Moral' },
      { key: 1, text: day.fragments.empirical, voice: 'Empirical' },
      { key: 2, text: day.fragments.moonshot, voice: 'Moonshot' }
    ];
    var showRng = mulberry32(hash32(day.dateStr + '|show'));
    var show = labels.slice();
    for (var i = show.length - 1; i > 0; i--) {
      var j = Math.floor(showRng() * (i + 1));
      var t = show[i];
      show[i] = show[j];
      show[j] = t;
    }

    var picked = [];

    function renderSmart() {
      var ready = state.unlocked.moral && state.unlocked.empirical;
      tray.innerHTML = '';
      slots.innerHTML = '';
      show.forEach(function (item) {
        if (picked.indexOf(item.key) !== -1) return;
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'order-chip';
        chip.textContent = ready ? item.text : '···';
        chip.dataset.key = String(item.key);
        chip.disabled = !ready || state.assembled;
        chip.title = item.voice;
        chip.addEventListener('click', function () {
          if (!ready || state.assembled) return;
          picked.push(item.key);
          renderSmart();
          if (picked.length === 3) checkOrder();
        });
        tray.appendChild(chip);
      });
      for (var s = 0; s < 3; s++) {
        var slot = document.createElement('div');
        slot.className = 'order-slot' + (picked[s] !== undefined ? ' filled' : '');
        slot.textContent = picked[s] !== undefined
          ? (labels.filter(function (x) { return x.key === picked[s]; })[0] || {}).text || '·'
          : String(s + 1);
        slots.appendChild(slot);
      }
    }

    function checkOrder() {
      var msg = el('order-msg');
      var ok = picked.length === 3 &&
        picked[0] === day.order[0] &&
        picked[1] === day.order[1] &&
        picked[2] === day.order[2];
      if (ok) {
        if (msg) { msg.textContent = 'Order locks. The Ensemble opens.'; msg.className = 'challenge-msg ok'; }
        setFrag('moonshot', day.fragments.moonshot);
        state.unlocked.moonshot = true;
        state.assembled = true;
        persist();
        updateProgress();
        showVictory(true);
        renderSmart();
      } else if (msg) {
        msg.textContent = 'Wrong sequence — clear and try another order.';
        msg.className = 'challenge-msg err';
      }
    }

    var clearBtn = el('order-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (state.assembled) return;
        picked = [];
        var msg = el('order-msg');
        if (msg) { msg.textContent = ''; msg.className = 'challenge-msg'; }
        renderSmart();
      });
    }

    document.addEventListener('ensemble:progress', renderSmart);
    renderSmart();

    if (state.unlocked.moonshot) setFrag('moonshot', day.fragments.moonshot);
    if (state.assembled) showVictory(false);
  }

  function initShare() {
    var copyBtn = el('copy-code');
    var shareBtn = el('share-win');
    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = day.phrase + ' · ' + day.code6;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            copyBtn.textContent = 'Copied';
            setTimeout(function () { copyBtn.textContent = 'Copy code'; }, 1600);
          }).catch(function () {
            copyBtn.textContent = 'Select manually';
          });
        }
      });
    }
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        var data = {
          title: 'The Ensemble — SEE, R',
          text: 'I opened the Ensemble: ' + day.phrase + ' (' + day.code6 + '). A lock one model can’t open alone.',
          url: location.href.split('#')[0]
        };
        if (navigator.share) {
          navigator.share(data).catch(function () { /* cancel */ });
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data.text + ' ' + data.url);
          shareBtn.textContent = 'Link copied';
          setTimeout(function () { shareBtn.textContent = 'Share'; }, 1600);
        }
      });
    }
  }

  function initMeta() {
    var d = el('day-seed');
    if (d) d.textContent = day.dateStr + ' UTC';
  }

  initMeta();
  initPattern();
  initReflection();
  initOrder();
  initShare();
  updateProgress();
  if (state.unlocked.moral) setFrag('moral', day.fragments.moral);
  if (state.unlocked.empirical) setFrag('empirical', day.fragments.empirical);
  if (state.unlocked.moonshot) setFrag('moonshot', day.fragments.moonshot);
})();
