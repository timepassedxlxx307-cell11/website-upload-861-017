(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(index);
                play();
            });
        });

        play();
    }

    function setupFilters() {
        var items = Array.prototype.slice.call(document.querySelectorAll("[data-filter-item]"));
        if (!items.length) {
            return;
        }
        var input = document.querySelector("[data-search-input]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var activeValue = "all";

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");
            if (query) {
                input.value = query;
            }
        }

        function matches(item, query, value) {
            var haystack = [
                item.getAttribute("data-title") || "",
                item.getAttribute("data-year") || "",
                item.getAttribute("data-type") || "",
                item.getAttribute("data-category") || ""
            ].join(" ").toLowerCase();
            var queryOk = !query || haystack.indexOf(query) !== -1;
            var valueOk = value === "all" || haystack.indexOf(value.toLowerCase()) !== -1;
            return queryOk && valueOk;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var visible = 0;
            items.forEach(function (item) {
                var ok = matches(item, query, activeValue);
                item.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeValue = chip.getAttribute("data-filter-value") || "all";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                apply();
            });
        });

        apply();
    }

    window.initializeMoviePlayer = function (source) {
        ready(function () {
            var video = document.querySelector(".js-movie-video");
            var overlay = document.querySelector(".js-player-overlay");
            var shell = document.querySelector(".js-player-shell");
            if (!video || !overlay || !shell || !source) {
                return;
            }

            var loaded = false;
            var hls = null;

            function attach() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function start() {
                attach();
                overlay.classList.add("is-hidden");
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            overlay.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });

            shell.addEventListener("click", function (event) {
                if (!loaded && event.target !== video) {
                    start();
                }
            });

            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    };

    ready(function () {
        setupNavigation();
        setupHeroSlider();
        setupFilters();
    });
})();
