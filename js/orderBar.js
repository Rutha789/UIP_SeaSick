$(document).ready(function(){
    cartListHeight = document.getElementById('cartList').clientHeight;
    undoManager.registerCallback(renderOrderBar);
    resizeButton();
    $("#clearButton").click( function(event){
        if(orderList.length() > 0){undoManager.perform(orderList.clearCommand())};
        }
    )
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

function allowDropOrderMenu(event) {
    event.preventDefault();
    console.info("allowDropOrderMenu");

}

function shopItemOnDrag(event){
    event.dataTransfer.setData("item", $(event.target).data("item").toJSONString());
}

function removeItem(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        let quan = orderList.items[item.nr].quantity;
        undoManager.perform(orderList.removeItemCommand(item.nr,quan));
    }
}

function resizeButton(){
    var orderButtonBox = document.getElementById("orderButtonBox");
    orderButtonBox.style.height = cartListHeight + "px";
    var confirmButton = document.getElementById("confirmButton");
    confirmButton.style.height = cartListHeight/2 + "px";
    confirmButton.style.width = cartListHeight/2 + "px";
    var clearButton = document.getElementById("clearButton");
    clearButton.style.height = cartListHeight/2 + "px";
    clearButton.style.width = cartListHeight/2 + "px";
}
