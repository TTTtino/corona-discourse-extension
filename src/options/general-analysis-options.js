// Takes in a string and saves it as a title for the data currently being collected and then performs a callback function
function storeNewResearchName(name, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if (name == null) {
                name = "NoNameProvidedInJSON";
            }
            defaultCollectionStats.researchName = name;
            chrome.storage.local.set({
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            // set the research name to the input string
            if (name == null) {
                name = "NoNameProvidedInJSON";
            }

            result.collectionStats.researchName = name;

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

function createTextCell(content, row) {
    let cell = row.insertCell();
    let text = document.createTextNode(content);
    cell.style = "text-align: left;";
    cell.appendChild(text);

}


// Store new meta instructions of query
function storeNewMetaInstructions(metaInfo, callback) {
    if (metaInfo == null) {
        throw 'noMetaInfo'
    }
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.metaInstructions === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();

        } else {
            // create new meta instructions with query values 
            result.collectionStats.metaInstructions = new MetaInstructions(metaInfo['remove-punctuation'],
                metaInfo['standardise-vocabulary'],
                metaInfo['standardise-casing'],
                metaInfo['stopwords']);
 
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