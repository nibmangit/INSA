// let addButtons = document.getElementsByClassName("add-to-cart");
// for (let button of addButtons){
//     button.addEventListener("click", onAddButtonPressed)
// }
// we have to remove this one and place it inside the display menu function
// after the card creates because if we put it here we can't applay the add button
// functionality 'cause it loads before the food card added to the hrml by display menu

let ordered_items_list = document.getElementById("selected-items-list")

let total_price_display = document.getElementById("order-total")

let discout_display = document.getElementById("discount-notice")

let check_out_button = document.getElementById("checkout-btn")

check_out_button.addEventListener("click", check_out_pressed )
let orders = { } 

let prices = { } 

let totalPrice = 0 
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
    console.log(key)

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

function calculate_order_totals(){
    let subtotal = 0;
    for (const [key, value] of Object.entries(orders)) {
        subtotal += prices[key] * parseInt(value);
    }

    let discount = 0;

    if (subtotal > 100) {
        discount = subtotal * 0.20;
    }
    else if (subtotal > 50) {
        discount = subtotal * 0.10;
    }

    let total = Math.round(subtotal - discount);

    return {
        subtotal: subtotal,
        discount: discount,
        total: total
    };
}

function check_out_pressed(E){
    if (Object.keys(orders).length <= 0){
        alert("no orders!");
        return;
    }
    let orderData = {
        items:[],
        subtotal:0,
        discount: 0,
        total: 0
    }

    for (const [key, value] of Object.entries(orders)){
        orderData.items.push({
            name: key,
            quantity: value,
            price: prices[key]
        });    
    }
    
    let totals = calculate_order_totals();

    orderData.subtotal = totals.subtotal;
    orderData.discount = totals.discount;
    orderData.total = totals.total;

    console.log("sending order: ", orderData)

    fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    }).then(response => response.json()).then(data => {
        console.log("server response: ", data);
        alert("Check out seccesful");

        ordered_items_list.innerHTML = "";
        total_price_display.innerHTML = "0";
        discout_display.innerHTML = "";

        for(const key in orders){
            delete orders[key]
        }
        for(const key in prices){
            delete prices[key]
        }
        add_no_orders_yet();
    }).catch(error =>{
        console.log("Error: ", error);
        alert("Something went wrong.")
    })
     
}

function update_discount_display(){
    let totals = calculate_order_totals();
    if (totals.discount > 0) {
        let discount_percentage =
            totals.subtotal > 100 ? 20 : 10;

        discout_display.innerText =
            `${discount_percentage}% discount applied`;

    }
    else { 
        discout_display.innerText = "";
    }
    total_price_display.innerText = totals.total;
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

// featch the menu items
fetch("/api/menu").then(response => response.json()).then(menu=>{
    displayMenu(menu)
});

function displayMenu(menu){
    let foodMenu = document.getElementById("food-menu")
    let drinkMenu = document.getElementById("drink-menu")
    for (const item of menu){
        let card =  document.createElement("div")
        card.className = "food-card"

        card.innerHTML = `
                <img src="static/images/${item.image}">

                <div class="card-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <span class="price">${item.price} birr</span>
                    <button class = "add-to-cart">add to cart</button>
                </div> 
                
                `;
        
        let addButton = card.querySelector(".add-to-cart");
        addButton.addEventListener("click", onAddButtonPressed);

        if(item.category === "food"){
            foodMenu.appendChild(card)
        }else if (item.category === "drink"){
            drinkMenu.appendChild(card)
        }
    }
}