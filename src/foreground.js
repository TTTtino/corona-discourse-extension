// requires a parser file executed before
console.log("EXECUTING foreground.js");

chrome.storage.local.get("collectionStats", function (result) {
    var statCollection = result.collectionStats;
    // check which stats to collect and find them them
     console.log(statCollection);
    var pageText = getPageContent();
    var tokens = tokenize(pageText);
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
        var calculatedCollocation = performCollocation(tokens.wordTokens, statCollection.collocation);
        
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
                var newCol = combineCollocationData(result.collocationData, calculatedCollocation);
                calculateFreqPMI(newCol, statCollection.collocation.selfReference);
                console.log(newCol);
                chrome.storage.local.set({ collocationData: newCol }, function () {});
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


