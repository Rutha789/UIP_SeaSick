ItemQuantity.prototype.renderPayment = function () {
    const paymentItem = document.createElement('div');
    paymentItem.className = "pay-item";
    paymentItem.innerHTML =
        '<div>'
        +   '<img src="https://source.unsplash.com/random/200x200" alt="" />'
        + '</div>'
        + '<div>'
        +   '<h4>' + this.item.name + '</h4>'
        +   '<h5>' + this.item.priceinclvat + " SEK </h4>"
        +   '<div class="amount">'
        +     '<h4>' + localizedString("pay_amount") + '</h4>'
        +     '<h5>' + this.quantity + '</h5>'
        +     '</div>'
        + '</div>';
    return paymentItem;
};

Item.prototype.renderForMenu = function (height) {
    return renderItem(height,this,"orderMenu");
};

ItemQuantity.prototype.renderForOrderList = function (height) {
    return renderItem(height,this.item,"orderBar",this.quantity);
};
Item.prototype.renderForOrderList = function (height) {
    return renderItem(height,this,"orderBar");
};

function renderItem(h,item,type,quantity=1){

    //render shopitem regarding the size
    var shopItem = document.createElement('div');
    shopItem.className = "shopItem";
    shopItem.style.width = h+"px";
    shopItem.style.height = h+"px";
    $(shopItem).data("item",item);

    var nameTag = document.createElement("div");
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

            nameTag.style.width = h+"px";
            nameTag.style.bottom = "0";
            nameTag.style.fontSize = "x-large";

            //create a infoicon for each shopItem
            var infoIcon = document.createElement("img");
            infoIcon.className = "infoIcon";
            infoIcon.draggable = false;
            infoIcon.src = "../res/info_icon.png";
            shopItem.appendChild(infoIcon);

            if (item.organic) {
                var ecoIcon = document.createElement("img");
                ecoIcon.className = "ecoIcon";
                ecoIcon.draggable = false;
                ecoIcon.src = "../res/eco_icon.png";
                shopItem.appendChild(ecoIcon);
            }

            //create a pcent
            var pcent = document.createElement("p");
            pcent.className = "pcent";
            pcent.textContent = item.alcoholstrength;
            pcent.draggable = false;
            shopItem.appendChild(pcent);

            break;
        case "orderBar":
            //drag and drop behaviours

            //start of the orderbar item generation
            shopItem.id = "orderBar"+item.nr;
            nameTag.style.width = h+"px";
            nameTag.style.top = "0";
            nameTag.style.fontSize = "100%";

            //increase decrease quantity button
            var indeButton = document.createElement('div');
            indeButton.className = "indeButton";
            indeButton.draggable = false;
            indeButton.style.height = h/5+"px";
            shopItem.appendChild(indeButton);

            var inButton = document.createElement('div');
            inButton.className = "inButton";
            inButton.draggable = false;
            inButton.textContent= "+";
            inButton.style.height = h/5+"px";
            inButton.style.width = h/3+"px";
            inButton.style.fontSize = h/6+"px";
            inButton.style.backgroundColor = "green";
            inButton.classList.add("indeDiv");
            indeButton.appendChild(inButton);

            var quanText = document.createElement('div');
            quanText.className = "quanText";
            quanText.draggable = false;
            quanText.textContent = quantity;
            quanText.style.height = h/5+"px";
            quanText.style.width = h/3+"px";
            quanText.style.fontSize = h/6+"px";
            quanText.style.backgroundColor = "grey";
            quanText.classList.add("indeDiv");
            indeButton.appendChild(quanText);

            var deButton = document.createElement('div');
            deButton.className = "inButton";
            deButton.draggable = false;
            deButton.textContent= "-";
            deButton.style.height = h/5+"px";
            deButton.style.width = h/3+"px";
            deButton.style.fontSize = h/6+"px";
            deButton.style.backgroundColor = "red";
            deButton.classList.add("indeDiv");
            indeButton.appendChild(deButton);
            break;
    }

    //create a drag and drop overlay
    shopItem.ondrag = function (event) {
        if (type === "orderBar") {
            $("#bar-overlay").show();
            $("#bar-overlay").addClass("shadowed");
            $("#menu-overlay").show();
            $("#menu-overlay").addClass("red-bordered");
        } else {
            $("#menu-overlay").show();
            $("#menu-overlay").addClass("shadowed");
            $("#bar-overlay").show();
            $("#bar-overlay").addClass("green-bordered");
        }
    };
    shopItem.ondragend = function (event) {
        if (type === "orderBar") {
            $("#bar-overlay").hide();
            $("#bar-overlay").removeClass("shadowed");
            $("#menu-overlay").hide();
            $("#menu-overlay").removeClass("red-bordered");
        } else {
            $("#menu-overlay").hide();
            $("#menu-overlay").removeClass("shadowed");
            $("#bar-overlay").hide();
            $("#bar-overlay").removeClass("green-bordered");
        }
    };

    shopItem.draggable = true;
    //append the item into the order item list
    return shopItem;
}
