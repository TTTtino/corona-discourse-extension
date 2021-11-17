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
                metaInfo['standardise-casing']);

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

// Cleans tokens so accurate analysis can be performed.
// Includes: removing stopwords, apply lemmatisation, to lowercase
function cleanTokens(tokens) {
    // get meta instructions of query
    chrome.storage.local.get("collectionStats", function (result) {
        if (typeof result.metaInstructions !== "undefined") {

            // TODO implement removing stopdwords

            if (result.metaInstructions.standardiseVocabulary === 'lemmatisation') {
                tokens = lemmatize(tokens);
            }

        }

    });
}
// Performs lemmatisation on tokens
// Lemmatisation: Lemmatisation in linguistics is the process of grouping together the inflected 
// forms of a word so they can be analysed as a single item, identified by the word's lemma, or dictionary form.
function lemmatize(tokens) {

    var lemmatizer = new Lemmatizer();

    // get POS (Position Of Speech) tag of tokens.
    // this is necessary to get the correct lemmatized token
    var taggedWords = new POSTagger().tag(tokens);

    var lemmaTokens = []

    for (i = 0; i < taggedWords.length; i++) {

        // map the correct lemmatizer tag of tokens
        var posTag = '';

        if (taggedWords[i][1].startsWith('J')) {
            posTag = 'adj';
        } else if (taggedWords[i][1].startsWith('V')) {
            posTag = 'verb';
        } else if (taggedWords[i][1].startsWith('N')) {
            posTag = 'noun';
        } else if (taggedWords[i][1].startsWith('R')) {
            posTag = 'adv';
        }

        try {
            lemmaTokens.push(lemmatizer.only_lemmas(taggedWords[i][0], posTag)[0]);

            if (lemmaTokens[i] === undefined) {
                lemmaTokens[i] = taggedWords[i][0];
            }
        } catch (err) {
            lemmaTokens.push(taggedWords[i][0]);
        }

    }

    return lemmaTokens;
}