var DBFilePath = "beverages_eng.js";

function loadDB() {
  return new Promise(function(resolve, reject) {
    let DB = localStorage.getItem('DrunkenSailorDB');
    if (DB === null || DB === undefined) {
      $.getScript(DBFilePath).done(() => resolve(__InitialDB));
    } else {
      resolve(JSON.parse(DB));
    }
  });
}


function storeDB(database){
    localStorage.setItem('DrunkenSailorDB', JSON.stringify(database));
}
