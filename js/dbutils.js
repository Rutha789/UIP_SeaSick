const DBFilePath = "../js/beverages_eng.js";

// Can't use $.getScript, uses XMLHttpRequest internally and
// Same Origin Policy hates that
function loadScript(path, callback) {
    var script = document.createElement('script');
    script.onload = callback;
    script.src = path;
    document.head.appendChild(script);
}

// Returns a promise
function loadDB() {
    return new Promise(function(resolve, reject) {
        loadScript(DBFilePath,function () {
            for (let itemIx in __InitialDB) {
                __InitialDB[itemIx] = new Item(__InitialDB[itemIx]);
            }
            resolve(__InitialDB);
        });
    });
}


// function storeDB(database){
//     localStorage.setItem('DrinkDB', JSON.stringify(database));
// }
