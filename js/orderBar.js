'use strict';

var updateOrderBar = undefined;
$(document).ready(function(){
    instance.controller.cartListHeight =
        document.getElementById('cartList').clientHeight;
    resizeButton();
    $("#clearButton").click( function(event){
        if(instance.model.orderList.length() > 0){
            instance.model.undoManager.perform(
                instance.model.orderList.clearCommand()
                    .augment(updateOrderBarCommand())
            );
        }
    });
    let updatePaymentButton = makeConditionalClick(
        $("#confirmButton"),
        () => instance.model.orderList.length() > 0,
        () => instance.controller.renderPaymentScreen()
    );
    updateOrderBar = function () {
        updatePaymentButton();
        renderOrderBar();
    };
});

function updateOrderBarCommand () {
    return new Command(updateOrderBar,updateOrderBar,updateOrderBar);
}

function addDOMItemToOrderBar(dom) {
    document.getElementById('cartList').appendChild(dom);
}


function onDropOrderList(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        instance.model.undoManager.perform(
            instance.model.orderList.addItemCommand(item)
                .augment(updateOrderBarCommand())
        );
    }
}

function renderOrderBar() {
    $("#cartList").html("");
    for (let itemQuantity of instance.model.orderList) {
        const domElem = itemQuantity.renderForOrderList(
            instance.controller.cartListHeight
        );
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
    event.dataTransfer.setData("item",
                               $(event.target).data("item").toJSONString());
}

function removeItem(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        let quan = instance.model.orderList.items[item.nr].quantity;
        instance.model.undoManager.perform(
            instance.model.orderList.removeItemCommand(item.nr,quan)
                .augment(updateOrderBarCommand())
        );
    }
}

function resizeButton(){
    const h = instance.controller.cartListHeight;
    var orderButtonBox = document.getElementById("orderButtonBox");
    orderButtonBox.style.height = h + "px";
    var confirmButton = document.getElementById("confirmButton");
    confirmButton.style.height = h/2 + "px";
    confirmButton.style.width = h/2 + "px";
    var clearButton = document.getElementById("clearButton");
    clearButton.style.height = h/2 + "px";
    clearButton.style.width = h/2 + "px";
}
