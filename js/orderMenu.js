var cartListHeight = undefined;

var orderList = undefined;
function initialOrderList(){
    const serialized = localStorage.getItem("orderList");
    if (serialized === null) {
        // object does not exist then create a new orderList
        orderList = new OrderList();
        localStorage.setItem("orderList",JSON.stringify(orderList));
    } else {
        orderList = OrderList.fromJSONString(serialized);
    }
}
initialOrderList();

$(document).ready(function () {
    initialOrderBar(function () {
        initialOrderMenu();
    });
});


function initialOrderBarPromise(){
    return new Promise(resolve => initialOrderBar(resolve));
};

function initialOrderBar(callback){
    $('#orderBar').load('../html/orderBar.html', callback);
};

// Given a DOM element, appends it to the order menu.
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

