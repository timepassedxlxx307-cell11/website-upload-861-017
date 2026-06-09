(function () {
    var configNode = document.getElementById('playerConfig');
    var video = document.querySelector('[data-player]');
    var playButton = document.querySelector('[data-play-button]');

    if (!configNode || !video) {
        return;
    }

    var config = {};

    try {
        config = JSON.parse(configNode.textContent || '{}');
    } catch (error) {
        config = {};
    }

    if (config.poster) {
        video.setAttribute('poster', config.poster);
    }

    if (config.stream) {
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(config.stream);
            hls.attachMedia(video);
            window.addEventListener('beforeunload', function () {
                hls.destroy();
            });
        } else {
            video.src = config.stream;
        }
    }

    function updateButton() {
        if (!playButton) {
            return;
        }
        playButton.classList.toggle('is-playing', !video.paused);
        playButton.textContent = video.paused ? '立即播放' : '播放中';
    }

    function togglePlay() {
        if (video.paused) {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        } else {
            video.pause();
        }
    }

    if (playButton) {
        playButton.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', function (event) {
        if (event.target === video) {
            togglePlay();
        }
    });
    video.addEventListener('play', updateButton);
    video.addEventListener('pause', updateButton);
    video.addEventListener('ended', updateButton);
    updateButton();
})();
