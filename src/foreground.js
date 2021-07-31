// requires a parser file executed before
console.log("EXECUTING foreground.js");


chrome.storage.local.get("collectionStats", function(result) {
    var statCollection = result.collectionStats;
    
    // check which stats to collect and find them them
    console.log(statCollection);
    pageText = getPageContent();

    console.log("Word Count: " + statCollection[0].performStat(pageText));
    console.log("Occurences of covid: " + statCollection[1].performStat(pageText));
});
