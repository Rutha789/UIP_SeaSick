'use strict';

// Checks if two arrays or maps are equal in terms of their contents,
// (rather than their references).
function deepEqual(a,b) {
    return a === b || JSON.stringify(a) === JSON.stringify(b);
}

// Converts a classy object (those created by "new ClassConstructor()")
// into a representation that can be serialized using JSON.stringify,
// which can that can be deserilized using JSON.parse followed by
// fromJSONUnsafe.
//
// This is unsafe since "fromJSONUnsafe" doesn't do any initialization;
// the constructor of the class isn't called. Instead, this
// creates an object of the class with the attributes the serialized object has.
//
// ONLY use this on a classy object that can be deserialized purely from the
// attributes.
function toJSONUnsafe(object) {
    const objectRep = {...object};
    return {
        constructor: object.constructor.name,
        object:      objectRep
      };
}

function fromJSONUnsafe(jsonRep) {
    let object = Object.create(eval(jsonRep.constructor).prototype);
    for (let key in jsonRep.object) {
        object[key] = jsonRep.object[key];
    }
    return object;
}

// Deeply clones a map
function cloneMap(map) {
    let newMap = {...map};
    for (let key in newMap) {
        if (Array.isArray(newMap[key])) {
            newMap[key] = cloneArray(newMap[key]);
        } else if (typeof newMap[key] === "object"
                   && newMap[key] !== null) {
            newMap[key] = cloneMap(newMap[key]);
        }
    }
    return newMap;
}

// Deeply clones an array
function cloneArray(array) {
    let newArray = [...array];
    for (let ix in newArray) {
        if (Array.isArray(newArray[ix])) {
            newArray[ix] = cloneArray(newArray[ix]);
        } else if (typeof newArray[ix] === "object"
                   && newArray[ix] !== null) {
            newArray[ix] = cloneMap(newArray[ix]);
        }
    }
    return newArray;
}

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

Item.fromJSON = fromJSONUnsafe;
Item.prototype.toJSON = function () { return toJSONUnsafe(this); };

Item.fromJSONString = str => Item.fromJSON(JSON.parse(str));
Item.prototype.toJSONString = function () {
    return JSON.stringify(this);
};

function ItemQuantity(item, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
}

ItemQuantity.prototype.toJSON = function () {
    return {
        item: this.item.toJSON(),
        quantity: this.quantity
    };
};

ItemQuantity.prototype.toJSONString = function () {
    return JSON.stringify(this.toJSON());
};

ItemQuantity.fromJSON = function (object) {
    return new ItemQuantity(
        Item.fromJSON(object.item),
        object.quantity
    );
};

ItemQuantity.fromJSONString = str => ItemQuantity.fromJSON(JSON.parse(str));

Item.prototype.hasHazards = function () {
    return !this.kosher || !this.organic;
};

// Represents an Item that is a Drink.
//
// Do do inheritence in JS, you:
// 1. call the superclass's constructor in the constructor of the subclass
// 2. Set the subclass's prototype to a duplicate of the superclass's prototype
// 3. Change the 'constructor' value of the subclass's prototype to that of
// of the subclass's constructor.
//
// JavaScipt is a good language, and there's NO WAY to tell it was designed in
// two weeks!
function Drink(dbItem) {
    if (pathDrinkDB == "../js/beverages_eng.js") {
        Item.call(this,dbItem);
        // Slice to remove the % sign at the end.
        this.alcoholstrength = Number(this.alcoholstrength.slice(0,-1));
    } else if (pathDrinkDB == "../js/beverages_eng.js"){
        //TODO, if we really want to use beverages.js
        throw new Error("Incompatible with Beverages.js");
    }
}

Drink.prototype = Object.create(Item.prototype);

Object.defineProperty(Drink.prototype, 'constructor', {
    value: Drink,
    enumerable: false, // so that it does not appear in 'for in' loop
    writable: true
});


// Given an drink item represented through a object from the drink database
// create an Item object from it.
Drink.fromDBObject = dbItem => new Drink(dbItem);


