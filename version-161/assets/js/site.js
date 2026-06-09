(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function escapeHTML(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
        if (!slides.length) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(next) {
            slides[index].classList.remove('is-active');
            if (dots[index]) {
                dots[index].classList.remove('is-active');
            }
            index = next;
            slides[index].classList.add('is-active');
            if (dots[index]) {
                dots[index].classList.add('is-active');
            }
        }

        function play() {
            timer = window.setInterval(function () {
                show((index + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(dotIndex);
                play();
            });
        });

        play();
    }

    function initSearchPage() {
        var results = document.querySelector('[data-search-results]');
        var input = document.querySelector('[data-search-input]');
        var count = document.querySelector('[data-search-count]');
        if (!results || typeof MovieCatalog === 'undefined') {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();
        if (input) {
            input.value = query;
        }

        var normalized = query.toLowerCase();
        var list = MovieCatalog.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                movie.category,
                (movie.tags || []).join(' '),
                movie.oneLine,
                movie.summary
            ].join(' ').toLowerCase();
            return text.indexOf(normalized) !== -1;
        }).slice(0, 240);

        if (count) {
            count.textContent = query ? '找到 ' + list.length + ' 条相关影片' : '展示 ' + list.length + ' 条精选影片';
        }

        if (!list.length) {
            results.innerHTML = '<div class="empty-state">没有找到匹配内容，请尝试其他关键词。</div>';
            return;
        }

        results.innerHTML = list.map(function (movie) {
            return [
                '<article class="movie-card">',
                '    <a class="poster" href="' + escapeHTML(movie.url) + '">',
                '        <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + ' 在线观看" loading="lazy">',
                '        <span class="quality-badge">高清</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="movie-meta-line">',
                '            <span>' + escapeHTML(movie.year) + '</span>',
                '            <span>' + escapeHTML(movie.region) + '</span>',
                '            <span>' + escapeHTML(movie.type) + '</span>',
                '        </div>',
                '        <h3><a href="' + escapeHTML(movie.url) + '">' + escapeHTML(movie.title) + '</a></h3>',
                '        <p>' + escapeHTML(movie.oneLine || movie.summary) + '</p>',
                '        <div class="tag-row"><span>' + escapeHTML(movie.category) + '</span><span>' + escapeHTML(movie.genre) + '</span></div>',
                '    </div>',
                '</article>'
            ].join('');
        }).join('');
    }

    ready(function () {
        initMenu();
        initHero();
        initSearchPage();
    });
})();
