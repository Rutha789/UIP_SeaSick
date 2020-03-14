'use strict';

function Stock(physicalStockRef = "itemStock"
               , reservedStockRef = "itemStockReserved"
               , refillRef = "itemStockRefill"
               , defaultStock = 20
               , alwaysSynchronize = true) {
    this.defaultStock = 20;
    this.physicalStockRef = physicalStockRef;
    this.reservedStockRef = reservedStockRef;
    this.refillRef = refillRef;
    this.alwaysSynchronize = alwaysSynchronize;
    this.physicalStock = JSON.parse(localStorage.getItem(physicalStockRef));
    this.reservedStock = JSON.parse(localStorage.getItem(reservedStockRef));
    this.toRefill = JSON.parse(localStorage.getItem(refillRef));
    if (this.physicalStock === null) {
        this.physicalStock = {};
        localStorage.setItem(physicalStockRef, JSON.stringify(this.physicalStock));
    }
    if (this.reservedStock === null) {
        this.reservedStock = {orders: {}, items: {}};
        localStorage.setItem(reservedStockRef, JSON.stringify(this.reservedStock));
    }
    if (this.toRefill === null) {
        this.toRefill = {};
        localStorage.setItem(refillRef, JSON.stringify(this.toRefill));
    }
}

Stock.prototype.synchronize = function () {
    this.synchronizePhysical();
    this.synchronizeReserved();
    this.synchronizeRefill();
};

Stock.prototype.synchronizePhysical = function () {
    localStorage.setItem(this.physicalStockRef, JSON.stringify(this.physicalStock));
};

Stock.prototype.synchronizeReserved = function () {
    localStorage.setItem(this.reservedStockRef, JSON.stringify(this.reservedStock));
};

Stock.prototype.synchronizeRefill = function () {
    localStorage.setItem(this.refillRef, JSON.stringify(this.reservedStock));
};

Stock.prototype.removeOrderCommand = function (tbl,
                                              sync = this.alwaysSynchronize) {
    return new Action (
        function () {
            const removedOrder = this.removeOrder(tbl,sync);
            if (typeof removedOrder === "undefined") {
                return {success: false};
            } else {
                return {success: true, result: removedOrder};
            }
        }.bind(this),
        function (removedOrder) {
            this.addCompactOrder(tbl, removedOrder,sync);
        }.bind(this)
        // Let redo be the same as perform
    );
};


Stock.prototype.commitOrderCommand = function (tbl,
                                               sync = this.alwaysSynchronize) {
    return new Action (
        function () {
            const commitedOrder = this.commitOrder(tbl,sync);
            if (typeof commitedOrder === "undefined") {
                return {success: false};
            } else {
                return {success: true, result: commitedOrder};
            }
        }.bind(this),
        function (commitedOrder) {
            for (let [id, q] of commitedOrder) {
                this.modifyPhysicalStock(id, q, false);
            }
            this.addCompactOrder(tbl, commitedOrder);
            if (sync) {
                this.synchronizePhysical();
            }
        }.bind(this)
        // Let redo be the same as perform
    );
};

Stock.prototype.addOrderCommand = function (order,
                                            sync = this.alwaysSynchronize) {
    return new Action (
        function () {
            const oldOrder = this.addOrder(order,sync);
            return {success: true, result: commitedOrder};
        }.bind(this),
        function (oldOrder) {
            if (typeof oldOrder === "undefined") {
                this.removeOrder(tbl,sync);
            } else {
                this.removeOrder(tbl,false);
                this.addCompactOrder(tbl, oldOrder,sync);
            }
        }.bind(this)
        // Let redo be the same as perform
    );
};


Stock.prototype.removeOrder = function (tbl,
                                        sync = this.alwaysSynchronize) {
    const removedOrder = this.reservedStock.orders[tbl];
    if (typeof removedOrder === "undefined") {
        return undefined;
    }
    // Turns out JavaScript has some form of pattern matching. Go figure.
    for (let [id, q] of removedOrder) {
        this.reservedStock.items[id] -= q;
    }
    delete this.reservedStock.orders[tbl];
    if (sync) {
        this.synchronizeReserved();
    }
    return removedOrder;
};

Stock.prototype.commitOrder = function (tbl,
                                        sync = this.alwaysSynchronize) {
    const commitedOrder = this.removeOrder(tbl,false);
    if (typeof commitedOrder === "undefined") {
        return undefined;
    }
    for (let [id, q] of commitedOrder) {
        this.physicalStock.items[id] -= q;
    }
    if (sync) {
        this.synchronizeReserved();
        this.synchronizePhysical();
    }
    return commitedOrder;
};

