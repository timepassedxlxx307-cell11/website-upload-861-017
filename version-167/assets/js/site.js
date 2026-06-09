(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav]');

    if (navToggle && nav) {
        navToggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(nextIndex) {
        if (!slides.length) {
            return;
        }

        activeSlide = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, index) {
            slide.classList.toggle('is-active', index === activeSlide);
        });

        dots.forEach(function (dot, index) {
            dot.classList.toggle('is-active', index === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5600);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function getFilterState(root) {
        var active = root.querySelector('[data-filter-button].is-active');
        if (!active) {
            return '';
        }
        return normalizeText(active.getAttribute('data-filter-value'));
    }

    function applyFilter(root, query) {
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card]'));
        var keyword = normalizeText(query);
        var filterValue = getFilterState(root);

        cards.forEach(function (card) {
            var searchText = normalizeText(card.textContent + ' ' + (card.getAttribute('data-search') || ''));
            var typeText = normalizeText(card.getAttribute('data-type'));
            var regionText = normalizeText(card.getAttribute('data-region'));
            var categoryText = normalizeText(card.getAttribute('data-category'));
            var matchedKeyword = !keyword || searchText.indexOf(keyword) !== -1;
            var matchedFilter = !filterValue || searchText.indexOf(filterValue) !== -1 || typeText.indexOf(filterValue) !== -1 || regionText.indexOf(filterValue) !== -1 || categoryText.indexOf(filterValue) !== -1;
            card.classList.toggle('hidden-card', !(matchedKeyword && matchedFilter));
        });
    }

    searchInputs.forEach(function (input) {
        var selector = input.getAttribute('data-target');
        var root = selector ? document.querySelector(selector) : document;

        if (!root) {
            root = document;
        }

        input.addEventListener('input', function () {
            applyFilter(root, input.value);
        });
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var rootSelector = button.getAttribute('data-filter-root');
            var root = rootSelector ? document.querySelector(rootSelector) : document;
            var group = button.getAttribute('data-filter-group') || 'default';

            filterButtons.forEach(function (item) {
                if ((item.getAttribute('data-filter-group') || 'default') === group) {
                    item.classList.remove('is-active');
                }
            });

            button.classList.add('is-active');

            var input = root ? root.querySelector('[data-site-search]') : document.querySelector('[data-site-search]');
            applyFilter(root || document, input ? input.value : '');
        });
    });

    var player = document.querySelector('[data-player]');

    if (player) {
        var video = player.querySelector('video');
        var cover = player.querySelector('[data-player-cover]');
        var playButton = player.querySelector('[data-play-button]');
        var started = false;
        var hls = null;

        function begin() {
            if (!video) {
                return;
            }

            var stream = video.getAttribute('data-stream');

            if (!started && stream) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.src = stream;
                    video.play().catch(function () {});
                }
                started = true;
            } else {
                video.play().catch(function () {});
            }

            video.setAttribute('controls', 'controls');

            if (cover) {
                cover.classList.add('is-hidden');
            }
        }

        if (cover) {
            cover.addEventListener('click', begin);
        }

        if (playButton) {
            playButton.addEventListener('click', function (event) {
                event.stopPropagation();
                begin();
            });
        }

        video.addEventListener('click', function () {
            if (!started || video.paused) {
                begin();
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
})();
