// requires a parser file executed before
console.log("FOREGROUND.js")

// get the stats to collect from chrome local storage
chrome.storage.local.get("collectionStats", function (result) {
    var statCollection = result.collectionStats;
    if(statCollection == null){
        return;
    }
    // check which stats to collect and find them them
    console.log("Stats to collect: ", statCollection);
    var pageText = getPageContent();
    var tokens = getTokenizedCorpus(pageText, true);;
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

                // creates an empty collocation data and combines it with result for current page
                var defConcordanceData = new ConcordanceData();
                defConcordanceData.concordanceLines = concordanceLines.sort((firstEl, secondEl) => {

                    if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
                        return -1;
                    } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
                        return 1;
                    } else{
                        return 0;
                    }
                })

                // save current page source
                defConcordanceData.source = window.location.hostname;
                

                if(typeof result.concordanceData === 'undefined'){
                    result.concordanceData = new Array();

                }
                
                result.concordanceData.push(defConcordanceData)


                // console.log("Combined=", newCol);
                // set the storage to the new data
                chrome.storage.local.set(
                    { concordanceData: result.concordanceData },
                    function () {
                        console.log("concordanceData not stored, storing it now");
                    }
                );            
                
        });
    }
});
