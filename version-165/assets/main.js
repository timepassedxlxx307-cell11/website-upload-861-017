const currentScript = document.currentScript;
const assetBase = currentScript && currentScript.src ? currentScript.src.replace(/[^/]*$/, '') : './assets/';

const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
        mobileNav.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let activeIndex = 0;

    const showSlide = (index) => {
        activeIndex = index;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
        window.setInterval(() => {
            showSlide((activeIndex + 1) % slides.length);
        }, 5600);
    }
}

const searchPage = document.querySelector('[data-search-page]');

if (searchPage) {
    const input = searchPage.querySelector('[data-filter-input]');
    const categorySelect = searchPage.querySelector('[data-filter-category]');
    const regionSelect = searchPage.querySelector('[data-filter-region]');
    const yearSelect = searchPage.querySelector('[data-filter-year]');
    const cards = Array.from(searchPage.querySelectorAll('.movie-card'));
    const regions = Array.from(new Set(cards.map((card) => card.dataset.region).filter(Boolean))).sort();
    const years = Array.from(new Set(cards.map((card) => card.dataset.year).filter(Boolean))).sort((a, b) => String(b).localeCompare(String(a)));

    regions.forEach((region) => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });

    years.forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q') || '';

    if (input && queryFromUrl) {
        input.value = queryFromUrl;
    }

    const applyFilters = () => {
        const query = (input.value || '').trim().toLowerCase();
        const category = categorySelect.value;
        const region = regionSelect.value;
        const year = yearSelect.value;

        cards.forEach((card) => {
            const text = (card.dataset.search || '').toLowerCase();
            const matchedQuery = !query || text.includes(query);
            const matchedCategory = !category || card.dataset.category === category;
            const matchedRegion = !region || card.dataset.region === region;
            const matchedYear = !year || card.dataset.year === year;
            card.hidden = !(matchedQuery && matchedCategory && matchedRegion && matchedYear);
        });
    };

    [input, categorySelect, regionSelect, yearSelect].forEach((control) => {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
    });

    applyFilters();
}

let hlsPromise = null;

const loadHls = () => {
    if (window.Hls) {
        return Promise.resolve(window.Hls);
    }

    if (hlsPromise) {
        return hlsPromise;
    }

    hlsPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = assetBase + 'hls-lib.js';
        script.onload = () => resolve(window.Hls);
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return hlsPromise;
};

const preparePlayers = () => {
    const players = Array.from(document.querySelectorAll('[data-stream]'));

    players.forEach((player) => {
        const video = player.querySelector('video');
        const button = player.querySelector('[data-play]');
        const source = player.dataset.stream;
        let initialized = false;

        const startPlayback = async () => {
            if (!video || !source) {
                return;
            }

            player.classList.add('is-active');

            if (!initialized) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    const Hls = await loadHls();
                    if (Hls && Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                }
                initialized = true;
            }

            try {
                await video.play();
            } catch (error) {
                player.classList.remove('is-active');
            }
        };

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', () => {
                if (video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', () => player.classList.add('is-active'));
            video.addEventListener('pause', () => {
                if (!video.seeking) {
                    player.classList.remove('is-active');
                }
            });
        }
    });
};

preparePlayers();
