function Item(dbItem) {
    if (pathDrinkDB == "../js/beverages_eng.js") {
        for (key in dbItem) {
            this[key] = dbItem[key];
        }
    } else if (pathDrinkDB == "../js/beverages_eng.js"){
        //TODO, if we really want to use beverages.js
        throw new Error("Incompatible with Beverages.js");
    }
};

// Given an drink item represented using only a JSON-compliant object,
// create an Item object from it.
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
