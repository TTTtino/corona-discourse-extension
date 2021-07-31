// requires a parser file executed before
console.log("EXECUTING foreground.js");


chrome.storage.local.get("collectionStats", function(result) {
    var statCollection = result.collectionStats;
    console.log(statCollection);
    pageText = getPageContent();
    console.log(pageText);

    console.log("Word Count: " + findWordCount(pageText));
    console.log("Occurences of covid: " + findOccurences(pageText, "covid"));
});
