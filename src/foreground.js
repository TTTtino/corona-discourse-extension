// requires a parser file executed before
console.log("FOREGROUND.js")

    var result = {};
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "startAnalysis"){

// get the stats to collect from chrome local storage
chrome.storage.local.get("collectionStats", function (result) {
    var statCollection = result.collectionStats;
    if(statCollection == null){
        return;
    }
    // check which stats to collect and find them them
    console.log("Stats to collect: ", statCollection);
    var pageText = getPageContent();
    var tokens = tokenize(pageText, true);;
    console.log("Extracted Text", pageText);
    if(statCollection.collocation){

        // calculates collocation probabilities and frequencies and outputs a CollocationData object (stat_storage/collocation_storage.js)
        const positionsRemoved = removePositionsFromTokenList(tokens.wordTokens)
        var calculatedCollocation = performCollocation(positionsRemoved, statCollection.collocation);
        // get the currently stored data on collocation
        chrome.storage.local.get("collocationData", function(result){
            // if none found...
            if (typeof result.collocationData === "undefined") {
                // creates an empty collocation data and combines it with result for current page
                var defaultCollocationData = new CollocationData();
                // console.log("default=", defaultCollocationData);
                // console.log("Calculated=", calculatedCollocation);
                var newCol = combineCollocationData(defaultCollocationData, calculatedCollocation);
                // console.log("Combined=", newCol);
                // set the storage to the new data
                chrome.storage.local.set(
                    { collocationData: newCol },
                    function () {
                        console.log("collocationData not stored, storing it now");
                    }
                );
            } else {
                // combine the data for the current page with the existing stored data
                //console.log("stored=", result.collocationData);
                console.log("Calculated=", calculatedCollocation);
                var newCollocation = combineCollocationData(result.collocationData, calculatedCollocation);
                // console.log("Combined PMI Results: ", calculateFreqPMI(newCollocation, statCollection.collocation.selfReference));
                // set the data to be the combined result
                chrome.storage.local.set({ collocationData: newCollocation }, function () {});
            }
        });
    }

    if(statCollection.concordance){
        // calculates collocation probabilities and frequencies and outputs a CollocationData object (stat_storage/collocation_storage.js)
        var calculatedConcordance = performConcordance(tokens.wordTokens, statCollection.concordance);
        //console.log(calculatedConcordance);
        var concordanceLines = [];
        calculatedConcordance.forEach(element => {
            var line = stringifyConcordanceLine(element, pageText);
            // console.log(line.left, " || ",  line.word, " || ", line.right);
            line.excluded = false;
            line.count = 1;
            concordanceLines.push(line);
        });
        // chrome.storage.local.remove("concordanceData");
        chrome.storage.local.get("concordanceData", function(result){
            // if none found...
            if (typeof result.concordanceData === "undefined") {
                // creates an empty collocation data and combines it with result for current page
                var defConcordanceData = new ConcordanceData();
                defConcordanceData.concordanceLines = concordanceLines.sort((firstEl, secondEl) => {
                    console.log("test");
                    if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
                        return -1;
                    } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
                        return 1;
                    } else{
                        return 0;
                    }
                })
                // console.log("Combined=", newCol);
                // set the storage to the new data
                chrome.storage.local.set(
                    { concordanceData: defConcordanceData },
                    function () {
                        console.log("concordanceData not stored, storing it now");
                        console.log("Concordance Lines", defConcordanceData);
                    }
                );
            } else {
                console.log("Stored", result);
                // combine the data for the current page with the existing stored data
                var newConcordance = combineConcordanceData(result.concordanceData, concordanceLines);
                // set the data to be the combined result
                chrome.storage.local.set({ concordanceData: newConcordance }, function () {
                    console.log("New concordance value set", newConcordance);


                });
            }

        });
    }

    alert("The analysis on this page run successfully. To see the results please visit the option page.")

});
    }
    });


////chrome.runtime.sendMessage({from:"script1"});
//
//
// chrome.storage.local.get("collectionStats", function (result) {
//    var statCollection = result.collectionStats;
//    if(statCollection == null){
//        return;
//    }
//    // check which stats to collect and find them them
//    console.log("Stats to collect: ", statCollection);
//    var pageText = getPageContent();
//    var tokens = tokenize(pageText, true);;
//    console.log("Extracted Text", pageText);
//
//
//
//    if(statCollection.collocation){
//        // calculates collocation probabilities and frequencies and outputs a CollocationData object (stat_storage/collocation_storage.js)
//        const positionsRemoved = removePositionsFromTokenList(tokens.wordTokens)
//        var calculatedCollocation = performCollocation(positionsRemoved, statCollection.collocation);
//
//        // creates an empty collocation data and combines it with result for current page
//        var defaultCollocationData = new CollocationData();
//        var newCol = combineCollocationData(defaultCollocationData, calculatedCollocation);
//
//        // set the storage to the new data
////        result['collocationData'] = newCol;
//        chrome.storage.local.set(
//                    { collocationData: newCol },
//                   () => {}
//                );
//    }
//
//    if(statCollection.concordance){
//        // calculates collocation probabilities and frequencies and outputs a CollocationData object (stat_storage/collocation_storage.js)
//        var calculatedConcordance = performConcordance(tokens.wordTokens, statCollection.concordance);
//        //console.log(calculatedConcordance);
//        var concordanceLines = [];
//        calculatedConcordance.forEach(element => {
//            var line = stringifyConcordanceLine(element, pageText);
//            // console.log(line.left, " || ",  line.word, " || ", line.right);
//            line.excluded = false;
//            line.count = 1;
//            concordanceLines.push(line);
//        });
//
//        // creates an empty collocation data and combines it with result for current page
//        var defConcordanceData = new ConcordanceData();
//        defConcordanceData.concordanceLines = concordanceLines.sort((firstEl, secondEl) => {
//            console.log("test");
//            if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
//                return -1;
//            } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
//                return 1;
//            } else{
//                return 0;
//            }
//        })
//    }
//
////         result['concordanceData'] = defConcordanceData;
//
//         console.log("PMI Results for Current Page: ", calculateFreqPMI(calculatedCollocation, statCollection.collocation.selfReference));
//
//         var defaultCollocationData = new CollocationData();
//         // creates an empty collocation data and combines it with result for current page
//         console.log("default=", defaultCollocationData);
//         console.log("Calculated=", calculatedCollocation);
//         var newCol = combineCollocationData(defaultCollocationData, calculatedCollocation);
//         console.log("Combined=", newCol);
//         // set the storage to the new data
//
////         result['collocationData'] = newCol;
//        chrome.storage.local.set(
//                    { collocationData: newCol },
//                    () => {}
//                );
//
//          chrome.storage.local.set(
//                {
//                    analysisResults: result,
//                },
//                () => {
//                    callback();
//                }
//            );
////         chrome.runtime.sendMessage({from:"script1After",message:result});
//    });
