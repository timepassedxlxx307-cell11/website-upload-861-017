(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var searchForms = document.querySelectorAll('[data-search-form]');
    searchForms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('[data-global-query]');
            var query = input ? input.value.trim() : '';
            if (query) {
                window.location.href = 'library.html?q=' + encodeURIComponent(query);
            } else {
                window.location.href = 'library.html';
            }
        });
    });

    var hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startAuto() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAuto();
            });
        });

        showSlide(0);
        startAuto();
    }

    function normalizeText(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applyFilter(input) {
        var section = input.closest('section') || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
        var emptyState = section.querySelector('[data-empty-state]');
        var query = normalizeText(input.value);
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalizeText(card.getAttribute('data-search'));
            var matched = !query || haystack.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    var filters = document.querySelectorAll('[data-local-filter]');
    filters.forEach(function (input) {
        input.addEventListener('input', function () {
            applyFilter(input);
        });
    });

    var libraryInput = document.querySelector('[data-library-search]');
    if (libraryInput) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            libraryInput.value = query;
            document.querySelectorAll('[data-global-query]').forEach(function (globalInput) {
                globalInput.value = query;
            });
            applyFilter(libraryInput);
        }
    }
})();
