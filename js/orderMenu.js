window.onload = function() {
    initialOrderMenu();
    initialOrderBar();
};

function initialOrderMenu(){
    var h = document.getElementById('item-container').clientHeight/3;
    // Load the drink database asynchronously. Once it's been loaded,
    // display the first 10 items in the menu.
    loadDB().then(function (dataBase) {
        $("#item-container").html("");
        for (let i = 0; i < 10; i++) {
            addDOMItemToMenu(renderItem(h,dataBase[i],"orderMenu"));
        }
    });
}

function initialOrderBar(){
    $('#orderBar').load('../html/orderBar.html');
};

// Given a DOM element, appends it to the order menu.
function addDOMItemToMenu(dom) {
    $("#item-container").append(dom);
}
