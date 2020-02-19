function Item(dbItem) {
    if (DBFilePath == "beverages_eng.js") {
        for (key in dbItem) {
            this[key] = dbItem[key];
        }
    } else {
        //TODO, if we really want to use beverages.js
        throw new Error("Incompatible with Beverages.js");
    }
};

function ItemQuantity(item, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
}

Item.prototype.hasHazards = function() {
    return !this.kosher || !this.organic;
};
