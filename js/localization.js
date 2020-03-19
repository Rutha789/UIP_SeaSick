////////////////////////////////////////////////////////////////////////////////
// localization.js
//
// The module for internationalisation using string replacement,
// and keeping track of the currently chosen application language.
//
// Author: Love Waern
// Translation maps provided by all members of the group.
////////////////////////////////////////////////////////////////////////////////

"use strict";


////////////////////////////////////////////////////////////////////////////////
// APPLICATION LANGUAGE
////////////////////////////////////////////////////////////////////////////////

// Global variable for the application language for this session.
var applicationLanguage = undefined;

// Will update the applicationLanguage to that of sessionStorage, and
// return it. You shouldn't need to call this manually; this module already
// loads the langauge from localStorage automatically
function loadLanguage() {
    applicationLanguage = sessionStorage.getItem('language');
    return applicationLanguage;
}

// Changes the language of the application to that of the argument,
// updating sessionStorage with it.
//
// Obs! In order for the change to apply in the page, call localizePage().
function setLanguage(lang) {
    applicationLanguage = lang;
    sessionStorage.setItem("language", lang);
}

// Initialize the language to what we've stored in localStorage
loadLanguage();

// If we haven't stored the language in localStorage,
// default it to english.
if (applicationLanguage === null) {
    setLanguage("en");
}

////////////////////////////////////////////////////////////////////////////////
// TRANSLATION MAPS
////////////////////////////////////////////////////////////////////////////////

// English translation map
let enTranslationMap = {
    welcome_welcome: "Welcome!",
    generic_loading: "Loading...",
    generic_not_logged_in: "Not logged in",
    generic_login: "LOG IN",
    generic_username: "@username",
    generic_password: "password",
    generic_close: "Close",
    generic_apply: "Apply",
    user_please_choose: "Please choose what user you are.",
    manage_order_refill: "Order refill",
    menu_drink: "DRINK",
    menu_food: "Food",
    menu_set: "set",
    menu_filter: "Filter",
    menu_credit: "Credit:",
    menu_page: "Page:",
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
    pay_your_order: "YOUR ORDER",
    pay_amount: "AMOUNT",
    pay_table: "Pay at table",
    pay_bar: "Pay at bar counter",
    pay_credit: "Pay with credit",
    pay_total_cost: "TOTAL COST:",
    pay_ordered: "YOU HAVE ORDERED:",
};


// Swedish translation map
let seTranslationMap = {
    welcome_welcome: "Välkommen!",
    generic_loading: "Laddar...",
    generic_not_logged_in: "Inte inloggad",
    generic_login: "LOGGA IN",
    generic_username: "@användarnamn",
    generic_password: "lösenord",
    generic_close: "Stäng",
    generic_apply: "Applicera",
    user_please_choose: "Snälla välj vad för typ av användare du är",
    manage_order_refill: "Beställ påfyllning",
    menu_drink: "DRYCK",
    menu_food: "Mat",
    menu_set: "sätt",
    menu_filter: "Filtrera",
    menu_credit: "Kredit:",
    menu_page: "Sida:",
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
    pay_your_order: "DIN BESTÄLLNING",
    pay_amount: "ANTAL",
    pay_table: "Betala vid bordet",
    pay_bar: "Betala vid bardisken",
    pay_credit: "Batala med kredit",
    pay_total_cost: "TOTAL KOSTNAD:",
    pay_ordered: "DU HAR BESTÄLLT:",
};

// Telugu translation map
let teTranslationMap = {
    welcome_welcome: "స్వాగతం!",
    generic_loading: "లోడ్ అవుతోంది ...",
    generic_not_logged_in: "లాగిన్ కాలేదు",
    generic_login: "లాగ్ ఇన్",
    generic_username: "ern వినియోగదారు పేరు",
    generic_password: "పాస్వర్డ్",
    generic_close: "మూసివేయి",
    generic_apply: "వర్తించు",
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
    pay_your_order: "మీ ఆర్డర్",
    pay_amount: "మొత్తం",
    pay_table: "టేబుల్ వద్ద చెల్లించండి",
    pay_bar: "బార్ కౌంటర్ వద్ద చెల్లించండి",
    pay_credit: "క్రెడిట్‌తో చెల్లించండి",
    pay_total_cost: "మొత్తం ఖర్చు:",
    pay_ordered: "మీరు ఆదేశించారు:",
};

// Simplified chinese translation map
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
    pay_ordered: "你落左單:",
    generic_not_logged_in: "未登入",
    generic_login:"登入",
    generic_username:"帳號",
    generic_password:"密碼",
    generic_close:"關閉",
    generic_apply:"申請",
    menu_credit:"信用額",
    pay_your_order:"你叫左D咩",
    pay_table:"唔該埋單",
    pay_bar:"出去比錢",
    pay_credit:"拖數",
};

////////////////////////////////////////////////////////////////////////////////
// BASIC STRING LOCALIZATION FUNCTIONALITY
////////////////////////////////////////////////////////////////////////////////

// Gets the translation map for the current applicationLanguage
function getTranslationMap() {
    switch (applicationLanguage) {
    case "en": return enTranslationMap;
    case "se": return seTranslationMap;
    case "zh": return zhTranslationMap;
    case "te": return teTranslationMap;
    default: throw new Error("Unsupported language");
    }
}

// Gets the corresponding string in our currently chosen language
// for the given string key.
function localizedString(string) {
    const translated = getTranslationMap()[string];
    if (typeof translated === "undefined") {
        console.warn("localizedString: no localized string for " + string
                     + " using language " + applicationLanguage);
        return string;
    } else {
        return translated;
    }
};

