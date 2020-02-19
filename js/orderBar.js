$(document).ready(function(){
    var h = document.getElementById('cartList').clientHeight;
    //dummy test data

    // if (typeof(Storage) !== "undefined") {
    //     //     // Store
    //     //     localStorage.setItem("lastname", "Smith");
    //     //     // Retrieve
    //     //     document.getElementById("result").innerHTML = localStorage.getItem("lastname");
    //     // }

    var itemList;
    itemList = localStorage.item
    renderOrderItem(h,itemList[0].itemId,itemList[0].quan);
});

function renderOrderItem(h,itemId,quan){

    //render shopitem regarding the size
    var shopItem = document.createElement('div');
    shopItem.className = "shopItem";
    shopItem.style = "height:"+h+"px;width:"+h+"px;display: inline-block;padding:1% 1% 1% 1%";
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

    //append the item into the order item list
    document.getElementById('cartList').appendChild(shopItem);

    //create a drag and drop overlay
    var overlay = document.getElementById("overlay");
    shopItem.addEventListener("drag", function(){overlay.style = "display:inherit;";});
    shopItem.addEventListener("dragend", function(){overlay.style = "display:none;";});
}
