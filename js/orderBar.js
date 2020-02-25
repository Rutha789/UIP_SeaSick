$(document).ready(function(){
    var h = document.getElementById('cartList').clientHeight;

    var itemList;
    itemList = localStorage.item;
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
    addDOMItemToMenu(renderOrderItem(h,itemList[0].itemId,itemList[0].quan));
});

function addDOMItemToMenu(dom) {
    document.getElementById('cartList').appendChild(dom);
}

function renderOrderItem(h,itemId,quan = 1, pc = "40%"){

    //render shopitem regarding the size
    var shopItem = document.createElement('div');
    shopItem.className = "shopItem";
    shopItem.style = "height:"+h+"px;width:"+h+"px;display: inline-block;padding:1% 1% 1% 1%;background-color: black;";
    shopItem.draggable = true;
    shopItem.ondrag = true;
    if(itemId != undefined){shopItem.id = itemId;}

    //create a infoicon for each shopItem
    var infoIcon = document.createElement("img");
    infoIcon.className = "infoIcon";
    infoIcon.style = "height:20%;width: 20%;top:0;margin: 2% 2% 2% 2%;";
    infoIcon.draggable = false;
    infoIcon.src = "../res/info_icon.png";
    shopItem.appendChild(infoIcon);

    //create a ecoIcon
    var ecoIcon = document.createElement("img");
    ecoIcon.className = "ecoIcon";
    ecoIcon.style = "height:20%;width: 20%;bottom:0;margin: 2% 2% 2% 2%;";
    ecoIcon.draggable = false;
    ecoIcon.src = "../res/eco_icon.png";
    shopItem.appendChild(ecoIcon);

    //create a pcent
    var pcent = document.createElement("p");
    pcent.className = "pcent";
    pcent.textContent = pc;
    pcent.style = "height:20%;width: 20%;margin: 2% 2% 2% 2%;color:white;font-weight: bold;";
    pcent.draggable = false;
    shopItem.appendChild(pcent);

    //increase decrease quantity button
    var indeButton = document.createElement('div');
    indeButton.className = "indeButton";
    indeButton.style = "height:15%;width:100%;display:inline-block;"
    indeButton.draggable = false;
    shopItem.appendChild(indeButton);

    var inButton = document.createElement('div');
    inButton.className = "inButton";
    inButton.style = "height:100%;width:"+h/3+"px;background-color:green;display:inline-block;float:left;text-align: center;font-weight: bolder;font-size: larger;";
    inButton.draggable = false;
    inButton.textContent= "+";
    indeButton.appendChild(inButton);

    var quanText = document.createElement('div');
    quanText.className = "quanText";
    quanText.style = "height:100%;width:"+h/3+"px;background-color:grey;display:inline-block;text-align: center;font-weight: bolder;font-size: larger;";
    quanText.draggable = false;
    quanText.textContent= quan;
    indeButton.appendChild(quanText);

    var deButton = document.createElement('div');
    deButton.className = "inButton";
    deButton.style = "height:100%;width:"+h/3+"px;background-color:red;display:inline-block;float:right;text-align: center;font-weight: bolder;font-size: larger;"
    deButton.draggable = false;
    deButton.textContent= "-";
    indeButton.appendChild(deButton);

    //create a drag and drop overlay
    var overlay = document.getElementById("overlay");
    shopItem.addEventListener("drag", function(){overlay.style = "display:inherit;";});
    shopItem.addEventListener("dragend", function(){overlay.style = "display:none;";});

    // Return the created item DOM element.
    return shopItem;
}
