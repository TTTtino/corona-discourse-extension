// Wrapper to import multiple scripts in the background of a webpage
try {
    importScripts(
        "StatCollectionInfo.js",
        "ProjectInfo.js",
        "stat_storage/collocation_storage.js",
        "stat_storage/concordance_storage.js",
        "stat_storage/frequency_storage.js",
        // "general/jquery-3.6.0.js",
        // "stat_functions/javascript-lemmatizer/bower_components/underscore/underscore.js",
        // "stat_functions/javascript-lemmatizer/js/lemmatizer.js",
        "stat_functions/generic.js",
        "stat_functions/preprocessing.js",
        "stat_functions/collocation.js",
        "stat_functions/concordance.js",
        "stat_functions/frequency.js",
        "stat_functions/analysis.js",
        "background/main.js"
    );
} catch (e) {
    console.log(e);
}
