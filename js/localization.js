let englishTranslationMap = {
    welcome_screen_welcome: "Welcome!",
    order_screen_filter: "Filter"
};

var applicationLanguage = "english";

function localized_string(string) {
    if (applicationLanguage === "english") {
        return englishTranslationMap[string];
    } else if (applicationLanguage === "swedish") {
        // TODO
        throw new Error("Unimplemented");
        // return swedish_translation_map[string];
    }
};
