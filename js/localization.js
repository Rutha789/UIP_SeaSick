let enTranslationMap = {
    welcome_welcome: "Welcome!",
    generic_loading: "Loading...",
    user_please_choose: "Please choose what user you are.",
    menu_drink: "DRINK",
    menu_food: "Food",
    menu_set: "set",
    menu_filter: "Filter",
    cat_ALL: "ALL",
    cat_ale: "Ale",
    cat_whisky: "Whisky",
    cat_white_wine: "White wine",
    cat_red_wine: "Red wine",
    cat_misc_wine: "Other wine",
    cat_alcoholfree: "Alcohol free",
    cat_sherry: "Sherry",
    cat_vermouth: "Vermouth",
    cat_cognac: "Cognac",
    filter_priceMin: "Minimum price (SEK)",
    filter_priceMax: "Maximum price (SEK)",
    filter_drink_percentageMin: "Minimum alcohol strength (%)",
    filter_drink_percentageMax: "Maximum alcohol strength (%)",
    filter_subCategories: "Subcategories",
    filter_searches: "Search",
    filter_organic: "Must be organic",
    filter_kosher: "Must be kosher",
    pay_amount: "AMOUNT",
    pay_total_cost: "TOTAL COST:",
    pay_ordered: "YOU HAVE ORDERED:",
};


let seTranslationMap = {
    welcome_welcome: "Välkommen!",
    generic_loading: "Laddar...",
    user_please_choose: "Snälla välj vad för typ av användare du är",
    menu_drink: "DRYCK",
    menu_food: "Mat",
    menu_set: "sätt",
    menu_filter: "Filtrera",
    cat_ALL: "ALLT",
    cat_ale: "Öl",
    cat_whisky: "Whisky",
    cat_white_wine: "Vitt vin",
    cat_red_wine: "Rött vin",
    cat_misc_wine: "Annat vin",
    cat_alcoholfree: "Alcoholfritt",
    cat_sherry: "Sherry",
    cat_vermouth: "Vermouth",
    cat_cognac: "Cognac",
    filter_priceMin: "Minimum pris (SEK)",
    filter_priceMax: "Maximum pris (SEK)",
    filter_drink_percentageMin: "Minimum alkoholhalt (%)",
    filter_drink_percentageMax: "Maximum alkoholhalt (%)",
    filter_subCategories: "Subkategorier",
    filter_searches: "Sök",
    filter_organic: "Måste vara organisk",
    filter_kosher: "Måste vara kosher",
    pay_amount: "ANTAL",
    pay_total_cost: "TOTAL KOSTNAD:",
    pay_ordered: "DU HAR BESTÄLLT:",
};
let teTranslationMap = {
    welcome_welcome: "స్వాగతం!",
    generic_loading: "లోడ్ అవుతోంది ...",
    user_please_choose: "దయచేసి మీరు ఏ వినియోగదారుని ఎంచుకోండి.",
    menu_drink: "పానీయం",
    menu_food: "ఆహారం",
    menu_set: "సెట్",
    menu_filter: "ఫిల్టర్",
    cat_ALL: "అన్నీ",
    cat_ale: "ఆలే",
    cat_whisky: "విస్కీ",
    cat_white_wine: "వైట్ వైన్",
    cat_red_wine: "రెడ్ వైన్",
    cat_misc_wine: "ఇతర వైన్",
    cat_alcoholfree: "ఆల్కహాల్ ఫ్రీ",
    cat_sherry: "షెర్రీ",
    cat_vermouth: "వర్మౌత్",
    cat_cognac: "కాగ్నాక్",
    filter_priceMin: "కనిష్ట ధర (SEK)",
    filter_priceMax: "గరిష్ట ధర (SEK)",
    filter_drink_percentageMin: "కనీస మద్యం శాతం (%)",
    filter_drink_percentageMax: "గరిష్ట ఆల్కహాల్ శాతం (%)",
    filter_subCategories: "ఉపవర్గాలు",
    filter_searches: "శోధన",
    filter_organic: "సేంద్రీయంగా ఉండాలి",
    filter_kosher: "కోషర్ అయి ఉండాలి",
    pay_amount: "మొత్తం",
    pay_total_cost: "మొత్తం ఖర్చు:",
    pay_ordered: "మీరు ఆదేశించారు:",
};

