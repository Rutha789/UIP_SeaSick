$(document).ready(function(){
    var h = document.getElementById('cartList').clientHeight;
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
    renderOrderItem(h);
});

function renderOrderItem(h){
    var shopItem = document.createElement('div');
    shopItem.className = "shopItem";
    shopItem.style = "height:"+h+"px;width:"+h+"px;display: inline-block;";
    shopItem.draggable = true;
    var infoIcon = document.createElement("img");
    infoIcon.className = "infoIcon";
    infoIcon.style = "height:20%;width: 20%;top:0;margin: 2% 2% 2% 2%;";
    infoIcon.draggable = false;
    infoIcon.src = "../res/info_icon.png";
    shopItem.appendChild(infoIcon);
    document.getElementById('cartList').appendChild(shopItem);
}