window.onload = function() {
    initialPage();
    orderItemList();
};

function initialPage(){
    $('#orderBar').load('../html/orderBar.html');
};

function orderItemList(){
    var dummyItem=[];
    orderItem = new OrderItem(DB2["spirits"][2]["nr"],1);
    dummyItem.push(orderItem);
    localStorage.setItem("item",dummyItem);
};

class OrderItem{
    constructor(itemId, quan) {
        this.itemId = itemId;
        this.quan = quan;
    }
}