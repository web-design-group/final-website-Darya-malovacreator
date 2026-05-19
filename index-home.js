(function () {
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
})();

(function () {
    var slides = document.querySelectorAll(".slide");
    var fade = document.querySelector(".fade");
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

    function updateSlider() {
        slides.forEach(function (slide, i) {
            slide.classList.remove("active-slide", "side");
            slide.classList.add(i === 1 ? "active-slide" : "side");
        });
        fade.style.opacity = 0;
        setTimeout(function () {
            document.getElementById("name").textContent = people[current].name;
            document.getElementById("role").textContent = people[current].role;
            document.getElementById("quote").textContent = people[current].quote;
            document.getElementById("nick").textContent = people[current].nick;
            fade.style.opacity = 1;
        }, 300);
    }

    setInterval(function () {
        current = (current + 1) % people.length;
        var left = current === 0 ? 4 : current;
        var center = current + 1;
        var right = current + 2 > 4 ? current - 2 : current + 2;
        slides[0].innerHTML = '<img src="' + imgSrc(left) + '" alt="">';
        slides[1].innerHTML = '<img src="' + imgSrc(center) + '" alt="">';
        slides[2].innerHTML = '<img src="' + imgSrc(right) + '" alt="">';
        updateSlider();
    }, 5000);
})();
