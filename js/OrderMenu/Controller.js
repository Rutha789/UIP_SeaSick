////////////////////////////////////////////////////////////////////////////////
// OrderMenu/Model.js
//
// The controller for the customer page.
//
// Author: All members
////////////////////////////////////////////////////////////////////////////////
'use strict';

// The controller for the customer page.
function OrderController (instance) {
    // Have an attribute for the model for easier access
    this.model = instance.model;
    // The promises relating to and launched by the controller
    this.promises = {};
};

// Synchronous initialization for the controller
OrderController.prototype.initialize = function () {
    // Create a promise for loading the order bar into the page
    this.promises.orderBar = new Promise(function (resolve) {
        $(document).ready(function () {
            $('#orderBar').load('/html/orderBar.html', resolve);
        });
    });

    $(document).ready(function () {
        this.onReady();
    }.bind(this));
};

// Initialization to be done once both the page is loaded
OrderController.prototype.onReady = function () {
    $("#filter-form").submit(function(e) {
        // preventDefault() to prevent reloading the page
        e.preventDefault();
        // Only submit filtering once the menuManager is loaded.
        this.model.promises.menuManager().then(
            () => this.submitFiltering()
        );
    }.bind(this));
    $("#toggle-filter-btn").click(function() {
        $("#filter-menu").css(
            "display",
            (i,display) =>
                display === "none" ? "grid" : "none"
        );
    }.bind(this));

    // Set-up undo and redo buttons, and create functions
    // for updating their visibility.
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

    // Create a method to update both at once.
    this.updateUndoRedo = function () {updateUndo(); updateRedo();};
    this.updateUndoRedo();

    // Register updateUndoRedo to the undoManager, so that
    // when the undoManager is modified, the visibility of the buttons
    // will be updated.
    this.model.undoManager.registerCallback(() => this.updateUndoRedo());

    // Set up interactions of the payment screen
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

    // Set up the pay-with-credit option, and create a method
    // for updating its visibility.
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


    // Set up the buttons for changing language
    $(".lang").click(event => changeLanguage(event));

    this.model.promises.dbs.user.then(function () {
        this.onUserDBReady();
    }.bind(this));

    localizePage();

    this.renderMenu();
};

// Initialization to be done once both the page and the user database is loaded
OrderController.prototype.onUserDBReady = function () {
    $("#user-button").click(function(){
        if (this.model.userSession.active() === null) {
            // Show the login-popup if no user is active
            $("#useroverlay-id").show();
            $(".user-overlay-container").show();
        } else {
            // Otherwise log-out, and update the header
            this.model.userSession.unauthenticate();
            this.updateHeaderLogin();
        }
    }.bind(this));

    // If the shadowed overlay is clicked while the login-popup
    // is open, the login-popup will be closed.
    $("#useroverlay-id").click(function(){
        $("#useroverlay-id").hide();
        $(".user-overlay-container").hide();
    }.bind(this));

    // Once the login-button is clicked, try to authenticate
    // the user. If that fails, we mark the button input as invalid,
    // preventing the login-form's submit event from firing.
    $("#login-button").click(function(e) {
        const userName = $("#input-username")[0].value;
        const password = $("#input-password")[0].value;
        const authenticated =
              this.model.userSession.authenticate(userName,password);

        if (!authenticated) {
            // By setting the custom validity to non-empty string,
            // we display an error message, and prevent submit from firing.
            $("#login-button")[0].setCustomValidity(
                "Incorrect username or password."
            );
            // When the user changes any detail in the form,
            // remove the error message.
            $("#login-form input").on(
                "input",
                () => $("#login-button")[0].setCustomValidity("")
            );
        }
    }.bind(this));

    $("#login-form").submit(function(e) {
        // At this point, we know we're authenticated, since $("#login-button").click
        // didn't prevent submit from firing, which only happens if authentication
        // succeeeds.

        // Don't reload the damn page
        e.preventDefault();

        // Hide the login pop-up
        $("#useroverlay-id").hide();
        $(".user-overlay-container").hide();

        // Scrub the input fields
        $("#input-username")[0].value = "";
        $("#input-password")[0].value = "";

        // Make sure noone else is logged in
        this.model.userSession.unauthenticateAllElse();

        this.updateHeaderLogin();
    }.bind(this));
    this.updateHeaderLogin();
};

// Render the menu for the current page for the chosen menuManager.
OrderController.prototype.renderMenu = function () {
    // Only render the menu once the menuManager is initialized
    this.model.promises.menuManager().then(function () {
        // Add functionality to each main category for changing the category.
        for (let cat of $("#main-categories").children()) {
            cat.onclick = () => this.setMainCategory(idToMainCat(cat.id));
        }
        let itemContainerWidth =
            document.getElementById('item-container').clientWidth;

        // Remove anything previously in the item container
        $("#item-container").html("");
        for (let item of this.model.pageItems()) {
            addDOMItemToMenu(item.renderForMenu(itemContainerWidth/4));
        }
    }.bind(this));
};

