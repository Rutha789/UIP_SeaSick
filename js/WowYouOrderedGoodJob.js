////////////////////////////////////////////////////////////////////////////////
// WowYouOrderedGoodJob.js
//
// Controller module for WowYouOrderedGoodJob.html, the "you-have-ordered" page.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

"use strict";

// Get what has been just been ordered.
var orderList =
  OrderList.fromJSONString(localStorage.getItem("lastOrderedList"));


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
    $("#close-pay").click(() => window.location = "/html/welcomepage.html");
}

$(document).ready(function () {
    localizePage();
    renderPaymentScreen();
});
