////////////////////////////////////////////////////////////////////////////////
// Management/Controller.js
//
// The controller for the management page.
//
// Author: All members
////////////////////////////////////////////////////////////////////////////////
'use strict';

// The controller for the management page.
function ManagementController (instance) {
    // Have an attribute for the model for easier access
    this.model = instance.model;
    // The promises relating to and launched by the controller
    this.promises = {};
};

// Synchronous initialization for the controller
ManagementController.prototype.initialize = function () {
    // Create a promise for loading the refill bar into the page
    this.promises.refillBar = new Promise(function (resolve) {
        $(document).ready(function () {
            $('#refillBar').load('/html/RefillBar.html', resolve);
        });
    });

    $(document).ready(function () {
        this.onReady();
    }.bind(this));
};

// Initialization to be done once both the page is loaded
ManagementController.prototype.onReady = function () {
    $("#filter-form").submit(function(e) {
        // preventDefault() to prevent reloading the page
        e.preventDefault();
        // Only submit filtering once the menuManager is loaded.
        this.model.promises.menuManager().then(
            () => this.submitFiltering()
        );
    }.bind(this));
    $("#toggle-filter-btn").click(function() {
        $("#filter-menu").css(
            "display",
            (i,display) =>
                display === "none" ? "grid" : "none"
        );
    }.bind(this));

    // Set-up undo and redo buttons, and create functions
    // for updating their visibility.
    const updateUndo = makeConditionalClick(
        $("#undo-button"),
        () => this.model.undoManager.undoAvailable(),
        () => this.model.undoManager.undo()
    );
    const updateRedo = makeConditionalClick(
        $("#redo-button"),
        () => this.model.undoManager.redoAvailable(),
        () => this.model.undoManager.redo()
    );

    // Create a method to update both at once.
    this.updateUndoRedo = function () {updateUndo(); updateRedo();};
    this.updateUndoRedo();

    // Register updateUndoRedo to the undoManager, so that
    // when the undoManager is modified, the visibility of the buttons
    // will be updated.
    this.model.undoManager.registerCallback(() => this.updateUndoRedo());

    // Set up the buttons for changing language
    $(".lang").click(event => changeLanguage(event));

    this.model.promises.dbs.drink.then(function () {
        this.onDrinkDBReady();
    }.bind(this));

    localizePage();
};

ManagementController.prototype.onDrinkDBReady = function () {
    if (this.model.activeMenu === "drink") {
        this.renderMenu();
    }

    const gotoPage = function (ix) {
        if (ix !== this.model.pageIx) {
            this.model.gotoPage(ix);
            this.renderMenu();
            this.updatePageIndex();
        }
    }.bind(this);

    const updatePrevButton = makeConditionalClick (
        $("#nav-prev-page-btn"),
        () => this.model.prevPageAvailable(),
        () => gotoPage(this.model.pageIx - 1)
    );
    const updateNextButton = makeConditionalClick (
        $("#nav-next-page-btn"),
        () => this.model.nextPageAvailable(),
        () => gotoPage(this.model.pageIx + 1)
    );
    $("#nav-page-input").on(
        "input",
        function (e) {
            e.target.setCustomValidity("");
            $(e.target).css("width", 2 + e.target.value.length + "ch");
        }
    );
    $("#nav-page-input").change(function (e) {
        let ix = e.target.value;
        if (ix !== "") {
            ix = Number(ix) - 1;
            if (this.model.pageAvailable(ix)) {
                gotoPage(ix);
            } else {
                e.target.setCustomValidity("Invalid page");
            }
        }
    }.bind(this));
    this.updatePageIndex = function () {
        updatePrevButton();
        updateNextButton();
        const viewIx = this.model.pageIx + 1;
        const maxViewIx = this.model.maxPageIx() + 1;
        $("#nav-page-input")[0].value = viewIx;
        $("#nav-page-input")[0].max = maxViewIx + 1;
        //                                  v  convert viewIx to string
        $("#nav-page-input").css("width", ((viewIx + "").length + 2) + "ch");
        $("#nav-page-max").text("/ " + (this.model.maxPageIx() + 1));
    };
    this.updatePageIndex();
};



// Render the menu for the current page for the chosen menuManager.
ManagementController.prototype.renderMenu = function () {
    // Add functionality to each main category for changing the category.
    for (let cat of $("#main-categories").children()) {
        cat.onclick = () => this.setMainCategory(idToMainCat(cat.id));
    }
    let itemContainerWidth =
        document.getElementById('item-container').clientWidth;

    // Remove anything previously in the item container
    $("#item-container").html("");
    for (let item of this.model.pageItems()) {
        addDOMItemToMenu(item.renderForMenu(itemContainerWidth/4));
    }
};


