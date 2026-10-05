/* SEER Solutions V3 — local interaction only; no network calls. */
(function () {
  "use strict";

  function qsa(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  var menuBtn = document.getElementById("menu");
  var drawer = document.getElementById("nav-links");
  var navQuery = window.matchMedia("(max-width: 1080px)");

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
      if (nodes.length) nodes[0].focus();
    } else if (navQuery.matches) {
      menuBtn.focus();
    }
  }

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", function () {
      setNav(menuBtn.getAttribute("aria-expanded") !== "true");
    });

    var closeBtn = drawer.querySelector(".nav-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        setNav(false);
      });
    }

    drawer.addEventListener("click", function (event) {
      if (event.target.closest("a") && navQuery.matches) setNav(false);
    });

    document.addEventListener("keydown", function (event) {
      if (menuBtn.getAttribute("aria-expanded") !== "true") return;

      if (event.key === "Escape") {
        event.preventDefault();
        setNav(false);
        return;
      }

      if (event.key !== "Tab") return;

      var nodes = focusableIn(drawer);
      if (!nodes.length) return;

      var first = nodes[0];
      var last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    navQuery.addEventListener("change", function () {
      if (!navQuery.matches) setNav(false);
    });
  }

  var roleRoot = document.querySelector("[data-role-switch]");

  if (roleRoot) {
    var roleButtons = qsa(roleRoot, "[data-role-btn]");
    var rolePanels = qsa(roleRoot, "[data-role-panel]");

    function showRole(id, moveFocus) {
      roleButtons.forEach(function (button) {
        var active = button.getAttribute("data-role-btn") === id;
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
        if (active && moveFocus) button.focus();
      });

      rolePanels.forEach(function (panel) {
        panel.classList.toggle("is-on", panel.getAttribute("data-role-panel") === id);
      });
    }

    roleButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        showRole(button.getAttribute("data-role-btn"), false);
      });
    });

    roleRoot.addEventListener("keydown", function (event) {
      if (["ArrowRight", "ArrowLeft", "Home", "End"].indexOf(event.key) === -1) return;

      var index = roleButtons.indexOf(document.activeElement);
      if (index < 0) return;

      event.preventDefault();
      var next = index;

      if (event.key === "ArrowRight") next = (index + 1) % roleButtons.length;
      if (event.key === "ArrowLeft") next = (index - 1 + roleButtons.length) % roleButtons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = roleButtons.length - 1;

      showRole(roleButtons[next].getAttribute("data-role-btn"), true);
    });
  }
})();