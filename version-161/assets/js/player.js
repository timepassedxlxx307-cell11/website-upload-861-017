function initMoviePlayer(options) {
    var root = document.getElementById(options.id);
    if (!root) {
        return;
    }

    var video = root.querySelector('video');
    var overlay = root.querySelector('.player-overlay');
    var startButton = root.querySelector('.player-start');
    var loaded = false;
    var hls = null;

    function attachSource() {
        if (loaded || !video) {
            return;
        }

        loaded = true;
        var source = options.source;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function startPlayback() {
        attachSource();
        hideOverlay();
        video.setAttribute('controls', 'controls');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (startButton) {
        startButton.addEventListener('click', function (event) {
            event.preventDefault();
            startPlayback();
        });
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!loaded || video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', hideOverlay);
    }

    window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}
