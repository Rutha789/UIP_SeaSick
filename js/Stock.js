////////////////////////////////////////////////////////////////////////////////
// MenuManager.js
//
// The module for the Stock class, which is used within the model for
// keeping track of availability of the items within the database.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

"use strict";

////////////////////////////////////////////////////////////////////////////////
// CLASS AND BASIC MACHINERY
////////////////////////////////////////////////////////////////////////////////

// A represesentation of the Stock: the availability of items,
// reserved items, and items merked for refilling.
function Stock(physicalStockRef = "itemStock"
               , reservedStockRef = "itemStockReserved"
               , refillRef = "itemStockRefill"
               , defaultStock = 20
               , alwaysSynchronize = true) {
    // The default availability of any item not in the Stock database
    this.defaultStock = 20;

    // The reference for the "physical stock" database:
    // the key in localStorage where the stock database is fetched from
    // and stored to.
    this.physicalStockRef = physicalStockRef;

    // The reference for the "reerved stock" database:
    // the key in localStorage where the database for items reserved to orders
    // is fetched from and stored to.
    this.reservedStockRef = reservedStockRef;

    // The reference for the "refill" database:
    // the key in localStorage where the database for items marked for restock
    // is fetched from and stored to.
    this.refillRef = refillRef;

    // A flag that indicates whether any change to any aspect of
    // the stock should immediately
    // update localStorage to reflect the changes made.
    this.alwaysSynchronize = alwaysSynchronize;

    // The physical stock: representing the actual, physical, availability of
    // items
    //
    // physicalStock is represented by a map from itemIds to the quantity of
    // items in stock for that id. If an itemId isn't present in the map.
    // that should be interpreted as the quantity in the stock for that id is
    // this.defaultStock.
    this.physicalStock = JSON.parse(localStorage.getItem(physicalStockRef));

    // The reserved stock: representing what items have been allocated to orders.
    // As orders are completed, reserved items will be moved from the
    // reservedStock to the physicalStock.
    //
    // reservedStock is represented by a map {orders: {}, items: {}}
    //
    // orders is a map from table number to a list of [itemId, quantity]-tuples,
    // representing the order for that table.
    //
    // items is a map from itemId to quantity of reserved items of that id
    // across all orders. If an itemId isn't present in items, that should
    // be interpreted as the quantity of reserved items for that id is 0.
    this.reservedStock = JSON.parse(localStorage.getItem(reservedStockRef));

    // To-refill: the set of items that management has marked for refill.
    // Represented by a map from itemId to null. If an itemId is present as a
    // key in the map, that indicates that the id is in the set.
    this.toRefill = JSON.parse(localStorage.getItem(refillRef));

    // If localStorage doesn't have the physicalStock stored, initialize it.
    if (this.physicalStock === null) {
        this.physicalStock = {};
        localStorage.setItem(physicalStockRef,
                             JSON.stringify(this.physicalStock));
    }

    // If localStorage doesn't have the reservedStock stored, initialize it.
    if (this.reservedStock === null) {
        this.reservedStock = {orders: {}, items: {}};
        localStorage.setItem(reservedStockRef,
                             JSON.stringify(this.reservedStock));
    }

    // If localStorage doesn't have the to-refill stored, initialize it.
    if (this.toRefill === null) {
        this.toRefill = {};
        localStorage.setItem(refillRef, JSON.stringify(this.toRefill));
    }
}


// Commit all aspects of the Stock to localStorage
Stock.prototype.synchronize = function () {
    this.synchronizePhysical();
    this.synchronizeReserved();
    this.synchronizeRefill();
};

// Commit the physicalStock to localStorage
Stock.prototype.synchronizePhysical = function () {
    localStorage.setItem(this.physicalStockRef, JSON.stringify(this.physicalStock));
};

// Commit the reservedStock to localStorage
Stock.prototype.synchronizeReserved = function () {
    localStorage.setItem(this.reservedStockRef, JSON.stringify(this.reservedStock));
};

// Commit toRefill to localStorage
Stock.prototype.synchronizeRefill = function () {
    localStorage.setItem(this.refillRef, JSON.stringify(this.toRefill));
};


////////////////////////////////////////////////////////////////////////////////
// COMMANDS
////////////////////////////////////////////////////////////////////////////////

