(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards(term) {
    var list = document.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var query = normalize(term);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var matched = !query || haystack.indexOf(query) !== -1;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  var libraryForm = document.querySelector('[data-library-search]');
  var localSearch = document.querySelector('[data-local-search]');
  var queryValue = getQueryValue('q');

  if (libraryForm) {
    var libraryInput = libraryForm.querySelector('input[name="q"]');
    if (libraryInput) {
      libraryInput.value = queryValue;
    }
    filterCards(queryValue);
    libraryForm.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(libraryInput ? libraryInput.value : '');
    });
  }

  if (localSearch) {
    var localInput = localSearch.querySelector('input');
    localSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      filterCards(localInput ? localInput.value : '');
    });
    if (localInput) {
      localInput.addEventListener('input', function () {
        filterCards(localInput.value);
      });
    }
  }

  var chipBox = document.querySelector('[data-filter-chips]');
  if (chipBox) {
    chipBox.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-filter]');
      if (!button) {
        return;
      }
      chipBox.querySelectorAll('button').forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      filterCards(button.getAttribute('data-filter'));
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')));
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    startHero();
  }

  function attachPlayer(player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play]');
    var src = player.getAttribute('data-video');
    var ready = false;
    var hls = null;

    if (!video || !overlay || !src) {
      return;
    }

    function loadVideo() {
      if (ready) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
      ready = true;
    }

    function playVideo() {
      overlay.classList.add('is-hidden');
      loadVideo();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.cinema-player[data-video]').forEach(attachPlayer);
}());
