// requires a parser file executed before
console.log("EXECUTING foreground.js");

chrome.storage.local.get("collectionStats", function (result) {
    var statCollection = result.collectionStats;
    // check which stats to collect and find them them
    //console.log(statCollection);
    pageText = getPageContent();
    console.log(pageText);
    if (statCollection.charCount) {
        console.log("Char Count: " + findCharacterCount(pageText));
    }

    if(statCollection.wordCount){
        console.log("Word Count: " + findWordCount(pageText));
    }

    if(statCollection.tokenOccurence){
        console.log("The word " + statCollection.tokenOccurence.searchToken + " appeared " + findTokenOccurence(statCollection.tokenOccurence.searchToken, pageText) + " time(s)");
    }

    if(statCollection.collocation){
        console.log("Performing Collcaiton")
        performCollocation(pageText, statCollection.collocation);
    }

    // chrome.runtime.sendMessage(
    //     { wordCount: statCollection[0], corpus: pageText },
    //     function (response) {
    //         console.log("Word Count: " + response);

    //         chrome.runtime.sendMessage(
    //             { occurence: statCollection[1], corpus: pageText },
    //             function (response) {
    //                 console.log("Occurences of covid: " + response);
    //             }
    //         );

    //     }
    // );
});
