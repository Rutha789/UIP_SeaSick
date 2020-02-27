let englishTranslationMap = {
    welcome_welcome: "Welcome!",
    generic_loading: "Loading...",
    user_please_choose: "Please choose what user you are.",
    menu_drink: "DRINK",
    menu_food: "Food",
    menu_set: "set",
    menu_filter: "Filter",
};


let swedishTranslationMap = {
    welcome_welcome: "Välkommen!",
    generic_loading: "Laddar...",
    user_please_choose: "Snälla välj vad för typ användare du är",
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
// (e.g. menu_drink, menu_filter)
function validLocalizedKey(string) {
    return (string in englishTranslationMap);
}


// Goes through the all DOM elements with the class "localize" and replaces all
// text occurences of a valid key for a localized string with
// the localized string.
//
// Note: the "localize" class will hide all text in the DOM element until
// localizePage() is run.
//
// Note: this removes the "localize" class from each DOM object traversed.
// If you need to use this multiple times on the same page, re-add "localize"
// as a class to the elements you need to localize and then run
// localizePage(). Alternatively, use localizeText() on the text content
// of each element you need translated..
function localizePage() {
    $(".localize").each(function () {
        $(this).text(localizeText($(this).text()));
        $(this).removeClass("localize");
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