Stock.prototype.addCompactOrder = function (tbl,
                                            compactOrder,
                                            sync = this.alwaysSynchronize) {
    const oldOrder = this.removeOrder(tbl,false);
    for (let [id, q] of compactOrder) {
        this.reservedStock.items[id] += q;
    }
    this.reservedStock.orders[tbl] = compactOrder;
    if (sync) {
        this.synchronizeReserved();
    }
};

Stock.prototype.addOrder = function (order,
                                    sync = this.alwaysSynchronize) {
    const compactOrder =
          Array.from(order.order, iQ => [iQ.item.id, iQ.quantity]);
    return this.addCompactOrder(order.table, compactOrder, sync);
};


Stock.prototype.getStock = function (id) {
    return this.getPhysicalStock(id) - this.getReservedOf(id);
};

Stock.prototype.getPhysicalStock = function (id) {
    const itemStock = this.physicalStock[id];
    if (typeof itemStock !== "undefined") {
        return itemStock;
    } else {
        return this.defaultStock;
    }
};

Stock.prototype.getReservedOf = function (id) {
    const reservedStock = this.reservedStock.items[id];
    if (typeof reservedStock !== "undefined") {
        return reservedStock;
    } else {
        return 0;
    }
};

Stock.prototype.reset = function (sync = this.alwaysSynchronize) {
    this.physicalStock = {};
    if (sync) {
        this.synchronizePhysical();
    }
};

Stock.prototype.refill = function (sync = this.alwaysSynchronize) {
    for (let id in this.toRefill) {
        delete this.physicalStock[id];
    }
    this.toRefill = {};
    if (sync) {
        this.synchronizePhysical();
        this.synchronizeRefill();
    }
};

Stock.prototype.orderRefillCommand = function (ids,
                                              sync = this.alwaysSynchronize) {
    return new Action(
        function () {
            let markedForRefill = this.orderRefill(ids, sync);
            if (markedForRefill.length > 0) {
                return {success: true, result: markedForRefill};
            } else {
                return {success: false};
            }
        }.bind(this),
        function (markedForRefill) {
            markedForRefill.forEach(id => delete this.toRefill[id]);
            if (sync) {
                this.synchronizeRefill();
            }
        }.bind(this)
        // let redo be same as perform
    );
};

Stock.prototype.orderRefill = function (ids,
                                       sync = this.alwaysSynchronize) {
    if (!Array.isArray(ids)) {
        ids = [ids];
    }
    ids = ids.filter(id => !(id in this.toRefill));
    ids.forEach(id => this.toRefill[id] = null);
    if (ids.length > 0 && sync) {
        this.synchronizeRefill();
    } 
    return ids;
};

Stock.prototype.modifyPhysicalStock = function (id,
                                                quantity,
                                                sync = this.alwaysSynchronize) {
    const oldQuantity = this.getPhysicalStock(id);
    return this.setPhysicalStock(id,oldQuantity + quantity,sync);
};

Stock.prototype.setPhysicalStock = function (id,
                                             quantity,
                                             sync = this.alwaysSynchronize) {
    const oldQuantity = this.getPhysicalStock(id);
    if (oldQuantity !== quantity) {
        if (quantity === this.defaultStock) {
            delete this.physicalStock[id];
        } else {
            this.physicalStock[id] = quantity;
        }
        if (sync) {
            this.synchronizePhysical();
        }
    }
    return oldQuantity;
};

Stock.prototype.setPhysicalStockCommand = function (id,
                                                    quantity,
                                                    sync = this.alwaysSynchronize) {
    return new Action(
        function () {
            const oldQuantity = this.setPhysicalStock(id,quantity,sync);
            return {success: oldQuantity !== quantity, result: oldQuantity};
        }.bind(this),
        function (oldQuantity) {
            this.setPhysicalStock(id, oldQuantity, sync);
        }.bind(this)
        // Let redo be the same as perform
    );
};

Stock.prototype.modifyPhysicalStockCommand = function (id,
                                                       quantity,
                                                       sync = this.alwaysSynchronize) {
    return new Action(
        function () {
            const oldQuantity = this.modifyPhysicalStock(id,quantity,sync);
            return {success: quantity !== 0, result: oldQuantity};
        }.bind(this),
        function (oldQuantity) {
            this.setPhysicalStock(id, oldQuantity, sync);
        }.bind(this)
        // Let redo be the same as perform
    );
};
