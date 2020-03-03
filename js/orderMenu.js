var undoManager = new UndoManager();

var pageIx = 0;
var pageSize = 10;
var itemSize = $(window).height()/3;
var drinkMenuModel = undefined;

$(document).ready(function(){
    $("#filter-form").submit(function(e) {
        e.preventDefault(); 
        if (typeof drinkMenuModel !== "undefined") {
            submitFiltering();
        }
    });
    updatePage();
    localizePage();
    undoManager.registerCallback(updatePage);
    $("#undo-button").click(() => undoManager.undo());
    $("#redo-button").click(() => undoManager.redo());

    // Load the drink database asynchronously. Once it's been loaded,
    // display the first 10 items in the menu.
    loadDB().then(function (dataBase) {
        drinkMenuModel = new MenuModel(dataBase);

        $("#item-container").html("");

        for (let cat of $("#main-categories").children()) {
            cat.onclick = () => setMainCategory(idToMainCat(cat.id));
        }
        updatePage();
    });
});

function nextPage() {
    if (typeof drinkMenuModel === "undefined") {
        return;
    }
    let filteredMenu =
        drinkMenuModel
        .getMenu()
        .restricted((pageIx + 1)*pageSize,(pageIx+2)*pageSize);
    if (filteredMenu.length() > 0) {
        pageIx++;
        updatePage();
    }
}

function prevPage() {
    if (typeof drinkMenuModel === "undefined") {
        return;
    }
    if (pageIx > 0) {
        pageIx--;
        updatePage();
    }
}

// $(document).on("submit", "#filter-form input[type='submit']", function () {
//     if (typeof drinkMenuModel !== "undefined") {
//         submitFiltering();
//     }
//     return false;
// });

function updateUndoRedoButtons() {
    $("#undo-button").css("opacity", 0.5 + undoManager.undoAvailable()*0.5);
    $("#redo-button").css("opacity", 0.5 + undoManager.redoAvailable()*0.5);
}

function mainCatToId(cat) {
    if (cat === null) {
        cat = "ALL";
    }
    return "cat-" + cat;
}
function idToMainCat(id) {
    let cat = id.slice(4);
    if (cat === "ALL") {
        cat = null;
    }
    return cat;
}

function setMainCategory(category) {
    if (typeof drinkMenuModel === "undefined"
        || drinkMenuModel.mainCategory === category) {
        return;
    }
    $("#" + mainCatToId(drinkMenuModel.mainCategory)).removeClass("selected");
    drinkMenuModel.mainCategory = category;
    $("#" + mainCatToId(drinkMenuModel.mainCategory)).addClass("selected");
    updatePage();
}

function submitFiltering() {
    let action = drinkMenuModel
        .modifyFilterCommand(getFilterForm)
        .augment(new Command(
            function () {
                pageIx = 0;
            },
            function () {
                setFilterForm(drinkMenuModel.filters);
                pageIx = 0;
            },
            function () {
                setFilterForm(drinkMenuModel.filters);
                pageIx = 0;
            }));
    undoManager.perform(action);
}

function getFilterForm() {
    let filters = emptyFilters();
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
            studiedFilters = filters.drink;
            key = key.slice(6);
        }
        if (key in studiedFilters) {
            if (element.type === "checkbox") {
                studiedFilters[key] = element.checked;
            } else if (element.type === "number" && element.value !== "") {
                studiedFilters[key] = Number(element.value);
            } else if (element.type === "search") {
                studiedFilters[key] = googlify(element.value);
            } else if (element.type === "text") {
                studiedFilters[key] = element.value;
            };
        }
    }
    return filters;
}

function setFilterForm(filters) {
    for (let element of $("#filter-form input")) {
        // slice(7) to remove "filter-" prefix of form element's id
        let key = element.id.slice(7);
        let studiedFilters = filters;
        // If it's a filter option for drinks, the key exists in filters.drink.
        // Drop that prefix also
        if (key.startsWith("drink-")) {
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
                    studiedFilters[key]
                    .map(str => str.includes(" ") ? "\" + str + \"" : str)
                    .join(" ");
            } else if (element.type === "text") {
                element.value = studiedFilters[key];
            };
        }
    }
}

function updatePage() {
    updateUndoRedoButtons();
    if (typeof drinkMenuModel === "undefined") {
        return;
    }
    let filteredMenu =
        drinkMenuModel
        .getMenu()
        .restricted(pageIx*pageSize,(pageIx+1)*pageSize);
    $("#item-container").html("");
    for (let item of filteredMenu) {
        addDOMItemToMenu(renderOrderItem(itemSize,item));
    }
}

