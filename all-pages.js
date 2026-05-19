(function () {
    var ROUTES = ["home", "events", "menu", "merch", "minigame", "contacts", "korzina"];

    function loadFrame(panel) {
        var frame = panel && panel.querySelector("iframe[data-src]");
        if (!frame || frame.src) return;
        frame.src = frame.dataset.src;
    }

    function resizeMenuFrame() {
        var frame = document.querySelector("#page-menu .page-frame");
        if (!frame || !frame.contentDocument) return;
        try {
            var doc = frame.contentDocument;
            var height = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight);
            frame.style.height = height + "px";
        } catch (err) {
            /* cross-origin */
        }
    }

    function bindMenuFrameResize() {
        var frame = document.querySelector("#page-menu .page-frame");
        if (!frame || frame.dataset.resizeBound) return;
        frame.dataset.resizeBound = "1";
        frame.addEventListener("load", function () {
            if (document.body.classList.contains("route-menu")) {
                resizeMenuFrame();
            }
        });
    }

    function setActiveNav(id) {
        document.querySelectorAll("#routerNav .router-link").forEach(function (el) {
            el.classList.toggle("active", el.dataset.target === id);
        });
    }

    function show(id) {
        if (ROUTES.indexOf(id) === -1) id = "home";

        ROUTES.forEach(function (name) {
            var panel = document.getElementById("page-" + name);
            if (!panel) return;
            var on = name === id;
            panel.classList.toggle("active", on);
            if (on) loadFrame(panel);
        });

        setActiveNav(id);
        document.body.classList.toggle("route-home", id === "home");
        document.body.classList.toggle("route-menu", id === "menu");
        history.replaceState(null, "", "#" + id);
        window.scrollTo(0, 0);

        var cartFloat = document.querySelector(".cart-float");
        if (cartFloat) {
            cartFloat.classList.remove("is-hidden");
        }

        var siteFooter = document.querySelector("body.all-app > footer.footer");
        if (siteFooter) {
            siteFooter.classList.toggle("footer--site-visible", id === "home");
        }

        if (id === "menu") {
            loadFrame(document.getElementById("page-menu"));
            requestAnimationFrame(resizeMenuFrame);
        } else {
            var menuFrame = document.querySelector("#page-menu .page-frame");
            if (menuFrame) menuFrame.style.height = "";
        }
    }

    document.body.addEventListener("click", function (e) {
        var link = e.target.closest(".router-link");
        if (!link || !link.dataset.target) return;
        e.preventDefault();
        show(link.dataset.target);
    });

    bindMenuFrameResize();

    var initial = (location.hash || "#home").replace("#", "") || "home";
    show(ROUTES.indexOf(initial) !== -1 ? initial : "home");

    window.addEventListener("hashchange", function () {
        var h = (location.hash || "#home").slice(1);
        if (ROUTES.indexOf(h) !== -1) show(h);
    });

    document.querySelectorAll(".we-have .small-patno").forEach(function (btn) {
        btn.addEventListener("pointerdown", function () {
            btn.classList.add("is-pressed");
        });
        function release() {
            btn.classList.remove("is-pressed");
        }
        btn.addEventListener("pointerup", release);
        btn.addEventListener("pointercancel", release);
        btn.addEventListener("pointerleave", release);
    });

    /* Слайдер на главной */
    (function initHomeSlider() {
        var root = document.getElementById("page-home");
        if (!root) return;
        var slides = root.querySelectorAll(".slide");
        var fade = document.getElementById("homeFade");
        if (!slides.length || !fade) return;

        var people = [
            { name: "МАРК БУЙЦОВ", role: "Координатор мероприятий", quote: "Жизнь как дорога, всегда может сбить человек на электросамокате", nick: "hi_immark" },
            { name: "ЛЕРА МИНАЕВА", role: "SMM менеджер", quote: "Самое красивое рождается в хаосе", nick: "lera.jpg" },
            { name: "ДАНЯ РИВЗ", role: "Бариста", quote: "Кофе — это тоже искусство", nick: "danyacoffee" },
            { name: "КИРА БЛЭЙК", role: "Организатор лекций", quote: "Главное — найти своих людей", nick: "kirablake" }
        ];
        var current = 1;

        function imgSrc(n) {
            if (n < 1) n += 4;
            if (n > 4) n -= 4;
            return "komanda" + n + ".png";
        }

        function update() {
            slides.forEach(function (s, i) {
                s.classList.remove("active-slide", "side");
                s.classList.add(i === 1 ? "active-slide" : "side");
            });
            fade.style.opacity = 0;
            setTimeout(function () {
                document.getElementById("home-name").textContent = people[current].name;
                document.getElementById("home-role").textContent = people[current].role;
                document.getElementById("home-quote").textContent = people[current].quote;
                document.getElementById("home-nick").textContent = people[current].nick;
                fade.style.opacity = 1;
            }, 300);
        }

        setInterval(function () {
            current = (current + 1) % people.length;
            var left = current === 0 ? 4 : current;
            var center = current + 1;
            var right = current + 2 > 4 ? current - 2 : current + 2;
            slides[0].innerHTML = "<img src=\"" + imgSrc(left) + "\" alt=\"\">";
            slides[1].innerHTML = "<img src=\"" + imgSrc(center) + "\" alt=\"\">";
            slides[2].innerHTML = "<img src=\"" + imgSrc(right) + "\" alt=\"\">";
            update();
        }, 5000);
    })();
})();
