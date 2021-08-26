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