// A function for creating an UndoManager-compatible command corresponding to
// setPhysicalStock().
//
// perform() sets the physical quantity of an item to a specific number.
// Will remove it from the physicalStock database if the new quantity
// is equal to defaultStock.
//
// perform() fails if the new quantity is the same as the old quantity.
// The result of perform() will be the old quantity.
Stock.prototype.setPhysicalStockCommand =
    function (id,
              quantity,
              shouldSync = this.alwaysSynchronize) {
    return new Command (
        // perform
        function () {
            const oldQuantity = this.setPhysicalStock(id,quantity,shouldSync);
            // Fail if the new quantity is the same as the old one.
            return {success: oldQuantity !== quantity, result: oldQuantity};
        }.bind(this),
        // undo
        function (oldQuantity) {
            this.setPhysicalStock(id, oldQuantity, shouldSync);
        }.bind(this)
        // Let redo be the same as perform
    );
};

// A function for creating an UndoManager-compatible command corresponding to
// setPhysicalStock().
//
// perform() sets the physical quantity of an item to a specific number.
// Will remove it from the physicalStock database if the new quantity
// is equal to defaultStock.
//
// perform() fails if the new quantity is the same as the old quantity.
// The result of perform() will be the old quantity.
Stock.prototype.modifyPhysicalStockCommand =
    function (id,
              quantity,
              shouldSync = this.alwaysSynchronize) {
    return new Command (
        // perform
        function () {
            if (quantity === 0) {
                return {success: false};
            }
            const oldQuantity = this.modifyPhysicalStock(id,quantity,shouldSync);
            return {success: true, result: oldQuantity};
        }.bind(this),
        // undo
        function (oldQuantity) {
            this.setPhysicalStock(id, oldQuantity, shouldSync);
        }.bind(this)
        // Let redo be the same as perform
    );
};

// A function for creating an UndoManager-compatible command corresponding to
// addOrder().
//
// perform() adds all reserved items of an order to the reservedStock.
// If an order for the table number was previously present in the reservedStock,
// it will be replaced by the new order.
// This can be used as a way of updating orders.
//
// If there was an old order, the result of perform() will be a list of
// [itemId, quantity]-tuples for each reserved item of the old order
//
// perform() fails if an order for the table number was already present,
// and is identical to the new one.
Stock.prototype.addOrderCommand = function (order,
                                            shouldSync = this.alwaysSynchronize) {
    return new Command (
        // perform()
        function () {
            const oldOrder = this.addOrder(order);
            const success =
                  typeof oldOrder === "undefined"
                  || !deepEqual(order.order.compact(),oldOrder);
            return {success: success, result: oldOrder};
        }.bind(this),
        // undo()
        function (oldOrder) {
            if (typeof oldOrder === "undefined") {
                this.removeOrder(order.table, shouldSync);
            } else {
                // We shouldSync in addCompactOrder, so no need to do it in
                // removeOrder.
                this.removeOrder(order.table,false);
                this.addCompactOrder(order.table, oldOrder, shouldSync);
            }
        }.bind(this)
        // Let redo() be the same as perform()
    );
};

// A function for creating an UndoManager-compatible command corresponding to
// commitOrder().
//
// perform() commits the reserved items for the specified table's order,
// removing all items of the order from the reservedStock,
// and changing the physicalStock accordingly.
//
// The result of perform() will be a list of [itemId, quantity] of
// reserved items of the commited order.
// perform() fails if the table doesn't have an order in the reservedStock.
Stock.prototype.commitOrderCommand =
    function (tbl,
              shouldSync = this.alwaysSynchronize) {
    return new Command (
        // perform
        function () {
            const commitedOrder = this.commitOrder(tbl, shouldSync);
            if (typeof commitedOrder === "undefined") {
                return {success: false};
            } else {
                return {success: true, result: commitedOrder};
            }
        }.bind(this),
        // undo
        function (commitedOrder) {
            for (let [id, q] of commitedOrder) {
                this.modifyPhysicalStock(id, q, false);
            }
            this.addCompactOrder(tbl, commitedOrder);
            if (shouldSync) {
                this.synchronizePhysical();
            }
        }.bind(this)
        // Let redo be the same as perform
    );
};