// Given a DOM element, appends it to the order menu.
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}

// Given an item creates and returns a dom element for it.
function renderOrderItem(h,item,quan = 1){

    //render shopitem regarding the size
    var shopItem = document.createElement('div');
    shopItem.className = "shopItem";
    shopItem.style = "height:"+h+"px;width:"+h+"px;display: inline-block;padding:1% 1% 1% 1%;background-color:dimgrey;";
    shopItem.draggable = true;
    shopItem.ondrag = true;
    shopItem.id = "menu-item-" + item.nr;
    // Associate it with the item
    $(shopItem).data("item",item);

  //create a infoicon for each shopItem
  var infoIcon = document.createElement("img");
  //   infoIcon.className = "infoIcon";
  //   infoIcon.style = "height:20%;width: 20%;top:0;margin: 2% 2% 2% 2%;";
  infoIcon.draggable = false;
  infoIcon.src = "../res/info_icon.png";
  shopItem.appendChild(infoIcon);

<<<<<<< HEAD
  //create a ecoIcon
  var ecoIcon = document.createElement("img");
  //   ecoIcon.className = "ecoIcon";
  //   ecoIcon.style = "height:20%;width: 20%;bottom:0;margin: 2% 2% 2% 2%;";
  ecoIcon.draggable = false;
  ecoIcon.src = "../res/eco_icon.png";
  shopItem.appendChild(ecoIcon);

  //create a pcent
  var pcent = document.createElement("p");
  pcent.className = "pcent";
  pcent.textContent = pc;
  pcent.style =
    "height:20%;width: 20%;margin: 2% 2% 2% 2%;color:white;font-weight: bold;";
  pcent.draggable = false;
  shopItem.appendChild(pcent);

  //create a drag and drop overlay
  var overlay = document.getElementById("overlay");
  shopItem.addEventListener("drag", function() {
    overlay.style = "display:inherit;";
  });
  shopItem.addEventListener("dragend", function() {
    overlay.style = "display:none;";
  });

  //append the item into the order item list
  document.getElementById("item-container").appendChild(shopItem);
=======
    //create a ecoIcon
    if (item.organic) {
        var ecoIcon = document.createElement("img");
        ecoIcon.className = "ecoIcon";
        ecoIcon.style = "height:20%;width: 20%;bottom:0;margin: 2% 2% 2% 2%;";
        ecoIcon.draggable = false;
        ecoIcon.src = "../res/eco_icon.png";
        shopItem.appendChild(ecoIcon);
    }

    //create a pcent
    var pcent = document.createElement("p");
    pcent.className = "pcent";
    pcent.textContent = item.alcoholstrength + "%";
    pcent.style = "height:20%;width: 20%;margin: 2% 2% 2% 2%;color:white;font-weight: bold;";
    pcent.draggable = false;
    shopItem.appendChild(pcent);

    //increase decrease quantity button
    // var indeButton = document.createElement('div');
    // indeButton.className = "indeButton";
    // indeButton.style = "height:15%;width:100%;display:inline-block;";
    // indeButton.draggable = false;
    // shopItem.appendChild(indeButton);

    // var inButton = document.createElement('div');
    // inButton.className = "inButton";
    // inButton.style = "height:100%;width:"+h/3+"px;background-color:green;display:inline-block;float:left;text-align: center;font-weight: bolder;font-size: larger;";
    // inButton.draggable = false;
    // inButton.textContent= "+";
    // indeButton.appendChild(inButton);

    // var quanText = document.createElement('div');
    // quanText.className = "quanText";
    // quanText.style = "height:100%;width:"+h/3+"px;background-color:grey;display:inline-block;text-align: center;font-weight: bolder;font-size: larger;";
    // quanText.draggable = false;
    // quanText.textContent= quan;
    // indeButton.appendChild(quanText);

    // var deButton = document.createElement('div');
    // deButton.className = "inButton";
    // deButton.style = "height:100%;width:"+h/3+"px;background-color:red;display:inline-block;float:right;text-align: center;font-weight: bolder;font-size: larger;";
    // deButton.draggable = false;
    // deButton.textContent= "-";
    // indeButton.appendChild(deButton);

    //create a drag and drop overlay
    var overlay = document.getElementById("overlay");
    shopItem.addEventListener("drag", function(){overlay.style = "display:inherit;";});
    shopItem.addEventListener("dragend", function(){overlay.style = "display:none;";});

    // Return the created item DOM element.
    return shopItem;
>>>>>>> 1525a546290b634c4fdf7a1a018c7301f06d2499
}
