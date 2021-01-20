////////////////////////////////////////////////////////////////////////////////
// OrderList.js
//
// The module for the OrderList class, objects of which are used within the
// model for managing carts of ordered items.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

"use strict";

////////////////////////////////////////////////////////////////////////////////
// CLASS AND BASIC MACHINERY
////////////////////////////////////////////////////////////////////////////////

// A represesentation of the items and their quantities for a specific order
function OrderList (maxItems = Infinity) {
    // A map from itemId to itemQuantity
    this.items = {};

    // A list of item ids corresponding to order items
    // were added to the OrderList, and thus in what
    // order items should appear in the view.
    this.ids = [];

    // You can choose to restrict the numbers of items in the cart.
    // We don't, by default.
    this.max = Math.max(0,maxItems);

    // The iterator function for FilteredMenu.
    this[Symbol.iterator] = () => new OrderListIterator(this);
};

// The iterator for an OrderList
//
// Once you understand the iterable and iterator protocols:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
// this is as simple as can be. We just keep track of the index and increment it
// upon each call to .next() until we run out of items.
function OrderListIterator (ol) {
    this.index = 0;
    this.next = function () {
        if (this.index >= ol.ids.length) {
            return {done: true};
        } else {
            // obs. this.index++ returns the current value of this.index,
            // and THEN increments it. Useful for one-liners like this.
            return { done: false, value: ol.items[ol.ids[this.index++]] };
        }
    };
}

// Given a JSON-representation of an OrderList
// (as returned from OrderList.toJSON),
// deserializes the OrderList from the JSON representation.
OrderList.fromJSON = function (olObject) {
    var ol = new OrderList();
    ol.items = olObject.items;
    for (let key in olObject.items) {
        ol.items[key] = ItemQuantity.fromJSON(olObject.items[key]);
    }
    ol.ids = olObject.ids;
    // JSON doesn't support Infinity: it serializes it to null.
    // Thus we check if olObject.max is null, and if so, set max to Infinity.
    ol.max = olObject.max === null ? Infinity : olObject.max;
    return ol;
};

// Given a stringified JSON-representation of an OrderList
// (as returned from OrderList.toJSON),
// deserializes the OrderList from the JSON representation.
//
// Use this instead of JSON.parse for OrderLists.
OrderList.fromJSONString = str => OrderList.fromJSON(JSON.parse(str));

// Serializes a OrderList to JSON-representation.
// Automatically used by JSON.stringify.
//
// Use OrderList.fromJSON() for deserialization.
OrderList.prototype.toJSON = function () {
    const rep = {items:{}};
    for (let key in this.items) {
        rep.items[key] = this.items[key].toJSON();
    }
    rep.ids = [...this.ids];
    rep.max = this.max;
    return rep;
};

// Serializes a OrderList to a stringified JSON-representation.
//
// Use OrderList.fromJSONString for deserialization
OrderList.prototype.toJSONString = function () {
    return JSON.stringify(this);
};

////////////////////////////////////////////////////////////////////////////////
// COMMANDS
////////////////////////////////////////////////////////////////////////////////

// Returns an UndoManager-compatible command corresponding to addItem().
//
// perform() adds the specified quantity of an item to the OrderList,
// placing it at position "offset" if the item wasn't previously present.
//
// perform() fails if adding the item with the specified quantity
// would go past the limit of maximum items.
OrderList.prototype.addItemCommand = function (item, quantity=1, offset=0) {
    return new Command(
        // perform()
        function () {
            const res = this.addItem(item, quantity, offset);
            return {success: res};
        }.bind(this),
        // undo()
        function () {
            const res = this.removeItem(item.id, quantity);
            return {success: typeof res !== 'undefined'};
        }.bind(this)
        // Let redo() be the same as perform()
    );
};

// Returns an UndoManager-compatible Command corresponding to removeItem().
//
// perform() decrease the quantity of an item by the specified quantity,
// removing it from the order list if quantity reaches 0 or below.
//
// perform() fails if the item we want to remove isn't in the OrderList,
// or if the quantity of items to remove is 0.
OrderList.prototype.removeItemCommand = function (itemId, quantity=1) {
    return new Command(
        // perform()
        function () {
            const oldItemQuantity = this.getItemQuantityById(itemId);
            // If the item we want to remove isn't in the OrderList,
            // or quantity === 0, fail.
            if (typeof oldItemQuantity === "undefined"
               || quantity === 0) {
                return {success: false};
            }

            // Determine where the removed item was in the list,
            // so that undo can place it back in its proper place.
            const oldIx = this.idToIx(itemId);

            // Restrict number of items to remove: at least 0,
            // at most current quantity.
            const toRemove = Math.min(oldItemQuantity.quantity,
                                      Math.max(0,quantity));
            this.removeItem(itemId, toRemove);
            return {
                success: true,
                result: {
                    oldIx: oldIx,
                    removedItem: oldItemQuantity.item,
                    numRemoved: toRemove
                }
            };
        }.bind(this),
        // undo()
        function (performed) {
            const res = this.addItem(
                performed.removedItem,
                performed.numRemoved,
                performed.oldIx
            );
            return {success: res};
        }.bind(this)
        // Let redo be the same as perform
    );
};

// Returns an UndoManager-compatible Command corresponding to clear().
//
// perform() removes all items from the OrderList.
//
// perform() fails if the orderList was already empty.
OrderList.prototype.clearCommand = function () {
    return new Command(
        function () {
            // Fail if the OrderList is empty
            if (this.ids.length === 0) {
                return {success: false};
            }
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

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

// Add the specified quantity of an item to the OrderList,
// placing it at position "offset" if the item wasn't previously present.
//
// Returns false if adding the number of items would cause the OrderList to go
// past the maximum number of items. Otherwise returns true.
OrderList.prototype.addItem = function (item, quantity = 1,offset=0) {
    // Prevent adding the item if it would go past the maximum
    if (this.length() + quantity > this.max) {
        return false;
    }
    if (item.id in this.items) {
        // If we had the item previously in the OrderList,
        // we simply need to adjust its quantity.
        this.items[item.id].quantity += quantity;
    } else {
        this.items[item.id] = new ItemQuantity(item, quantity);
        // Use splice to put the id into the id list at the proper place.
        this.ids.splice(offset, 0, item.id);
    }
    return true;
};

// Decrease the quantity of an item by the specified quantity,
// removing it from the order list if quantity reaches 0 or below.
//
// Returns the old quantity of items.
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
        return oldQuantity;
    } else {
        return undefined;
    }
};

// Gets an ItemQuantity from the order list by id
OrderList.prototype.getItemQuantityById = function (id) {
    return this.items[id];
};

// Gets an ItemQuantity from the order list by index
OrderList.prototype.index = function (ix) {
    return this.items[this.ixToId(ix)];
};


// Calculates the number of items on the order list.
OrderList.prototype.length = function () {
    let quantity = 0;
    for (const itemQ of this) {
        quantity += itemQ.quantity;
    }
    return quantity;
};

// Removes all items from the OrderList.
OrderList.prototype.clear = function () {
    this.items = {};
    this.ids = [];
};

// Calculates the "compact form" of the OrderList, which
// is represented by a list of [itemId, quantity]-tuples.
OrderList.prototype.compact = function () {
    return Array.from(this, iQ => [iQ.item.id, iQ.quantity]);
};

// Gets an ItemQuantity id from an index
OrderList.prototype.ixToId = function (ix) {
    return this.ids[ix];
};

// Gets the index of an ItemQuantity given an item id
OrderList.prototype.idToIx = function (id) {
    return this.ids.indexOf(id);
};

