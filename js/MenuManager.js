// MenuManager.js
//
// Model functions for configuring filtering options
// and creating views of the database based on those filtering options
//
// Author: Love Waern

'use strict';

// A map of main categories mapped to arrays with subcategories belonging
// to that category.
const mainCategories = {
    ale: ["Öl", "Ale"],
    whisky: ["Whisky"],
    white_wine: ["Vitt vin"],
    red_wine: ["Rött vin"],
    misc_wine: ["Mousserande vin",
                "Fruktvin",
                "Rosévin",
                "Vin av flera typer",
                "Vinsprit"],
    alcoholfree: ["Alkoholfritt"],
    sherry: ["Sherry"],
    vermouth: ["Vermouth"],
    cognac: ["Cognac"]
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

// The constructor for the MenuManager:
// A representation of the menu, as restricted by the filtering options
// in place.
function MenuManager (dataBase, stock, stockMin = 5) {
    this.dataBase = dataBase;
    this.stock = stock;
    this.stockMin = stockMin;
    this.storedFilteredMenu = null;
    // Main category currently chosen. Either null, meaning all items,
    // or a key of mainCategories, or "misc", meaning everything not part of a
    // main category.
    this.mainCategory = null;
    this.filters = emptyFilters();
}

// Serializes a MenuManager to JSON-representation, to be used with
// MenuManager.fromJSON()
// Use this instead of JSON.stringify for MenuManagers.
// If you use JSON.stringify, it will
// serialize the entire view. You don't want that.
MenuManager.prototype.toJSON = function () {
    let toSerialize = {
        mainCategory: this.mainCategory,
        filters:      this.filters,
        stockMin:     this.stockMin
    };
    return toSerialize;
};

MenuManager.prototype.toJSONString = function () {
    return JSON.stringify(this);
};

// Given a JSON-representation of a MenuManager
// (as returned from MenuManager.toJSON), and the targeted dataBase,
// deserializes the MenuManager from the JSON representation.
// USe this instead of JSON.parse for MenuManagers.
MenuManager.fromJSON = function (jsonRep, dataBase, stock) {
    let menuModel = new MenuManager(dataBase, stock, jsonRep.stockMin);
    menuModel.filters = jsonRep.filters;
    menuModel.mainCategory = jsonRep.mainCategory;
    return menuModel;
};

MenuManager.fromJSONString = (str, dataBase, stock) =>
    MenuManager.fromJSON(JSON.parse(str), dataBase);

// Resets the filter of the MenuManager
// OBS! Not a command, can't be undone.
MenuManager.prototype.clearFilter = function () {
    this.filters = emptyFilters();
};

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

// Seperates the string into words or words encapsulated in quotes.
// E.g. googlify("\"Rött vin\" Kryddigt Mustigt")
//   == ["Rött vin", "Kryddigt", "Mustigt"]
function googlify(string) {
    let components = [];
    let chunks = string.split("\"").map(str => str.trim());
    let open = false;
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


// Returns a command compatible with UndoManager for clearing
// the filter of the MenuManager
MenuManager.prototype.clearFilterCommand = function () {
    return this.modifyFilterCommand(() => emptyFilters());
};

// Given a function to modify the filter, returns a command compatible with
// UndoManager for modifying the filter of the MenuManager according to the
// function:
// The function is passed the filter map of the MenuManager,
// and may either return the new filter map or simply modify the passed
// filter in-place and return nothing.
MenuManager.prototype.modifyFilterCommand =
    function (filterModifier
              , preserveFilteredMenu=false) {
        return new Command(
            function () {
                let oldMenu = {
                    // deeply clone filters,
                    // to actually preserve the old filters
                    filters: cloneMap(this.filters)
                };
                if (preserveFilteredMenu) {
                    oldMenu.storedFilteredMenu = this.getMenu();
                }
                const newFilters = filterModifier(this.filters);
                if (typeof newFilters === "object") {
                    this.filters = newFilters;
                }
                // If the filter options have unchanged, we fail,
                // so we don't change undo/redo lists.
                if (deepEqual(oldMenu.filters, this.filters)) {
                    return { success: false };
                }
                return { success: true, result: oldMenu };
            }.bind(this),
            function (oldMenu) {
                let undoneMenu = {
                    // since undo is guaranteed to replaces the reference,
                    // no need to copy the undone filters here.
                    filters: this.filters,
                };
                if (preserveFilteredMenu) {
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
            function (menus) {
                this.filters = menus.undoneMenu.filters;
                if (preserveFilteredMenu) {
                    this.storedFilterMenu = menus.undoneMenu.storedFilteredMenu;
                }
                return { success: true, result: menus.oldMenu };
            }.bind(this)
        );
};


// Generates an iterable FilteredMenu object of the data base according
// to the filters in place.
MenuManager.prototype.getMenu = function () {
    if (this.storedFilteredMenu === null
        || !deepEqual(this.filters, this.storedFilteredMenu.filters)) {
        this.storedFilteredMenu = new FilteredMenu(this.dataBase,this.stock, this.filters,this.stockMin);
    }
    this.storedFilteredMenu.scope.category = this.mainCategory;
    return this.storedFilteredMenu;
};

// An constructor for a represention of a filtered view of the database.
// This is iterable: you can go through all main categories
// using "for (... of filteredMenu) { ... }" .
// to access specific main category, use .categories.X, where X is the key
// for the main category.
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

FilteredMenu.prototype.initialize = function (dataBase, stock) {
    for (let item of dataBase) {
        if (verifyItem(item, stock, this.filters, this.stockMin)) {
            let subCategories = subCategoriesOf(item.category);
            let mainCatFound = false;
            for (let key in mainCategories) {
                if (mainCategories[key]
                    .some(str => subCategories.includes(str))) {
                    this.categories[key].push(item);
                    mainCatFound = true;
                }
            }
            if (!mainCatFound) {
                this.categories.misc.push(item);
            }
        }
    }
};

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


// Indexes into a filtered view.
// OBS! Does not support negative indexes.
FilteredMenu.prototype.index = function (ix) {
    ix += this.scope.begin;
    if (ix >= this.scope.end) {
        return undefined;
    }
    if (this.scope.category !== null) {
        return this.categories[this.scope.category][ix];
    }
    for (let list of Object.values(this.categories)) {
        if (ix < list.length) {
            return list[ix];
        } else {
            ix -= list.length;
        }
    }
    return undefined;
};

// Calculates the number of items in the filtered view.
FilteredMenu.prototype.length = function() {
    let count = undefined;
    if (this.scope.category !== null) {
        count = this.categories[this.scope.category].length;
    } else {
        count = Object.values(this.categories)
                .reduce((acc,list) => acc + list.length, 0);
    }
    return Math.max(0, Math.min(this.scope.end,count) - this.scope.begin);
};


// Finds all subcategories of the provided iterable of items, together with the
// the number of items in each subcategory.
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

// Creates a new filtered view of another one, sharing all properties
// except that the visible elements are additionally restricted according
// to the arguments. With respect to "this", the beginning of the created view
// is at the index "begin" and the end of the created view is at index "end".
// "begin" defaults to 0, "end" defaults to Infinity, meaning the end of the
// view is unchanged.
//
// The third argument, if provided, will switch the targeted main category
// of the returned view to that argument.
//
// For example, to restrict the view to display only the first 20 items
// (indices 0-19):
//    filteredMenu.restricted(0,20)
// To view all sherry at index 20 and beyond:
//    filteredMenu.restricted(20,Infinity,"sherry")
//
// Mostly intended to be used for iteration, e.g.
// for (let item of filteredMenu.restricted(page*pageSize,pageSize,category))
FilteredMenu.prototype.restricted =
    function(begin=0,end=Infinity,category) {
        let offsetted = new FilteredMenu([],undefined, this.filters, this.stockMin);
        offsetted.categories = this.categories;
        offsetted.scope.end =
            Math.min(this.scope.end, this.scope.begin + end);
        offsetted.scope.begin =
            Math.min(offsetted.scope.end, begin + this.scope.begin);
        if (typeof category !== "undefined") {
            offsetted.scope.category = category;
        } else {
            offsetted.scope.category = this.scope.category;
        }
        return offsetted;
};

// The iterator for a FilteredMenu
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