// A function for creating an UndoManager-compatible command corresponding to
// removeOrder().
//
// perform() removes all reserved items for the specified table's order from the
// reservedStock, (without changing the physicalStock).
//
// The result of perform() will be a list of [itemId, quantity] of reserved items
// of the removed order.
// perform() fails if the table doesn't have an order in the reservedStock.
Stock.prototype.removeOrderCommand =
    function (tbl,
              shouldSync = this.alwaysSynchronize) {
    return new Command (
        // perform
        function () {
            const removedOrder = this.removeOrder(tbl,shouldSync);
            if (typeof removedOrder === "undefined") {
                return {success: false};
            } else {
                return {success: true, result: removedOrder};
            }
        }.bind(this),
        // undo
        function (removedOrder) {
            this.addCompactOrder(tbl, removedOrder, shouldSync);
        }.bind(this)
        // Let redo be the same as perform
    );
};

// A function for creating an UndoManager-compatible command corresponding to
// orderRefill().
//
// perform() mark all items as specified by ids for refill.
//
// The result of perform() will be the list of all ids newly marked for refill
// (and weren't already marked for refill).
// perform() fails if all ids to be marked for refill already have been.
Stock.prototype.orderRefillCommand =
    function (ids,
              shouldSync = this.alwaysSynchronize) {
    return new Command (
        function () {
            let markedForRefill = this.orderRefill(ids, shouldSync);
            if (markedForRefill.length > 0) {
                return {success: true, result: markedForRefill};
            } else {
                return {success: false};
            }
        }.bind(this),
        function (markedForRefill) {
            markedForRefill.forEach(id => delete this.toRefill[id]);
            if (shouldSync) {
                this.synchronizeRefill();
            }
        }.bind(this)
        // let redo be same as perform
    );
};

////////////////////////////////////////////////////////////////////////////////
// METHODS
////////////////////////////////////////////////////////////////////////////////

// Get the availabilty of an item, taking into account
// its availaibility in the physical stock and how much has
// been reserved.
Stock.prototype.getStock = function (id) {
    return this.getPhysicalStock(id) - this.getReservedOf(id);
};

// Get the availaibilty of an item in the physical
// stock.
Stock.prototype.getPhysicalStock = function (id) {
    const itemStock = this.physicalStock[id];
    if (typeof itemStock !== "undefined") {
        return itemStock;
    } else {
        // If id not present in our physicalStock database,
        // we use the default value.
        return this.defaultStock;
    }
};

// Get the quantity that has been reserved for a given item
Stock.prototype.getReservedOf = function (id) {
    const reservedStock = this.reservedStock.items[id];
    if (typeof reservedStock !== "undefined") {
        return reservedStock;
    } else {
        // If id not present in our reservedStock database,
        // then the number of reserved for that item must be 0.
        return 0;
    }
};

// Sets the physical quantity of an item to a specific number.
// Will remove it from the physicalStock database if the new quantity
// is equal to defaultStock.
//
// Returns the old quantity.
Stock.prototype.setPhysicalStock = function (id,
                                             quantity,
                                             shouldSync = this.alwaysSynchronize) {
    const oldQuantity = this.getPhysicalStock(id);
    if (oldQuantity !== quantity) {
        if (quantity === this.defaultStock) {
            delete this.physicalStock[id];
        } else {
            this.physicalStock[id] = quantity;
        }
        if (shouldSync) {
            this.synchronizePhysical();
        }
    }
    return oldQuantity;
};

// Modify the physical quantity of an item by the specified quantity.
// Will remove the item from the physicalStock database if the new quantity
// is equal to defaultStock.
//
// Returns the old quantity.
Stock.prototype.modifyPhysicalStock =
    function (id,
              quantity,
              shouldSync = this.alwaysSynchronize) {
    const oldQuantity = this.getPhysicalStock(id);
    return this.setPhysicalStock(id,oldQuantity + quantity,shouldSync);
};


// Add all reserved items of an order to the reservedStock.
//
// If the order was previously present in the reservedStock, it will be
// replaced by the new one, and addOrder will return a list of
// [itemId, quantity]-tuples for each reserved item of the old order.
// This can be used as a way of updating orders.
Stock.prototype.addOrder = function (order,
                                     shouldSync = this.alwaysSynchronize) {
    this.addCompactOrder(order.table, order.order.compact(), shouldSync);
};

