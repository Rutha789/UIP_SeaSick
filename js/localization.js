let englishTranslationMap = {
    welcome_welcome: "Welcome!",
    generic_loading: "Loading...",
    menu_drink: "DRINK",
    menu_food: "Food",
    menu_set: "set",
    menu_filter: "Filter",
};


let swedishTranslationMap = {
    welcome_welcome: "Välkommen!",
    generic_loading: "Laddar...",
    menu_drink: "DRYCK",
    menu_food: "Mat",
    menu_set: "sätt",
    menu_filter: "Filtrera",
};

var applicationLanguage = "english";

function localizedString(string) {
    if (applicationLanguage === "english") {
        return englishTranslationMap[string];
    } else if (applicationLanguage === "swedish") {
        return swedishTranslationMap[string];
    } else {
        throw new Error("Unsupported language");
    }
};

// Checks if input is a valid key for a localized string
// (e.g. order_drink, order_filter)
function validLocalizedKey(string) {
    return (string in englishTranslationMap);
}





// Goes through the all DOM elements with the class "localize" replaces all
// text occurences of a valid key for a localized string with
// the localized string.
function localizePage() {
    $(".localize").each(function () {
        $(this).text(localizeText($(this).text()));
    });
}

function localizeText(text) {
    let toStudy = text.split("\n").map(l => l.split(" "));
    for (let lineIx in toStudy) {
        for (let wordIx in toStudy[lineIx]) {
            let key = toStudy[lineIx][wordIx];
            if (validLocalizedKey(key)) {
                toStudy[lineIx][wordIx] = localizedString(key);
            }
        }
        toStudy[lineIx] = toStudy[lineIx].join(" ");
    }
    return toStudy.join("\n");
}
