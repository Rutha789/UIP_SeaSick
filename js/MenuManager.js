////////////////////////////////////////////////////////////////////////////////
// MenuManager.js
//
// The module for the MenuManager class, which is used within the model for
// configuring filtering options and creating item menus of the database
// based on those filtering options.
//
// Author: Love Waern
////////////////////////////////////////////////////////////////////////////////

"use strict";

////////////////////////////////////////////////////////////////////////////////
// MenuManager CLASS AND BASIC MACHINERY
////////////////////////////////////////////////////////////////////////////////

// A manager for a specific menu, and the restrictions
// placed upon it. You can use this to
// generate views of the database which are restricted
// according to the availability of items and the
// filtering options that are in place.
function MenuManager (dataBase, stock, stockMin = 5) {
    this.dataBase = dataBase;
    this.stock = stock;

    // stockMin is the required "buffer" of items. Any item with quantity
    // at or below stockMin won't be displayed in the menu.
    this.stockMin = stockMin;

    // Creating a FilteredMenu is expensive. We memoize the result of .getMenu()
    // using storedFilteredMenu, only generating a new one if the filters have
    // changed.
    this.storedFilteredMenu = null;

    // Main category currently chosen. Either null, meaning all items,
    // or a key of mainCategories, or "misc", meaning everything not part of a
    // main category.
    this.mainCategory = null;

    this.filters = emptyFilters();
}

// Serializes a MenuManager to JSON-representation.
// Automatically used by JSON.stringify.
//
// Use MenuManager.fromJSON() for deserialization.
MenuManager.prototype.toJSON = function () {
    let toSerialize = {
        mainCategory: this.mainCategory,
        filters:      this.filters,
        stockMin:     this.stockMin
    };
    return toSerialize;
};

// Serializes a MenuManager to a stringified JSON-representation.
//
// Use MenuManager.fromJSONString for deserialization
MenuManager.prototype.toJSONString = function () {
    return JSON.stringify(this);
};

// Given a JSON-representation of a MenuManager
// (as returned from MenuManager.toJSON), and the targeted dataBase and stock,
// deserializes the MenuManager from the JSON representation.
MenuManager.fromJSON = function (jsonRep, dataBase, stock) {
    let menuModel = new MenuManager(dataBase, stock, jsonRep.stockMin);
    menuModel.filters = jsonRep.filters;
    menuModel.mainCategory = jsonRep.mainCategory;
    return menuModel;
};

// Given a stringified JSON-representation of a MenuManager
// (as returned from MenuManager.toJSON), and the targeted dataBase and stock,
// deserializes the MenuManager from the JSON representation.
//
// USe this instead of JSON.parse for MenuManagers.
MenuManager.fromJSONString = (str, dataBase, stock) =>
    MenuManager.fromJSON(JSON.parse(str), dataBase);

////////////////////////////////////////////////////////////////////////////////
// MenuManager COMMANDS
////////////////////////////////////////////////////////////////////////////////

// Returns a UndoManager-compatible Command for resetting
// the filter of the MenuManager
MenuManager.prototype.clearFilterCommand = function () {
    return this.modifyFilterCommand(() => emptyFilters());
};

