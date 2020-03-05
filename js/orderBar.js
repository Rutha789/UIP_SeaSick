$(document).ready(function(){
    cartListHeight = document.getElementById('cartList').clientHeight;
    $("#bar-overlay").css("height", cartListHeight + "px");
    undoManager.registerCallback(renderOrderBar);
});

function addDOMItemToOrderBar(dom) {
    document.getElementById('cartList').appendChild(dom);
}

function onDropOrderList(event){
    // event.stopPropagation();
    // event.preventDefault();
    console.log(event);
    console.info(event.target.id);
    console.info("onDropOrderList");
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        undoManager.perform(orderList.addItemCommand(item));
    }
    // if (localStorage.getItem("orderList") != null) {
    //     let orderList = new OrderList();
    //     orderList = Object.assign(new OrderList,JSON.parse(localStorage.getItem("orderList")));
    //     orderList.addItem(event.dataTransfer.getData('item'));
    // }
}

function renderOrderBar() {
    $("#cartList").html("");
    for (let itemQuantity of orderList) {
        const domElem = itemQuantity.renderForOrderList(cartListHeight);
        addDOMItemToOrderBar(domElem);
    }
}

function allowDropOrderList(event) {
    // event.stopPropagation();
    event.preventDefault();
    console.info("allowDropOrderList");

}

function shopItemOnDrag(event){
    console.info("shopItemOnDrag");
    console.info(event.target.id);
    event.dataTransfer.setData("item", $(event.target).data("item").toJSONString());
    event.dataTransfer.setData("text/plain", "hatred");
}
