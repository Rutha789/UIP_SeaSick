'use strict';

var undoManager = new UndoManager();
var cartListHeight = undefined;
var itemContainerWidth = undefined;
var orderList = undefined;
var orderBarPromise = undefined;

var pageIx = 0;
var pageSize = 10;
var drinkMenuModel = undefined;
var userSession = undefined;
var stock = new Stock();
var tableNum = Math.floor((Math.random() * 100) + 1);


$(document).ready(initialOrderMenu);

var drinkDBPromise = loadDB();
var userDBPromise = loadDB(pathUserDB,
                           "__UserDB",
                           convertUserDB);

function updateLoginSpecific() {
    const user = userSession.active();
    if (user === null) {
        $("#header-username").attr("localize", "");
        $("#header-username").text("generic_not_logged_in");
        $("#header-credit").text("");
        $("#header-credit").removeAttr("localize");
        localizeDOM($("#header-username"));
    } else {
        $("#header-username").removeAttr("localize");
        $("#header-username").text(user.first_name + " " + user.last_name);
        $("#header-credit").attr("localize","");
        $("#header-credit").text(
            "menu_credit " + userSession.getCredit() + " SEK"
        );
        localizeDOM($("#header-credit"));
    }
}

userDBPromise.then(function (userDB) {
    userSession = new UserSession(userDB);
    $(document).ready(function () {
        $("#user-button").click(function(){
            if (userSession.active() === null) {
                $("#useroverlay-id").show();
                $(".user-overlay-container").show();
            } else {
                userSession.unauthenticate();
                updateLoginSpecific();
            }
        });
        $("#useroverlay-id").click(function(){
            $("#useroverlay-id").hide();
            $(".user-overlay-container").hide();
        });

        $("#login-button").click(function(e) {
            const userName = $("#input-username")[0].value;
            const password = $("#input-password")[0].value;
            if (userSession.authenticate(userName,password)) {
            } else {
                $("#login-button")[0].setCustomValidity(
                    "Incorrect username or password."
                );
                $("#login-form input").on(
                    "input",
                    () => $("#login-button")[0].setCustomValidity("")
                );
            }
        });
        $("#login-form").submit(function(e) {
            e.preventDefault();
            $("#useroverlay-id").hide();
            $(".user-overlay-container").hide();
            $("#input-username")[0].value = "";
            $("#input-password")[0].value = "";
            userSession.unauthenticateAllElse();
            updateLoginSpecific();
        });
        updateLoginSpecific();
    });
});


function initialOrderList(){
    const serialized = localStorage.getItem("orderList");
    if (serialized === null) {
        // object does not exist then create a new orderList
        orderList = new OrderList();
        localStorage.setItem("orderList",JSON.stringify(orderList));
    } else {
        orderList = OrderList.fromJSONString(serialized);
    }
}

initialOrderList();


function initialOrderBar(callback){
    $('#orderBar').load('../html/orderBar.html', callback);
};

function initialOrderBarPromise(){
    return new Promise(resolve => initialOrderBar(resolve));
};

// Given a DOM element, appends it to the order menu.
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

function clickIf (DOMelem, condition, callback) {
    if (condition) {
        $(DOMelem).removeClass("unclickable");
        $(DOMelem).click(callback);
    } else {
        $(DOMelem).addClass("unclickable");
        $(DOMelem).off("click");
    }
}

function renderPaymentScreen () {
    $("#paydialog-id").css("display","block");
    $("#overlay-id").css("display","block");
    $(".pay-items").html("");
    let total = 0;
    for (const itemQ of orderList) {
        total += itemQ.item.priceinclvat * itemQ.quantity;
        $(".pay-items").append(itemQ.renderPayment());
    }
    $("#pay-total-cost").text(
        localizedString("pay_total_cost") + " " + total + " SEK"
    );
    userDBPromise.then(function () {
        if (userSession.active() !== null) {
            $("#pay-available-credit").text(
                localizedString("menu_credit")
                    + " " + userSession.getCredit() + " SEK"
            );
            $("#pay-credit").show();
            clickIf($("#pay-credit"),
                    total <= userSession.getCredit(),
                    function () {
                        userSession.modifyCredit(-total);
                        completeOrder({type: "credit",
                                       user: userSession.activeId});
                    }
                   );
        } else {
            $("#pay-available-credit").text(" ");
            $("#pay-credit").hide();
        }
    });
}

function initialOrderMenu() {
    orderBarPromise = initialOrderBarPromise();
    orderBarPromise.then(function () {
        undoManager.registerCallback(
            () =>
                clickIf(
                    $("#confirmButton"),
                    orderList.length() > 0,
                    renderPaymentScreen
                )
        );
        $("#close-pay").click(function() {
            $("#paydialog-id").css("display","none");
            $("#overlay-id").css("display","none");
        });
        $("#pay-bar").click(function () {
            completeOrder({type: "bar"});
        });
        $("#pay-table").click(function () {
            completeOrder({type: "table"});
        });
    });
    $("#filter-form").submit(function(e) {
        e.preventDefault();
        if (typeof drinkMenuModel !== "undefined") {
            submitFiltering();
        }
    });
    $("#toggle-filter-btn").click(function() {
        $("#filter-menu").css(
            "display",
            (i,display) =>
                display === "none" ? "grid" : "none"
        );
    });
    updatePage();
    localizePage();
    undoManager.registerCallback(updatePage);
    $("#undo-button").click(() => undoManager.undo());
    $("#redo-button").click(() => undoManager.redo());

    // Load the drink database asynchronously. Once it's been loaded,
    // display the first 10 items in the menu.
    drinkDBPromise.then(function (dataBase) {

        drinkMenuModel = new MenuModel(dataBase, stock);

        $("#item-container").html("");

        for (let cat of $("#main-categories").children()) {
            cat.onclick = () => setMainCategory(idToMainCat(cat.id));
        }
        updatePage();
    });
    $(".lang").click(() => changeLanguage(event));
};

