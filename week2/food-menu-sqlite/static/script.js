const ordered_items_list = document.getElementById("selected-items-list");
const total_price_display = document.getElementById("order-total");
const check_out_button = document.getElementById("checkout-btn");

let orders = {};
let prices = {};

fetch("/api/menu")
    .then(response => response.json())
    .then(menu => displayMenu(menu))
    .catch(error => console.error("Error loading menu:", error));

function displayMenu(menu) {
    const foodMenu = document.getElementById("food-menu");
    const drinkMenu = document.getElementById("drink-menu");

    for (const item of menu) {
        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
            <img src="/static/${item.image}">
            <div class="card-content">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <span class="price">${item.price} birr</span>
                <button class="add-to-cart">Add to cart</button>
            </div>
        `;

        card.querySelector(".add-to-cart").addEventListener("click", onAddButtonPressed);

        if (item.category === "food") {
            foodMenu.appendChild(card);
        } else if (item.category === "drinks") {
            drinkMenu.appendChild(card);
        }
    }
}

function onAddButtonPressed(event) {
    const card = event.currentTarget.parentElement;
    const food = card.querySelector("h3").innerText;
    const price = parseInt(card.querySelector(".price").innerText);

    if (food in orders) {
        orders[food] += 1;
    } else {
        orders[food] = 1;
    }

    prices[food] = price;
    showNotification(`Added ${food} to order list!`);
    displayOrderSummary();
}

function displayOrderSummary() {
    ordered_items_list.innerHTML = "";
    let total = 0;

    for (const [key, quantity] of Object.entries(orders)) {
        const itemTotal = prices[key] * quantity;
        total += itemTotal;

        const li = document.createElement("li");
        li.className = "summary-item";

        li.innerHTML = `
            <span><strong>${key}</strong> (${quantity} × ${prices[key]} birr) = ${itemTotal} birr</span>
            <div class="summary-actions">
                <button data-item="${key}" class="qty-btn">+</button>
                <span class="qty-display">${quantity}</span>
                <button data-item="${key}" class="qty-btn">-</button>
                <button data-item="${key}" class="remove-btn">Remove</button>
            </div>
        `;

        li.querySelectorAll("button").forEach(button => {
            button.addEventListener("click", changeQuantity);
        });

        ordered_items_list.appendChild(li);
    }

    if (Object.keys(orders).length === 0) {
        addNoOrdersYet();
    }

    total_price_display.innerText = total;
}

function changeQuantity(event) {
    const key = event.currentTarget.dataset.item;
    const action = event.currentTarget.innerText;

    if (action === "Remove") {
        delete orders[key];
        delete prices[key];
        displayOrderSummary();
        return;
    }

    if (action === "+") {
        orders[key] += 1;
    }

    if (action === "-") {
        orders[key] -= 1;
    }

    if (orders[key] <= 0) {
        delete orders[key];
        delete prices[key];
    }

    displayOrderSummary();
}

check_out_button.addEventListener("click", checkOutPressed);

async function checkOutPressed() {
    if (Object.keys(orders).length === 0) {
        alert("No orders!");
        return;
    }

    const items = [];

    for (const [name, quantity] of Object.entries(orders)) {
        items.push({ name: name, price: prices[name], qty: quantity });
    }

    const customerInput = document.getElementById("customer-name");
    const customer = customerInput.value.trim() || "Guest";

    check_out_button.disabled = true;
    check_out_button.innerText = "Sending order...";

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer: customer, items: items })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Could not submit order.");
        }

        alert(`Order successful! Order #${data.id}`);

        orders = {};
        prices = {};
        customerInput.value = "";

        displayOrderSummary();

    } catch (error) {
        alert(`Something went wrong: ${error.message}`);
    } finally {
        check_out_button.disabled = false;
        check_out_button.innerText = "Confirm Order & Checkout";
    }
}

function addNoOrdersYet() {
    const li = document.createElement("li");
    li.className = "summary-item";
    li.innerText = "no orders yet.";
    ordered_items_list.appendChild(li);
}

let notificationTimeout;

function showNotification(message) {
    const notification = document.getElementById("notification");

    notification.innerText = message;
    notification.classList.add("show");

    clearTimeout(notificationTimeout);

    notificationTimeout = setTimeout(() => {
        notification.classList.remove("show");
    }, 2000);
}