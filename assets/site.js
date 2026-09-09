(function () {
  var toggle = document.getElementById('menu-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
})();

/* Idea Garden — maturity filter chips (seed-card or idea-row) */
(function () {
  var filters = document.getElementById('garden-filters');
  if (!filters) return;
  var empty = document.getElementById('nursery-empty');

  function cards() {
    return document.querySelectorAll('#nursery-cards .seed-card, #nursery-cards .idea-row');
  }

  function apply(maturity) {
    var list = cards();
    var shown = 0;
    for (var i = 0; i < list.length; i++) {
      var m = list[i].getAttribute('data-maturity') || '';
      var match = maturity === 'all' || m === maturity;
      list[i].hidden = !match;
      if (match) shown++;
    }
    if (empty) empty.hidden = shown > 0;
  }

  filters.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-maturity]');
    if (!btn) return;
    var chips = filters.querySelectorAll('.filter-chip');
    for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
    btn.classList.add('active');
    apply(btn.getAttribute('data-maturity'));
  });
})();
