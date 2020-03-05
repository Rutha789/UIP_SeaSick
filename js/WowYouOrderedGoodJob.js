var orderList =
  OrderList.fromJSONString(localStorage.getItem("orderedList"));


function renderPaymentScreen () {
    $("#paydialog-id").css("display","block");
    $("#overlay-id").css("display","block");
    $(".pay-items").html("");
    let total = 0;
    for (const itemQ of orderList) {
        total += itemQ.item.priceinclvat * itemQ.quantity;
        $(".pay-items").append(itemQ.renderPayment());
    }
    $("#pay-total-amount").text(
        localizedString("pay_total_cost") + " " + total + " SEK"
    );

}

$(document).ready(function () {
    localizePage();
    renderPaymentScreen();
});
