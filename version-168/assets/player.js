(function () {
  function initPlayer() {
    var shell = document.querySelector('[data-player]');
    if (!shell) return;
    var video = shell.querySelector('video');
    var overlay = shell.querySelector('[data-play-overlay]');
    if (!video) return;
    var source = video.getAttribute('data-stream');
    var hls = null;
    var attached = false;

    function attach() {
      if (attached || !source) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function showOverlay() {
      if (overlay) overlay.hidden = false;
      shell.classList.remove('is-playing');
    }

    function hideOverlay() {
      if (overlay) overlay.hidden = true;
      shell.classList.add('is-playing');
    }

    function play() {
      attach();
      hideOverlay();
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          showOverlay();
        });
      }
    }

    if (overlay) overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) play();
    });
    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (!video.ended) showOverlay();
    });
    video.addEventListener('ended', showOverlay);
    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', initPlayer);
})();
