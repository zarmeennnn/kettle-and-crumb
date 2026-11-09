const MENU = [
    { name: "Espresso", cat: "Coffee", price: 3.0, desc: "Double shot, dark chocolate and orange peel." },
    { name: "Flat white", cat: "Coffee", price: 4.5, desc: "Silky steamed milk over a double ristretto." },
    { name: "Oat latte", cat: "Coffee", price: 5.0, desc: "House oat milk, lightly sweet, very smooth." },
    { name: "Cold brew", cat: "Cold", price: 4.75, desc: "Steeped 18 hours, served over big ice." },
    { name: "Iced vanilla latte", cat: "Cold", price: 5.5, desc: "Real vanilla bean syrup and whole milk." },
    { name: "Cardamom bun", cat: "Bakery", price: 3.75, desc: "Soft, sticky, baked at 6 a.m." },
    { name: "Butter croissant", cat: "Bakery", price: 3.5, desc: "Laminated three days, flaky outside." },
    { name: "Banana bread", cat: "Bakery", price: 3.25, desc: "Brown butter and toasted walnuts." }
];
const CATS = ["All", "Coffee", "Cold", "Bakery"];
const ICONS = { "Espresso": "espresso", "Flat white": "cup", "Oat latte": "cup", "Cold brew": "iced", "Iced vanilla latte": "iced", "Cardamom bun": "bun", "Butter croissant": "croissant", "Banana bread": "loaf" };
const HOURS = [ // Sunday first, matching Date.getDay()
    { day: "Sunday", open: 8, close: 15 }, { day: "Monday", open: 7, close: 17 },
    { day: "Tuesday", open: 7, close: 17 }, { day: "Wednesday", open: 7, close: 17 },
    { day: "Thursday", open: 7, close: 17 }, { day: "Friday", open: 7, close: 19 },
    { day: "Saturday", open: 8, close: 19 }
];
const fmtHour = h => (h % 12 || 12) + (h < 12 ? " am" : " pm");
const money = n => "$" + n.toFixed(2);
const cart = {};
let activeCat = "All";

const tabsEl = document.getElementById("tabs"), itemsEl = document.getElementById("items"),
    cartEl = document.getElementById("cart"), emptyEl = document.getElementById("empty"),
    totalEl = document.getElementById("total"), placeEl = document.getElementById("place"),
    confirmEl = document.getElementById("confirm");

function renderTabs() {
    tabsEl.innerHTML = "";
    CATS.forEach(c => {
        const b = document.createElement("button");
        b.className = "tab"; b.textContent = c; b.setAttribute("aria-pressed", c === activeCat);
        b.onclick = () => { activeCat = c; renderTabs(); renderItems(); };
        tabsEl.appendChild(b);
    });
}
function renderItems() {
    itemsEl.innerHTML = "";
    MENU.filter(i => activeCat === "All" || i.cat === activeCat).forEach(i => {
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `<span class="ico c-${i.cat}"><svg viewBox="0 0 64 64" aria-hidden="true"><use href="#i-${ICONS[i.name]}"/></svg></span><h3>${i.name}</h3><span class="price">${money(i.price)}</span><p>${i.desc}</p>`;
        const add = document.createElement("button");
        add.className = "add"; add.textContent = "Add"; add.setAttribute("aria-label", "Add " + i.name);
        add.onclick = () => { cart[i.name] = (cart[i.name] || 0) + 1; confirmEl.textContent = ""; renderCart(); };
        li.appendChild(add);
        itemsEl.appendChild(li);
    });
}
function renderCart() {
    cartEl.innerHTML = "";
    let total = 0;
    Object.keys(cart).forEach(name => {
        const item = MENU.find(m => m.name === name);
        total += item.price * cart[name];
        const li = document.createElement("li");
        li.innerHTML = `<span>${name}</span><span class="qty"><button aria-label="Remove one ${name}">−</button><span>${cart[name]}</span><button aria-label="Add one ${name}">+</button></span><span>${money(item.price * cart[name])}</span>`;
        const [minus, plus] = li.querySelectorAll("button");
        minus.onclick = () => { if (--cart[name] <= 0) delete cart[name]; renderCart(); };
        plus.onclick = () => { cart[name]++; renderCart(); };
        cartEl.appendChild(li);
    });
    emptyEl.style.display = total ? "none" : "block";
    totalEl.textContent = money(total);
    placeEl.disabled = !total;
}
placeEl.onclick = () => {
    const n = Object.values(cart).reduce((a, b) => a + b, 0);
    Object.keys(cart).forEach(k => delete cart[k]);
    renderCart();
    confirmEl.textContent = `Order placed: ${n} item${n > 1 ? "s" : ""}. We’ll call your name at the counter.`;
};

function renderHours() {
    const now = new Date(), today = now.getDay(), t = now.getHours() + now.getMinutes() / 60;
    const table = document.getElementById("hours");
    table.innerHTML = HOURS.map((h, i) =>
        `<tr class="${i === today ? "today" : ""}"><td>${h.day}</td><td>${fmtHour(h.open)} – ${fmtHour(h.close)}</td></tr>`).join("");
    const h = HOURS[today], isOpen = t >= h.open && t < h.close;
    document.getElementById("dot").className = "dot" + (isOpen ? " open" : "");
    document.getElementById("statusText").textContent = isOpen
        ? `Open now, until ${fmtHour(h.close)}`
        : (t < h.open ? `Closed, opens today at ${fmtHour(h.open)}` : `Closed, opens tomorrow at ${fmtHour(HOURS[(today + 1) % 7].open)}`);
}

renderTabs(); renderItems(); renderCart(); renderHours();