(function () {
    var embedded = /[?&]embed=1/.test(location.search) || window.self !== window.top;
    if (embedded) {
        document.documentElement.classList.add("is-embed");
        if (/events\.html/i.test(location.pathname)) {
            document.documentElement.classList.add("events-embed");
        }
        if (/menu\.html/i.test(location.pathname)) {
            document.documentElement.classList.add("menu-embed");
        }
        if (/merch\.html/i.test(location.pathname)) {
            document.documentElement.classList.add("merch-embed");
        }
        if (/tovar\.html/i.test(location.pathname)) {
            document.documentElement.classList.add("tovar-embed");
        }
        if (/contacts\.html/i.test(location.pathname)) {
            document.documentElement.classList.add("contacts-embed");
        }
        if (/korzina\.html/i.test(location.pathname)) {
            document.documentElement.classList.add("korzina-embed");
        }
        var pageRoute = pathnameToRoute(location.pathname);
        if (pageRoute && pageRoute !== "korzina") {
            try {
                sessionStorage.setItem("homieCurrentPage", pageRoute);
            } catch (err) {}
        }
    }

    function pathnameToRoute(pathname) {
        if (/events\.html/i.test(pathname)) return "events";
        if (/menu\.html/i.test(pathname)) return "menu";
        if (/merch\.html/i.test(pathname)) return "merch";
        if (/tovar\.html/i.test(pathname)) return "merch";
        if (/minigame\.html/i.test(pathname) || /game\.html/i.test(pathname)) return "minigame";
        if (/contacts\.html/i.test(pathname)) return "contacts";
        if (/korzina\.html/i.test(pathname)) return "korzina";
        if (/index\.html/i.test(pathname) || /main\.html/i.test(pathname)) return "home";
        return "";
    }

    if (embedded && /merch\.html/i.test(location.pathname)) {
        document.querySelectorAll('a[href*="tovar.html"]').forEach(function (link) {
            var href = link.getAttribute("href");
            if (!href || /[?&]embed=1/.test(href)) return;
            link.setAttribute("href", href + (href.indexOf("?") >= 0 ? "&" : "?") + "embed=1");
        });
    }

    document.addEventListener("click", function (e) {
        var korzLink = e.target.closest('a[href*="#korzina"], a[href*="korzina.html"]');
        if (korzLink && window.self !== window.top) {
            try {
                var cur = sessionStorage.getItem("homieCurrentPage") || "home";
                sessionStorage.setItem("homiePrevRoute", cur);
            } catch (err) {}
        }

        var link = e.target.closest('a[href*="all-pages.html"]');
        if (!link || window.self === window.top) return;
        var hash = (link.hash || "#home").slice(1) || "home";
        if (hash === "korzina") {
            try {
                var from = sessionStorage.getItem("homieCurrentPage") || pathnameToRoute(location.pathname) || "home";
                sessionStorage.setItem("homiePrevRoute", from);
            } catch (err) {}
        }
        e.preventDefault();
        try {
            window.parent.location.hash = hash;
        } catch (err) {
            window.top.location.href = "all-pages.html#" + hash;
        }
    });
})();
