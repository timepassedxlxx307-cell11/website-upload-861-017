(function() {
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.querySelector(".nav-panel");
  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var active = 0;
    var timer = null;
    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }
    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        showSlide(i);
        startTimer();
      });
    });
    if (slides.length > 1) {
      startTimer();
    }
  }

  var filterBar = document.querySelector("[data-filter-bar]");
  var cardGrid = document.querySelector("[data-card-grid]");
  if (filterBar && cardGrid) {
    var input = filterBar.querySelector(".local-filter");
    var chips = Array.prototype.slice.call(filterBar.querySelectorAll(".filter-chip"));
    var cards = Array.prototype.slice.call(cardGrid.querySelectorAll(".movie-card"));
    var type = "all";
    function applyFilter() {
      var q = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function(card) {
        var text = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.genre, card.dataset.type].join(" ").toLowerCase();
        var matchText = !q || text.indexOf(q) !== -1;
        var matchType = type === "all" || (card.dataset.type || "").indexOf(type) !== -1;
        card.classList.toggle("card-hidden", !(matchText && matchType));
      });
    }
    if (input) {
      input.addEventListener("input", applyFilter);
    }
    chips.forEach(function(chip) {
      chip.addEventListener("click", function() {
        chips.forEach(function(item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        type = chip.dataset.type || "all";
        applyFilter();
      });
    });
  }

  var resultBox = document.querySelector("[data-search-results]");
  if (resultBox && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    var titleBox = document.querySelector("[data-search-title]");
    var pageInput = document.querySelector(".search-page-form input[name='q']");
    if (pageInput) {
      pageInput.value = keyword;
    }
    function escapeHtml(value) {
      return String(value || "").replace(/[&<>\"]/g, function(ch) {
        return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"}[ch];
      });
    }
    function card(item) {
      var tags = (item.tags || []).slice(0, 3).map(function(tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");
      return "<article class=\"movie-card\">" +
        "<a class=\"poster-link\" href=\"./" + item.file + "\" aria-label=\"观看" + escapeHtml(item.title) + "\">" +
        "<img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">" +
        "<span class=\"poster-shade\"></span><span class=\"play-pill\">立即观看</span></a>" +
        "<div class=\"movie-card-body\"><div class=\"movie-meta-line\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>" +
        "<h3><a href=\"./" + item.file + "\">" + escapeHtml(item.title) + "</a></h3>" +
        "<p>" + escapeHtml(item.oneLine) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
    }
    var results = window.MOVIE_INDEX;
    if (keyword) {
      var lower = keyword.toLowerCase();
      results = results.filter(function(item) {
        return [item.title, item.year, item.region, item.type, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase().indexOf(lower) !== -1;
      });
    } else {
      results = results.slice(0, 48);
    }
    if (titleBox) {
      titleBox.textContent = keyword ? "搜索结果：" + keyword : "热门内容";
    }
    resultBox.innerHTML = results.slice(0, 240).map(card).join("");
  }
}());
