(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        const button = document.querySelector(".mobile-toggle");
        const panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                const input = form.querySelector("input[name='q'], input[type='search']");
                const value = input ? input.value.trim() : "";
                const query = value ? "?q=" + encodeURIComponent(value) : "";
                window.location.href = "./all-movies.html" + query;
            });
        });
    }

    function setupLocalFilters() {
        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";
        document.querySelectorAll("[data-local-filter]").forEach(function (form) {
            const input = form.querySelector("input[type='search']");
            const scope = document.querySelector(".filter-scope");
            if (!input || !scope) {
                return;
            }
            if (initial) {
                input.value = initial;
            }
            function apply() {
                const value = input.value.trim().toLowerCase();
                scope.querySelectorAll(".library-card").forEach(function (card) {
                    const text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    card.classList.toggle("filter-hidden", value !== "" && text.indexOf(value) === -1);
                });
            }
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            input.addEventListener("input", apply);
            apply();
        });
    }

    function setupHero() {
        const carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
        const previous = carousel.querySelector("[data-hero-prev]");
        const next = carousel.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        let current = 0;
        let timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === current);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupLocalFilters();
        setupHero();
    });
}());
