// Shared behavior: light/dark toggle + active-section nav highlighting + analytics.
(function () {
  var root = document.documentElement;

  // Page-view analytics via GoatCounter (free, privacy-friendly, per-page counts).
  // 1) Sign up at https://www.goatcounter.com and pick a code (e.g. "eberteo").
  // 2) Put that code below. Dashboard: https://<code>.goatcounter.com
  var GOATCOUNTER_CODE = "eberteo";
  if (GOATCOUNTER_CODE) {
    var gc = document.createElement("script");
    gc.async = true;
    gc.src = "https://gc.zgo.at/count.js";
    gc.setAttribute("data-goatcounter", "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count");
    document.head.appendChild(gc);
  }

  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  if (stored === "light" || stored === "dark") root.dataset.theme = stored;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // Knowledge-base article index (one place to maintain).
  var KB = [
    { t: "ServiceNow CMDB & CSDM v5", h: "ServiceNow CMDB and CSDM.html", c: "Enterprise Platforms & Identity" },
    { t: "Moveworks Agent Studio", h: "Moveworks Agent Studio.html", c: "Enterprise Platforms & Identity" },
    { t: "ServiceNow System Administration", h: "servicenow.html", c: "Enterprise Platforms & Identity" },
    { t: "ServiceNow Platform Practices", h: "ServiceNow Platform Practices.html", c: "Enterprise Platforms & Identity" },
    { t: "SailPoint Identity Security Cloud", h: "SailPoint/index.html", c: "Enterprise Platforms & Identity" },
    { t: "SailPoint IdentityIQ — Learning Journal", h: "SailPoint IdentityIQ Journal.html", c: "Enterprise Platforms & Identity" },
    { t: "Reverse Engineering on Tesla Models 3, S & X", h: "Reverse Engineering on Tesla Models 3 S X.html", c: "Hardware & Networks" },
    { t: "PCB, IC Packages & ARM Architecture", h: "PCB, Integrated Circuit Packages & ARM architecture.html", c: "Hardware & Networks" },
    { t: "Telecommunications Bootcamp & Network", h: "Telecommunications Bootcamp & Network.html", c: "Hardware & Networks" },
    { t: "Orchard Core 2.0 & .NET Architecture", h: "Orchard Core and DotNet Architecture.html", c: "Software, Security & DevOps" },
    { t: "DevOps Environments — Docker, WSL & Git", h: "DevOps Environments.html", c: "Software, Security & DevOps" },
    { t: "Web Security Quick Reference", h: "Web Security Quick Reference.html", c: "Software, Security & DevOps" },
    { t: "Ethical Cybersecurity — ISO 27001/27099", h: "Ethical Cybersecurity ISO 27001_27099.html", c: "Software, Security & DevOps" },
    { t: "Foundational C# and .NET with Microsoft", h: "Foundational C# and .Net with Microsoft.html", c: "Software, Security & DevOps" }
  ];

  function kbHref(prefix, h) {
    return prefix + encodeURI(h).replace(/#/g, "%23");
  }

  ready(function () {
    var nav = document.querySelector(".site-nav");

    // 📚 Knowledge Base dropdown, available on every page.
    if (nav) {
      var brand = nav.querySelector(".brand");
      var prefix = brand ? brand.getAttribute("href").replace(/index\.html$/, "") : "";

      var menu = document.createElement("div");
      menu.className = "kb-menu";
      var btn = document.createElement("button");
      btn.className = "kb-btn";
      btn.setAttribute("aria-haspopup", "true");
      btn.textContent = "📚 Knowledge Base ▾";
      var panel = document.createElement("div");
      panel.className = "kb-panel";

      var searchInput = document.createElement("input");
      searchInput.type = "search";
      searchInput.placeholder = "Search articles…";
      panel.appendChild(searchInput);

      var lastCat = null;
      KB.forEach(function (a) {
        if (a.c !== lastCat) {
          var label = document.createElement("div");
          label.className = "kb-group";
          label.textContent = a.c;
          panel.appendChild(label);
          lastCat = a.c;
        }
        var link = document.createElement("a");
        link.href = kbHref(prefix, a.h);
        link.textContent = a.t;
        link.dataset.kbTitle = a.t.toLowerCase();
        panel.appendChild(link);
      });

      searchInput.addEventListener("input", function () {
        var q = searchInput.value.toLowerCase();
        panel.querySelectorAll("a").forEach(function (a) {
          a.style.display = a.dataset.kbTitle.indexOf(q) !== -1 ? "" : "none";
        });
        panel.querySelectorAll(".kb-group").forEach(function (g) {
          var el = g.nextElementSibling, any = false;
          while (el && !el.classList.contains("kb-group")) {
            if (el.tagName === "A" && el.style.display !== "none") { any = true; break; }
            el = el.nextElementSibling;
          }
          g.style.display = any ? "" : "none";
        });
      });

      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("open");
        if (menu.classList.contains("open")) searchInput.focus();
      });
      document.addEventListener("click", function (e) {
        if (!menu.contains(e.target)) menu.classList.remove("open");
      });

      menu.appendChild(btn);
      menu.appendChild(panel);
      nav.appendChild(menu);
    }

    // Homepage card filter (#kb-search input, if present).
    var cardSearch = document.getElementById("kb-search");
    if (cardSearch) {
      var section = cardSearch.closest("section");
      cardSearch.addEventListener("input", function () {
        var q = cardSearch.value.toLowerCase();
        section.querySelectorAll(".card").forEach(function (card) {
          card.style.display = card.textContent.toLowerCase().indexOf(q) !== -1 ? "" : "none";
        });
        section.querySelectorAll(".kb-cat").forEach(function (h) {
          var grid = h.nextElementSibling;
          var any = grid && grid.querySelector('.card:not([style*="none"])');
          h.style.display = any ? "" : "none";
          if (grid) grid.style.display = any ? "" : "none";
        });
      });
    }

    if (nav) {
      var btn = document.createElement("button");
      btn.className = "theme-toggle";
      btn.setAttribute("aria-label", "Toggle light/dark theme");
      btn.textContent = currentTheme() === "light" ? "🌙" : "☀️";
      btn.addEventListener("click", function () {
        var next = currentTheme() === "light" ? "dark" : "light";
        root.dataset.theme = next;
        btn.textContent = next === "light" ? "🌙" : "☀️";
        try { localStorage.setItem("theme", next); } catch (e) {}
      });
      nav.appendChild(btn);
    }

    // Highlight the nav link of the section currently in view (homepage only).
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.site-nav a[href^="#"]')
    );
    if (!links.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-30% 0px -60% 0px" });

    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  });
})();
