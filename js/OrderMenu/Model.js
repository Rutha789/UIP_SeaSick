'use strict';

function OrderModel (instance) {
    this.instance = instance;
    this.pageIx = 0;
    this.pageSize = 10;
    this.tableNum = Math.floor((Math.random() * 100) + 1);
    this.menus = {
        drink: undefined,
        food: undefined
    };
    this.activeMenu = "drink";
    this.undoManager = new UndoManager();
    this.stock = new Stock();
    this.userSession = undefined;
    const outerThis = this;
    this.promises = {
        dbs: {},
        menuManager: function () {
            const menu = this.activeMenu;
            return this.promises.dbs[menu].then(() => this.menus[menu]);
        }.bind(outerThis)
    };
};

OrderModel.prototype.initialize = function () {
    this.initializeOrderList();
    this.promises.dbs.drink = loadDB();
    this.promises.dbs.user = loadDB(pathUserDB, "__UserDB", convertUserDB);
    this.promises.dbs.drink.then(function (drinkDB) {
        this.menus.drink = new MenuManager(drinkDB, this.stock);
    }.bind(this));
    this.promises.dbs.user.then(function (userDB) {
        this.userSession = new UserSession(userDB);
    }.bind(this));
};

OrderModel.prototype.initializeOrderList = function () {
    const serialized = localStorage.getItem("orderList");
    if (serialized === null) {
        // object does not exist then create a new orderList
        this.orderList = new OrderList();
        localStorage.setItem("orderList",JSON.stringify(this.orderList));
    } else {
        this.orderList = OrderList.fromJSONString(serialized);
    }
};


OrderModel.prototype.menuManager = function () {
    return this.menus[this.activeMenu];
};

OrderModel.prototype.pageItems = function () {
    const menu = this.menuManager();
    if (typeof menu === "undefined") {
        throw new Error("OrderModel.getPageItems: Menu not ready!");
    }
    const pageMenu =
        menu
        .getMenu()
        .restricted(
            (this.pageIx)*this.pageSize,
            (this.pageIx + 1)*this.pageSize
        );
    return pageMenu;
};

OrderModel.prototype.maxPageIx = function () {
    const menu = this.menuManager();
    if (typeof menu === "undefined") {
        throw new Error("OrderModel.maxPageIx: Menu not ready!");
    }
    return Math.max(0,
                    Math.ceiling(menu.getMenu().length() / this.pageSize) - 1
                   );
};

OrderModel.prototype.gotoPage = function (pageIx) {
    if (pageIx >= 0 && pageIx <= this.maxPageIx()) {
        this.pageIx = pageIx;
    }
};

OrderModel.prototype.prevPage = function () {
    this.gotoPage(this.pageIx - 1);
};

OrderModel.prototype.nextPage = function () {
    this.gotoPage(this.pageIx + 1);
};

OrderModel.prototype.registerOrder = function (method) {
    let items = localStorage.getItem("registeredOrders");
    if (items === null) {
        items = [];
    } else {
        items = JSON.parse(items);
    }
    items.push({order: this.orderList, table: this.tableNum, method: method});
    localStorage.setItem("registeredOrders",JSON.stringify(items));
    localStorage.setItem("lastOrderedList",JSON.stringify(this.orderList));
};

OrderModel.prototype.modifyFilterCommand = function(filterFunction) {
    return this
        .menuManager()
        .modifyFilterCommand(filterFunction)
        .augment(new Command(
            function () {
                this.pageIx = 0;
            }.bind(this),
            function () {
                this.pageIx = 0;
            }.bind(this)));
};