// Given a function to modify the filter, returns a UndoManager-compatible
// Command for modifying the filter of the MenuManager according to the
// provided function:
// The function is passed the current filters of the MenuManager,
// and may either return the new filters or simply modify the passed
// filter in-place and return nothing.
//
// The command will fail (and thus the undoManager will remain unchanged)
// if the new filters are the same as the old ones.
//
// This optionally accepts a boolean as a second argument.
// If this boolean is 'true', then the old FilteredMenu will be stored
// and reused if the command is undone. This makes undoing/redoing the command
// significantly faster, but also consumes a lot of memory.
MenuManager.prototype.modifyFilterCommand =
    function (filterModifier
              , preserveFilteredMenu=false) {
        return new Command(
            // perform()
            function () {
                let oldMenu = {
                    // deeply clone filters,
                    // to actually preserve the old filters
                    filters: cloneMap(this.filters)
                };
                if (preserveFilteredMenu) {
                    // Store the old FilteredMenu
                    oldMenu.storedFilteredMenu = this.getMenu();
                }
                const newFilters = filterModifier(this.filters);
                // If filterModifier returned new filters,
                // then we set this.filters to those filters.
                // Otherwise, we assume the filterModifier has
                // modified this.filters in place.
                if (typeof newFilters === "object") {
                    this.filters = newFilters;
                }
                // If the filter options are unchanged, we fail,
                // so we don't change undo/redo lists.
                if (deepEqual(oldMenu.filters, this.filters)) {
                    return { success: false };
                }
                return { success: true, result: oldMenu };
            }.bind(this),
            // undo()
            function (oldMenu) {
                let undoneMenu = {
                    // since undo is guaranteed to replace the this.filter
                    // reference, no need to copy the undone filters here.
                    filters: this.filters,
                };
                if (preserveFilteredMenu) {
                    // Store the undone FilteredMenu, and restore the old FilteredMenu
                    undoneMenu.storedFilteredMenu = this.getMenu();
                    this.storedFilteredMenu = oldMenu.storedFilteredMenu;
                }
                this.filters = oldMenu.filters;
                return {
                    success: true,
                    result: {
                        oldMenu: oldMenu,
                        undoneMenu: undoneMenu
                    }
                };
            }.bind(this),
            // redo()
            function (menus) {
                // Restore the undone filters
                this.filters = menus.undoneMenu.filters;
                if (preserveFilteredMenu) {
                    // Restore the undone FilteredMenu
                    this.storedFilteredMenu = menus.undoneMenu.storedFilteredMenu;
                }
                return { success: true, result: menus.oldMenu };
            }.bind(this)
        );
};

////////////////////////////////////////////////////////////////////////////////
// MenuManager METHODS
////////////////////////////////////////////////////////////////////////////////

// Generates an iterable FilteredMenu object of the data base according
// to the filters in place.
//
// The result of this is memoized such that the data base will only
// be traversed and the valid items calculated when the active filters
// have changed.
MenuManager.prototype.getMenu = function () {
    // If we don't have a storedFilteredMenu, or the filters of the
    // one we do have is not equal to the current filters, then
    // generate a new FilteredMenu.
    if (this.storedFilteredMenu === null
        || !deepEqual(this.filters, this.storedFilteredMenu.filters)) {
        this.storedFilteredMenu = new FilteredMenu(
            this.dataBase,
            this.stock,
            this.filters,
            this.stockMin
        );
    }
    // Use restricted to create a copy of the storedFilteredMenu
    // with its category set to the currently focused mainCategory.
    // (This won't retraverse the database)
    return this.storedFilteredMenu.restricted(0,Infinity,this.mainCategory);
};

// Resets the filter of the MenuManager
// OBS! Not a command, can't be undone.
MenuManager.prototype.clearFilter = function () {
    this.filters = emptyFilters();
};

////////////////////////////////////////////////////////////////////////////////
// FilteredMenu CLASS AND BASIC MACHINERY
////////////////////////////////////////////////////////////////////////////////

// An object which represents a filtered view of the database.
// Can be indexed into and iterated through.
//
// This is iterable: you can go through all main categories
// using "for (... of filteredMenu) { ... }".
//
// You can modify .category to restrict the view to a specific main category,
// or use .restricted to create a copy of the view restricted to a specific main
// category.
function FilteredMenu (dataBase, stock, filters, stockMin) {
    // Clone filters, so changes to the argument after the fact
    // won't change this.filters
    this.filters = cloneMap(filters);
    this.stockMin = stockMin;
    this.scope = {
        begin: 0,
        end: Infinity,
        category: null
    };
    this.categories = {misc: []};
    for (let key in mainCategories) {
        this.categories[key] = [];
    }

    // The iterator function for FilteredMenu.
    this[Symbol.iterator] = () => new FilteredMenuIterator(this);
    this.initialize(dataBase, stock);
}

