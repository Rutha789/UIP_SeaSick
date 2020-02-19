function OrderList (maxItems = Infinity) {
    this.items = {};
    this.ids = [];
    this.max = maxItems;
};


// Returns an Action compatible with UndoManager for adding the
// specified item to the OrderList.
OrderList.prototype.addItemAction = function (item) {
    // TODO
};

OrderList.prototype.addItem = function (item) {
        if (this.length < this.max) {
            this.list.push(item);
            return true;
        }
        return false;
    };

OrderList.prototype.addItem = function (item) {
    if (this.length >= this.max) {
        return false;
    }
    if (item.id in this.items) {
        this.items[item.id].quantity += 1;
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


// Decrement the quantity of an item, removing it from the order list if quantity reaches 0.
OrderList.prototype.removeItem = function (id) {
    if (id in this.items) {
        const oldQuantity = this.items[id].quantity;
        if (oldQuantity <= 1) {
            delete this.items[id];
            const index = this.idToIx(id);
            this.ids.splice(index, index);
        } else {
            this.items[id].quantity -= 1;
        }
        return oldQuantity - 1;
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
