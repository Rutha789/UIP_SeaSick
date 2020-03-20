let registeredOrders = getRegisteredOrders();
let stock = new Stock();
$(document).ready(function(){
    initialOrderTab();
});

function setRegisteredOrders(orders) {
    localStorage.setItem("registeredOrders", JSON.stringify(orders));
}

function removeOrder(tbl) {
    registeredOrders = registeredOrders.filter(order => order.table !== tbl);
    setRegisteredOrders(registeredOrders);
    $('#tab').html("");
    $('#orderitem').html("");
    initialOrderTab();
}

function getRegisteredOrders() {
    let orders = localStorage.getItem("registeredOrders");
    if (orders === null) {
        orders = [];
        localStorage.setItem("registeredOrders", JSON.stringify(orders));
    } else {
        orders = JSON.parse(orders);
        for (let order of orders) {
            order.order = OrderList.fromJSON(order.order);
        }
    }
    return orders;
}

function initialOrderTab(){
    let tab = document.getElementById("tab");
    for(let key in registeredOrders){
        let x = orderTabTemplate(registeredOrders[key],key);
        tab.appendChild(x);
    }
    $('.sidetable-items').click( function (event) {
        let order = $('#'+event.currentTarget.id).data('item');
        orderDetailTemplate(order);
        $('#orderitem').html("");
        $('#complete-order')[0].onclick = function () {
            console.log(stock.commitOrder(order.table));
            removeOrder(order.table);
        };
        $('#cancel-order')[0].onclick = function () {
            stock.removeOrder(order.table);
            removeOrder(order.table);
        };
        let container = document.getElementById('orderitem');
        for (let key in order.order.items){
            container.appendChild(orderItemTemplate(order.order.items[key]));
        }
    });
}

function orderTabTemplate(orderlist,key){
    let div = document.createElement('div');
    div.classList.add('sidetable-items');
    div.id = 'orderlist'+key;
    let tableNo = document.createElement('h3');
    tableNo.textContent = 'Table no: '+ orderlist.table;
    tableNo.classList.add('tableNo');
    div.appendChild(tableNo);
    let itemtotal = document.createElement('h3');
    itemtotal.textContent = 'Items total: '+ orderlist.order.ids.length;
    itemtotal.classList.add('item-total');
    div.appendChild(itemtotal);
    let scarce = document.createElement('h3');
    scarce.textContent = 'Scarce Items: 1';
    scarce.classList.add('scarce');
    div.appendChild(scarce);
    $(div).data("item",registeredOrders[key]);
    return div;
}

function orderDetailTemplate(orderlist){
    console.info(orderlist);
    let tableNo = document.getElementById('tableno');
    tableNo.textContent = "Table No.: " + orderlist.table;
    let vip = document.getElementById('vip');
    vip.textContent = 'VIP: David';
    return true;
}

function orderItemTemplate(order){
    let item = order.item;
    let div = document.createElement('div');
    div.classList.add('maintable-items');
    div.draggable = false;
    let img = document.createElement('img');
    img.src ="../res/alcohol.png";
    img.style.height='100px';
    img.style.width='100px';
    div.appendChild(img);
    let alname = document.createElement('h3');
    alname.classList.add('alname');
    alname.textContent = 'Name: '+item.name;
    div.appendChild(alname);
    let cat = document.createElement('h3');
    cat.classList.add('cat');
    cat.textContent = 'Category: '+item.category;
    div.appendChild(cat);
    let pcent = document.createElement('h3');
    pcent.classList.add('pcent');
    pcent.textContent = 'Alcohol %: '+item.alcoholstrength+'%';
    div.appendChild(pcent);
    let organic = document.createElement('h3');
    organic.classList.add('organic');
    organic.textContent = item.organic?'Organic: Yes':'Organic: No';
    div.appendChild(organic);

    let tbox = document.createElement('input');
    tbox.placeholder = 'Total';

    let quantity = document.createElement('h3');
    quantity.classList.add('quantity');
    quantity.textContent = 'Quantity: '+order.quantity;
    quantity.appendChild(tbox);
    div.appendChild(quantity);
    let remaining = document.createElement('h3');
    remaining.classList.add('remaining');
    remaining.textContent = 'Remaining: ???';
    div.appendChild(remaining);

    let price = document.createElement('h3');
    price.classList.add('price');
    price.textContent = 'Price: ' + item.priceinclvat + ' SEK';
    price.appendChild(tbox);
    div.appendChild(price);
    return div;
}
