////////////////////////////////////////////////////////////////////////////////
// RefillBar.js
//
// A controller module for updating the view of the refill bar,
// and updating the model according to how the refill bar is interacted with.
//
// Author: Valen and Love Waern
////////////////////////////////////////////////////////////////////////////////
"use strict";

// The function for updating the order bar. Initialized when the order bar
// loaded
var updateRefillBar = undefined;

// A function which rerenders the menu
// if the filters are configured not to display
// items marked for refill.
// It's called whenever items are un/marked for refill.
function updateRefillMenu () {
    const menu = instance.model.menuManager();
    if (typeof menu !== "undefined") {
        if (menu.filters.notToRefill) {
            // HACK
            // We need to invalidate the storedFilteredMenu
            // of the menu here since the menuManager()
            // checks if it can keep the menu only based
            // on if filters have changed: but here,
            // the filters haven't changed, but rather the
            // availability of items/items marked for refill.
            menu.invalidateCache();
            instance.model.gotoPage(0);
            instance.controller.updatePageIndex();
            instance.controller.renderMenu();
        }
    }
}

// A command where perform(), undo(), redo() all update the refill bar.
// Intended to be augmented onto other commands that modify the refill bar.
function updateRefillBarCommand () {
    return new Command(updateRefillBar,updateRefillBar,updateRefillBar);
}

function updateRefillMenuCommand () {
    return new Command(updateRefillMenu,updateRefillMenu,updateRefillMenu);
}

$(document).ready(function(){
    instance.controller.cartListHeight =
        document.getElementById('cartList').clientHeight;
    resizeButton();

    $("#clearButton").click( function(event){
        // Only bother if we actually have items in the refill bar.
        if(instance.model.orderList.length() > 0){
            instance.model.undoManager.perform(
                instance.model.orderList.clearCommand()
                    .augment(updateRefillBarCommand())
            );
        }
    });
    const updateRefillButton = makeConditionalClick(
        $("#confirmButton"),
        () => instance.model.orderList.length() > 0,
        () => instance.model.undoManager.perform(
                  instance.model.refillItemsCommand()
                      .augment(updateRefillBarCommand())
                      .augment(updateRefillMenuCommand())
              )
    );
    updateRefillBar = function () {
        renderRefillBar();
        updateRefillButton();
    };
    localizePage();
});


function addDOMItemToRefillBar(dom) {
  document.getElementById("cartList").appendChild(dom);
}

// Called when "ondrop" is fired for the refill bar. This happens when an item
// has been dropped into the refill bar.
function onDropOrderList(event){
    // Get the dragged item from the event. If this fails,
    // that means that we've dropped something else into the refill bar,
    // and thus we ignore these cases.
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        instance.model.undoManager.perform(
            instance.model.orderList.addItemCommand(item)
                .augment(updateRefillBarCommand())
        );
    }
}

function renderRefillBar() {
    $("#cartList").html("");
    for (let itemQuantity of instance.model.orderList) {
        const domElem = itemQuantity.renderForRefillList(
            instance.controller.cartListHeight
        );
        addDOMItemToRefillBar(domElem);
    }
}

// Called when "ondragover" is fired for the refill bar. This happens
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
// item from the refill bar is dropped into it.
function removeItem(event){
    const serializedItem = event.dataTransfer.getData('item');
    if (serializedItem !== null) {
        const item = Item.fromJSONString(serializedItem);
        let quan = instance.model.orderList.items[item.nr].quantity;
        // Remove the item from the refill bar completely
        instance.model.undoManager.perform(
            instance.model.orderList.removeItemCommand(item.nr,quan)
                .augment(updateRefillBarCommand())
        );
    }
}

function resizeButton(){
    // Josi's method. We may need to restore this if our
    // current design doesn't work.
    // const h = instance.controller.cartListHeight;
    // var orderButtonBox = document.getElementById("refillButtonBox");
    // orderButtonBox.style.height = h + "px";
    // var confirmButton = document.getElementById("confirmButton");
    // confirmButton.style.height = h/2 + "px";
    // confirmButton.style.width = h/2 + "px";
    // var clearButton = document.getElementById("clearButton");
    // clearButton.style.height = h/2 + "px";
    // clearButton.style.width = h/2 + "px";
}
