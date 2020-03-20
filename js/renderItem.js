////////////////////////////////////////////////////////////////////////////////
// renderItem.js
//
// Functions and additional item methods for rendering items.
//
// Author: Valen, Josi
////////////////////////////////////////////////////////////////////////////////

"use strict";

ItemQuantity.prototype.renderPayment = function() {
  const paymentItem = document.createElement("div");
  paymentItem.className = "pay-item";
  paymentItem.innerHTML =
    "<div>" +
    '<img style="width:100%;" src="/res/alcohol.png" alt="" />' +
    "</div>" +
    "<div>" +
    "<h4>" +
    this.item.name +
    "</h4>" +
    "<h5>" +
    this.item.priceinclvat +
    " SEK </h4>" +
    '<div class="amount">' +
    "<h4>" +
    localizedString("pay_amount") +
    "</h4>" +
    "<h5>" +
    this.quantity +
    "</h5>" +
    "</div>" +
    "</div>";
  return paymentItem;
};

Item.prototype.renderForMenu = function(height) {
  return renderItem(height, this, "orderMenu");
};

ItemQuantity.prototype.renderForOrderList = function(height) {
  return renderItem(height, this.item, "orderBar", this.quantity);
};
ItemQuantity.prototype.renderForRefillList = function(height) {
    return renderItem(height, this.item, "refillBar", 1);
};
Item.prototype.renderForOrderList = function(height) {
  return renderItem(height, this, "orderBar");
};

