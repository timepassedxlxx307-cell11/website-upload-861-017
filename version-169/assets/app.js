(function () {
  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  function initMenu() {
    const button = $('.menu-toggle');
    const menu = $('.mobile-menu');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      const open = menu.classList.toggle('is-open');
      menu.hidden = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      button.textContent = open ? '×' : '☰';
    });
  }

  function initHero() {
    const hero = $('.hero');
    if (!hero) {
      return;
    }
    const slides = $$('.hero-slide', hero);
    const dots = $$('.hero-controls button', hero);
    const prev = $('.hero-arrow.prev', hero);
    const next = $('.hero-arrow.next', hero);
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    const bar = $('[data-filter-bar]');
    const grid = $('[data-filter-grid]');
    if (!bar || !grid) {
      return;
    }
    const input = $('[data-filter-input]', bar);
    const year = $('[data-filter-year]', bar);
    const type = $('[data-filter-type]', bar);
    const empty = $('[data-empty-state]');
    const cards = $$('.movie-card', grid);

    function apply() {
      const q = normalize(input ? input.value : '');
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year
        ].join(' '));
        const okQuery = !q || haystack.indexOf(q) !== -1;
        const okYear = !y || card.dataset.year === y;
        const okType = !t || card.dataset.type === t;
        const show = okQuery && okYear && okType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function cardTemplate(item) {
    return [
      '<article class="movie-card" data-title="', escapeHtml(item.title), '" data-year="', escapeHtml(item.year), '" data-type="', escapeHtml(item.type), '" data-region="', escapeHtml(item.region), '" data-tags="', escapeHtml(item.tags), '">',
      '<a class="poster-link" href="./', escapeHtml(item.file), '" aria-label="', escapeHtml(item.title), '">',
      '<span class="poster-frame"><img src="', escapeHtml(item.cover), '" alt="', escapeHtml(item.title), '" loading="lazy"><span class="poster-play">▶</span></span>',
      '</a>',
      '<div class="card-body"><div class="card-meta"><span>', escapeHtml(item.year), '</span><span>', escapeHtml(item.region), '</span><span>', escapeHtml(item.type), '</span></div>',
      '<h3><a href="./', escapeHtml(item.file), '">', escapeHtml(item.title), '</a></h3>',
      '<p>', escapeHtml(item.oneLine), '</p>',
      '<div class="tag-row">', item.tagList.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join(''), '</div></div></article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function initSearchPage() {
    const grid = $('[data-search-grid]');
    const input = $('[data-search-input]');
    const type = $('[data-search-type]');
    const year = $('[data-search-year]');
    const empty = $('[data-search-empty]');
    if (!grid || !window.SEARCH_INDEX) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }

    function apply() {
      const q = normalize(input ? input.value : '');
      const t = type ? type.value : '';
      const y = year ? year.value : '';
      const matched = window.SEARCH_INDEX.filter(function (item) {
        const haystack = normalize([item.title, item.region, item.type, item.year, item.tags, item.category].join(' '));
        return (!q || haystack.indexOf(q) !== -1) && (!t || item.type === t) && (!y || item.year === y);
      });
      grid.innerHTML = matched.map(cardTemplate).join('');
      if (empty) {
        empty.style.display = matched.length ? 'none' : 'block';
      }
      initImageErrors(grid);
    }

    [input, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function initPlayer() {
    const stage = $('[data-player]');
    if (!stage) {
      return;
    }
    const video = $('video', stage);
    const layer = $('[data-play-layer]', stage);
    const button = $('[data-play-button]', stage);
    const streamUrl = stage.getAttribute('data-m3u8');
    let hls = null;
    let ready = false;

    function bind() {
      if (ready || !video || !streamUrl) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        ready = true;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        ready = true;
      } else {
        video.src = streamUrl;
        ready = true;
      }
    }

    function play() {
      bind();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', play);
    }
    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  }

  function initImageErrors(root) {
    $$('img', root || document).forEach(function (img) {
      img.addEventListener('error', function () {
        img.style.opacity = '0';
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
    initImageErrors(document);
  });
})();
