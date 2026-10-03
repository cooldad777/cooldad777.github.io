/* Local interactions only. No network, no audio. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qsa(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  /* One visible panel per switch when JS runs. Without .js, CSS shows every panel. */
  function showSwitch(root, id, fromClick) {
    qsa(root, "[data-switch-btn]").forEach(function (btn) {
      var on = btn.getAttribute("data-switch-btn") === id;
      if (btn.getAttribute("role") === "tab") {
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.tabIndex = on ? 0 : -1;
      } else {
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      }
    });
    qsa(root, "[data-switch-panel]").forEach(function (panel) {
      panel.classList.toggle("is-on", panel.getAttribute("data-switch-panel") === id);
    });
    if (fromClick && id) {
      if (history.replaceState) history.replaceState(null, "", "#" + id);
    }
  }

  function bindSwitch(root) {
    var tabs = root.getAttribute("data-switch") === "tabs";
    qsa(root, "[data-switch-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        showSwitch(root, btn.getAttribute("data-switch-btn"), true);
      });
    });
    if (!tabs) return;
    var tabBtns = qsa(root, '[role="tab"]');
    root.addEventListener("keydown", function (e) {
      var keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      var i = tabBtns.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = i;
      if (e.key === "ArrowRight") next = (i + 1) % tabBtns.length;
      if (e.key === "ArrowLeft") next = (i - 1 + tabBtns.length) % tabBtns.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabBtns.length - 1;
      tabBtns[next].focus();
      showSwitch(root, tabBtns[next].getAttribute("data-switch-btn"), true);
    });
  }

  qsa(document, "[data-switch]").forEach(bindSwitch);

  var hash = (location.hash || "").replace(/^#/, "");
  if (hash) {
    var hashed = document.querySelector('[data-switch-btn="' + (window.CSS && CSS.escape ? CSS.escape(hash) : hash) + '"]');
    if (hashed) {
      var root = hashed.closest("[data-switch]");
      if (root) showSwitch(root, hash, false);
    }
  }

  /* Mobile drawer: trap focus, Escape closes, focus returns to the trigger. */
  var menuBtn = document.getElementById("menu");
  var drawer = document.getElementById("nav-links");
  var navQuery = window.matchMedia("(max-width: 760px)");

  function focusableIn(node) {
    return qsa(node, "a[href], button:not([disabled])").filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  }

  function setNav(open) {
    if (!menuBtn || !drawer) return;
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    drawer.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    if (open) {
      var nodes = focusableIn(drawer);
      if (nodes[0]) nodes[0].focus();
    } else if (navQuery.matches) {
      menuBtn.focus();
    }
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      setNav(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    var closer = drawer.querySelector(".nav-close");
    if (closer) closer.addEventListener("click", function () { setNav(false); });
    drawer.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a && navQuery.matches) setNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (menuBtn.getAttribute("aria-expanded") !== "true") return;
      if (e.key === "Escape") {
        e.preventDefault();
        setNav(false);
        return;
      }
      if (e.key !== "Tab") return;
      var nodes = focusableIn(drawer);
      if (!nodes.length) return;
      var first = nodes[0];
      var last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    navQuery.addEventListener("change", function () {
      if (!navQuery.matches) setNav(false);
    });
  }

  /* Gap nodes: sentences stay visible; pressed state is only a highlight. */
  qsa(document, ".chain button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      qsa(document, ".chain button").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
    });
  });

  /* Portfolio filter. Cards stay in the DOM; hidden is applied only after JS. */
  var shelf = document.getElementById("shelf");
  var shelfStatus = document.getElementById("shelf-status");
  qsa(document, "[data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-filter");
      qsa(document, "[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      if (!shelf) return;
      var n = 0;
      qsa(shelf, "[data-kind]").forEach(function (card) {
        var show = kind === "all" || card.getAttribute("data-kind") === kind;
        card.hidden = !show;
        if (show) n += 1;
      });
      if (shelfStatus) {
        shelfStatus.textContent = n + (n === 1 ? " public piece" : " public pieces") + " in " + btn.textContent.trim();
      }
    });
  });

  /* Timeline: mark steps as they enter. Reduced motion marks them all. */
  var steps = qsa(document, ".method li");
  if (reduce) {
    steps.forEach(function (li) { li.classList.add("is-active"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add("is-active");
      });
    }, { threshold: 0.45, rootMargin: "0px 0px -10% 0px" });
    steps.forEach(function (li) { io.observe(li); });
  } else {
    steps.forEach(function (li) { li.classList.add("is-active"); });
  }

})();
