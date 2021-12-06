// tokenize and clean corpus
async function getTokenizedCorpus(corpus, storeLocation = false, callback) {
    return new Promise((resolve) => {
        var tokens = tokenize(corpus, storeLocation);
        // get the stats to collect from chrome local storage
        chrome.storage.local.get("collectionStats", function (result) {
            if (result.collectionStats !== 'undefined') {
                if (result.collectionStats.metaInstruction !== 'undefined') {
                    tokens.wordTokens = cleanCorpus(
                        tokens.wordTokens,
                        result.collectionStats.metaInstruction.standardiseCasing);
                }
            }

            resolve(tokens)
        });


    })


}


// tokenize a corpus and return the token lists
// returns: {wordTokens: [string], sentenceTokens: [string]}
function tokenize(corpus, storeLocation = false) {
    // return empty tokens if no corpus given
    if (corpus === "undefined") {
        return {
            sentenceTokens: [],
            wordTokens: []
        };
    }
    var wordTokens = [];
    var sentenceTokens = [];
    var wordBuffer = "";
    var sentenceBuffer = "";
    var wordStart = -1;
    var wordEnd = -1;
    // iterate through each character of the corpus
    for (var i = 0; i < corpus.length - 1; i++) {
        var char = corpus[i];
        // if the character is a letter or a number
        if (/[a-zA-Z0-9]+/.test(char)) {
            if (wordStart === -1) {
                wordStart = i;
            }
            // add character to buffer
            //console.log("Adding to buffer" + wordBuffer);
            wordBuffer = wordBuffer.concat(char);
            wordEnd = i;
        }

        // if the character is '-'
        if (char === "-") {
            // if the nextChar is a letter
            var nextChar = corpus[i + 1];
            if (/[a-zA-Z0-9]+/.test(nextChar)) {
                if (wordStart === -1) {
                    wordStart = i;
                }
                // add currentChar to buffer
                wordBuffer = wordBuffer.concat(char);
                wordEnd = i;
            } else {
                // ignore character
                continue;
            }
        }

        // if character is ' ' or newline
        if (/^[\s\n\r]$/.test(char) && wordBuffer !== "") {
            // add word in buffer to wordTokens
            if (storeLocation) {
                wordTokens.push([wordBuffer, wordStart, wordEnd])
            } else {
                wordTokens.push(wordBuffer);
            }
            // reset buffer
            wordBuffer = "";
            wordStart = -1;
            wordEnd = -1;
        }

        // if the character is not a sentence ending character
        if (/^[^!.?\n\r]$/.test(char)) {
            // add the character to a sentence buffer
            sentenceBuffer = sentenceBuffer.concat(char);
        } else {
            // if the character is a sentence ending punctuation
            if (/^[!.?]$/.test(char)) {
                sentenceBuffer = sentenceBuffer.concat(char);
            }
            // if the character is a character that ends a sentence (excluding punctuation)
            if (!/^[\n\s\r]*$/.test(sentenceBuffer)) {
                sentenceTokens.push(sentenceBuffer);
                sentenceBuffer = "";
            }
        }
    }
    // if word buffer is not empty
    if (wordBuffer !== "") {
        // the last character is alpha-numeric
        if (/[a-zA-Z0-9]+/.test(corpus[i])) {
            // add character to wordbuffer
            wordBuffer = wordBuffer.concat(corpus[i]);
            wordEnd = i;
        }
        // add word in buffer to wordTokens
        if (storeLocation) {
            wordTokens.push([wordBuffer, wordStart, wordEnd])
        } else {
            wordTokens.push(wordBuffer);
        }
        // reset buffer
        wordBuffer = "";
        wordStart = -1;
        wordEnd = -1;
    }

    // if the sentence is not empty
    if (sentenceBuffer !== "") {
        // the last character is alpha-numeric or a sentence ending character
        if (/[a-zA-Z0-9?!.\n\r]+/.test(corpus[i])) {
            // add character to sentence buffer
            sentenceBuffer = sentenceBuffer.concat(corpus[i]);
        }
        // add sentence buffer contents to sentence tokens list
        sentenceTokens.push(sentenceBuffer);
    }
    return {
        sentenceTokens: sentenceTokens,
        wordTokens: wordTokens
    };
}



// clean tokens
// includes removing stopwords, apply lemmatisation and make lowercase
function cleanCorpus(tokens, casing) {


    // make lowercase
    if (casing === 'lowercase') {
        tokens = tokensToLowerCase(tokens);
    }

    return tokens


}



function tokensToLowerCase(tokens) {
    for (i = 0; i < tokens.length; i++) {
        tokens[i][0] = tokens[i][0].toLowerCase();
    }
    return tokens;
}
