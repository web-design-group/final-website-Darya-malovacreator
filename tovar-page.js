(function () {

    var params = new URLSearchParams(location.search);

    var id = params.get("id") || "shirt";

    var products = window.HOMIE_PRODUCTS || {};

    var p = products[id] || products.shirt;



    function money(n) {

        return Math.round(n).toLocaleString("ru-RU");

    }



    document.title = p.name + " — Homie";



    var back = document.getElementById("backBtn");
    if (back) {
        var inFrame = window.self !== window.top;
        back.href = inFrame ? "merch.html?embed=1" : "merch.html";
        back.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = inFrame ? "merch.html?embed=1" : "merch.html";
        });
    }

    var cart = document.getElementById("tovarCart");
    if (cart) {
        if (window.self !== window.top) {
            cart.addEventListener("click", function (e) {
                e.preventDefault();
                try {
                    window.parent.location.hash = "korzina";
                } catch (err) {
                    window.top.location.href = "all-pages.html#korzina";
                }
            });
        }
    }



    var root = document.getElementById("productRoot");

    if (!root) return;



    var galleryHtml = "";

    var bigSrc = p.img;

    if (p.gallery && p.gallery.length) {

        galleryHtml = '<div class="gallery">';

        p.gallery.forEach(function (g, i) {

            galleryHtml +=

                '<input type="radio" name="img" id="img' + i + '"' + (i === 0 ? " checked" : "") + ">" +

                '<label for="img' + i + '"><img src="' + g.thumb + '" alt=""></label>';

        });

        galleryHtml += "</div>";

        bigSrc = p.gallery[0].big;

    }



    var sizesHtml = '<div class="sizes">';

    (p.sizes || ["ONE"]).forEach(function (s, i) {

        var sid = "size-" + s.replace(/\W/g, "");

        sizesHtml +=

            '<input type="radio" name="size" id="' + sid + '"' + (i === 0 ? " checked" : "") + ">" +

            '<label for="' + sid + '">' + s + "</label>";

    });

    sizesHtml += "</div>";



    var descHtml = '<div class="desc">';

    (p.desc || []).forEach(function (row) {

        descHtml += '<p class="gray">' + row[0] + "</p><p>" + row[1] + "</p>";

    });

    descHtml += "</div>";



    root.innerHTML =

        galleryHtml +

        '<div class="big"><img id="mainImage" src="' + bigSrc + '" alt=""></div>' +

        '<div class="info">' +

        "<h1>" + p.name + "</h1>" +

        '<p class="price">' + money(p.price) + " ₽</p>" +

        sizesHtml +

        descHtml +

        '<button type="button" class="buy" id="productBuy">' +

        '<img src="patno.png" alt="">' +

        '<span class="text-default">Положить в корзину</span>' +

        '<span class="text-active">В корзине</span>' +

        "</button>" +

        "</div>";



    if (p.gallery && p.gallery.length) {

        var radios = root.querySelectorAll('input[name="img"]');

        var main = document.getElementById("mainImage");

        radios.forEach(function (radio, i) {

            radio.addEventListener("change", function () {

                main.src = p.gallery[i].big;

            });

        });

    }



    function readCart() {

        if (window.HomieCart && window.HomieCart.read) {

            return window.HomieCart.read();

        }

        try {

            return JSON.parse(localStorage.getItem("homieCart")) || [];

        } catch (e) {

            return [];

        }

    }



    function isInCart(name, price) {

        return readCart().some(function (x) {

            return x.name === name && x.price === price;

        });

    }



    function addToCart(name, price) {
        var meta = null;
        if (window.HomieCart && window.HomieCart.productMeta) {
            meta = window.HomieCart.productMeta(p, id);
            var sizeInput = document.querySelector('.sizes input[name="size"]:checked');
            if (sizeInput && meta) {
                var sizeLabel = document.querySelector('label[for="' + sizeInput.id + '"]');
                if (sizeLabel) meta.size = sizeLabel.textContent.trim();
            }
        }
        if (window.HomieCart && window.HomieCart.add) {
            window.HomieCart.add(name, price, 1, meta);
            return;
        }
        var cart = readCart();
        var item = cart.find(function (x) {
            return x.name === name && x.price === price;
        });
        if (item) item.qty += 1;
        else {
            var entry = { name: name, price: price, qty: 1 };
            if (meta && meta.type === "merch") {
                entry.type = "merch";
                if (meta.img) entry.img = meta.img;
                if (meta.size) entry.size = meta.size;
                if (meta.color) entry.color = meta.color;
                if (meta.id) entry.id = meta.id;
            }
            cart.push(entry);
        }
        localStorage.setItem("homieCart", JSON.stringify(cart));
    }



    function setBuyInCart(inCart) {

        var buyBtn = document.getElementById("productBuy");

        if (!buyBtn) return;

        buyBtn.classList.toggle("in-cart", !!inCart);

        buyBtn.setAttribute("aria-pressed", inCart ? "true" : "false");

    }



    var buyBtn = document.getElementById("productBuy");

    if (buyBtn) {

        if (isInCart(p.name, p.price)) {

            setBuyInCart(true);

        }



        buyBtn.addEventListener("click", function () {

            var wasInCart = isInCart(p.name, p.price);

            if (!wasInCart) {

                addToCart(p.name, p.price);

                setBuyInCart(true);

            }

            if (window.HomieModals && window.HomieModals.openCartAdded) {

                window.HomieModals.openCartAdded(p.name, p.price);

            }

        });

    }

})();

