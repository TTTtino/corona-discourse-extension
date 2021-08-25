// requires a parser file executed before
console.log("EXECUTING foreground.js");

// get the stats to collect from chrome local storage
chrome.storage.local.get("collectionStats", function (result) {
    var statCollection = result.collectionStats;
    // check which stats to collect and find them them
    console.log("Stats to collect: ", statCollection);
    var pageText = getPageContent();
    var tokens = tokenize(pageText);
    console.log("Extracted Text", pageText);

    // Not important stat, so just being logged
    if (statCollection.charCount) {
        console.log("Char Count: " + findCharacterCount(pageText));
    }

    // Not important stat, so just being logged
    if(statCollection.wordCount){
        console.log("Word Count: " + findWordCount(pageText));
    }

    // Not important stat, so just being logged
    if(statCollection.tokenOccurence){
        console.log("The word " + statCollection.tokenOccurence.searchToken + " appeared " + findTokenOccurence(statCollection.tokenOccurence.searchToken, pageText) + " time(s)");
    }

    if(statCollection.collocation){
        // calculates collocation probabilities and frequencies and outputs a CollocationData object (stat_storage.js)
        var calculatedCollocation = performCollocation(tokens.wordTokens, statCollection.collocation);
        // console.log("PMI Results for Current Page: ", calculateFreqPMI(calculatedCollocation, statCollection.collocation.selfReference));
        
        // get the currently stored data on collocation
        chrome.storage.local.get("collocationData", function(result){
            // if none found...
            if (typeof result.collocationData === "undefined") {
                var defaultCollocationData = new CollocationData();
                // creates an empty collocation data and combines it with result for current page
                console.log("default=", defaultCollocationData);
                console.log("Calculated=", calculatedCollocation);
                var newCol = combineCollocationData(defaultCollocationData, calculatedCollocation);
                console.log("Combined=", newCol);
                // set the storage to the new data
                chrome.storage.local.set(
                    { collocationData: newCol },
                    function () {
                        console.log("collocationData not stored, storing it now");
                    }
                );
            } else {
                // combine the data for the current page with the existing stored data
                console.log("stored=", result.collocationData);
                console.log("Calculated=", calculatedCollocation);
                var newCollocation = combineCollocationData(result.collocationData, calculatedCollocation);
                // console.log("Combined PMI Results: ", calculateFreqPMI(newCollocation, statCollection.collocation.selfReference));
                // set the data to be the combined result
                chrome.storage.local.set({ collocationData: newCollocation }, function () {});
            }
        });
    }

    if(statCollection.concordance){
        // calculates collocation probabilities and frequencies and outputs a CollocationData object (stat_storage.js)
        var calculatedCollocation = performCollocation(tokens.wordTokens, statCollection.collocation);
        // console.log("PMI Results for Current Page: ", calculateFreqPMI(calculatedCollocation, statCollection.collocation.selfReference));
        
        // get the currently stored data on collocation
        chrome.storage.local.get("collocationData", function(result){
            // if none found...
            if (typeof result.collocationData === "undefined") {
                var defaultCollocationData = new CollocationData();
                // creates an empty collocation data and combines it with result for current page
                console.log("default=", defaultCollocationData);
                console.log("Calculated=", calculatedCollocation);
                var newCol = combineCollocationData(defaultCollocationData, calculatedCollocation);
                console.log("Combined=", newCol);
                // set the storage to the new data
                chrome.storage.local.set(
                    { collocationData: newCol },
                    function () {
                        console.log("collocationData not stored, storing it now");
                    }
                );
            } else {
                // combine the data for the current page with the existing stored data
                console.log("stored=", result.collocationData);
                console.log("Calculated=", calculatedCollocation);
                var newCollocation = combineCollocationData(result.collocationData, calculatedCollocation);
                // console.log("Combined PMI Results: ", calculateFreqPMI(newCollocation, statCollection.collocation.selfReference));
                // set the data to be the combined result
                chrome.storage.local.set({ collocationData: newCollocation }, function () {});
            }
        });
    }

});


