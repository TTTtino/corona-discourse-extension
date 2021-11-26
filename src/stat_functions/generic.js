
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
        ngram.push({
            word: wordTokens[i],
            left: left,
            right: right
        });
    }
    return ngram;
} 

// generate n-grams based on left and right span
// returns: array of objects {word:string, left:[string], right:[string]}
function generateNgramsConcordance(pivot,target,wordTokens, [l, r]) {

    //IDEE:Erst das, dann eweils index von links und rechts speichern und dann an den indexen wieder anfangen mit context
    // 
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
        ngram.push({
            word: wordTokens[i],
            left: left,
            right: right
        });
    }
    return ngram;
} 

// get the frequency of a token in the list of tokens
// returns: int representing occurrence of token
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
        let re = new RegExp(formatRegexToken(word));
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
    var positions = []
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
                        positions.push(i)
                    }
                }
                // iterate through right list
                for (let ri = 0; ri < element.right.length; ri++) {
                    // increment counter
                    if (element.right[ri] === target) {
                        count++;
                        positions.push(i)
                    }
                }
            }
        }
    } else {
        let pivotRe = new RegExp(formatRegexToken(pivot));
        let targetRe = new RegExp(formatRegexToken(target));
        for (let i = 0; i < ngrams.length; i++) {
            var element = ngrams[i];
            // if the n-grams word passes the regex of the pivot that is being searched
            if (pivotRe.test(element.word)) {
                // iterate through left list and test against target regex
                for (let li = 0; li < element.left.length; li++) {
                    // increment counter
                    if (targetRe.test(element.left[li])) {
                        count++;
                        positions.push(i)
                    }
                }
                // iterate through right list and test against target regex
                for (let ri = 0; ri < element.right.length; ri++) {
                    // increment counter
                    if (targetRe.test(element.right[ri])) {
                        count++;
                        positions.push(i)
                    }
                }
            }
        }
    }
    return {
        count:count,
        positions:positions
    };
}

// remove the positions from the token list and only include the token
function removePositionsFromTokenList(tokenList) {
    return tokenList.map(x => x[0]);
}

// gets the stat collection info and calls the callback parameter function with result as an argument
function getStatsToCollect(callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // if no collection stats have been defined
        if (typeof result.collectionStats === "undefined") {
            callback(null);
        } else {
            console.log("result found");
            callback(result.collectionStats);
        }
    });
}

function formatRegexToken(word) {
    if (word.startsWith("\b")) {
         word = word.slice(0, -1) + '\\b';
         word = '\\b' + word.slice(1);

    }

    word = "^" + word + "$";

    return word;
}