function nextPage() {
    if (typeof drinkMenuModel === "undefined") {
        return;
    }
    let filteredMenu =
        drinkMenuModel
        .getMenu()
        .restricted((pageIx + 1)*pageSize,(pageIx+2)*pageSize);
    if (filteredMenu.length() > 0) {
        pageIx++;
        updatePage();
    }
}

function prevPage() {
    if (typeof drinkMenuModel === "undefined") {
        return;
    }
    if (pageIx > 0) {
        pageIx--;
        updatePage();
    }
}

function completeOrder (method) {
    let items = localStorage.getItem("registeredOrders");

    if (items === null) {
        items = [];
    } else {
        items = JSON.parse(items);
    }
    items.push({order: orderList, table: tableNum, method: method});
    localStorage.setItem("registeredOrders",JSON.stringify(items));
    localStorage.setItem("orderedList",JSON.stringify(orderList));
    window.location = "../html/WowYouOrderedGoodJob.html";
}

// $(document).on("submit", "#filter-form input[type='submit']", function () {
//     if (typeof drinkMenuModel !== "undefined") {
//         submitFiltering();
//     }
//     return false;
// });

function updateUndoRedoButtons() {
    $("#undo-button").css("opacity", 0.5 + undoManager.undoAvailable()*0.5);
    $("#redo-button").css("opacity", 0.5 + undoManager.redoAvailable()*0.5);
}

function mainCatToId(cat) {
    if (cat === null) {
        cat = "ALL";
    }
    return "cat-" + cat;
}
function idToMainCat(id) {
    let cat = id.slice(4);
    if (cat === "ALL") {
        cat = null;
    }
    return cat;
}

function setMainCategory(category) {
    if (typeof drinkMenuModel === "undefined"
        || drinkMenuModel.mainCategory === category) {
        return;
    }
    $("#" + mainCatToId(drinkMenuModel.mainCategory)).removeClass("selected");
    drinkMenuModel.mainCategory = category;
    $("#" + mainCatToId(drinkMenuModel.mainCategory)).addClass("selected");
    updatePage();
}

function submitFiltering() {
    let action = drinkMenuModel
        .modifyFilterCommand(getFilterForm)
        .augment(new Command(
            function () {
                pageIx = 0;
            },
            function () {
                setFilterForm(drinkMenuModel.filters);
                pageIx = 0;
            },
            function () {
                setFilterForm(drinkMenuModel.filters);
                pageIx = 0;
            }));
    undoManager.perform(action);
}

function getFilterForm() {
    let filters = emptyFilters();
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            studiedFilters = filters.drink;
            key = key.slice(6);
        }
        if (key in studiedFilters) {
            if (element.type === "checkbox") {
                studiedFilters[key] = element.checked;
            } else if (element.type === "number" && element.value !== "") {
                studiedFilters[key] = Number(element.value);
            } else if (element.type === "search") {
                studiedFilters[key] = googlify(element.value);
            } else if (element.type === "text") {
                studiedFilters[key] = element.value;
            };
        }
    }
    return filters;
}

function setFilterForm(filters) {
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            studiedFilters = filters.drink;
            key = key.slice(6);
        }
        if (key in studiedFilters) {
            if (element.type === "checkbox") {
                element.checked = studiedFilters[key];
            } else if (element.type === "number") {
                element.value = studiedFilters[key];
            } else if (element.type === "search") {
                element.value =
                    studiedFilters[key]
                    .map(str => str.includes(" ") ? "\" + str + \"" : str)
                    .join(" ");
            } else if (element.type === "text") {
                element.value = studiedFilters[key];
            };
        }
    }
}

function updatePage() {
    updateUndoRedoButtons();
    itemContainerWidth = document.getElementById('item-container').clientWidth;
    if (typeof drinkMenuModel === "undefined"
     || typeof orderBarPromise === "undefined") {
        return;
    }
    orderBarPromise.then(function () {
        let filteredMenu =
            drinkMenuModel
            .getMenu()
            .restricted(pageIx*pageSize,(pageIx+1)*pageSize);
        $("#item-container").html("");
        for (let item of filteredMenu) {
            addDOMItemToMenu(item.renderForMenu(itemContainerWidth/4));
        }
    });
}

// Given a DOM element, appends it to the order menu.
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

function langOptionShow(){
    console.info("hihi");
    document.getElementById("language-options").classList.add("show");
}

function changeLanguage(event){
    console.info(event.target.id);
    setLanguage(event.target.id);
}