// Commit the reserved items for a given order,
// removing all items of the order from the reservedStock,
// and change the physicalStock accordingly.
//
// Returns a list of [itemId, quantity] of reserved items
// of the commited order.
Stock.prototype.commitOrder = function (tbl,
                                        shouldSync = this.alwaysSynchronize) {
    const commitedOrder = this.removeOrder(tbl,false);
    if (typeof commitedOrder === "undefined") {
        return undefined;
    }
    for (let [id, q] of commitedOrder) {
        // Don't synchronize after every item.
        // Instead, we synchronize once all items have been moved.
        this.modifyPhysicalStock(id, -q, false);
    }
    if (shouldSync) {
        this.synchronizeReserved();
        this.synchronizePhysical();
    }
    return commitedOrder;
};

// Remove all reserved items for a given order from the reservedStock,
// (without changing the physicalStock).
//
// Returns a list of [itemId, quantity] of reserved items
// of the removed order.
Stock.prototype.removeOrder =
    function (tbl,
              shouldSync = this.alwaysSynchronize) {
    const removedOrder = this.reservedStock.orders[tbl];
    if (typeof removedOrder === "undefined") {
        return undefined;
    }
    for (let [id, q] of removedOrder) {
        this.reservedStock.items[id] -= q;
        // No need to keep the entry around if
        // it reserved quantity falls to 0.
        if (this.reservedStock.items[id] === 0) {
            delete this.reservedStock.items[id];
        }
    }
    // Remove the order from the orders map
    delete this.reservedStock.orders[tbl];
    if (shouldSync) {
        this.synchronizeReserved();
    }
    return removedOrder;
};



// Reset the physical stock, bringing all items to their default quantities,
// and empty toRefill.
Stock.prototype.reset = function (shouldSync = this.alwaysSynchronize) {
    this.physicalStock = {};
    this.toRefill = {};
    if (shouldSync) {
        this.synchronizePhysical();
        this.synchronizeRefill();
    }
};

// Bring all items marked for refill to their default quantities,
// and empty toRefill.
Stock.prototype.refill = function (shouldSync = this.alwaysSynchronize) {
    for (let id in this.toRefill) {
        delete this.physicalStock[id];
    }
    this.toRefill = {};
    if (shouldSync) {
        this.synchronizePhysical();
        this.synchronizeRefill();
    }
};

// Mark all items as specified by a list of their ids for refill.
//
// Returns the list of all ids newly marked for refill
// (and weren't already marked for refill).
Stock.prototype.orderRefill =
    function (ids,
              shouldSync = this.alwaysSynchronize) {
    // Sloppy-proofing: if just an id is provied, we wrap it in a
    // singleton list.
    if (!Array.isArray(ids)) {
        ids = [ids];
    }
    let newlyAdded = [];
    for (let id of ids) {
        if (!(id in this.toRefill)) {
            this.toRefill[id] = null;
            newlyAdded.push(id);
        }
    }
    // Only need to synchronize if we've actually marked new ids for refill
    if (newlyAdded.length > 0 && shouldSync) {
        this.synchronizeRefill();
    }
    return newlyAdded;
};


////////////////////////////////////////////////////////////////////////////////
// INTERNAL METHODS
////////////////////////////////////////////////////////////////////////////////

// Add all reserved items of an order to the reservedStock,
// where the order is represented by a table number, and a list of
// [itemId, quantity]-tuples (rather than a normal OrderList).
//
// If the order was previously present in the reservedStock, it will be
// replaced by the new one, and addCompactOrder will return a list of
// [itemId, quantity]-tuples for each reserved item of the old order.
// This can be used as a way of updating orders.
Stock.prototype.addCompactOrder =
    function (tbl,
              compactOrder,
              shouldSync = this.alwaysSynchronize) {
    // Get the old order if present.
    const oldOrder = this.reservedStock.orders[tbl];
    if (typeof oldOrder !== "undefined"
        && deepEqual(oldOrder, compactOrder)) {
        // If the new order is the same as the old one,
        // we don't need to do anything.
        return oldOrder;
    }
    // Remove the old order if present.
    // We'll synchronize at the end of addCompactOrder,
    // so no need to do it in removeOrder
    this.removeOrder(tbl,false);
    for (let [id, q] of compactOrder) {
        let oldQ = this.reservedStock.items[id];
        if (typeof oldQ === "undefined") {
            oldQ = 0;
        }
        this.reservedStock.items[id] = oldQ + q;
    }
    this.reservedStock.orders[tbl] = compactOrder;
    if (shouldSync) {
        this.synchronizeReserved();
    }
    return oldOrder;
};