// Internal. Traverse the database and add each valid item
// to its corresponding main category.
FilteredMenu.prototype.initialize = function (dataBase, stock) {
    for (let item of dataBase) {
        if (verifyItem(item, stock, this.filters, this.stockMin)) {
            let subCategories = subCategoriesOf(item.category.toLowerCase());
            let mainCatFound = false;
            for (let key in mainCategories) {
                // If some subcategory of the item falls under the
                // main category, add it to that category.
                if (mainCategories[key]
                    .some(str => subCategories.includes(str))) {
                    this.categories[key].push(item);
                    mainCatFound = true;
                }
            }
            if (!mainCatFound) {
                // If we haven't found any other main categories,
                // add the item under misc.
                this.categories.misc.push(item);
            }
        }
    }
};

// The iterator for a FilteredMenu
//
// Once you understand the iterable and iterator protocols:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
// this is as simple as can be. We just keep track of the index and increment it
// upon each call to .next() until we run out of items.
function FilteredMenuIterator(filteredMenu) {
    this.index = 0;
    this.next = function () {
        const item = filteredMenu.index(this.index);
        if (typeof item === "undefined") {
            return {done: true};
        } else {
            this.index++;
            return {done: false, value: item};
        }
    };
};

////////////////////////////////////////////////////////////////////////////////
// FilteredMenu METHODS
////////////////////////////////////////////////////////////////////////////////

// Indexes into a filtered view.
// OBS! Does not support negative indexes.
FilteredMenu.prototype.index = function (ix) {
    // The index is relative to the beginning of the scope,
    // so we offset it to get the actual index.
    ix += this.scope.begin;

    // Special case if the calculated index trespasses the end of
    // the scope.
    if (ix >= this.scope.end) {
        return undefined;
    }
    // If we have a main category targeted, index into the items
    // for that category.
    if (this.scope.category !== null) {
        // Will return undefined as desired if
        // index is out-of-bounds.
        return this.categories[this.scope.category][ix];
    }
    // Otherwise, index into all categories combined.
    for (let list of Object.values(this.categories)) {
        if (ix < list.length) {
            return list[ix];
        } else {
            ix -= list.length;
        }
    }
    // If we've iterated through all items of all categories
    // without returning, we know we're out-of-bounds, so return nothing.
    return undefined;
};

// Calculates the number of items in the filtered view.
FilteredMenu.prototype.length = function() {
    let count = undefined;
    if (this.scope.category !== null) {
        count = this.categories[this.scope.category].length;
    } else {
        count = 0;
        for (let items of Object.values(this.categories)) {
            count += items.length;
        }
    }
    // The number of items in the filtered view depends on how the
    // scope is restricted: anything past this.scope.end
    // is not part of the view, so we take the minimum this.scope.end
    // and the actual number of items. Anything before this.scope.begin
    // is not part of the view, so we subtract the result with
    // this.scope.begin.
    // Finally, we Math.max with 0 to make sure we don't go negative.
    return Math.max(0, Math.min(this.scope.end,count) - this.scope.begin);
};


// Creates a new filtered view of another one, sharing all properties
// except that the visible elements are additionally restricted according
// to the arguments. With respect to "this", the beginning of the created view
// is at the index "begin" and the end of the created view is at index "end".
// "begin" defaults to 0 (meaning the beginning of the view is unchanged),
// and "end" defaults to Infinity, (meaning the end of the view is unchanged).
//
// The third argument, if provided, will switch the targeted main category
// of the returned view to that argument. Otherwise it will inherit the
// targeted main category.
//
// For example, to restrict the view to display only the first 20 items
// (indices 0-19):
//    filteredMenu.restricted(0,20)
//
// To view all sherry at index 20 and beyond:
//    filteredMenu.restricted(20,Infinity,"sherry")
FilteredMenu.prototype.restricted =
    function(begin=0,
             end=Infinity,
             category=this.scope.category) {
        // Dangerous cheat. We create a new FilteredMenu with an empty dataBase,
        // and thus it won't do any initilization. This also means the stock is unused,
        // so we can give it undefined as the stock.
        let offsetted = new FilteredMenu([],undefined, this.filters, this.stockMin);

        // Share the filtered items of "this" with "offsetted", thus
        // avoiding the need for retraversing the database.
        offsetted.categories = this.categories;

        // Calculate the end of the view according to the arguments,
        // relative to "this".
        offsetted.scope.end =
            Math.min(this.scope.end, this.scope.begin + end);

        // Calculate the beginning of the view according to the arguments,
        // relative to "this".
        // Can't go past the calculated end.
        offsetted.scope.begin =
            Math.min(offsetted.scope.end, begin + this.scope.begin);

        // Switch the targeted main category to the provided one
        // (or inherit it if the third argument isn't provided)
        offsetted.scope.category = category;
        return offsetted;
};

