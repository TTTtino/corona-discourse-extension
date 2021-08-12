// requires a parser file executed before
console.log("EXECUTING foreground.js");

chrome.storage.local.get("collectionStats", function (result) {
    var statCollection = result.collectionStats;
    // check which stats to collect and find them them
    console.log("Stats to collect: ", statCollection);
    var pageText = getPageContent();
    var tokens = tokenize(pageText);
    console.log("Extracted Text", pageText);

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
        var calculatedCollocation = performCollocation(tokens.wordTokens, statCollection.collocation);
        console.log("PMI Results for Current Page: ", calculateFreqPMI(calculatedCollocation, statCollection.collocation.selfReference));
        
        chrome.storage.local.get("collocationData", function(result){
            if (typeof result.collocationData === "undefined") {
                var defaultCollocationData = new CollocationData();
                var newCol = combineCollocationData(defaultCollocationData, calculatedCollocation);
                chrome.storage.local.set(
                    { collocationData: newCol },
                    function () {
                        console.log("collocationData not stored, storing it now");
                    }
                );
            } else {
                var newCollocation = combineCollocationData(result.collocationData, calculatedCollocation);
                console.log("Combined PMI Results: ", calculateFreqPMI(newCollocation, statCollection.collocation.selfReference));
                chrome.storage.local.set({ collocationData: newCollocation }, function () {});
            }
        });
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