let zhTranslationMap = {
    welcome_welcome: "歡迎!",
    generic_loading: "載入中...",
    user_please_choose: "請選擇用戶",
    menu_drink: "酒",
    menu_food: "食物",
    menu_set: "套餐",
    menu_filter: "篩選",
    cat_ALL: "全部",
    cat_ale: "麥酒",
    cat_whisky: "威士忌",
    cat_white_wine: "白酒",
    cat_red_wine: "紅酒",
    cat_misc_wine: "其他",
    cat_alcoholfree: "無酒精",
    cat_sherry: "雪梨",
    cat_vermouth: "苦艾",
    cat_cognac: "干邑",
    filter_priceMin: "最低價格 (SEK)",
    filter_priceMax: "最高價格 (SEK)",
    filter_drink_percentageMin: "最低酒精 (%)",
    filter_drink_percentageMax: "最高酒精 (%)",
    filter_subCategories: "酒類",
    filter_searches: "搜尋",
    filter_organic: "有機",
    filter_kosher: "清真",
    pay_amount: "總數",
    pay_total_cost: "總數:",
    pay_ordered: "你已落單:",
};

// Will update the applicationLanguage to that of localStorage, and
// return it. You shouldn't need to use this; this module already
// loads the langauge from localStorage automatically
function loadLanguage() {
    applicationLanguage = localStorage.getItem('language');
    return applicationLanguage;
}

var applicationLanguage = undefined;

// Initialize the language to what we've stored in localStorage
loadLanguage();

// If we haven't stored the language in localStorage,
// default it to english.
if (applicationLanguage === null) {
    setLanguage("en");
}

// Changes the language of the application to that of the argument,
// updating localStorage with it.
//
// Obs! In order for change in language to become visible in the page,
// call "localizePage()" after "setLanguage()".
function setLanguage(lang) {
    applicationLanguage = lang;
    localStorage.setItem("language", lang);
    localizePage();
}

function localizedString(string) {
    if (applicationLanguage === "en") {
        return enTranslationMap[string];
    } else if (applicationLanguage === "se") {
        return seTranslationMap[string];
    } else if (applicationLanguage === 'zh') {
        return zhTranslationMap[string];
    } else if (applicationLanguage === 'te') {
        return teTranslationMap[string];
    } else {
        throw new Error("Unsupported language");
    }
};

// Checks if input is a valid key for a localized string
// (e.g. menu_drink, menu_filter)
function validLocalizedKey(string) {
    return (string in enTranslationMap);
}


// Goes through the all DOM elements with the class "localize" and replaces all
// text occurences of a valid key for a localized string with
// the localized string.
//
// Even if the elements have already been localized, this function will
// relocalize them. This is useful if you've switched languages, and want to
// update the page to use the new language.
// Simply call "localizePage()" again after "setLanguage()".
//
// Note: the "localize" class will hide all text in the DOM elements until
// localizePage() is run.
function localizePage() {
    $(".localize").each(function () {
        localizeDOM(this);
    });
}

// Localizes a DOM element, replacing all
// text occurences of a valid key for a localized string with
// the localized string.
//
// Even if the element has already been localized, this function will
// relocalize it. This is useful if you've switched languages, and want to
// update the element to use the new language.
//
// This will add the "localize" class to the DOM element if it didn't
// have it already, so that localizePage() will visit it upon relocalization.
function localizeDOM(dom) {
    // Give the element the "localize" class if it doesn't have it already,
    // so "localizePage()" will visit it if called.
    $(dom).addClass("localize");
    // Since localizeDOM replaces the original text of the dom, we need to
    // preserve the original text for relocalization (switching language).
    let text = $(dom).data("originalText");
    // A check for if this is a initial localization or a relocalization.
    // - If it's relocalization, we use .data("originalText") rather than
    //   .text()
    // - If it's an initial localization, use .text() and set
    //   .data("originalText")
    if (typeof text === "undefined") {
        text = $(dom).text();
        $(dom).data("originalText", text);
    }
    $(dom).text(localizeText(text));
    // There's a rule that makes text of "localize"-classed DOM elements
    // invisible. It doesn't apply if the DOM element has the "localized"
    // class. So by adding this class, we make text of the targeted DOM
    // element visible again.
    $(dom).addClass("localized");
}

// Localizes a piece of text, replacing all
// text occurences of a valid key for a localized string with
// the localized string.
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
