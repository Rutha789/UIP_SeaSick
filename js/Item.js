////////////////////////////////////////////////////////////////////////////////
// Item.js
//
// The module for item-related data structures such as
// Item, Drink, and ItemQuantity.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Item
////////////////////////////////////////////////////////////////////////////////

// A menu item.
// Constructed by providing the database-representation of the item.
function Item(dbItem) {
    for (let key in dbItem) {
        this[key] = dbItem[key];
    }

    // We need something to identify the item by. We use nr.
    this.id = this.nr;

    // Convert various string fields to their boolean/numeric
    // counterparts
    this.kosher  = this.kosher === "1";
    this.organic = this.organic === "1";
    this.priceinclvat = Number(this.priceinclvat);
};

// Given a JSON-representation of an Item
// (as returned from Item.toJSON),
// deserializes the Item from the JSON representation.
Item.fromJSON = fromJSONUnsafe;

// Given a stringified JSON-representation of an Item
// (as returned from Item.toJSON),
// deserializes the Item from the JSON representation.
//
// Use this instead of JSON.parse for Items.
Item.fromJSONString = str => Item.fromJSON(JSON.parse(str));

// Serializes an Item to JSON-representation.
// Automatically used by JSON.stringify.
//
// Use Item.fromJSON() for deserialization
Item.prototype.toJSON = function () { return toJSONUnsafe(this); };

// Serializes the Item to a stringified JSON-representation.
//
// Use Item.fromJSONString for deserialization
Item.prototype.toJSONString = function () {
    return JSON.stringify(this);
};

////////////////////////////////////////////////////////////////////////////////
// ItemQuantity
////////////////////////////////////////////////////////////////////////////////

// A simple tuple of item and quantity
function ItemQuantity(item, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
}

// Given a JSON-representation of an ItemQquantity
// (as returned from Item.toJSON),
// deserializes the ItemQuantity from the JSON representation.
ItemQuantity.fromJSON = function (object) {
    return new ItemQuantity(
        Item.fromJSON(object.item),
        object.quantity
    );
};

// Given a stringified JSON-representation of an ItemQuantity
// (as returned from ItemQuantity.toJSON),
// deserializes the ItemQuantity from the JSON representation.
//
// Use this instead of JSON.parse for ItemQuantity.
ItemQuantity.fromJSONString = str => ItemQuantity.fromJSON(JSON.parse(str));

// Serializes an ItemQuantity to JSON-representation.
// Automatically used by JSON.stringify.
//
// Use ItemQuantity.fromJSON() for deserialization
ItemQuantity.prototype.toJSON = function () {
    return {
        item: this.item.toJSON(),
        quantity: this.quantity
    };
};

// Serializes an ItemQuantity to stringified JSON-representation.
//
// Use ItemQuantity.fromJSONString() for deserialization
ItemQuantity.prototype.toJSONString = function () {
    return JSON.stringify(this.toJSON());
};


////////////////////////////////////////////////////////////////////////////////
// Drink
////////////////////////////////////////////////////////////////////////////////

// Represents an Item that is a Drink.
//
// To do inheritence in JS, you:
// 1. call the superclass's constructor in the constructor of the subclass
// 2. Set the subclass's prototype to a duplicate of the superclass's prototype
// 3. Change the 'constructor' value of the subclass's prototype to that of
// of the subclass's constructor.
//
// JavaScipt is a good language, and there's NO WAY to tell it was designed in
// two weeks!
function Drink(dbItem) {
    Item.call(this,dbItem);
    // Slice to remove the % sign at the end.
    this.alcoholstrength = Number(this.alcoholstrength.slice(0,-1));
}

Drink.prototype = Object.create(Item.prototype);

Object.defineProperty(Drink.prototype, 'constructor', {
    value: Drink,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});


// Given an drink item represented through a object from the drink database,
// create an Item object from it.
Drink.fromDBObject = dbItem => new Drink(dbItem);

////////////////////////////////////////////////////////////////////////////////
// Drink
////////////////////////////////////////////////////////////////////////////////

// Represents an Item that is a Food item.
function Food(dbItem) {
    Item.call(this,dbItem);
    // Slice to remove the % sign at the end.
    this.mass = Number(this.mass);
}

Food.prototype = Object.create(Item.prototype);

Object.defineProperty(Food.prototype, 'constructor', {
    value: Food,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});


// Given an drink item represented through a object from the drink database,
// create an Item object from it.
Food.fromDBObject = dbItem => new Food(dbItem);
