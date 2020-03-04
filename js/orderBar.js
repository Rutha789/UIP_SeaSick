$(document).ready(function(){
    setTimeout(function(){
        var h = document.getElementById('cartList').clientHeight;
    },1000);
});

function addDOMItemToOrderBar(dom) {
    document.getElementById('cartList').appendChild(dom);
}

function onDropOrderList(event){
    event.preventDefault();
    console.info(event);
    console.info(event.target.id);
    console.info("onDropOrderList");
    if (localStorage.getItem("orderList") != null) {
        let orderList = new OrderList();
        orderList = Object.assign(new OrderList,JSON.parse(localStorage.getItem("orderList")));
        orderList.addItem(event.dataTransfer.getData('item'));
    }
}

function allowDropOrderList(event) {
    event.preventDefault();
    console.info("allowDropOrderList");
}

function shopItemOnDrag(event){
    event.preventDefault();
    console.info("shopItemOnDrag");
    console.info(event.target.id);
    // event.dataTransfer.setData("item", event.target.id);
}
