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
            price: 3000,
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
        try {
            window.dispatchEvent(new CustomEvent("homie-cart-updated", { detail: arr }));
            if (window.parent !== window) {
                window.parent.postMessage({ type: "homie-cart-updated" }, "*");
            }
        } catch (err) {}
    }

    function productMetaFromProd(prod, id) {
        var color = "";
        if (prod.desc) {
            prod.desc.forEach(function (row) {
                if (String(row[0]).toLowerCase().indexOf("цвет") >= 0) color = row[1];
            });
        }
        var size = prod.sizes && prod.sizes.length ? prod.sizes[0] : "";
        if (size === "ONE") size = "";
        return {
            type: "merch",
            id: id || "",
            img: prod.img || "",
            size: size,
            color: color
        };
    }

    function cartItemMatch(a, name, price, meta) {
        if (meta && meta.type === "merch" && a.type === "merch") {
            return a.name === name && a.price === price && (a.size || "") === (meta.size || "");
        }
        return a.name === name && a.price === price && !a.type;
    }

    function addToCart(name, price, qty, meta) {
        qty = qty || 1;
        meta = meta || null;
        var cart = readCart();
        var item = cart.find(function (x) {
            return cartItemMatch(x, name, price, meta);
        });
        if (item) {
            item.qty += qty;
        } else {
            var entry = { name: name, price: price, qty: qty };
            if (meta && meta.type === "merch") {
                entry.type = "merch";
                if (meta.img) entry.img = meta.img;
                if (meta.size) entry.size = meta.size;
                if (meta.color) entry.color = meta.color;
                if (meta.id) entry.id = meta.id;
            }
            cart.push(entry);
        }
        writeCart(cart);
    }

    function money(n) {
        return Math.round(n).toLocaleString("ru-RU");
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
            '<button type="button" class="homie-modal-close" data-close aria-label="Закрыть">&times;</button>' +
            '<div class="homie-modal-body"></div>' +
            "</div>";
        document.body.appendChild(root);
        bodyEl = root.querySelector(".homie-modal-body");
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && root.classList.contains("is-open")) close();
        });
    }

    function bindModalClose() {
        if (!root) return;
        var backdrop = root.querySelector(".homie-modal-backdrop");
        var closeBtn = root.querySelector(".homie-modal-close");
        if (backdrop) backdrop.onclick = close;
        if (closeBtn) closeBtn.onclick = close;
        bodyEl.querySelectorAll("[data-close]").forEach(function (btn) {
            if (btn.classList.contains("homie-modal-close")) return;
            btn.onclick = close;
        });
    }

    function open(html, extraClass) {
        ensureRoot();
        root.className = "homie-modal-root is-open" + (extraClass ? " " + extraClass : "");
        bodyEl.innerHTML = html;
        bindModalClose();
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
        var p = getProduct(id);
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
        var p = getProduct(id);
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
            var inCart = readCart().some(function (x) {
                return x.name === p.name && x.price === p.price;
            });
            if (inCart) buy.classList.add("is-in-cart");

            buy.addEventListener("click", function () {
                var sizeBtn = sizes && sizes.querySelector("button.is-active");
                var meta = productMetaFromProd(p, id);
                if (sizeBtn) meta.size = sizeBtn.dataset.size || meta.size;
                if (!buy.classList.contains("is-in-cart")) {
                    addToCart(p.name, p.price, 1, meta);
                    buy.classList.add("is-in-cart");
                }
                showCartAdded(p.name, p.price);
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

    function ticketCardHtml(ticket, index) {
        return (
            '<article class="homie-ticket-card" data-ticket-index="' + index + '">' +
            '<div class="homie-ticket-card__head">' +
            '<span class="homie-ticket-card__type">ВХОДНОЙ БИЛЕТ</span>' +
            '<span class="homie-ticket-card__price">' + money(ticket.price) + " РУБ</span>" +
            "</div>" +
            '<div class="homie-ticket-qty" role="group" aria-label="Количество">' +
            '<button type="button" class="homie-ticket-qty__btn" data-qty-minus aria-label="Меньше">−</button>' +
            '<span class="homie-ticket-qty__val" data-qty-val>1</span>' +
            '<button type="button" class="homie-ticket-qty__btn" data-qty-plus aria-label="Больше">+</button>' +
            "</div>" +
            '<button type="button" class="homie-ticket-next">ДАЛЕЕ</button>' +
            "</article>"
        );
    }

    function showEventTickets(tickets) {
        if (!tickets || !tickets.length) return;
        var cardsHtml = tickets
            .map(function (t, i) {
                return ticketCardHtml(t, i);
            })
            .join("");
        open('<div class="homie-ticket-picker"><div class="homie-ticket-cards">' + cardsHtml + "</div></div>", "homie-modal--tickets");

        bodyEl.querySelectorAll(".homie-ticket-card").forEach(function (card, index) {
            var ticket = tickets[index];
            var qtyVal = card.querySelector("[data-qty-val]");
            var qty = 1;

            function setQty(n) {
                qty = Math.max(1, Math.min(99, n));
                qtyVal.textContent = String(qty);
            }

            card.querySelector("[data-qty-minus]").addEventListener("click", function () {
                setQty(qty - 1);
            });
            card.querySelector("[data-qty-plus]").addEventListener("click", function () {
                setQty(qty + 1);
            });
            card.querySelector(".homie-ticket-next").addEventListener("click", function () {
                addToCart(ticket.name, ticket.price, qty);
                var label = qty > 1 ? ticket.name + " × " + qty : ticket.name;
                showCartAdded(label, ticket.price * qty);
            });
        });
    }

    function ticketsFromBuyBtn(btn) {
        var list = [];
        var name = (btn.dataset.name || "").trim();
        var price = parsePrice(btn.dataset.price);
        if (name && price > 0) list.push({ name: name, price: price });
        var name2 = (btn.dataset.ticket2Name || "").trim();
        var price2 = parsePrice(btn.dataset.ticket2Price);
        if (price2 > 0) {
            list.push({ name: name2 || name, price: price2 });
        }
        return list;
    }

    function showCartAdded(name, price) {
        close();
        setTimeout(function () {
            open(
                '<div class="homie-toast-hero">' +
                '<img src="patno.png" alt="" class="homie-toast-patno">' +
                '<p class="homie-toast-text">Добавлено в корзину!</p>' +
                "</div>" +
                '<p class="homie-toast-detail">' + name + " — " + money(price) + " ₽</p>" +
                '<div class="homie-modal-actions">' +
                '<button type="button" class="homie-btn homie-btn--dark" data-goto-cart>Перейти в корзину</button>' +
                '<button type="button" class="homie-btn homie-btn--light" data-close>Продолжить</button>' +
                "</div>",
                "homie-modal--toast"
            );
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
            '<div class="homie-pay-fields homie-pay-fields--4">' +
            '<label class="homie-pay-field"><span>Имя*</span><input type="text" name="firstName" required placeholder="Имя*"></label>' +
            '<label class="homie-pay-field"><span>Фамилия*</span><input type="text" name="lastName" required placeholder="Фамилия*"></label>' +
            '<label class="homie-pay-field"><span>E-mail*</span><input type="email" name="email" required placeholder="E-mail*"></label>' +
            '<label class="homie-pay-field"><span>Номер телефона*</span><input type="tel" name="phone" required placeholder="Номер телефона*"></label>' +
            "</div>" +
            "</section>" +
            '<section class="homie-pay-section homie-pay-section--delivery">' +
            '<h3 class="homie-pay-section-title">СПОСОБ ПОЛУЧЕНИЯ</h3>' +
            '<div class="homie-pay-delivery-row">' +
            '<div class="homie-pay-toggle" role="group" aria-label="Способ получения">' +
            '<button type="button" class="is-active" data-delivery="pickup">Самовывоз</button>' +
            '<button type="button" data-delivery="delivery">Доставка</button>' +
            "</div>" +
            '<p class="homie-pay-pickup-note" id="homiePayPickupNote">Пункт выдачи: Санкт-Петербург, ул. Красивая 59</p>' +
            '<label class="homie-pay-field homie-pay-delivery-field" id="homiePayDeliveryWrap" hidden>' +
            "<span>Адрес доставки*</span>" +
            '<input type="text" name="deliveryAddress" id="homiePayDeliveryAddress" placeholder="Адрес доставки*" autocomplete="street-address">' +
            "</label>" +
            "</div>" +
            "</section>" +
            '<section class="homie-pay-section">' +
            '<h3 class="homie-pay-section-title">ОПЛАТА</h3>' +
            '<div class="homie-pay-fields homie-pay-fields--payment">' +
            '<label class="homie-pay-field"><span>Номер карты*</span><input type="text" name="card" required placeholder="Номер карты*" inputmode="numeric" autocomplete="cc-number" maxlength="19"></label>' +
            '<label class="homie-pay-field"><span>Действует до*</span><input type="text" name="expiry" required placeholder="Действует до*" inputmode="numeric" autocomplete="cc-exp" maxlength="5"></label>' +
            '<label class="homie-pay-field"><span>Код*</span><input type="text" name="cvv" required placeholder="Код*" inputmode="numeric" autocomplete="cc-csc" maxlength="4"></label>' +
            "</div>" +
            "</section>" +
            "</div>" +
            '<div class="homie-pay-right">' +
            '<h3 class="homie-pay-section-title">ВАШ ЗАКАЗ</h3>' +
            '<dl class="homie-pay-summary">' +
            '<div class="homie-pay-summary-row"><dt>' + itemsLabel(itemCount) + '</dt><dd>' + money(total) + " руб.</dd></div>" +
            '<div class="homie-pay-summary-row"><dt>Стоимость доставки</dt><dd id="homiePayDeliveryCost">' + deliveryLabel + "</dd></div>" +
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
        var pickupNote = bodyEl.querySelector("#homiePayPickupNote");
        var deliveryWrap = bodyEl.querySelector("#homiePayDeliveryWrap");
        var deliveryInput = bodyEl.querySelector("#homiePayDeliveryAddress");
        var toggleBtns = bodyEl.querySelectorAll(".homie-pay-toggle button");
        var deliverySummary = bodyEl.querySelector("#homiePayDeliveryCost");

        function activeDeliveryType() {
            var active = bodyEl.querySelector(".homie-pay-toggle button.is-active");
            return active ? active.dataset.delivery : "pickup";
        }

        function setDeliveryMode(mode) {
            var isPickup = mode === "pickup";
            pickupNote.hidden = !isPickup;
            deliveryWrap.hidden = isPickup;
            if (isPickup) {
                deliveryInput.removeAttribute("required");
                deliveryInput.value = "";
                deliveryInput.setCustomValidity("");
            } else {
                deliveryInput.setAttribute("required", "");
            }
            if (deliverySummary) {
                deliverySummary.textContent = isPickup ? "Самовывоз" : "Бесплатно";
            }
        }

        toggleBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                toggleBtns.forEach(function (b) {
                    b.classList.toggle("is-active", b === btn);
                });
                setDeliveryMode(btn.dataset.delivery);
            });
        });

        deliveryInput.addEventListener("input", function () {
            deliveryInput.setCustomValidity("");
        });

        setDeliveryMode("pickup");

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            var deliveryType = activeDeliveryType();
            if (deliveryType === "delivery") {
                var addr = deliveryInput.value.trim();
                if (!addr) {
                    deliveryInput.setCustomValidity("Укажите адрес доставки");
                    deliveryInput.reportValidity();
                    deliveryInput.focus();
                    return;
                }
                deliveryInput.setCustomValidity("");
            }
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            var orderPayload = {
                firstName: form.firstName.value.trim(),
                lastName: form.lastName.value.trim(),
                email: form.email.value.trim(),
                phone: form.phone.value.trim(),
                deliveryType: deliveryType,
                deliveryAddress: deliveryType === "delivery" ? deliveryInput.value.trim() : null,
                pickupAddress: deliveryType === "pickup" ? "Санкт-Петербург, ул. Красивая 59" : null,
                items: cart.slice(),
                total: total
            };
            try {
                sessionStorage.setItem("homieLastOrder", JSON.stringify(orderPayload));
            } catch (err) {}
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

    function bindMerchClick(e) {
        var label = e.target.closest(".cart-small");
        if (!label) return;
        e.preventDefault();
        e.stopPropagation();
        var wrap = label.closest(".card-wrap");
        var input = label.querySelector(".merch-cart-check");
        var id = (input && input.dataset.id) || (wrap && wrap.dataset.id);
        var prod = id && getProduct(id);
        if (!prod) return;
        addToCart(prod.name, prod.price, 1, productMetaFromProd(prod, id));
        if (input) input.checked = false;
        label.classList.add("is-added");
        setTimeout(function () {
            label.classList.remove("is-added");
        }, 1200);
        showCartAdded(prod.name, prod.price);
    }

    function bindEvents() {
        document.querySelectorAll(".event-card").forEach(function (card) {
            var title = card.querySelector(".event-card__title") || card.querySelector("h3");
            var price = card.querySelector(".event-price");
            var datetime = card.querySelector(".event-datetime");
            var desc = card.querySelector(".event-desc");
            var participants = card.querySelector(".event-participants");
            var tags = [];
            card.querySelectorAll(".tag").forEach(function (t) {
                tags.push(t.textContent.trim());
            });
            if (participants) tags.push(participants.textContent.trim());
            var ageEl = card.querySelector(".event-age");
            if (ageEl) tags.push(ageEl.textContent.trim());
            if (!title || !desc) return;

            card.setAttribute("data-modal-event", "1");
            card.addEventListener("click", function (e) {
                if (e.target.closest(".event-buy")) return;
                showEvent({
                    day: card.dataset.day || "",
                    mon: card.dataset.mon || "",
                    title: title.textContent.trim(),
                    meta: [price ? price.textContent.trim() : "", datetime ? datetime.textContent.trim() : ""].filter(Boolean).join(" · "),
                    desc: desc.textContent.trim(),
                    tags: tags
                });
            });
        });

        document.querySelectorAll(".event-buy.add-btn").forEach(function (btn) {
            if (btn.dataset.ticketBound) return;
            btn.dataset.ticketBound = "1";
            btn.addEventListener("click", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var tickets = ticketsFromBuyBtn(btn);
                if (!tickets.length) return;
                showEventTickets(tickets);
            });
        });

        document.querySelectorAll("[data-event-signup]").forEach(function (btn) {
            if (btn.dataset.modalBound) return;
            btn.dataset.modalBound = "1";
            btn.addEventListener("click", function (e) {
                e.stopPropagation();
                var card = btn.closest(".event-card");
                var titleEl = card && (card.querySelector(".event-card__title") || card.querySelector("h3"));
                open(
                    '<h2 class="homie-modal-title">' + (titleEl ? titleEl.textContent.trim() : "Запись") + "</h2>" +
                    '<p class="homie-success-text">Запись на мероприятие скоро будет доступна онлайн.<br>Следите за новостями в соцсетях Homie.</p>' +
                    '<div class="homie-modal-actions">' +
                    '<button type="button" class="homie-btn homie-btn--dark" data-close>Закрыть</button>' +
                    "</div>",
                    "homie-modal--toast"
                );
                bodyEl.querySelector("[data-close]").addEventListener("click", close);
            });
        });
    }

    function parsePrice(val) {
        var n = Number(String(val || "").replace(/\s/g, "").replace(",", "."));
        return Number.isFinite(n) ? n : 0;
    }

    function handleAddBtnClick(e) {
        var btn = e.target.closest(".add-btn");
        if (!btn || btn.classList.contains("event-buy")) return;
        e.preventDefault();
        e.stopPropagation();
        var name = (btn.dataset.name || "").trim();
        var price = parsePrice(btn.dataset.price);
        if (!name || price <= 0) return;
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
        if (!document.documentElement.dataset.homieCartBound) {
            document.documentElement.dataset.homieCartBound = "1";
            document.addEventListener("click", handleAddBtnClick);
            document.addEventListener("click", bindMerchClick);
        }
        bindEvents();
        bindCheckout();
        bindContacts();
    }

    window.HomieCart = {
        key: CART_KEY,
        read: readCart,
        write: writeCart,
        add: addToCart,
        productMeta: productMetaFromProd
    };

    window.HomieModals = {
        openProduct: showProduct,
        openEvent: showEvent,
        openEventTickets: showEventTickets,
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
