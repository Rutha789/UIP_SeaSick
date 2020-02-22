const DBFilePath = "beverages_eng.js";

// Returns a Promise.
function loadDB() {
  return new Promise(function(resolve, reject) {
    let DB = localStorage.getItem('DrinkDB');
    if (typeof DB === undefined || DB === null) {
      $.getScript(DBFilePath).done(() => resolve(__InitialDB));
    } else {
      resolve(JSON.parse(DB));
    }
  });
}


function storeDB(database){
    localStorage.setItem('DrinkDB', JSON.stringify(database));
}