////////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS AND CONSTANTS
////////////////////////////////////////////////////////////////////////////////

// A map of main categories mapped to arrays with subcategories belonging
// to that category.
//
// Used to figure out what main category an item belongs to
const mainCategories = {
    ale: ["öl", "ale"],
    whisky: ["whisky"],
    white_wine: ["vitt vin"],
    red_wine: ["rött vin"],
    misc_wine: ["mousserande vin",
                "fruktvin",
                "rosévin",
                "vin av flera typer",
                "vinsprit"],
    alcoholfree: ["alkoholfritt"],
    sherry: ["sherry"],
    vermouth: ["vermouth"],
    cognac: ["cognac"]
};



// Given the category of an objects, splits it into subcategories,
// as separated by ",", "och", and "&".
// Example:
//    subCategoriesOf("Rött vin, Kryddigt & Mustigt")
// == ["Rött vin", "Kryddigt", "Mustigt"]
function subCategoriesOf(category) {
    return category
            .split(",")
            .flatMap(str => str.split("och"))
            .flatMap(str => str.split("&"))
            .map(str => str.trim())
            .filter(str => str.length > 0 );
}


// Default filters, which make no restrictions.
function emptyFilters() {
    return {
        priceMin:      0,
        priceMax:      Infinity,
        drink: {
            percentageMin: 0,
            percentageMax: 100
        },
        subCategories:  [],
        // Required subcategories
        searches:       [],
        organic:        false,
        kosher:         false
    };
}


// Verifies that an item is permissable according to the filters
function verifyItem(item, stock, filters, stockMin) {
    const subcategories = subCategoriesOf(item.category);
    // Simple checks
    if (item.priceinclvat < filters.priceMin
        || item.priceinclvat > filters.priceMax
        || item.kosher < filters.kosher
        || item.organic < filters.organic
       ) {
        return false;
    }
    if (item instanceof Drink) {
        // Additional simple checks for Drinks
        if (item.alcoholstrength < filters.drink.percentageMin
            || item.alcoholstrength > filters.drink.percentageMax) {
            return false;
        }
    }
    // Check that the available stock is greater than the needed
    // buffer.
    if (stock.getStock(item.id) <= stockMin) {
        return false;
    }
    // Check that all required subcategories are present.
    if (filters
        .subCategories
        .some(cat => !subcategories.includes(cat))) {
        return false;
    }
    // Check that each search is located somewhere in name or category of item
    if (filters
        .searches
        .some(search =>
              !item.name.includes(search)
              && !item.name2.includes(search)
              && !item.category.includes(search))) {
        return false;
    }
    return true;
};


// Seperates the string into words or words encapsulated in quotes.
// E.g. googlify("\"Rött vin\" Kryddigt Mustigt")
//   == ["Rött vin", "Kryddigt", "Mustigt"]
function googlify(string) {
    let components = [];
    let chunks = string.split("\"").map(str => str.trim());
    let open = false;
    // This code is very weird, and requires a
    // deeper understanding of how .split works.
    // This is too difficult for me to explain:
    // just treat googlify as a black box.
    for (let i in chunks) {
        if (open && i < chunks.length - 1) {
            components.push(chunks[i]);
            open = false;
        } else {
            components.push(...chunks[i].split(" "));
            open = true;
        }
    }
    return components.filter(str => str !== "");
}

// Finds all subcategories of the provided iterable of items, together with the
// the number of items in each subcategory.
//
// Unused.
function getSubCategories (iterable) {
    let subcategories = {};
    for (let item of iterable) {
        for (let cat of subCategoriesOf(item.category)){
            if (typeof subcategories[cat] === "undefined") {
                subcategories[cat] = 1;
            } else {
                subcategories[cat]++;
            }
        }
    }
    return subcategories;
};
