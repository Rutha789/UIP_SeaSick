'use strict';


const pathDrinkDB = "../js/beverages_eng.js";
const pathUserDB = "../js/DBLoaded.js";

// Can't use $.getScript, since that uses XMLHttpRequest internally and
// Same Origin Policy hates that
function loadScript(path, callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = path;
    document.head.appendChild(script);
}


// A map of (potentially completed) promises
let __loadDBPromises = {};

// Asynchronously loads a database, given the path to the .js file and the
// name to the variable representing the database in that file,
// and a function to initialize that database.
//
// Defaults to loading the drink database if no arguments are provided.
//
// If you don't need to initialize the database, pass null as the third argument.
//
// This is safe to use multiple times; it will not reload any database
// already loaded using loadDB().
//
// This returns a promise.
// Promises represent asynchronous computations (computations that are happening
// in parallell) that are currently in progress.
// You can add actions onto the result of a promise by using .then().
// This promise simply loads the database. You can use .then() on this
// to add computations upon the result of that promise, which will be executed
// when the promise finishes (or has already finished).
// For more info, see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
function loadDB(pathDB = pathDrinkDB,
                varName = "__DrinkDB",
                initializer = db => db.map(Drink.fromDBObject)) {
    // Memoization; future calls to loadDB() always returns the promise
    // created by the first call.
    // This is needed since we REALLY don't want to load the database multiple
    // times upon multiple calls to loadDB(), and the easy way to prevent
    // that without risking
    // race conditions is to simply return the originally created promise.
    if (varName in __loadDBPromises) {
        return __loadDBPromises[varName].promise;
    } else {
        __loadDBPromises[varName] = {};
        let promise = new Promise(function(resolve, reject) {
            loadScript(pathDB, function () {
                let db = eval(varName);
                let result = undefined;
                if (initializer !== null) {
                    result = initializer(db);
                    // If the initializer returns undefined, we assume
                    // it has modified the database in-place.
                    if (typeof result === undefined) {
                        result = db;
                    }
                } else {
                    result = db;
                }
                __loadDBPromises[varName].result = result;
                resolve(result);
            });
        });
        __loadDBPromises[varName].promise = promise;
        return promise;
    }
}

// A synchronous variant (doesn't return a promise of loadDB()
// you can use when you're SURE the database has been loaded.
//
// Only use this when you're sure the database has been loaded (like inside
// a function that is only called once the promise returned by a loadDB()
// completes).
function loadedDB(varName = "__DrinkDB") {
    return __loadDBPromises[varName].result;
}
