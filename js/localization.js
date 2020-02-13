let english_translation_map = {
    welcome_screen_welcome: "Welcome!",
    order_screen_filter: "Filter"
};

var applicationLanguge = "english";

function localized_string(string) {
    if (application_language == "english") {
        return english_translation_map[string];
    } else if (application_language == "swedish") {
        // TODO
        throw new Error("Unimplemented");
        // return swedish_translation_map[string];
    }
};