// Render the payment screen
OrderController.prototype.renderPaymentScreen = function () {
    $("#paydialog-id").css("display","block");
    $("#overlay-id").css("display","block");

    // Remove any items previously in the "you will order" list
    $(".pay-items").html("");

    // Calculate the total cost and render each item in parallell.
    let total = 0;
    for (const itemQ of this.model.orderList) {
        total += itemQ.item.priceinclvat * itemQ.quantity;
        $(".pay-items").append(itemQ.renderPayment());
    }
    $("#pay-total-cost").text(
        localizedString("pay_total_cost") + " " + total + " SEK"
    );
    // Only display the available credit and the pay-with-credit option
    // once the user database is loaded and the userSession becomes accessible.
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

// Updates the view of the header.
OrderController.prototype.updateHeaderLogin = function () {
    const user = this.model.userSession.active();
    if (user === null) {
        // Since we're modifying the text of localized DOM elements,
        // we need to invalidate their localization.
        invalidateLocalization($("#header-username"));
        invalidateLocalization($("#header-credit"));
        $("#header-username").text("generic_not_logged_in");
        $("#header-credit").text("");
        localizeDOM($("#header-username"));
    } else {
        invalidateLocalization($("#header-username"));
        invalidateLocalization($("#header-credit"));
        $("#header-username").text(user.first_name + " " + user.last_name);
        $("#header-credit").text(
            "menu_credit " + this.model.userSession.getCredit() + " SEK"
        );
        localizeDOM($("#header-credit"));
    }
};

// Complete the order with the given method,
// switching from the customer page to the "you-have-ordered" page
OrderController.prototype.completeOrder = function (method) {
    this.model.registerOrder(method);
    window.location = "../html/WowYouOrderedGoodJob.html";
};

// Set the main category, highlighting the corresponding button
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

// Get the filter options as specified by the user and apply them.
OrderController.prototype.submitFiltering = function () {
    const menu = this.model.menuManager();
    if (typeof menu === "undefined") {
        return;
    }
    // We augment the modifyFilterCommand of the model with
    // a command to update the user's filter form
    // upon an undo or redo, and rerender the menu
    let filterCommand = this
        .model
        .modifyFilterCommand(filter => this.getFilterForm())
        .augment(new Command(
            // perform(). Does nothing.
            () => undefined,
            // undo()
            function () {
                this.setFilterForm(menu.filters);
                this.renderMenu();
            }.bind(this),
            // redo()
            function () {
                this.setFilterForm(menu.filters);
                this.renderMenu();
            }.bind(this)
        ));
    let result = this.model.undoManager.perform(filterCommand);
    // If the new filters are different, rerender the menu.
    if (result.success) {
        this.renderMenu();
    }

};

// Get the filter options as specified by the user
OrderController.prototype.getFilterForm = function () {
    let filters = emptyFilters();
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        // The map we modify for this element
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            // In this case, we're modifying a field in filters.drink,
            // and not filters, so we change studiedFilters
            studiedFilters = filters.drink;
            key = key.slice(6);
        }
        if (key in studiedFilters) {
            if (element.type === "checkbox") {
                studiedFilters[key] = element.checked;
            } else if (element.type === "number" && element.value !== "") {
                studiedFilters[key] = Number(element.value);
            } else if (element.type === "search") {
                // Specifically for searches, we split the string up into
                // required phrases using googlify
                studiedFilters[key] = googlify(element.value);
            } else if (element.type === "text") {
                studiedFilters[key] = element.value;
            };
        }
    }
    return filters;
};

// Update the filter form visible to the user to reflect the
// filters in place in the menuManager.
OrderController.prototype.setFilterForm = function (filters) {
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            // In this case, we're want looking at a field in filters.drink,
            // and not filters, so we change studiedFilters
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
                  // This is basically the reverse of "googlify".
                  // For each search pharse, we wrap it into
                  // quotes if that phrase contains a space,
                  // and then we join the phrases together.
                    studiedFilters[key]
                    .map(str => str.includes(" ") ? "\"" + str + "\"" : str)
                    .join(" ");
            } else if (element.type === "text") {
                element.value = studiedFilters[key];
            };
        }
    }
};

// Given the identifier for a main category,
// convert it into the id for the button of that category.
//
// This will convert null to "cat-ALL"
function mainCatToId(cat) {
    if (cat === null) {
        cat = "ALL";
    }
    return "cat-" + cat;
}

// Given the id of a main category button, convert it into the identifier
// for that main category.
//
// This will convert "cat-ALL" to null
function idToMainCat(id) {
    let cat = id.slice(4);
    if (cat === "ALL") {
        cat = null;
    }
    return cat;
}

// Appends a dom element to the menu
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

// Displays the language menu
function langOptionShow(){
    document.getElementById("language-options").classList.add("show");
}

// Given the event of a language choice being clicked,
// switch the application language to that language,
// and relocalize the page.
function changeLanguage(event){
    const oldLanguage = applicationLanguage;
    setLanguage(event.target.id.slice(5));
    // Only relocalize if the language has actually changed.
    if (oldLanguage !== applicationLanguage) {
        localizePage();
    }
}