// Set the main category, highlighting the corresponding button
ManagementController.prototype.setMainCategory = function (category) {
    const menu = this.model.menuManager();
    if (typeof menu === "undefined"
        || menu.mainCategory === category) {
        return;
    }
    $("#" + mainCatToId(menu.mainCategory)).removeClass("red-bordered");
    menu.mainCategory = category;
    $("#" + mainCatToId(menu.mainCategory)).addClass("red-bordered");
    this.model.gotoPage(0);
    this.updatePageIndex();
    this.renderMenu();
};

// Get the filter options as specified by the user and apply them.
ManagementController.prototype.submitFiltering = function () {
    const menu = this.model.menuManager();
    if (typeof menu === "undefined") {
        return;
    }
    // We augment the modifyFilterCommand of the model with
    // a command to update the user's filter form
    // upon an undo or redo, and rerender the menu
    let filterCommand = this
        .model
        .modifyFilterCommand(filter => this.getFilterForm())
        .augment(new Command(
            // perform(). Does nothing.
            () => undefined,
            // undo()
            function () {
                this.setFilterForm(menu.filters);
                this.updatePageIndex();
                this.renderMenu();
            }.bind(this),
            // redo()
            function () {
                this.setFilterForm(menu.filters);
                this.updatePageIndex();
                this.renderMenu();
            }.bind(this)
        ));
    let result = this.model.undoManager.perform(filterCommand);
    // If the new filters are different, rerender the menu.
    if (result.success) {
        this.updatePageIndex();
        this.renderMenu();
    }

};

// Get the filter options as specified by the user
ManagementController.prototype.getFilterForm = function () {
    let filters = emptyFilters();
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        // The map we modify for this element
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            // In this case, we're modifying a field in filters.drink,
            // and not filters, so we change studiedFilters
            studiedFilters = filters.drink;
            key = key.slice(6);
        }
        if (key in studiedFilters) {
            if (element.type === "checkbox") {
                studiedFilters[key] = element.checked;
            } else if (element.type === "number" && element.value !== "") {
                studiedFilters[key] = Number(element.value);
            } else if (element.type === "search") {
                // Specifically for searches, we split the string up into
                // required phrases using googlify
                studiedFilters[key] = googlify(element.value);
            } else if (element.type === "text") {
                studiedFilters[key] = element.value;
            };
        }
    }
    return filters;
};

// Update the filter form visible to the user to reflect the
// filters in place in the menuManager.
ManagementController.prototype.setFilterForm = function (filters) {
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            // In this case, we're want looking at a field in filters.drink,
            // and not filters, so we change studiedFilters
            studiedFilters = filters.drink;
            key = key.slice(6);
        }
        if (key in studiedFilters) {
            if (element.type === "checkbox") {
                element.checked = studiedFilters[key];
            } else if (element.type === "number") {
                element.value = studiedFilters[key];
            } else if (element.type === "search") {
                element.value =
                  // This is basically the reverse of "googlify".
                  // For each search pharse, we wrap it into
                  // quotes if that phrase contains a space,
                  // and then we join the phrases together.
                    studiedFilters[key]
                    .map(str => str.includes(" ") ? "\"" + str + "\"" : str)
                    .join(" ");
            } else if (element.type === "text") {
                element.value = studiedFilters[key];
            };
        }
    }
};

// Given the identifier for a main category,
// convert it into the id for the button of that category.
//
// This will convert null to "cat-ALL"
function mainCatToId(cat) {
    if (cat === null) {
        cat = "ALL";
    }
    return "cat-" + cat;
}

// Given the id of a main category button, convert it into the identifier
// for that main category.
//
// This will convert "cat-ALL" to null
function idToMainCat(id) {
    let cat = id.slice(4);
    if (cat === "ALL") {
        cat = null;
    }
    return cat;
}

// Appends a dom element to the menu
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

// Displays the language menu
function langOptionShow(){
    document.getElementById("lang-overlay").classList.add("show");
    document.getElementById("language-options").classList.add("show");
}

function langOptionHide(){
    document.getElementById("lang-overlay").classList.remove("show");
    document.getElementById("language-options").classList.remove("show");
}

// Given the event of a language choice being clicked,
// switch the application language to that language,
// and relocalize the page.
function changeLanguage(event){
    const oldLanguage = applicationLanguage;
    setLanguage(event.target.id.slice(5));
    // Only relocalize if the language has actually changed.
    if (oldLanguage !== applicationLanguage) {
        localizePage();
    }
    langOptionHide();
}

