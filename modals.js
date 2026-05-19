(function () {
    "use strict";

    var CART_KEY = "homieCart";

    var PRODUCTS = {
        shirt: {
            name: "ФУТБОЛКА",
            price: 2500,
            img: "t-shirt.png",
            gallery: [
                { thumb: "t-shirt-smal1.png", big: "t-shirt-big1.png" },
                { thumb: "t-shirt-smal2.png", big: "t-shirt-big2.png" },
                { thumb: "t-shirt-smal3.png", big: "t-shirt-big3.png" },
                { thumb: "t-shirt-smal4.png", big: "t-shirt-big4.png" }
            ],
            sizes: ["S", "M", "L"],
            desc: [
                ["Состав", "Хлопок — 100%"],
                ["Материал подкладки", "Без подкладки"],
                ["Цвет", "Чёрный"]
            ]
        },
        hoodie: {
            name: "ХУДИ",
            price: 4500,
            img: "hoodie.png",
            sizes: ["S", "M", "L"],
            desc: [["Состав", "Хлопок 80%, полиэстер 20%"], ["Цвет", "Графит"]]
        },
        cap: {
            name: "КЕПКА",
            price: 1500,
            img: "cap.png",
            sizes: ["ONE"],
            desc: [["Материал", "Хлопок"], ["Цвет", "Чёрный"]]
        },
        bag: {
            name: "СУМКА",
            price: 2500,
            img: "bag.png",
            sizes: ["ONE"],
            desc: [["Материал", "Канвас"], ["Цвет", "Бежевый"]]
        },
        phone: {
            name: "ЧЕХОЛ",
            price: 800,
            img: "phone.png",
            sizes: ["ONE"],
            desc: [["Совместимость", "Универсальный"], ["Цвет", "Молочный"]]
        },
        key: {
            name: "БРЕЛОК",
            price: 500,
            img: "key.png",
            sizes: ["ONE"],
            desc: [["Материал", "Металл + эмаль"]]
        },
        skate: {
            name: "ДЕКА",
            price: 5000,
            img: "skate.png",
            sizes: ["8.0", "8.25"],
            desc: [["Коллекция", "Homie Limited"]]
        },
        keys: {
            name: "КЕЙС",
            price: 500,
            img: "keys.png",
            sizes: ["ONE"],
            desc: [["Формат", "Для ключей и мелочей"]]
        },
        button: {
            name: "КНОПКА",
            price: 500,
            img: "button.png",
            sizes: ["ONE"],
            desc: [["Набор", "3 шт."]]
        }
    };

    var root, bodyEl;

    function readCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function writeCart(arr) {
        localStorage.setItem(CART_KEY, JSON.stringify(arr));
    }

    function addToCart(name, price, qty) {
        qty = qty || 1;
        var cart = readCart();
        var item = cart.find(function (x) {
            return x.name === name && x.price === price;
        });
        if (item) item.qty += qty;
        else cart.push({ name: name, price: price, qty: qty });
        writeCart(cart);
    }

    function money(n) {
        return Math.round(n).toLocaleString("ru-RU");
    }

    var VENUE = "Санкт-Петербург, ул. Красивая 59";

    var MONTHS_GEN = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];

    function formatEventWhen(meta) {
        if (!meta) return "";
        var m = meta.match(/^(\d{1,2})\.(\d{1,2})\.\s*·\s*(.+)$/);
        if (!m) return meta.replace("·", ",").trim();
        var mon = MONTHS_GEN[parseInt(m[2], 10) - 1] || m[2];
        return m[1] + " " + mon + ", " + m[3].trim();
    }

    function ticketDataFromButton(btn) {
        var card = btn.closest(".event-card");
        var title = btn.dataset.eventTitle || "";
        var when = btn.dataset.eventWhen || "";
        var price = Number(btn.dataset.price) || 0;

        if (card) {
            var h3 = card.querySelector("h3");
            var meta = card.querySelector(".event-meta");
            if (h3) title = h3.textContent.trim();
            if (meta) when = formatEventWhen(meta.textContent.trim());
            if (!price) {
                var priceEl = card.querySelector(".event-price");
                if (priceEl) {
                    var num = priceEl.textContent.replace(/\D/g, "");
                    price = Number(num) || 0;
                }
            }
        }

        return {
            title: title,
            when: when,
            place: btn.dataset.eventPlace || VENUE,
            price: price,
            name: btn.dataset.name || title + " — билет"
        };
    }

    function ensureRoot() {
        if (root) return;
        root = document.createElement("div");
        root.className = "homie-modal-root";
        root.setAttribute("role", "dialog");
        root.setAttribute("aria-modal", "true");
        root.setAttribute("aria-hidden", "true");
        root.innerHTML =
            '<div class="homie-modal-backdrop" data-close></div>' +
            '<div class="homie-modal-panel">' +
            '<button type="button" class="homie-modal-close" aria-label="Закрыть">&times;</button>' +
            '<div class="homie-modal-body"></div>' +
            "</div>";
        document.body.appendChild(root);
        bodyEl = root.querySelector(".homie-modal-body");
        root.querySelector(".homie-modal-backdrop").addEventListener("click", close);
        root.querySelector(".homie-modal-close").addEventListener("click", close);
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && root.classList.contains("is-open")) close();
        });
    }

    function open(html, extraClass) {
        ensureRoot();
        root.className = "homie-modal-root is-open" + (extraClass ? " " + extraClass : "");
        bodyEl.innerHTML = html;
        root.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function close() {
        if (!root) return;
        root.classList.remove("is-open");
        root.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        bodyEl.innerHTML = "";
    }

    function renderProduct(id) {
        var p = PRODUCTS[id];
        if (!p) return "";

        var galleryHtml = "";
        var bigSrc = p.img;
        if (p.gallery && p.gallery.length) {
            galleryHtml = '<div class="homie-product-gallery">';
            p.gallery.forEach(function (g, i) {
                galleryHtml +=
                    '<button type="button" class="' + (i === 0 ? "is-active" : "") + '" data-big="' + g.big + '">' +
                    '<img src="' + g.thumb + '" alt=""></button>';
            });
            galleryHtml += "</div>";
            bigSrc = p.gallery[0].big;
        }

        var sizesHtml = '<div class="homie-sizes">';
        (p.sizes || ["ONE"]).forEach(function (s, i) {
            sizesHtml += '<button type="button" class="' + (i === 0 ? "is-active" : "") + '" data-size="' + s + '">' + s + "</button>";
        });
        sizesHtml += "</div>";

        var descHtml = '<div class="homie-product-desc">';
        (p.desc || []).forEach(function (row) {
            descHtml += '<p class="gray">' + row[0] + "</p><p>" + row[1] + "</p>";
        });
        descHtml += "</div>";

        return (
            '<div class="homie-product-grid">' +
            galleryHtml +
            '<div class="homie-product-big"><img src="' + bigSrc + '" alt="" id="homieProductMain"></div>' +
            '<div class="homie-product-info">' +
            "<h2>" + p.name + "</h2>" +
            '<p class="homie-product-price">' + money(p.price) + " ₽</p>" +
            sizesHtml +
            descHtml +
            '<button type="button" class="homie-buy-patno" id="homieProductBuy">' +
            '<img src="patno.png" alt="">' +
            '<span class="text-default">Положить в корзину</span>' +
            '<span class="text-active">В корзине</span>' +
            "</button>" +
            "</div>" +
            "</div>"
        );
    }

    function bindProductModal(id) {
        var p = PRODUCTS[id];
        if (!p) return;

        var gallery = bodyEl.querySelector(".homie-product-gallery");
        var mainImg = bodyEl.querySelector("#homieProductMain");
        if (gallery && mainImg) {
            gallery.addEventListener("click", function (e) {
                var btn = e.target.closest("button[data-big]");
                if (!btn) return;
                gallery.querySelectorAll("button").forEach(function (b) {
                    b.classList.toggle("is-active", b === btn);
                });
                mainImg.src = btn.dataset.big;
            });
        }

        var sizes = bodyEl.querySelector(".homie-sizes");
        if (sizes) {
            sizes.addEventListener("click", function (e) {
                var btn = e.target.closest("button[data-size]");
                if (!btn) return;
                sizes.querySelectorAll("button").forEach(function (b) {
                    b.classList.toggle("is-active", b === btn);
                });
            });
        }

        var buy = bodyEl.querySelector("#homieProductBuy");
        if (buy) {
            buy.addEventListener("click", function () {
                addToCart(p.name, p.price, 1);
                buy.classList.add("is-in-cart");
                setTimeout(function () {
                    showCartAdded(p.name, p.price);
                }, 350);
            });
        }
    }

    function showProduct(id) {
        open(renderProduct(id));
        bindProductModal(id);
    }

    function showEvent(data) {
        var tags = (data.tags || [])
            .map(function (t) {
                return '<span class="homie-tag">' + t + "</span>";
            })
            .join("");

        open(
            '<h2 class="homie-modal-title">' + data.title + "</h2>" +
            '<div class="homie-event-head">' +
            '<div class="homie-event-date"><span class="day">' + data.day + '</span><span class="mon">' + data.mon + "</span></div>" +
            '<div class="homie-event-body"><p class="homie-modal-sub">' + data.meta + "</p></div>" +
            "</div>" +
            "<p>" + data.desc + "</p>" +
            '<div class="homie-tag-row">' + tags + "</div>" +
            '<div class="homie-modal-actions">' +
            '<button type="button" class="homie-btn homie-btn--dark" data-close>Закрыть</button>' +
            '<button type="button" class="homie-btn homie-btn--light" data-close>Записаться</button>' +
            "</div>"
        );
        bodyEl.querySelectorAll("[data-close]").forEach(function (btn) {
            btn.addEventListener("click", close);
        });
    }

    function showCartAdded(name, price) {
        close();
        setTimeout(function () {
            open(
                '<img src="patno.png" alt="" class="homie-toast-patno">' +
                '<p class="homie-toast-text">Добавлено в корзину!</p>' +
                '<p style="color:#415a77;margin-bottom:20px;">' + name + " — " + money(price) + " ₽</p>" +
                '<div class="homie-modal-actions">' +
                '<button type="button" class="homie-btn homie-btn--dark" data-goto-cart>Перейти в корзину</button>' +
                '<button type="button" class="homie-btn homie-btn--light" data-close>Продолжить</button>' +
                "</div>",
                "homie-modal--toast"
            );
            bodyEl.querySelector("[data-close]").addEventListener("click", close);
            bodyEl.querySelector("[data-goto-cart]").addEventListener("click", function () {
                close();
                if (window.self !== window.top) {
                    try {
                        window.parent.location.hash = "korzina";
                    } catch (err) {
                        window.top.location.href = "all-pages.html#korzina";
                    }
                } else {
                    window.location.href = "all-pages.html#korzina";
                }
            });
        }, 200);
    }

    function showTicketAdded(ticket) {
        close();
        setTimeout(function () {
            open(
                '<img src="patno.png" alt="" class="homie-toast-patno">' +
                '<p class="homie-toast-text">Билет выбран!</p>' +
                '<p style="color:#415a77;margin-bottom:20px;">' + ticket.title + " — " + money(ticket.price) + " ₽</p>" +
                '<div class="homie-modal-actions">' +
                '<button type="button" class="homie-btn homie-btn--dark" data-close>Закрыть</button>' +
                '<button type="button" class="homie-btn homie-btn--light" data-ticket-continue>Продолжить</button>' +
                "</div>",
                "homie-modal--toast"
            );
            bodyEl.querySelector("[data-close]").addEventListener("click", close);
            bodyEl.querySelector("[data-ticket-continue]").addEventListener("click", function () {
                showTicketCheckout(ticket);
            });
        }, 200);
    }

    function bindTicketCheckoutForm(ticket) {
        var form = bodyEl.querySelector("#homieTicketForm");
        if (!form) return;
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            showTicketSuccess(ticket);
        });
    }

    function showTicketCheckout(ticket) {
        open(
            '<div class="homie-pay homie-pay--ticket">' +
            '<form class="homie-pay-grid" id="homieTicketForm" novalidate>' +
            '<div class="homie-pay-left">' +
            '<section class="homie-pay-section">' +
            '<h3 class="homie-pay-section-title">ДАННЫЕ ДЛЯ ПОЛУЧЕНИЯ БИЛЕТА</h3>' +
            '<div class="homie-pay-fields homie-pay-fields--2">' +
            '<label class="homie-pay-field"><span>Имя*</span><input type="text" name="firstName" required placeholder="Имя*"></label>' +
            '<label class="homie-pay-field"><span>Фамилия*</span><input type="text" name="lastName" required placeholder="Фамилия*"></label>' +
            '<label class="homie-pay-field"><span>E-mail*</span><input type="email" name="email" required placeholder="E-mail*"></label>' +
            '<label class="homie-pay-field"><span>Номер телефона*</span><input type="tel" name="phone" required placeholder="Номер телефона*"></label>' +
            "</div>" +
            "</section>" +
            '<section class="homie-pay-section">' +
            '<h3 class="homie-pay-section-title">СПОСОБ ОПЛАТЫ</h3>' +
            '<div class="homie-pay-fields">' +
            '<label class="homie-pay-field homie-pay-field--full"><span>Номер карты*</span><input type="text" name="card" required placeholder="Номер карты*" inputmode="numeric" autocomplete="cc-number" maxlength="19"></label>' +
            '<div class="homie-pay-field-row">' +
            '<label class="homie-pay-field"><span>Действует до*</span><input type="text" name="expiry" required placeholder="Действует до*" inputmode="numeric" autocomplete="cc-exp" maxlength="5"></label>' +
            '<label class="homie-pay-field"><span>Код*</span><input type="text" name="cvv" required placeholder="Код*" inputmode="numeric" autocomplete="cc-csc" maxlength="4"></label>' +
            "</div>" +
            "</div>" +
            "</section>" +
            "</div>" +
            '<div class="homie-pay-right homie-pay-right--ticket">' +
            '<h2 class="homie-ticket-event-title">' + ticket.title + "</h2>" +
            '<p class="homie-ticket-event-meta">' + ticket.when + "</p>" +
            '<p class="homie-ticket-event-meta">' + ticket.place + "</p>" +
            '<dl class="homie-pay-summary homie-pay-summary--ticket">' +
            '<motion class="homie-pay-summary-row"><dt>1 билет</dt><dd>' + money(ticket.price) + " руб.</dd></div>" +
            "</dl>" +
            '<div class="homie-pay-total-block">' +
            '<p class="homie-pay-total-label">ИТОГО:</p>' +
            '<p class="homie-pay-total-sum">' + money(ticket.price) + " РУБ</p>" +
            "</div>" +
            '<button type="submit" class="homie-pay-submit">ОПЛАТИТЬ</button>' +
            '<p class="homie-pay-note">билеты будут отправлены на указанный почтовый адрес</p>' +
            "</div>" +
            "</form>" +
            "</div>",
            "homie-modal--checkout homie-modal--ticket"
        );
        bindTicketCheckoutForm(ticket);
    }

    function showTicketSuccess(ticket) {
        open(
            '<motion class="homie-success-icon">✓</div>' +
            '<h2 class="homie-modal-title">ОПЛАТА ПРОШЛА</h2>' +
            '<p class="homie-success-text">Билет на «' + ticket.title + "» оформлен.<br>Отправим на указанный e-mail.</p>" +
            '<div class="homie-modal-actions">' +
            '<button type="button" class="homie-btn homie-btn--dark" data-close>Отлично</button>' +
            "</div>",
            "homie-modal--toast"
        );
        bodyEl.querySelector("[data-close]").addEventListener("click", close);
    }

    function itemsLabel(count) {
        var n = Math.abs(count) % 100;
        var n1 = n % 10;
        if (n > 10 && n < 20) return count + " товаров";
        if (n1 > 1 && n1 < 5) return count + " товара";
        if (n1 === 1) return count + " товар";
        return count + " товаров";
    }

    function showCheckout(total) {
        var cart = readCart();
        var itemCount = cart.reduce(function (s, i) {
            return s + i.qty;
        }, 0);
        var deliveryLabel = "Бесплатно";

        open(
            '<div class="homie-pay">' +
            '<form class="homie-pay-grid" id="homieCheckoutForm" novalidate>' +
            '<div class="homie-pay-left">' +
            '<section class="homie-pay-section">' +
            '<h3 class="homie-pay-section-title">КТО ПОЛУЧИТ ЗАКАЗ?</h3>' +
            '<div class="homie-pay-fields homie-pay-fields--2">' +
            '<label class="homie-pay-field"><span>Имя*</span><input type="text" name="firstName" required placeholder="Имя*"></label>' +
            '<label class="homie-pay-field"><span>Фамилия*</span><input type="text" name="lastName" required placeholder="Фамилия*"></label>' +
            '<label class="homie-pay-field"><span>E-mail*</span><input type="email" name="email" required placeholder="E-mail*"></label>' +
            '<label class="homie-pay-field"><span>Номер телефона*</span><input type="tel" name="phone" required placeholder="Номер телефона*"></label>' +
            "</div>" +
            "</section>" +
            '<section class="homie-pay-section">' +
            '<h3 class="homie-pay-section-title">СПОСОБ ПОЛУЧЕНИЯ</h3>' +
            '<div class="homie-pay-toggle" role="group" aria-label="Способ получения">' +
            '<button type="button" class="is-active" data-delivery="delivery">Доставка</button>' +
            '<button type="button" data-delivery="pickup">Самовывоз</button>' +
            "</div>" +
            '<p class="homie-pay-address" id="homiePayAddress">Санкт-Петербург, ул. Красивая 59</p>' +
            "</section>" +
            '<section class="homie-pay-section">' +
            '<h3 class="homie-pay-section-title">ОПЛАТА</h3>' +
            '<div class="homie-pay-fields">' +
            '<label class="homie-pay-field homie-pay-field--full"><span>Номер карты*</span><input type="text" name="card" required placeholder="Номер карты*" inputmode="numeric" autocomplete="cc-number" maxlength="19"></label>' +
            '<div class="homie-pay-field-row">' +
            '<label class="homie-pay-field"><span>Действует до*</span><input type="text" name="expiry" required placeholder="Действует до*" inputmode="numeric" autocomplete="cc-exp" maxlength="5"></label>' +
            '<label class="homie-pay-field"><span>Код*</span><input type="text" name="cvv" required placeholder="Код*" inputmode="numeric" autocomplete="cc-csc" maxlength="4"></label>' +
            "</div>" +
            "</div>" +
            "</section>" +
            "</div>" +
            '<div class="homie-pay-right">' +
            '<h3 class="homie-pay-section-title">ВАШ ЗАКАЗ</h3>' +
            '<dl class="homie-pay-summary">' +
            '<div class="homie-pay-summary-row"><dt>' + itemsLabel(itemCount) + '</dt><dd>' + money(total) + " руб.</dd></div>" +
            '<div class="homie-pay-summary-row"><dt>Стоимость доставки</dt><dd>' + deliveryLabel + "</dd></div>" +
            "</dl>" +
            '<div class="homie-pay-total-block">' +
            '<p class="homie-pay-total-label">ИТОГО:</p>' +
            '<p class="homie-pay-total-sum">' + money(total) + " РУБ</p>" +
            "</div>" +
            '<button type="submit" class="homie-pay-submit">ОПЛАТИТЬ</button>' +
            '<p class="homie-pay-note">когда заказ будет собран, вам придет оповещение на смс</p>' +
            "</div>" +
            "</form>" +
            "</div>",
            "homie-modal--checkout"
        );

        var form = bodyEl.querySelector("#homieCheckoutForm");
        var addressEl = bodyEl.querySelector("#homiePayAddress");
        var toggleBtns = bodyEl.querySelectorAll(".homie-pay-toggle button");

        toggleBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                toggleBtns.forEach(function (b) {
                    b.classList.toggle("is-active", b === btn);
                });
                if (btn.dataset.delivery === "pickup") {
                    addressEl.textContent = "Санкт-Петербург, ул. Красивая 59";
                    addressEl.hidden = false;
                } else {
                    addressEl.textContent = "Санкт-Петербург, ул. Красивая 59";
                    addressEl.hidden = false;
                }
            });
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            writeCart([]);
            showOrderSuccess();
        });
    }

    function showOrderSuccess() {
        open(
            '<div class="homie-success-icon">✓</div>' +
            '<h2 class="homie-modal-title">ЗАКАЗ ПРИНЯТ</h2>' +
            '<p class="homie-success-text">Спасибо! Мы свяжемся с тобой в ближайшее время.<br>Ждём в Homie.</p>' +
            '<div class="homie-modal-actions">' +
            '<button type="button" class="homie-btn homie-btn--dark" data-close>Отлично</button>' +
            "</div>",
            "homie-modal--toast"
        );
        bodyEl.querySelector("[data-close]").addEventListener("click", function () {
            close();
            if (typeof window.homieCartRender === "function") window.homieCartRender();
            else location.reload();
        });
    }

    function showContactSuccess() {
        open(
            '<div class="homie-success-icon">♥</div>' +
            '<h2 class="homie-modal-title">СПАСИБО!</h2>' +
            '<p class="homie-success-text">Сообщение отправлено. Ответим на указанные контакты.</p>' +
            '<div class="homie-modal-actions">' +
            '<button type="button" class="homie-btn homie-btn--dark" data-close>Закрыть</button>' +
            "</div>",
            "homie-modal--toast"
        );
        bodyEl.querySelector("[data-close]").addEventListener("click", close);
    }

    function cardProductId(card) {
        var map = {
            "ФУТБОЛКА": "shirt",
            "ХУДИ": "hoodie",
            "КЕПКА": "cap",
            "СУМКА": "bag",
            "ЧЕХОЛ": "phone",
            "БРЕЛОК": "key",
            "ДЕКА": "skate",
            "КЕЙС": "keys",
            "КНОПКА": "button"
        };
        var nameEl = card.querySelector(".name");
        if (!nameEl) return null;
        return map[nameEl.textContent.trim().toUpperCase()] || null;
    }

    function getProduct(id) {
        if (window.HOMIE_PRODUCTS && window.HOMIE_PRODUCTS[id]) {
            return window.HOMIE_PRODUCTS[id];
        }
        return PRODUCTS[id];
    }

    function bindMerch() {
        document.querySelectorAll(".merch-cart-check").forEach(function (checkbox) {
            if (checkbox.dataset.modalBound) return;
            checkbox.dataset.modalBound = "1";
            checkbox.addEventListener("change", function (e) {
                e.stopPropagation();
                if (!checkbox.checked) return;
                var id = checkbox.dataset.id;
                var prod = getProduct(id);
                if (!prod) return;
                addToCart(prod.name, prod.price, 1);
                showCartAdded(prod.name, prod.price);
            });
        });

        document.querySelectorAll(".cart-small").forEach(function (label) {
            label.addEventListener("click", function (e) {
                e.stopPropagation();
            });
        });
    }

    function bindEvents() {
        document.querySelectorAll(".event-card").forEach(function (card) {
            var day = card.querySelector(".day");
            var mon = card.querySelector(".mon");
            var title = card.querySelector("h3");
            var meta = card.querySelector(".event-meta");
            var price = card.querySelector(".event-price");
            var desc = card.querySelector(".event-desc");
            var tags = [];
            card.querySelectorAll(".tag").forEach(function (t) {
                tags.push(t.textContent.trim());
            });
            card.querySelectorAll(".event-guests-list li").forEach(function (li) {
                tags.push(li.textContent.trim());
            });
            var ageEl = card.querySelector(".event-age");
            if (ageEl) tags.push(ageEl.textContent.trim());
            if (!title || !desc) return;

            card.setAttribute("data-modal-event", "1");
            card.addEventListener("click", function (e) {
                if (e.target.closest(".event-buy")) return;
                showEvent({
                    day: day ? day.textContent.trim() : "",
                    mon: mon ? mon.textContent.trim() : "",
                    title: title.textContent.trim(),
                    meta: [price ? price.textContent.trim() : "", meta ? meta.textContent.trim() : ""].filter(Boolean).join(" · "),
                    desc: desc.textContent.trim(),
                    tags: tags
                });
            });
        });
    }

    function bindMenu() {
        document.querySelectorAll(".add-btn").forEach(function (btn) {
            if (btn.dataset.modalBound) return;
            btn.dataset.modalBound = "1";
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                var name = btn.dataset.name;
                var price = Number(btn.dataset.price);
                if (!name || !price) return;
                addToCart(name, price, 1);
                var hasIcon = btn.querySelector("img");
                var label = btn.dataset.label;
                if (label === undefined) {
                    label = hasIcon ? "" : btn.textContent;
                    btn.dataset.label = label;
                }
                var savedHtml = hasIcon ? btn.innerHTML : null;
                if (hasIcon) {
                    btn.classList.add("done");
                } else {
                    btn.textContent = "Добавлено ✓";
                    btn.classList.add("done");
                }
                showCartAdded(name, price);
                setTimeout(function () {
                    if (hasIcon) {
                        btn.innerHTML = savedHtml;
                    } else {
                        btn.textContent = label;
                    }
                    btn.classList.remove("done");
                }, 1200);
            });
        });
    }

    function bindCheckout() {
        var btn = document.getElementById("checkoutBtn");
        if (!btn || btn.dataset.modalBound) return;
        btn.dataset.modalBound = "1";
        btn.addEventListener("click", function () {
            var cart = readCart();
            if (!cart.length) return;
            var sum = cart.reduce(function (s, i) {
                return s + i.price * i.qty;
            }, 0);
            showCheckout(sum);
        });
    }

    function bindContacts() {
        var section = document.querySelector(".contacts");
        if (!section) return;
        var form = section.querySelector(".form");
        var submitBtn = form && form.querySelector("button");
        if (!submitBtn || submitBtn.dataset.modalBound) return;
        submitBtn.dataset.modalBound = "1";
        submitBtn.addEventListener("click", function (e) {
            e.preventDefault();
            var textarea = form.querySelector("textarea");
            var input = form.querySelector("input");
            if (textarea && !textarea.value.trim()) {
                textarea.focus();
                return;
            }
            showContactSuccess();
            if (textarea) textarea.value = "";
            if (input) input.value = "";
        });
    }

    function init() {
        bindMerch();
        bindEvents();
        bindMenu();
        bindCheckout();
        bindContacts();
    }

    window.HomieModals = {
        openProduct: showProduct,
        openEvent: showEvent,
        openCartAdded: showCartAdded,
        openCheckout: showCheckout,
        openContactSuccess: showContactSuccess,
        close: close
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
