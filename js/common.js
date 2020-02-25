function Item(dbItem) {
    if (DBFilePath == "../js/beverages_eng.js") {
        for (key in dbItem) {
            this[key] = dbItem[key];
        }
    } else if (DBFilePath == "../js/beverages_eng.js"){
        //TODO, if we really want to use beverages.js
        throw new Error("Incompatible with Beverages.js");
    }
};

Item.fromJSON = dbItem => new Item(dbItem);


function ItemQuantity(item, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
}

ItemQuantity.fromJSON = function(object) {
    return new ItemQuantity(new Item(object.item), object.quantity);
};

Item.prototype.hasHazards = function() {
    return !this.kosher || !this.organic;
};