// Checks if input is a valid key for a localized string
// (e.g. menu_drink, menu_filter)
function validLocalizedKey(string) {
    return (string in getTranslationMap());
}

////////////////////////////////////////////////////////////////////////////////
// TEXT WIDE, DOM-ELEMENT WIDE, AND PAGE WIDE LOCALIZATION
////////////////////////////////////////////////////////////////////////////////

// Localizes a piece of text: for each word,
// if that word is a valid key for a localized string, then that word
// will be replaced by the localized string. Otherwise, that work will be kept
// intact.
//
// For example, given the current application language is english:
//    localizeText("menu_credit 100 SEK") === "Credit: 100 SEK"
function localizeText(text) {
    // Split the text into lines and words:
    // Creates a list of lists, where each inner list is represents a
    // line, and consists of a the words on that line.
    let linesWords = text.split("\n").map(l => l.split(" "));
    // For each line
    for (let lineIx in linesWords) {
        // For each word
        for (let wordIx in linesWords[lineIx]) {
            let key = linesWords[lineIx][wordIx];
            // Check if the word is a valid key
            if (validLocalizedKey(key)) {
                // If so, replace the word with the localized string.
                linesWords[lineIx][wordIx] = localizedString(key);
            }
        }
        // Once all words of the line have been processed,
        // we join the words of that line together into a complete string.
        linesWords[lineIx] = linesWords[lineIx].join(" ");
    }
    // Once all lines have been processed,
    // we join the lines together into a complete string.
    return linesWords.join("\n");
}

// The attributes that are considered considered text attributes.
const textAttributes = ["alt", "label", "title", "value", "placeholder"];

// Localizes a DOM element: for each word across the element's
// "text attributes" and text content, if that word is a valid
// key for a localized string, then it will be replaced with
// the localized string.
//
// The original attributes and text content will be
// stored. This allows this function to relocalize DOM elements
// that have already been localized, by acting on the original
// strings. This is useful if you've switched languages, and want to
// update the element to use the new language.
//
// This will mark the DOM element as localized
// (by setting the attribute "localize" to "done"), for several purposes:
//   1. If the DOM element was previously marked as "localize",
//      but not "localized", (i.e. localize attribute existing but not "done"),
//      then the text within the element will become visible.
//   2. If the DOM element wasn't already marked "localize", then
//      this makes it so localizePage() will visit upon relocalization
//   3. We know upon relocalization that the text of the DOM has been replaced,
//      and that we need to fetch the original text.
//
// If you have changed the text contents or values of a previously localized
// DOM element, you need to avoid relocalization from reverting the changes you've
// made. This is done by calling invalidateLocalization() on the DOM element,
// which will remove the "localize" marking from the element.
function localizeDOM(dom) {
    let text = undefined;

    const localizeAttr = $(dom).attr("localize");

    // A check for if this is a initial localization or a relocalization.
    // It's an initial localization if the localize attribute isn't present,
    // or is present but isn't "done".

    let firstLocalize =
        typeof localizeAttr === "undefined"
        || localizeAttr !== "done";
    if (firstLocalize) {
        // If this is an initial localization, we may use .text(), but we should
        // also store the original text in .data("originalText") so we may
        // reuse it upon relocalization.
        text = $(dom).text();
        $(dom).data("originalText", text);
    } else {
        // If this is a relocalization, we translate the original text contents
        // rather than the current one.
        text = $(dom).data("originalText");
    }
    // Replace the text contents of the DOM with the localized text.
    $(dom).text(localizeText(text));

    // Now to replace the value of each text attribute of the DOM element
    for (let attribute of $(dom)[0].attributes) {
        if (textAttributes.includes(attribute.name)) {
            let origValue = undefined;
            if (firstLocalize) {
                // If this is an initial localization, we may localize the value
                // currently present, but we should also store the original value
                // in .data("original" + attribute.name) so we may
                // reuse it upon relocalization.
                origValue = attribute.value;
                $(dom).data("original" + attribute.name, origValue);
            } else {
                // If this is a relocalization, we use the original value
                // rather than the current one.
                origValue = $(dom).data("original" + attribute.name);
            }
            // If this is a relocalization, we use the original value
            // rather than the current one.
            attribute.value = localizeText(origValue);
        }
    }
    // Set the "localize" attribute to "done", making the element become visible.
    $(dom).attr("localize","done");
}



// Localizes all DOM elements on the page marked as "localize"
// (by having "localize" attribute): for each word across each
// DOM element's attributes and text content, if that word is a valid
// key for a localized string, then it will be replaced with
// the localized string.
//
// The original attributes and text content of each DOM element will be
// stored. This allows this function to relocalize DOM elements
// that have already been localized, by acting on the original
// strings. This is useful if you've switched languages, and want to
// update the page to use the new language.
// Simply call localizePage() again after setLanguage().
//
// Note: the "localize" attribute will hide all text in the DOM elements
// unless the "localize" is set to "done", which it will be once the DOM
// element has been translated.
function localizePage() {
    $("[localize]").each(function () {
        localizeDOM(this);
    });
}

// Removes the "localize" and "localized" markings on a DOM element
// (by removing the "localize" attribute).
// This is often necessary when you change a DOM element's attributes
//
// You must manually call "localizeDOM" on the element again
// to mark it as "localize". When you do, it will use the current
// contents as the original contents.
function invalidateLocalization(dom) {
    $(dom).removeAttr("localize");
}