function renderItem(h = 60,item,type,quantity=1){

    //render shopitem regarding the size
    let itemId = item.nr;
    let shopItem = document.createElement('div');
    shopItem.className = "shopItem";
    // shopItem.style.width = h+"px";
    // shopItem.style.height = h+"px";
    $(shopItem).data("item",item);

    let nameTag = document.createElement("div");
    nameTag.className = "nameTag";
    nameTag.textContent = item.name;
    nameTag.draggable = false;
    shopItem.appendChild(nameTag);

    shopItem.ondragstart = function (event) {
        shopItemOnDrag(event);
    };

    switch (type) {
        case "orderMenu":
            //start of the orderMenu item generation
            shopItem.id = "orderMenu"+item.nr;
            // nameTag.ondragstart = event => shopItemOnDrag(event);

            // nameTag.style.width = h+"px";
            nameTag.style.bottom = "0";
            // nameTag.style.fontSize = "x-large";

            //create a infoicon for each shopItem
            let infoIcon = document.createElement("img");
            infoIcon.className = "infoIcon";
            infoIcon.draggable = false;
            infoIcon.src = "../res/info_icon.png";
            shopItem.appendChild(infoIcon);

            if (item.organic) {
                let ecoIcon = document.createElement("img");
                ecoIcon.className = "ecoIcon";
                ecoIcon.draggable = false;
                ecoIcon.src = "../res/eco_icon.png";
                shopItem.appendChild(ecoIcon);
            }

            let price = document.createElement("p");
            price.className = "pcent";
            price.textContent = item.priceinclvat + " SEK";
            shopItem.appendChild(price);

            //create a pcent
            let pcent = document.createElement("p");
            pcent.className = "pcent";
            pcent.textContent = item.alcoholstrength + "%";
            pcent.draggable = false;
            shopItem.appendChild(pcent);

            let quan = document.createElement("p");
            quan.classList = "pcent item-quan";
            quan.textContent = instance.model.stock.getStock(item.id);
            quan.draggable = false;
            shopItem.appendChild(quan);


            infoIcon.onclick = function (event){
                displayInfoPopUp(item);
            };

            // let infoDiv = document.createElement("div");
            // infoDiv.className = "infoDiv";
            // infoDiv.classList.add("hide");
            // infoDiv.draggable = false;
            // let infoId = itemId + "info";
            // infoDiv.id = infoId;
            // infoIcon.onmouseover = function (event){
            //     infoDiv.classList.remove("hide");
            //     infoDiv.classList.add("show");
            // };
            // shopItem.onmouseleave = function (event){
            //     infoDiv.classList.remove("show");
            //     infoDiv.classList.add("hide");
            // };

            //Add drink info

            // let packaging = document.createElement("p");
            // packaging.textContent = "Packaging: " + item.packaging;
            // infoDiv.appendChild(packaging);

            // let producer = document.createElement("p");
            // producer.textContent = "Producer: " + item.producer;
            // infoDiv.appendChild(producer);


            // shopItem.appendChild(infoDiv);

            break;
        case "orderBar":

            //start of the orderbar item generation
            shopItem.id = "orderBar"+item.nr;
            shopItem.style.width = h / 9 + "vw";
            shopItem.style.height = h / 7.5 + "vh";
            nameTag.style.top = "0";

            //increase decrease quantity button
            let indeButton = document.createElement('div');
            indeButton.className = "indeButton";
            indeButton.draggable = false;
            indeButton.style.height = h / 8 + "%";
            indeButton.style.bottom = "0";
            shopItem.appendChild(indeButton);


            let inButton = document.createElement('div');
            inButton.className = "inButton";
            inButton.draggable = false;
            inButton.textContent = "+";
            inButton.style.height = h / 5 + "px";
            inButton.style.width = h / 30 + "vw";
            inButton.style.fontSize = h / 6 + "px";

            inButton.style.backgroundColor = "green";
            inButton.classList.add("indeDiv");
            $(inButton).data("item",item);
            $(inButton).click( function(event){
                const currQuantity =
                      instance.model.orderList.items[item.id].quantity;
                const available = instance.model.stock.getStock(item.id);
                const stockMin = instance.model.menuManager().filters.stockMin;

                // Don't add the item if that would go past the buffer
                // This is a hack. The issue needs to be communicated better,
                // but we don't have the time to fix that.
                if ( available >= currQuantity + stockMin) {
                    instance.model.undoManager.perform(
                        instance.model.orderList.addItemCommand(item)
                            .augment(updateOrderBarCommand())
                    );
                }
            });
            indeButton.appendChild(inButton);

            let quanText = document.createElement('div');
            quanText.className = "quanText";
            quanText.draggable = false;
            quanText.textContent = quantity;
            quanText.style.height = h / 5 + "px";
            quanText.style.width = h / 30 + "vw";
            quanText.style.fontSize = h / 6 + "px";
            quanText.style.backgroundColor = "grey";
            quanText.classList.add("indeDiv");
            indeButton.appendChild(quanText);

            let deButton = document.createElement('div');
            deButton.className = "inButton";
            deButton.draggable = false;
            deButton.textContent= "-";
            deButton.style.height = h / 5 + "px";
            deButton.style.width = h / 30 + "vw";
            deButton.style.fontSize = h / 6 + "px";
            deButton.style.backgroundColor = "red";
            deButton.classList.add("indeDiv");
            $(deButton).click( function(event){
                instance.model.undoManager.perform(
                    instance.model.orderList.removeItemCommand(itemId)
                        .augment(updateOrderBarCommand())
                );
            });
            indeButton.appendChild(deButton);
            break;
        case "refillBar":

            //start of the orderbar item generation
            shopItem.id = "refillBar"+item.nr;
            shopItem.style.width = h / 9 + "vw";
            shopItem.style.height = h / 7.5 + "vh";
            nameTag.style.top = "0";
            break;
    }

    //create a drag and drop overlay when an item is being dragged
    shopItem.ondrag = function (event) {
        switch (type) {
        case "orderBar":
        case "refillBar":
            $("#bar-overlay").show();
            $("#bar-overlay").addClass("shadowed");
            $("#wrapper").addClass("red-bordered");
            break;
        case "orderMenu":
            $("#menu-overlay").show();
            $("#menu-overlay").addClass("shadowed");
            $("#inOrderBar").addClass("green-bordered");
        }
    };
    //remove the overlay when the item stops being dragged
    shopItem.ondragend = function (event) {
        switch (type) {
        case "orderBar":
        case "refillBar":
            $("#bar-overlay").hide();
            $("#bar-overlay").removeClass("shadowed");
            $("#wrapper").removeClass("red-bordered");
            break;
        case "orderMenu":
            $("#menu-overlay").hide();
            $("#menu-overlay").removeClass("shadowed");
            $("#inOrderBar").removeClass("green-bordered");
            break;
        }
    };

    shopItem.draggable = true;
    //append the item into the order item list
    return shopItem;
}
