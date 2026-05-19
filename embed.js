(function () {
    var embedded = /[?&]embed=1/.test(location.search) || window.self !== window.top;
    if (embedded) {
        document.documentElement.classList.add("is-embed");
        if (document.body.classList.contains("menu-layout")) {
            document.documentElement.classList.add("menu-embed");
        }
    }

    document.addEventListener("click", function (e) {
        var link = e.target.closest('a[href*="all-pages.html"]');
        if (!link || window.self === window.top) return;
        var hash = (link.hash || "#home").slice(1) || "home";
        e.preventDefault();
        try {
            window.parent.location.hash = hash;
        } catch (err) {
            window.top.location.href = "all-pages.html#" + hash;
        }
    });
})();
