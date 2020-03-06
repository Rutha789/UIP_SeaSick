$(document).ready(function(){
    cartListHeight = document.getElementById('cartList').clientHeight;
    undoManager.registerCallback(renderOrderBar);
});

function addDOMItemToOrderBar(dom) {
    document.getElementById('cartList').appendChild(dom);
}

function onDropOrderList(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        undoManager.perform(orderList.addItemCommand(item));
    }
}

function renderOrderBar() {
    $("#cartList").html("");
    for (let itemQuantity of orderList) {
        const domElem = itemQuantity.renderForOrderList(cartListHeight);
        addDOMItemToOrderBar(domElem);
    }
}

function allowDropOrderList(event) {
    event.preventDefault();

}

function shopItemOnDrag(event){
    event.dataTransfer.setData("item", $(event.target).data("item").toJSONString());
    event.dataTransfer.setData("text/plain", "hatred");
}

function removeItem(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        let quan = orderList.items[item.nr].quantity;
        undoManager.perform(orderList.removeItemCommand(item.nr,quan));
    }
}