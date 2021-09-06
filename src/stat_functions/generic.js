// tokenize a corpus and return the token lists
// returns: {wordTokens: [string], sentenceTokens: [string]}
function tokenize(corpus, storeLocation=false) {
    // return empty tokens if no corpus given
    if (corpus === "undefined") {
        return { sentenceTokens: [], wordTokens: [] };
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
            if(wordStart === -1){
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
                if(wordStart === -1){
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
            if(storeLocation){
                wordTokens.push([wordBuffer, wordStart, wordEnd])
            } else{
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
        if(storeLocation){
            wordTokens.push([wordBuffer, wordStart, wordEnd])
        } else{
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
    return { sentenceTokens: sentenceTokens, wordTokens: wordTokens };
}

// find the occurences of a particular token in a corpus
function findTokenOccurence(token, corpus) {
    var newString = corpus.replace(/[-]/g, " ").toLowerCase();
    newString = newString.replace(/[^\w\s!?]/g, "").toLowerCase();
    var wordArr = newString.split(" ");
    var count = 0;
    for (let i = 0; i < wordArr.length; i++) {
        if (wordArr[i] == token) {
            count++;
        }
    }
    return count;
}

// find the number of characters in a corpus
function findCharacterCount(corpus) {
    var newString = corpus.replace(/[^a-zA-Z]/g, "");
    return newString.length;
}

// find the number of words in a corpus
function findWordCount(corpus) {
    var newString = corpus.split(" ");
    newString = newString.filter(function (el) {
        return el != "" && el != null;
    });
    return newString.length;
}

// generate n-grams based on left and right span
// returns: array of objects {word:string, left:[string], right:[string]}
function generateNgrams(wordTokens, [l, r]) {
    var ngram = [];
    // iterate through each token
    for (var i = 0; i < wordTokens.length; i++) {
        var left = [];
        var right = [];

        // iterate from the left most token from the current token
        for (var j = l; j > 0; j--) {
            // if there is a token at the index
            if (i - j >= 0) {
                // add the token to the left list
                left.push(wordTokens[i - j]);
            } else {
                continue;
            }
        }

        // iterate through tokens to the right of current token
        for (var k = 1; k <= r; k++) {
            // if there is a token at the index
            if (i + k < wordTokens.length) {
                // add the token to the left list
                right.push(wordTokens[i + k]);
            } else {
                continue;
            }
        }

        // push the object to the ngram array
        ngram.push({ word: wordTokens[i], left: left, right: right });
    }
    return ngram;
}


// get the frequency of a token in the list of tokens
// returns: int representing occurence of token
function getFrequency(word, wordTokens, regex = true) {
    var count = 0;
    // if not using regex
    if (regex === false) {
        // iterate through tokens and exactly match the word
        for (let i = 0; i < wordTokens.length; i++) {
            if (wordTokens[i] === word) {
                count++;
            }
        }
    } else {
        // add ^ and $ to create regex object to define a clear start and end
        let re = new RegExp("^" + word + "$");
        // iterate through tokens and test the word regex against each token
        for (let i = 0; i < wordTokens.length; i++) {
            if (re.test(wordTokens[i])) {
                count++;
            }
        }
    }
    return count;
}


// Calculate the frequency of particular pivot and target in an array of n-grams
// returns: int representing the number of times the pivot and target appear in the n-grams list
function getNgramFrequency(pivot, target, ngrams, regex = true) {
    var count = 0;
    if (regex === false) {
        // iterate through each ngram
        for (let i = 0; i < ngrams.length; i++) {
            var element = ngrams[i];
            // if the n-grams word exactly matches the pivot that is being searched
            if (element.word === pivot) {
                // iterate through left list
                for (let li = 0; li < element.left.length; li++) {
                    // increment counter
                    if (element.left[li] === target) {
                        count++;
                    }
                }
                // iterate through right list
                for (let ri = 0; ri < element.right.length; ri++) {
                    // increment counter
                    if (element.right[ri] === target) {
                        count++;
                    }
                }
            }
        }
    } else {
        let pivotRe = new RegExp("^" + pivot + "$");
        let targetRe = new RegExp("^" + target + "$");
        for (let i = 0; i < ngrams.length; i++) {
            var element = ngrams[i];
            // if the n-grams word passes the regex of the pivot that is being searched
            if (pivotRe.test(element.word)) {
                // iterate through left list and test against target regex
                for (let li = 0; li < element.left.length; li++) {
                    // increment counter
                    if (targetRe.test(element.left[li])) {
                        count++;
                    }
                }
                // iterate through right list and test against target regex
                for (let ri = 0; ri < element.right.length; ri++) {
                    // increment counter
                    if (targetRe.test(element.right[ri])) {
                        count++;
                    }
                }
            }
        }
    }
    return count;
}

// remove the positions from the token list and only include the token
function removePositionsFromTokenList(tokenList){
    return tokenList.map(x => x[0]);
}

// gets the stat collection info and calls the callback parameter function with result as an argument
function getStatsToCollect(callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // if no collection stats havfe been defined
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            // create and set a "default collection stat"
            chrome.storage.local.set(
                { collectionStats: defaultCollectionStats },
                function () {
                    console.log("collectionStats not stored using defautlts");
                    console.log(defaultCollectionStats);
                    callback(defaultCollectionStats);
                }
            );
        } else {
            console.log("result found");
            callback(result.collectionStats);
        }
    });
}