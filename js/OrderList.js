function OrderList (maxItems = Infinity) {
    this.items = {};
    this.ids = [];
    this.max = maxItems;
};

OrderList.fromJSON = function (olObject) {
    var ol = new OrderList();
    ol.items = olObject.items;
    for (let key in olObject.items) {
        ol.items[key] = ItemQuantity.fromJSON(olObject.items[key]);
    }
    ol.items = olObject.items;
    ol.max = olObject.maxItems;
    return ol;
};

// Returns an Command compatible with UndoManager for adding the
// specified item to the OrderList.
OrderList.prototype.addItemCommand = function (item, quantity=1) {
    return new Command(
        function () {
            const res = this.addItem(item, quantity);
            return {success: res, result: undefined};
        }.bind(this),
        function () {
            const res = this.removeItem(item.id, quantity);
            return {success: typeof res !== 'undefined', result: undefined};
        }.bind(this)
        // Let redo be the same as perform
    );
};

OrderList.prototype.clearCommand = function () {
    return new Command(
        function () {
            let result = {
                oldItems: this.items,
                oldIds:  this.ids
              };
            this.items = {};
            this.ids = [];
            return { success: true, result: result};
        }.bind(this),
        function (result) {
            this.items = result.oldItems;
            this.ids = result.oldIds;
        }
        // Let redo be the same as perform
    );
};

OrderList.prototype.addItem = function (item, quantity = 1) {
    if (this.length + quantity > this.max) {
        return false;
    }
    if (item.id in this.items) {
        this.items[item.id].quantity += quantity;
    } else {
        this.items[item.id] = new ItemQuantity(item);
        this.ids.push(item.id);
    }
    return true;
};

// Gets an ItemQuantity id from an index
OrderList.prototype.ixToId = function (ix) {
    return this.ids[ix];
};

OrderList.prototype.idToIx = function (id) {
    return this.ids.indexOf(id);
};

// Gets an ItemQuantity from the order list by id
OrderList.prototype.geItemById = function (id) {
    return this.items[id];
};


// Decrease the quantity of an item by the specified quantity,
// removing it from the order list if quantity reaches 0 or below.
OrderList.prototype.removeItem = function (id, quantity) {
    if (id in this.items) {
        const oldQuantity = this.items[id].quantity;
        if (oldQuantity <= quantity) {
            delete this.items[id];
            const index = this.idToIx(id);
            this.ids.splice(index, index);
        } else {
            this.items[id].quantity -= quantity;
        }
        return Math.max(oldQuantity - quantity,0);
    } else {
        return undefined;
    }
};

// Calculates the number of items on the order list.
OrderList.prototype.length = function () {
    let quantity = 0;
    for (item of this.items) {
        quantity += item.quantity;
    }
    return quantity;
};
