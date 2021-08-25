// Calculates the Probabilities and Frequencies based on the collocation collection info
// and tokenised corpus
// TODO: Improve readability and remove repeated code
function performCollocation(wordTokens, collocationInfo) {
    // generate n-grams based on the span provided
    const nGrams = generateNgrams(wordTokens, collocationInfo.span);

    var pivotFrequencies = {};
    var targetFrequencies = {};
    var nGramFrequency = {};
    // iterate through each pivot token provided
    for (let iPivot = 0; iPivot < collocationInfo.pivotTokens.length; iPivot++) {
        const pivot = collocationInfo.pivotTokens[iPivot];
        // gets the frequency of the current pivot
        pivotFrequencies[pivot] = getFrequency(
            pivot,
            wordTokens,
            collocationInfo.parseAsRegex
        );
        for (let iTarget = 0; iTarget < collocationInfo.targetTokens.length; iTarget++) {
            const target = collocationInfo.targetTokens[iTarget];
            if (!collocationInfo.selfReference && pivot === target) {
                // skip if pivot and target are the same and self reference is not allowed
                continue;
            } else {
                // caluclate the nGram frequency using pivot and target, and store it in nGramFrequency dictionary
                nGramFrequency[pivot + " " + target] = getNgramFrequency(
                    pivot,
                    target,
                    nGrams,
                    collocationInfo.parseAsRegex
                );
            }
        }
    }

    // iterate through the target tokens
    for (
        let iTarget = 0;
        iTarget < collocationInfo.targetTokens.length;
        iTarget++
    ) {
        const target = collocationInfo.targetTokens[iTarget];
        // calculate the frequency for each target
        targetFrequencies[target] = getFrequency(
            target,
            wordTokens,
            collocationInfo.parseAsRegex
        );
    }

    // var pivotProb = {};
    // for (let iFreq = 0; iFreq < collocationInfo.pivotTokens.length; iFreq++) {
    //     const element = collocationInfo.pivotTokens[iFreq];
    //     pivotProb[element] = pivotFrequencies[element] / wordTokens.length;
    // }

    // var targetProb = {};
    // for (let iFreq = 0; iFreq < collocationInfo.targetTokens.length; iFreq++) {
    //     const element = collocationInfo.targetTokens[iFreq];
    //     targetProb[element] = targetFrequencies[element] / wordTokens.length;
    // }

    // var nGramProb = {};
    // for (var key in nGramFrequency) {
    //     var value = nGramFrequency[key];
    //     nGramProb[key] = value / nGrams.length;
    // }

    // var pmi = calculateProbPMI(
    //     pivotProb,
    //     targetProb,
    //     nGramProb,
    //     collocationInfo.selfReference
    // );
    
    // create a CollocationData Object and store the calculated frequencies to return
    var colStorage = new CollocationData();
    colStorage.pivotFrequencies = pivotFrequencies;
    colStorage.targetFrequencies = targetFrequencies;
    colStorage.nGramFrequencies = nGramFrequency;
    colStorage.nGramSum = nGrams.length;
    colStorage.tokenSum = wordTokens.length;

    return colStorage;
}




// tokenize a corpus and return the token lists
// returns: {wordTokens: [string], sentenceTokens: [string]}
function tokenize(corpus) {
    // return empty tokens if no corpus given
    if (corpus === "undefined") {
        return { sentenceTokens: [], wordTokens: [] };
    }
    var wordTokens = [];
    var sentenceTokens = [];
    var wordBuffer = "";
    var sentenceBuffer = "";
    var quotation = false;
    // iterate through each character of the corpus
    for (var i = 0; i < corpus.length - 1; i++) {
        var char = corpus[i];
        // if the character is a letter or a number
        if (/[a-zA-Z0-9]+/.test(char)) {
            // add character to buffer
            //console.log("Adding to buffer" + wordBuffer);
            wordBuffer = wordBuffer.concat(char);
        }

        // if the character is '-'
        if (char === "-") {
            // if the nextChar is a letter
            var nextChar = corpus[i + 1];
            if (/[a-zA-Z0-9]+/.test(nextChar)) {
                // add currentChar to buffer
                wordBuffer = wordBuffer.concat(char);
            } else {
                // ignore character
                continue;
            }
        }

        // if character is ' ' or newline
        if (/^[\s\n\r]$/.test(char) && wordBuffer !== "") {
            // add word in buffer to wordTokens
            wordTokens.push(wordBuffer);
            // reset buffer
            wordBuffer = "";
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
        }
        // add word in buffer to wordTokens
        wordTokens.push(wordBuffer);
        // reset buffer
        wordBuffer = "";
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

// calculates PMI given the probabilities
// returns: Number representing the PMI
function calculateProbPMI(pivotProbs, targetProbs, nGramProbs, canSelfReference) {
    var pmi = {};
    for (var pivot in pivotProbs) {
        pProb = pivotProbs[pivot];
        for (var target in targetProbs) {
            pTarget = targetProbs[target];
            if (pivot === target && !canSelfReference) {
                continue;
            }
            pNGram = nGramProbs[pivot + " " + target];
            if (pProb === 0 || pTarget === 0 || pNGram === 0) {
                pmi[pivot + " " + target] = 0;
            } else {
                pmi[pivot + " " + target] = Math.log2(
                    pNGram / (pProb * pTarget)
                );
            }
        }
    }
    return pmi;
}

// calculates the PMI given just the CollocationData object containing only the frequencies
function calculateFreqPMI(collocationData, canSelfReference){
    var pivotProb = {};
    // iterate through the frequencies and calculate the probabilities for each "pivot"
    for (var key in collocationData.pivotFrequencies) {
        var freq = collocationData.pivotFrequencies[key];
        pivotProb[key] = freq / collocationData.tokenSum;
    }
    //console.log("pivot probabilities: ", pivotProb);

    // iterate through the frequencies and calculate the probabilities for each "target"
    var targetProb = {};
    for (var key in collocationData.targetFrequencies) {
        var freq = collocationData.targetFrequencies[key];
        targetProb[key] = freq / collocationData.tokenSum;
    }
    //console.log("target probabilities: ", targetProb);

    // iterate through the frequencies and calculate the probabilities for each "ngram"
    var nGramProb = {};
    for (var key in collocationData.nGramFrequencies) {
        var freq = collocationData.nGramFrequencies[key];
        nGramProb[key] = freq / collocationData.tokenSum;
    }
    //console.log("n-gram probabilities: ", nGramProb);

    // calculate the PMI
    var pmi = calculateProbPMI(
        pivotProb,
        targetProb,
        nGramProb,
        canSelfReference
    );

    // add the probabilities and PMI as key:value pairs to the input object, and return it
    collocationData["pivotProbabilities"] = pivotProb;
    collocationData["targetProbabilities"] = targetProb;
    collocationData["nGramProbabilities"] = nGramProb;
    collocationData["pmi"] = pmi;
    
    return collocationData;
}