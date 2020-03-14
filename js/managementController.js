let registeredOrders = getRegisteredOrders();
$(document).ready(function(){
    initialOrderTab();
});

function setRegisteredOrders(orders) {
    localStorage.getItem("registeredOrders", JSON.serialize(orders));
}

function getRegisteredOrders() {
    let orders = localStorage.getItem("registeredOrders");
    if (orders === null) {
        orders = [];
        localStorage.setItem("registeredOrders", JSON.serialize(orders));
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
        let order = $('#'+event.target.id).data('item');
        orderDetailTemplate(order);
        $('#orderitem').html("");
        let container = document.getElementById('orderitem');
        for (let key in order.order.items){
            container.appendChild(orderItemTemplate(order.order.items[key].item));
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

function orderItemTemplate(item){
    let div = document.createElement('div');
    div.classList.add('maintable-items');
    div.draggable = false;
    let img = document.createElement('img');
    img.src ="../res/alcohol.png";
    img.style.height='50px';
    img.style.width='50px';
    div.appendChild(img);
    let alname = document.createElement('h3');
    alname.classList.add('alname');
    alname.textContent = 'Name: '+item.name;
    div.appendChild(alname);
    let cat = document.createElement('h3');
    cat.classList.add('cat');
    cat.textContent = 'category: '+item.category;
    div.appendChild(cat);
    let pcent = document.createElement('h3');
    pcent.classList.add('pcent');
    pcent.textContent = 'alcohol percentage: '+item.alcoholstrength+'%';
    div.appendChild(pcent);
    let organic = document.createElement('h3');
    organic.classList.add('organic');
    organic.textContent = 'organic kosner: '+ item.organic?'Yes':'No';
    div.appendChild(organic);

    let tbox = document.createElement('input');
    tbox.placeholder = 'Total';

    let quantity = document.createElement('h3');
    quantity.classList.add('quantity');
    quantity.textContent = 'quantity: ';
    quantity.appendChild(tbox);
    div.appendChild(quantity);
    let remaining = document.createElement('h3');
    remaining.classList.add('remaining');
    remaining.textContent = 'remaining: ';
    div.appendChild(remaining);

    let price = document.createElement('h3');
    price.classList.add('price');
    price.textContent = 'price: ' + item.priceinclvat + ' SEK';
    price.appendChild(tbox);
    div.appendChild(price);
    return div;
        // <div class="maintable-items">
        //     <img src="../res/alcohol.png" height=50px width=50px/>
        //     <h3 class="alname">Name: </h3>
        //     <h3 class="cat">category: </h3>
        //     <h3 class="pcent">alcohol percentage: </h3>
        //     <h3 class="organic">organic kosner: </h3>
        //     <h3 class="quantity">quantity: <input class="tbox" type=" " placeholder="Total" value=""></h3>
        //     <h3 class="remaining">remaining:<input class="tbox" type=" " placeholder="Total" value=""></h3>
        //     <h3 class="price">price: </h3>
        //     <h3><input  class="bttn" type="submit" name="" value="Reset"></h3>
        // </div>
}