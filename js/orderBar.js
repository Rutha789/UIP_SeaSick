////////////////////////////////////////////////////////////////////////////////
// orderBar.js
//
// A controller module for updating the view of the order bar,
// and updating the model according to how the order bar is interacted with.
//
// Author: Valen and Love Waern
////////////////////////////////////////////////////////////////////////////////
"use strict";

// The function for updating the order bar. Initialized when the order bar
// loaded
var updateOrderBar = undefined;

// A command where perform(), undo(), redo() all update the order bar.
// Intended to be augmented onto other commands that modify the order bar.
function updateOrderBarCommand () {
    return new Command(updateOrderBar,updateOrderBar,updateOrderBar);
}

$(document).ready(function(){
    instance.controller.cartListHeight =
        document.getElementById('cartList').clientHeight;
    resizeButton();

    $("#clearButton").click( function(event){
        // Only bother if we actually have items in the order bar.
        if(instance.model.orderList.length() > 0){
            instance.model.undoManager.perform(
                instance.model.orderList.clearCommand()
                    .augment(updateOrderBarCommand())
            );
        }
    });
    // Set up the button that takes you to the payment screen
    // and get the update function for its clickability
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


function addDOMItemToOrderBar(dom) {
  document.getElementById("cartList").appendChild(dom);
}

// Called when "ondrop" is fired for the order bar. This happens when an item
// has been dropped into the order bar.
function onDropOrderList(event){
    // Get the dragged item from the event. If this fails,
    // that means that we've dropped something else into the order bar,
    // and thus we ignore these cases.
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

// Called when "ondragover" is fired for the order bar. This happens
// when an item is being dragged over it.
function allowDropOrderList(event) {
    // Preventing default behaviour allows the ondrop event to fire.
    event.preventDefault();
}

function allowDropOrderMenu(event) {
    event.preventDefault();
}

// Called when "ondragstart" is fired for a menu item.
function shopItemOnDrag(event){
    // Store the item associated with the DOM element in the event.
    // To do this, we must serialize it.
    event.dataTransfer.setData("item",
                               $(event.target).data("item").toJSONString());
}

// Called when "ondrop" is fired for the menu. This happens when an
// item from the order bar is dropped into it.
function removeItem(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        let quan = instance.model.orderList.items[item.nr].quantity;
        // Remove the item from the order bar completely
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
// document.getElementById("vip-user").addEventListener("click", function() {
//   let display = document.getElementById("vipcontainer-id");
//   if (display.style.visibility === "visible") {
//     display.style.visibility = "hidden";
//     document.getElementById("userid").value = "";
//     document.getElementById("userpassid").value = "";
//   } else {
//     display.style.visibility = "visible";
//   }
// });

// document.getElementById("vipclose-id").addEventListener("click", function() {
//   let e = document.getElementById("vipcontainer-id");

//   e.style.visibility = "hidden";
//   document.getElementById("userid").value = "";
//   document.getElementById("userpassid").value = "";
// });
