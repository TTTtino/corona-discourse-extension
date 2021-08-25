// Wrapper to import multiple scripts in the background of a webpage
try {
    importScripts("background/StatCollectionInfo.js", "stat.js", "background/main.js");
} catch (e) {
    console.log(e);
}