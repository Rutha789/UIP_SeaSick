'use strict';

function OrderController (instance) {
    this.model = instance.model;
    this.promises = {};
};

OrderController.prototype.initialize = function () {
    this.promises.orderBar = new Promise(function (resolve) {
        $(document).ready(function () {
            $('#orderBar').load('/html/orderBar.html', resolve);
        });
    });

    $(document).ready(function () {
        this.onReady();
    }.bind(this));

    this.promises.orderBar.then(function () {
        $("#close-pay").click(function() {
            $("#paydialog-id").css("display","none");
            $("#overlay-id").css("display","none");
        }.bind(this));
        $("#pay-bar").click(function () {
            this.completeOrder({type: "bar"});
        }.bind(this));
        $("#pay-table").click(function () {
            this.completeOrder({type: "table"});
        }.bind(this));
    }.bind(this));
};

OrderController.prototype.onReady = function () {
    $("#filter-form").submit(function(e) {
        e.preventDefault();
        if (typeof this.model.menuManager() !== "undefined") {
            this.submitFiltering();
        }
    }.bind(this));
    $("#toggle-filter-btn").click(function() {
        $("#filter-menu").css(
            "display",
            (i,display) =>
                display === "none" ? "grid" : "none"
        );
    }.bind(this));

    const updateUndo = makeConditionalClick(
        $("#undo-button"),
        () => this.model.undoManager.undoAvailable(),
        () => this.model.undoManager.undo()
    );
    const updateRedo = makeConditionalClick(
        $("#redo-button"),
        () => this.model.undoManager.redoAvailable(),
        () => this.model.undoManager.redo()
    );
    this.updateUndoRedo = function () {updateUndo(); updateRedo();};
    this.updateCreditOption = makeConditionalClick(
        $("#pay-credit"),
        function (total) {
            const userSession = this.model.userSession;
            return typeof userSession !== "undefined"
                && userSession.active() !== null
                && total <= userSession.getCredit();
        }.bind(this),
        function (total) {
            const userSession = this.model.userSession;
            userSession.modifyCredit(-total);
            this.completeOrder({type: "credit",
                                user: userSession.activeId});
        }.bind(this)
    );
    this.model.undoManager.registerCallback(() => this.updateUndoRedo());
    this.updateUndoRedo();

    this.model.promises.dbs.user.then(function () {
        this.onUserDBReady();
    }.bind(this));
    $(".lang").click(event => changeLanguage(event));
    localizePage();
    this.renderMenu();
};

OrderController.prototype.onUserDBReady = function () {
    $("#user-button").click(function(){
        if (this.model.userSession.active() === null) {
            $("#useroverlay-id").show();
            $(".user-overlay-container").show();
        } else {
            this.model.userSession.unauthenticate();
            this.updateHeaderLogin();
        }
    }.bind(this));
    $("#useroverlay-id").click(function(){
        $("#useroverlay-id").hide();
        $(".user-overlay-container").hide();
    }.bind(this));

    $("#login-button").click(function(e) {
        const userName = $("#input-username")[0].value;
        const password = $("#input-password")[0].value;
        const authenticated =
              this.model.userSession.authenticate(userName,password);

        if (!authenticated) {
            $("#login-button")[0].setCustomValidity(
                "Incorrect username or password."
            );
            $("#login-form input").on(
                "input",
                () => $("#login-button")[0].setCustomValidity("")
            );
        }
    }.bind(this));
    $("#login-form").submit(function(e) {
        e.preventDefault();
        $("#useroverlay-id").hide();
        $(".user-overlay-container").hide();
        $("#input-username")[0].value = "";
        $("#input-password")[0].value = "";
        this.model.userSession.unauthenticateAllElse();
        this.updateHeaderLogin();
    }.bind(this));
    this.updateHeaderLogin();
};

OrderController.prototype.renderMenu = function () {
    this.model.promises.menuManager().then(function () {
        for (let cat of $("#main-categories").children()) {
            cat.onclick = () => this.setMainCategory(idToMainCat(cat.id));
        }
        
        let itemContainerWidth =
            document.getElementById('item-container').clientWidth;
        this.promises.orderBar.then(function () {
            $("#item-container").html("");
            for (let item of this.model.pageItems()) {
                addDOMItemToMenu(item.renderForMenu(itemContainerWidth/4));
            }
        }.bind(this));
    }.bind(this));
};

OrderController.prototype.renderPaymentScreen = function () {
    $("#paydialog-id").css("display","block");
    $("#overlay-id").css("display","block");
    $(".pay-items").html("");
    let total = 0;
    for (const itemQ of this.model.orderList) {
        total += itemQ.item.priceinclvat * itemQ.quantity;
        $(".pay-items").append(itemQ.renderPayment());
    }
    $("#pay-total-cost").text(
        localizedString("pay_total_cost") + " " + total + " SEK"
    );
    this.model.promises.dbs.user.then(function () {
        const userSession = this.model.userSession;
        if (userSession.active() !== null) {
            $("#pay-available-credit").text(
                localizedString("menu_credit")
                    + " " + userSession.getCredit() + " SEK"
            );
            $("#pay-credit").show();
            this.updateCreditOption(total);
        } else {
            $("#pay-available-credit").text(" ");
            $("#pay-credit").hide();
        }
    }.bind(this));
};

OrderController.prototype.updateHeaderLogin = function () {
    const user = this.model.userSession.active();
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
            "menu_credit " + this.model.userSession.getCredit() + " SEK"
        );
        localizeDOM($("#header-credit"));
    }
};

OrderController.prototype.completeOrder = function (method) {
    this.model.registerOrder(method);
    window.location = "../html/WowYouOrderedGoodJob.html";
};

OrderController.prototype.setMainCategory = function (category) {
    const menu = this.model.menuManager();
    if (typeof menu === "undefined"
        || menu.mainCategory === category) {
        return;
    }
    $("#" + mainCatToId(menu.mainCategory)).removeClass("selected");
    menu.mainCategory = category;
    $("#" + mainCatToId(menu.mainCategory)).addClass("selected");
    this.renderMenu();
};

OrderController.prototype.submitFiltering = function () {
    const menu = this.model.menuManager();
    if (typeof menu === "undefined") {
        return;
    }
    let action = this
        .model
        .modifyFilterCommand(filter => this.getFilterForm())
        .augment(new Command(
            () => undefined,
            function () {
                this.setFilterForm(menu.filters);
            }.bind(this),
            function () {
                this.setFilterForm(menu.filters);
            }.bind(this)
        ));
    let result = this.model.undoManager.perform(action);
    if (result.success) {
        this.renderMenu();
    }

};

OrderController.prototype.getFilterForm = function () {
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
};

OrderController.prototype.setFilterForm = function (filters) {
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
};

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

function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

function langOptionShow(){
    document.getElementById("language-options").classList.add("show");
}

function changeLanguage(event){
    setLanguage(event.target.id.slice(5));
}
