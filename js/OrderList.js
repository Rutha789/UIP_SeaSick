function OrderList (maxItems = Infinity) {
    this.items = {};
    this.ids = [];
    this.max = maxItems;
    this[Symbol.iterator] = () => new OrderListIterator(this);
};

function OrderListIterator (ol) {
    this.index = 0;
    this.next = function () {
        if (this.index >= ol.ids.length) {
            return {done: true};
        } else {
            this.index++;
            return { done: false, value: ol.items[ol.ids[this.index-1]] };
        }
    };
}

OrderList.fromJSON = function (olObject) {
    var ol = new OrderList();
    ol.items = olObject.items;
    for (let key in olObject.items) {
        ol.items[key] = ItemQuantity.fromJSON(olObject.items[key]);
    }
    ol.ids = olObject.ids;
    // So JSON doesn't support Infinity; it serializes it to null.
    // Thus we check if olObject.max is null, and if so, set max to Infinity.
    ol.max = olObject.max === null ? Infinity : olObject.max;
    return ol;
};

OrderList.fromJSONString = str => OrderList.fromJSON(JSON.parse(str));

OrderList.prototype.toJSON = function () {
    const rep = {items:{}};
    for (let key in this.items) {
        rep.items[key] = this.items[key].toJSON();
    }
    rep.ids = [...this.ids];
    rep.max = this.max;
    return rep;
};

OrderList.prototype.toJSONString = function () {
    return JSON.stringify(this);
};

// Returns an Command compatible with UndoManager for adding the
// specified item to the OrderList.
OrderList.prototype.addItemCommand = function (item, quantity=1, offset=0) {
    return new Command(
        function () {
            const res = this.addItem(item, quantity, offset);
            return {success: res, result: undefined};
        }.bind(this),
        function () {
            const res = this.removeItem(item.id, quantity);
            return {success: typeof res !== 'undefined', result: undefined};
        }.bind(this)
        // Let redo be the same as perform
    );
};

// Returns an Command compatible with UndoManager for removing the
// specified item from the OrderList.
OrderList.prototype.removeItemCommand = function (itemId, quantity=1) {
    return new Command(
        function () {
            const oldIx = this.idToIx(itemId);
            const itemQuantity = this.getItemQuantityById(itemId);
            const remaining = this.removeItem(itemId, quantity);
            return {
                success: typeof remaining !== undefined,
                result: {
                    oldIx: oldIx,
                    oldItemQuantity: itemQuantity,
                    oldRemaining: remaining
                }
            };
        }.bind(this),
        function (performed) {
            const res = this.addItem(
                performed.oldItemQuantity.item,
                performed.oldItemQuantity.quantity - performed.oldRemaining,
                performed.oldIx
            );
            return {success: res};
        }.bind(this)
        // Let redo be the same as perform
    );
};

// OrderList.prototype.removeItemCommand = function (item, quantity=1) {}

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
        }.bind(this)
        // Let redo be the same as perform
    );
};

OrderList.prototype.addItem = function (item, quantity = 1,offset=0) {
    if (this.length() + quantity > this.max) {
        return false;
    }
    if (item.id in this.items) {
        this.items[item.id].quantity += quantity;
    } else {
        this.items[item.id] = new ItemQuantity(item, quantity);
        this.ids.splice(offset, 0, item.id);
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
OrderList.prototype.getItemQuantityById = function (id) {
    return this.items[id];
};


// Decrease the quantity of an item by the specified quantity,
// removing it from the order list if quantity reaches 0 or below.
OrderList.prototype.removeItem = function (id, quantity=1) {
    if (id in this.items) {
        const oldQuantity = this.items[id].quantity;
        if (oldQuantity <= quantity) {
            delete this.items[id];
            const index = this.idToIx(id);
            this.ids.splice(index, 1);
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
    for (const itemQ of this) {
        quantity += itemQ.quantity;
    }
    return quantity;
};
