function storeNewMetaInstructions(metaInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if (metaInst == null) {
                defaultCollectionStats.metaInstruction = null;
            } else {
                removePunctuation,standardiseVocabulary, standardiseCasing,stopwords
                defaultCollectionStats.metaInstruction = new MetaInstructions(
                    metaInst["remove-punctuation"],
                    metaInst["standardise-vocabulary"],
                    metaInst["standardise-casing"],
                    metaInst["stopwords"],
                    metaInst["load-content-at"]
                );
            }
            
            chrome.storage.local.set({
                collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            if (metaInst == null) {
                result.collectionStats.metaInstruction = null;
            } else {
                result.collectionStats.metaInstruction =  new MetaInstructions(
                    metaInst["remove-punctuation"],
                    metaInst["standardise-vocabulary"],
                    metaInst["standardise-casing"],
                    metaInst["stopwords"],
                    metaInst["load-content-at"]
                );
            } 

            // override the currently stored StatCollectionInfo object
            chrome.storage.local.set({
                collectionStats: result.collectionStats,
                },
                () => {
                    callback();
                }
            );
        }
    });
}

// Gets the stored concordance data then performs the callback function with the resulting object as an argument
function getMetaInstructionsData(callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // if no meta instruction data has been defined
        if (typeof result.collectionStats.metaInstruction === "undefined") {
            callback(null);
        } else {
            console.log("meta instructions found");
            callback(result.collectionStats.metaInstruction);
        }
    });
}