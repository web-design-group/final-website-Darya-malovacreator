(function () {
    var params = new URLSearchParams(location.search);
    var id = params.get("id") || "shirt";
    var products = window.HOMIE_PRODUCTS || {};
    var p = products[id] || products.shirt;

    document.title = p.name + " — Homie";

    if (window.self !== window.top) {
        var back = document.getElementById("backBtn");
        if (back) {
            back.href = "merch.html?embed=1";
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
        '<p class="price">' + p.price + "</p>" +
        sizesHtml +
        descHtml +
        '<input type="checkbox" id="buy">' +
        '<label for="buy" class="buy">' +
        '<img src="patno.png" alt="">' +
        '<span class="text-default">Положить в корзину</span>' +
        '<span class="text-active">В корзине</span>' +
        "</label>" +
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

    var buy = document.getElementById("buy");
    if (buy) {
        buy.addEventListener("change", function () {
            if (!buy.checked) return;
            var KEY = "homieCart";
            var cart;
            try {
                cart = JSON.parse(localStorage.getItem(KEY)) || [];
            } catch (e) {
                cart = [];
            }
            var item = cart.find(function (x) {
                return x.name === p.name && x.price === p.price;
            });
            if (item) item.qty += 1;
            else cart.push({ name: p.name, price: p.price, qty: 1 });
            localStorage.setItem(KEY, JSON.stringify(cart));
        });
    }
})();
