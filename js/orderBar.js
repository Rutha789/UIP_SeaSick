$(document).ready(function(){
    setTimeout(function(){

        var h = document.getElementById('cartList').clientHeight;
        var itemList;
        itemList = localStorage.item;
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
        addDOMItemToOrderBar(renderItem(h,itemList[0],"orderBar"));
    },1000);
});

function addDOMItemToOrderBar(dom) {
    document.getElementById('cartList').appendChild(dom);
}
