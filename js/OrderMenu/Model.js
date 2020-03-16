////////////////////////////////////////////////////////////////////////////////
// OrderMenu/Model.js
//
// The model for the customer page.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////
"use strict";

// The entire model for the customer page.
function OrderModel (instance) {
    this.instance = instance;

    // On what menu page the customer is on
    this.pageIx = 0;

    // Number of items on each page.
    this.pageSize = 10;

    // Table number. Currently randomized.
    this.tableNum = Math.floor((Math.random() * 100) + 1);

    // A map of MenuManagers in use. Currently, we only use a MenuManager
    // for the drink menu.
    this.menus = {
        // Will be initialized when the DrinkDB is loaded.
        drink: undefined,
        food: undefined
    };

    // The menu the customer has in focus
    this.activeMenu = "drink";

    this.undoManager = new UndoManager();

    this.stock = new Stock();

    // Will be initialized when the UserDB is loaded.
    this.userSession = undefined;

    // The cart of ordered items
    this.orderList = new OrderList();

    const outerThis = this;

    // The promises relating to and launched by the model
    this.promises = {
        // loadDB()-generated promises
        dbs: {},
        // A function to get a promise for when the currently active
        // menu is ready.
        menuManager: function () {
            const menu = this.activeMenu;
            return this.promises.dbs[menu].then(() => this.menus[menu]);
        }.bind(outerThis)
    };
};

// Synchronous initialization for the model
OrderModel.prototype.initialize = function () {
    this.promises.dbs.drink = loadDB();
    this.promises.dbs.user = loadDB(pathUserDB, "__UserDB", convertUserDB);

    // Once the DrinkDB is loaded, initialize the drink MenuManager
    this.promises.dbs.drink.then(function (drinkDB) {
        this.menus.drink = new MenuManager(drinkDB, this.stock);
    }.bind(this));
    // Once the UserDB is loaded, initialize the UserSession
    this.promises.dbs.user.then(function (userDB) {
        this.userSession = new UserSession(userDB);
    }.bind(this));
};


// Get the MenuManager for the active menu
OrderModel.prototype.menuManager = function () {
    return this.menus[this.activeMenu];
};

// Get the FilteredMenu for the items on the current page
OrderModel.prototype.pageItems = function () {
    const menu = this.menuManager();
    if (typeof menu === "undefined") {
        throw new Error("OrderModel.getPageItems: Menu not ready!");
    }
    const pageMenu =
        menu
          .getMenu()
          // restrict the filtered menu to begin on the first
          // item of the page, and end before the first item
          // of the next page.
          .restricted(
              (this.pageIx)*this.pageSize,
              (this.pageIx + 1)*this.pageSize
          );
    return pageMenu;
};

// Calculate the maximum page index for the given filtering options
OrderModel.prototype.maxPageIx = function () {
    const menu = this.menuManager();
    if (typeof menu === "undefined") {
        throw new Error("OrderModel.maxPageIx: Menu not ready!");
    }
    return Math.max(0,
                    Math.ceiling(menu.getMenu().length() / this.pageSize) - 1
                   );
};

// Switch the page to the given index, if possible
OrderModel.prototype.gotoPage = function (pageIx) {
    if (pageIx >= 0 && pageIx <= this.maxPageIx()) {
        this.pageIx = pageIx;
    }
};

// Go to the previous page, if possible
OrderModel.prototype.prevPage = function () {
    this.gotoPage(this.pageIx - 1);
};

// Go to the next page, if possible
OrderModel.prototype.nextPage = function () {
    this.gotoPage(this.pageIx + 1);
};

// Register the current order with the current method
// adding it to the registeredOrders database,
// and updating the stock.
OrderModel.prototype.registerOrder = function (method) {
    let orders = localStorage.getItem("registeredOrders");
    if (orders === null) {
        orders = [];
    } else {
        orders = JSON.parse(orders);
    }
    const order = {order: this.orderList, table: this.tableNum, method: method};
    orders.push(order);
    localStorage.setItem("registeredOrders",JSON.stringify(orders));
    localStorage.setItem("lastOrderedList",JSON.stringify(this.orderList));
    this.stock.addOrder(order);
};

// A variant of this.menuManager.modifyFilterCommand that resets
// the page index upon changing the page.
OrderModel.prototype.modifyFilterCommand =
    function(filterFunction, preserveFilteredMenu=false) {
        return this
            .menuManager()
            .modifyFilterCommand(filterFunction,preserveFilteredMenu)
            .augment(new Command(
                // perform()
                function () {
                    this.pageIx = 0;
                }.bind(this),
                // undo()
                function () {
                    this.pageIx = 0;
                }.bind(this)
                // Let redo() be the same as perform()
            ));
};
