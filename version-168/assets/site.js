(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-site-nav]');
    if (!button || !nav) return;
    button.addEventListener('click', function () {
      nav.classList.toggle('nav-open');
    });
  }

  function setupHero() {
    qsa('[data-hero]').forEach(function (hero) {
      var slides = qsa('[data-hero-slide]', hero);
      var dots = qsa('[data-hero-dot]', hero);
      if (!slides.length) return;
      var index = 0;
      var timer = null;

      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) window.clearInterval(timer);
      }

      var prev = qs('[data-hero-prev]', hero);
      var next = qs('[data-hero-next]', hero);
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    });
  }

  function setupFilters() {
    var cards = qsa('[data-movie-card]');
    if (!cards.length) return;
    var search = qs('[data-filter-search]');
    var region = qs('[data-filter-region]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');
    var empty = qs('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (search && initial) search.value = initial;

    function apply() {
      var query = text(search && search.value);
      var regionValue = text(region && region.value);
      var typeValue = text(type && type.value);
      var yearValue = text(year && year.value);
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = text([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchRegion = !regionValue || text(card.dataset.region).indexOf(regionValue) !== -1 || text(card.dataset.tags).indexOf(regionValue) !== -1;
        var matchType = !typeValue || text(card.dataset.type).indexOf(typeValue) !== -1 || text(card.dataset.tags).indexOf(typeValue) !== -1;
        var matchYear = !yearValue || text(card.dataset.year) === yearValue;
        var ok = matchQuery && matchRegion && matchType && matchYear;
        card.hidden = !ok;
        if (ok) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    }

    [search, region, type, year].forEach(function (control) {
      if (control) control.addEventListener('input', apply);
      if (control) control.addEventListener('change', apply);
    });
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
