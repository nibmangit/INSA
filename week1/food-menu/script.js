let addButtons = document.getElementsByClassName("add-to-cart");
console.log(addButtons)
let ordered_items_list = document.getElementById("selected-items-list")

let total_price_display = document.getElementById("order-total")

let discout_display = document.getElementById("discount-notice")

let check_out_button = document.getElementById("checkout-btn")



check_out_button.addEventListener("click", check_out_pressed )
let orders = { }
//{"ፍርፍር": 2, "እንቁላል": 1}

let prices = { }
//{"ፍርፍር": 50, "እንቁላል": 20}

let totalPrice = 0

for (let button of addButtons){
    button.addEventListener("click", onAddButtonPressed)
}

function onAddButtonPressed(e){
    let food = e.currentTarget.parentElement.querySelector("h3")
    let price = e.currentTarget.parentElement.querySelector("span").innerText
    price = parseInt(price)
    
    if (food.innerText in orders){
        orders[food.innerText] += 1
        prices[food.innerText] = price
        showNotification(`added ${food.innerText} to order list!`)
    }
    else{
        orders[food.innerText] = 1
        prices[food.innerText] = price
        showNotification(`added ${food.innerText} to order list!`)

    }


    ordered_items_list.innerHTML = "";

    for (const[key, value] of Object.entries(orders)){
        totalPrice = prices[key] * parseInt(value);

        let li = document.createElement("li");

        li.className = "summary-item";

        li.innerHTML = `
            <span><strong>${key}</strong>(${value} x ${prices[key]} birr) = ${totalPrice} birr</span>

            <div class="summary-actions">
        
                <button data-item="${key}" class="qty-btn">+</button>

                <span class="qty-display">${value}</span>

                <button data-item="${key}" class="qty-btn">-</button>

                <button data-item="${key}" class="remove-btn">Remove</button>

            </div>
        `;

        li.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", change_quantity);
        });

       

        ordered_items_list.appendChild(li);

    }

    let total_cost = 0;

    for (const[key, value] of Object.entries(orders)){
        total_cost += prices[key] * parseInt(value);
    }

    total_price_display.innerText = total_cost;

    update_discount_display(total_cost);

}


function change_quantity(e){
    let key = e.currentTarget.dataset.item;

    if (e.currentTarget.innerText == "Remove"){
        delete orders[key];
        delete prices[key];
        e.currentTarget.closest("li").remove();

        let total_cost = 0;

        for (const[key, value] of Object.entries(orders)){
                total_cost += prices[key] * parseInt(value);
        }

        total_price_display.innerText = total_cost;

        update_discount_display(total_cost)

        if (Object.keys(orders).length <= 0){
            add_no_orders_yet()
        }
        return;
    }


    if (e.currentTarget.innerText == "+"){
        if (key in orders){
            orders[key] += 1;
        }

    }
    else if (e.currentTarget.innerText == "-"){
        if (key in orders){
            orders[key] -= 1;
        }
    }

    let total_cost = 0;

    for (const[key, value] of Object.entries(orders)){
        total_cost += prices[key] * parseInt(value);
    }

    total_price_display.innerText = total_cost;

    update_discount_display(total_cost)

    if (orders[key] <= 0){
        delete orders[key];
        delete prices[key];
        e.currentTarget.closest("li").remove();

        if (Object.keys(orders).length <= 0){
            add_no_orders_yet()
        }


        return;
    }

    let totalPrice = prices[key] * parseInt(orders[key]);

    e.currentTarget.parentElement.parentElement.querySelector("span").innerHTML =  `<span><strong>${key}</strong> = ${totalPrice} birr</span>`;

    e.currentTarget.parentElement.querySelector("span").innerHTML = `<span class="qty-display">${orders[key]}</span>`;

   
}

function check_out_pressed(E){
    if (Object.keys(orders).length > 0){
        alert("check out sucessfull")

        ordered_items_list.innerHTML = '';
        total_price_display.innerText = 0

        for (const key in orders) {
            delete orders[key];
        }
        for (const key in prices) {
            delete prices[key];
        }

        add_no_orders_yet()
    }
    else{
        alert("no orders!")

    }
}

function update_discount_display(total_cost){
     if (total_cost > 100){
        discout_display.innerText = "20% discount applied"

        total_price_display.innerText = Math.round(total_cost * 0.8);
    }
    else if(total_cost > 50){
        discout_display.innerText = "10% discount applied"

        total_price_display.innerText = Math.round(total_cost * 0.9);
    }
    else{
        discout_display.innerText = ''

        let total_cost = 0;

        for (const[key, value] of Object.entries(orders)){
                total_cost += prices[key] * parseInt(value);
        }

        total_price_display.innerText = total_cost;
    }
}

function add_no_orders_yet(){
    let li = document.createElement("li");
    li.className = "summary-item";
    li.innerHTML = `no orders yet.`
    ordered_items_list.appendChild(li);
}

let notification_timeout;

function showNotification(message) {
    const notification = document.getElementById('notification');
    
    notification.innerText = message;
    
    notification.classList.add('show');

    clearTimeout(notification_timeout)

    notification_timeout=setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}
