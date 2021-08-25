// Wrapper to import multiple scripts in the background of a webpage
try {
    importScripts(
        "background/StatCollectionInfo.js",
        "stat_functions/generic.js",
        "stat_functions/collocation.js",
        "stat_functions/concordance.js",
        "background/main.js"
    );
} catch (e) {
    console.log(e);
}
