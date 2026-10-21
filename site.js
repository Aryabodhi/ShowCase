(function () {
  var CONFIG = {
    phone: "9822774003",
    whatsapp: "9822774003",
    // Free key from https://www.callmebot.com/blog/free-api-whatsapp-messages/ — it is tied to the
    // `whatsapp` number above and can only send messages to that number.
    callmebotApiKey: "",
    address: ["Kasturba Road, near Pataleshwar Mandir, opposite Bharat Petroleum", "Bazar Ward, Chandrapur 442402"],
    mapQuery: "i-Expert Kasturba Road Chandrapur Maharashtra",
    googleUrl: "https://share.google/Hse1YJZSvR1mBke1q",
    googlePlaceId: "",
    // Leave empty until you copy the real number from the Google listing.
    rating: "",
    reviewCount: "",
    // Replace these with real reviews copied from Google, then set sample: false.
    reviews: [
      { author: "Customer name", stars: 5, sample: true, text: "Front glass on my iPhone was shattered. Fixed the same evening and it looks new." },
      { author: "Customer name", stars: 5, sample: true, text: "Sent a photo on WhatsApp, got the price straight away. No surprises at pickup." },
      { author: "Customer name", stars: 5, sample: true, text: "Back glass replaced cleanly. Camera and wireless charging work fine." },
    ],
  };

  var lang = "en";

  function digits(v) {
    return (v || "").replace(/\D/g, "");
  }

  function waNumber() {
    var d = digits(CONFIG.whatsapp);
    return d.length === 10 ? "91" + d : d;
  }

  function prettyPhone(v) {
    var d = digits(v).slice(-10);
    return "+91 " + d.slice(0, 5) + " " + d.slice(5);
  }

  function t(key) {
    return window.IExpertI18n ? window.IExpertI18n.t(lang, key) : key;
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function chatUrl(message) {
    var text = message ? encodeURIComponent(message) : "";
    if (isMobile()) {
      return "https://wa.me/" + waNumber() + (text ? "?text=" + text : "");
    }
    return "https://web.whatsapp.com/send?phone=" + waNumber() + (text ? "&text=" + text : "");
  }

  function ticketNo() {
    var el = document.getElementById("ticket-no");
    return el ? el.textContent : "";
  }

  function bookingMessage(f) {
    var lines = ["New repair booking from the website", "Ticket: " + ticketNo()];
    if (f.name) lines.push("Name: " + f.name);
    lines.push("Mobile: " + prettyPhone(f.phone));
    lines.push("Phone: " + f.device);
    lines.push("Problem: " + f.issue);
    if (f.time) lines.push("Coming: " + f.time);
    lines.push("Language: " + lang.toUpperCase());
    return lines.join("\n");
  }

  function sendToShop(message) {
    if (!CONFIG.callmebotApiKey) return Promise.reject(new Error("WhatsApp sending is not configured"));
    var url =
      "https://api.callmebot.com/whatsapp.php?phone=%2B" + waNumber() +
      "&text=" + encodeURIComponent(message) +
      "&apikey=" + encodeURIComponent(CONFIG.callmebotApiKey);
    // CallMeBot sends no CORS headers, so the response is opaque; only network failures reject.
    return fetch(url, { mode: "no-cors", cache: "no-store" });
  }

  function wireContact() {
    document.querySelectorAll("[data-wa-chat]").forEach(function (el) {
      el.href = chatUrl("");
      el.target = "_blank";
      el.rel = "noopener noreferrer";
    });
    document.querySelectorAll("[data-wa-number]").forEach(function (el) {
      el.textContent = prettyPhone(CONFIG.whatsapp);
    });
    document.querySelectorAll("[data-call]").forEach(function (el) {
      if (!CONFIG.phone) {
        el.hidden = true;
        return;
      }
      el.href = "tel:+91" + digits(CONFIG.phone).slice(-10);
    });
    document.querySelectorAll("[data-google]").forEach(function (el) {
      el.href = CONFIG.googleUrl;
    });
    document.querySelectorAll("[data-google-write]").forEach(function (el) {
      el.href = CONFIG.googlePlaceId
        ? "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(CONFIG.googlePlaceId)
        : CONFIG.googleUrl;
    });
    document.querySelectorAll("[data-address]").forEach(function (el) {
      el.innerHTML = CONFIG.address.join("<br>");
    });
    document.querySelectorAll("[data-address-inline]").forEach(function (el) {
      el.textContent = CONFIG.address[0] + ", Chandrapur";
    });
  }

  function stars(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆";
    return s;
  }

  function renderReviews() {
    var rating = document.getElementById("reviews-rating");
    if (rating && CONFIG.rating) {
      rating.hidden = false;
      rating.innerHTML =
        '<span class="rating-num">' + CONFIG.rating + "</span>" +
        '<span class="rating-stars" aria-hidden="true">' + stars(Math.round(parseFloat(CONFIG.rating))) + "</span>" +
        '<span class="rating-meta">' + (CONFIG.reviewCount ? CONFIG.reviewCount + " " : "") + "Google</span>";
    }
    var list = document.getElementById("reviews-list");
    if (!list) return;
    list.innerHTML = "";
    CONFIG.reviews.forEach(function (r) {
      var q = document.createElement("blockquote");
      q.className = "quote" + (r.sample ? " quote-sample" : "");
      var flag = r.sample ? '<span class="sample-flag">' + t("reviews.sample") + "</span>" : "";
      q.innerHTML =
        flag +
        '<span class="quote-stars" aria-label="' + r.stars + ' / 5">' + stars(r.stars) + "</span>" +
        "<p></p><footer></footer>";
      q.querySelector("p").textContent = r.text;
      q.querySelector("footer").textContent = r.author;
      list.appendChild(q);
    });
  }

  function updateMap() {
    var map = document.getElementById("map");
    if (!map) return;
    map.src =
      "https://maps.google.com/maps?q=" + encodeURIComponent(CONFIG.mapQuery) +
      "&z=16&hl=" + lang + "&output=embed";
  }

  function initCompare() {
    var box = document.querySelector(".compare");
    if (!box) return;
    var range = box.querySelector(".compare-range");

    function set(v) {
      box.style.setProperty("--pos", v + "%");
    }

    range.addEventListener("input", function () {
      set(range.value);
    });

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) {
      var from = 92;
      var to = 50;
      var start = null;
      set(from);
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / 1400);
        var v = from + (to - from) * (1 - Math.pow(1 - p, 3));
        set(v);
        range.value = Math.round(v);
        if (p < 1) requestAnimationFrame(step);
      };
      setTimeout(function () {
        requestAnimationFrame(step);
      }, 500);
    }

    document.querySelectorAll("[data-view-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        box.setAttribute("data-view", btn.getAttribute("data-view-btn"));
        document.querySelectorAll("[data-view-btn]").forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
      });
    });
  }

  function syncCanonical() {
    var link = document.querySelector('link[rel="canonical"]');
    if (!link || link.href.indexOf("SITE_URL") !== -1) return;
    var base = link.href.split("?")[0];
    link.href = lang === "en" ? base : base + "?lang=" + lang;
  }

  function newTicket() {
    var no = document.getElementById("ticket-no");
    if (no) no.textContent = "IE-" + (1000 + Math.floor(Math.random() * 9000));
  }

  function initBooking() {
    newTicket();
    var form = document.getElementById("book-form");
    if (!form) return;
    var body = form.querySelector(".ticket-body");
    var done = document.getElementById("book-done");
    var fallback = document.getElementById("book-fallback");
    var opened = document.getElementById("book-opened");
    var submit = document.getElementById("book-submit");
    var phone = document.getElementById("book-phone");
    var phoneError = document.getElementById("book-phone-error");

    function show(panel) {
      body.hidden = panel !== body;
      done.hidden = panel !== done;
      fallback.hidden = panel !== fallback;
      opened.hidden = panel !== opened;
    }

    document.querySelectorAll("[data-book]").forEach(function (link) {
      link.addEventListener("click", function () {
        var issue = link.getAttribute("data-issue");
        if (issue) {
          var radio =
            form.querySelector('input[name="issue"][value="' + issue + '"]') ||
            form.querySelector('input[name="issue"][value="Other"]');
          if (radio) radio.checked = true;
        }
        show(body);
        setTimeout(function () {
          document.getElementById("book-name").focus({ preventScroll: true });
        }, 400);
      });
    });

    phone.addEventListener("input", function () {
      phone.removeAttribute("aria-invalid");
      phoneError.hidden = true;
    });

    document.querySelectorAll("[data-book-again]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        form.reset();
        newTicket();
        show(body);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var mobile = digits(phone.value).replace(/^(91|0)(?=\d{10}$)/, "");
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        phone.setAttribute("aria-invalid", "true");
        phoneError.hidden = false;
        phone.focus();
        return;
      }
      var device = form.querySelector('input[name="device"]:checked');
      var issue = form.querySelector('input[name="issue"]:checked');
      var message = bookingMessage({
        name: document.getElementById("book-name").value.trim(),
        phone: mobile,
        device: device ? device.value : "iPhone",
        issue: issue ? issue.value : "Front glass",
        time: document.getElementById("book-time").value.trim(),
      });

      // No server-side sender configured: hand the prefilled ticket to WhatsApp directly.
      // window.open must run synchronously inside the submit handler or popup blockers stop it.
      if (!CONFIG.callmebotApiKey) {
        var url = chatUrl(message);
        document.getElementById("book-opened-wa").href = url;
        window.open(url, "_blank", "noopener");
        show(opened);
        return;
      }

      submit.disabled = true;
      submit.textContent = t("book.sending");
      sendToShop(message)
        .then(function () {
          show(done);
        })
        .catch(function () {
          document.getElementById("book-fallback-wa").href = chatUrl(message);
          show(fallback);
        })
        .then(function () {
          submit.disabled = false;
          submit.textContent = t("book.submit");
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    lang = window.IExpertI18n ? window.IExpertI18n.init() : "en";
    initBooking();
    wireContact();
    renderReviews();
    updateMap();
    initCompare();
    syncCanonical();
    document.addEventListener("iexpert:lang", function (ev) {
      lang = ev.detail.lang;
      syncCanonical();
      renderReviews();
      updateMap();
    });
  });
})();
