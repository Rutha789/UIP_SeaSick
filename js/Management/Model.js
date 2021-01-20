////////////////////////////////////////////////////////////////////////////////
// Management/Model.js
//
// The model for the management page.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////
"use strict";

// The entire model for the management page.
function ManagementModel (instance) {
    this.instance = instance;

    // On what menu page the manager is on
    this.pageIx = 0;

    // Number of items on each page.
    this.pageSize = 12;

    // A map of MenuManagers in use. Currently, we only use a MenuManager
    // for the drink menu.
    this.menus = {
        // Will be initialized when the DrinkDB is loaded.
        drink: undefined,
        food: undefined
    };

    // The menu the manager has in focus
    this.activeMenu = "drink";

    this.undoManager = new UndoManager();

    this.stock = new Stock();

    // The cart of items to refill. Hack: quantities of each item are ignored.
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
ManagementModel.prototype.initialize = function () {
    this.promises.dbs.drink = loadDB();

    // Once the DrinkDB is loaded, initialize the drink MenuManager
    this.promises.dbs.drink.then(function (drinkDB) {
        this.menus.drink = new MenuManager(drinkDB, this.stock);
    }.bind(this));
};


// Get the MenuManager for the active menu
ManagementModel.prototype.menuManager = function () {
    return this.menus[this.activeMenu];
};

// Get the FilteredMenu for the items on the current page
ManagementModel.prototype.pageItems = function () {
    const menu = this.menuManager();
    if (typeof menu === "undefined") {
        throw new Error("ManagementModel.getPageItems: Menu not ready!");
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
ManagementModel.prototype.maxPageIx = function () {
    const menu = this.menuManager();
    if (typeof menu === "undefined") {
        throw new Error("ManagementModel.maxPageIx: Menu not ready!");
    }
    return Math.max(0,
                    Math.ceil(menu.getMenu().length() / this.pageSize) - 1
                   );
};

// Switch the page to the given index, if possible
ManagementModel.prototype.gotoPage = function (pageIx) {
    if (this.pageAvailable(pageIx)) {
        this.pageIx = pageIx;
    }
};

// Go to the previous page, if possible
ManagementModel.prototype.prevPage = function () {
    this.gotoPage(this.pageIx - 1);
};

// Checks if there's a previous page available
ManagementModel.prototype.prevPageAvailable = function () {
    return this.pageIx > 0;
};

// Checks if there's a next page available
ManagementModel.prototype.nextPageAvailable = function () {
    return this.pageIx < this.maxPageIx();
};

// Checks if the specific page is available
ManagementModel.prototype.pageAvailable = function (pageIx) {
    return pageIx >= 0 && pageIx <= this.maxPageIx();
};

// Go to the next page, if possible
ManagementModel.prototype.nextPage = function () {
    this.gotoPage(this.pageIx + 1);
};

// Returns an UndoManager-compatible command for
// marking all items currently present in the refill bar
// to be refilled, and clear the bar.
ManagementModel.prototype.refillItemsCommand = function () {
    return this.stock.orderRefillCommand(this.orderList.ids)
    // orderRefillCommand fails if all items in the bar are already marked
    // for refill.
    // But in that case, we still want to pretend the command worked,
    // so the orderList is cleared, even though it had no effect on the stock.
        .unfailing()
        .augment(this.orderList.clearCommand());
};

// A variant of this.menuManager.modifyFilterCommand that resets
// the page index upon changing the page.
ManagementModel.prototype.modifyFilterCommand =
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
