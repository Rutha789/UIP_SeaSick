////////////////////////////////////////////////////////////////////////////////
// common.js
//
// Miscallenous helper functions.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

"use strict";

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

// Deserializes a the JSON reprsentation of a classy object
// into that object.
//
// This is unsafe since it doesn't do any initialization;
// the constructor of the class isn't called. Instead, this
// creates an object of the class with the attributes the serialized object has.
//
// ONLY use this on a classy object that can be deserialized purely from the
// attributes.
function fromJSONUnsafe(jsonRep) {
    let object = Object.create(eval(jsonRep.constructor).prototype);
    for (let key in jsonRep.object) {
        object[key] = jsonRep.object[key];
    }
    return object;
}

// Deeply clones a map:
// Clone the map, and any maps and arrays within that map, recursively.
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

// Deeply clones an array:
// Clone the array, and any maps and arrays within that map, recursively.
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

// Sets up a DOM element to be conditionally clickable,
// given a function that checks the condition,
// and the function that should be called when the element is clicked
// upon when it is clickable.
// Initially, the button is not clickable.
//
// This returns an update function: once called, it will update
// the clickability of the button. The condition function is called,
// and the button is made clickable if the condition function returns true.
//
// Any argument to the update function will be provided to the
// condition function and the click function.
//
// When the button is not clickable, it's given the "unclickable" class.
function makeConditionalClick(DOMelem, condition, callback) {
    let check = false;
    let argument = undefined;
    $(DOMelem).addClass("unclickable");
    $(DOMelem).click(() => check ? callback(argument) : undefined);
    return function (arg) {
        check = condition(arg);
        if (check) {
            argument = arg;
            $(DOMelem).removeClass("unclickable");
        } else {
            $(DOMelem).addClass("unclickable");
        }
    };
};
