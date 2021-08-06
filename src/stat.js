function performCollocation(wordTokens, collocationInfo) {
    //console.log("Performign Collocation on", corpus);
    console.log(wordTokens);
    const nGrams = generateNgrams(wordTokens, collocationInfo.span);
    console.log("nGrams: ", nGrams);
    var pivotFrequencies = {};
    var targetFrequencies = {};
    var nGramFrequency = {};
    for (let iPivot = 0; iPivot < collocationInfo.pivotTokens.length; iPivot++) {
        const pivot = collocationInfo.pivotTokens[iPivot];
        pivotFrequencies[pivot] = getFrequency(pivot, wordTokens);
        for (let iTarget = 0; iTarget < collocationInfo.targetTokens.length; iTarget++) {
            const target = collocationInfo.targetTokens[iTarget];
            nGramFrequency[pivot + " " + target] =  getNgramFrequency(pivot, target, nGrams);
        }
    }
    
    for (let iTarget = 0; iTarget < collocationInfo.targetTokens.length; iTarget++) {
        const target = collocationInfo.targetTokens[iTarget];
        targetFrequencies[target] = getFrequency(target, wordTokens);
    }
    console.log("pivot frequencies: ", pivotFrequencies);
    console.log("target frequencies: ", targetFrequencies);
    console.log("n-gram frequencies: ", nGramFrequency);

    var pivotProb = {};
    for (let iFreq = 0; iFreq < collocationInfo.pivotTokens.length; iFreq++) {
        const element = collocationInfo.pivotTokens[iFreq];
        pivotProb[element] = ( pivotFrequencies[element] / wordTokens.length);
    }
    console.log("pivot probabilities: ", pivotProb);


    var targetProb = {};
    for (let iFreq = 0; iFreq < collocationInfo.targetTokens.length; iFreq++) {
        const element = collocationInfo.targetTokens[iFreq];
        targetProb[element] = ( targetFrequencies[element] / wordTokens.length);
    }
    console.log("target probabilities: ", targetProb);

    var nGramProb = {};
    for (var key in nGramFrequency){
        var value = nGramFrequency[key];
        nGramProb[key] = (value / nGrams.length)
    }
    console.log("n-gram probabilities: ", nGramProb);

    var pmi = calculatePMI(pivotProb, targetProb, nGramProb);
    console.log("PMI: ", pmi);
}

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

function findCharacterCount(corpus) {
    var newString = corpus.replace(/[^a-zA-Z]/g, "");
    return newString.length;
}

function findWordCount(corpus) {
    var newString = corpus.split(" ");
    newString = newString.filter(function (el) {
        return el != "" && el != null;
    });
    return newString.length;
}

function tokenize(corpus) {
    if (corpus === "undefined") {
        return { sentenceTokens: [], wordTokens: [] };
    }
    var wordTokens = [];
    var sentenceTokens = [];
    var wordBuffer = "";
    var sentenceBuffer = "";
    var quotation = false;
    for (var i = 0; i < corpus.length - 1; i++) {
        var char = corpus[i];
        // if character is a letter
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

        if (/^[^!.?\n\r]$/.test(char)) {
            sentenceBuffer = sentenceBuffer.concat(char);
        } else {
            if (/^[!.?]$/.test(char)) {
                sentenceBuffer = sentenceBuffer.concat(char);
            }
            if (!/^[\n\s\r]*$/.test(sentenceBuffer)) {
                sentenceTokens.push(sentenceBuffer);
                sentenceBuffer = "";
            }
        }
    }
    // if character is ' '
    if (wordBuffer !== "") {
        // add word in buffer to wordTokens
        if (/[a-zA-Z0-9]+/.test(corpus[i])) {
            wordBuffer = wordBuffer.concat(corpus[i]);
        }
        wordTokens.push(wordBuffer);
        // reset buffer
        wordBuffer = "";
    }

    if (sentenceBuffer !== "") {
        if (/[a-zA-Z0-9?!.]+/.test(corpus[i])) {
            sentenceBuffer = sentenceBuffer.concat(corpus[i]);
        }
        sentenceTokens.push(sentenceBuffer);
    }
    return { sentenceTokens: sentenceTokens, wordTokens: wordTokens };
}

function generateNgrams(wordTokens, [l, r]) {
    var ngram = [];
    for (var i = 0; i < wordTokens.length; i++) {
        var left = [];
        var right = [];
        for (var j = l; j > 0; j--) {
            if (i - j >= 0) {
                left.push(wordTokens[i - j]);
            } else{
                break;
            }
        }
        for (var k = 1; k <= r; k++){
            if (i + k < wordTokens.length) {
                right.push(wordTokens[i + k]);
            } else{
                break;
            }
        }
        ngram.push({ word: wordTokens[i], left: left, right: right });
    }
    return ngram;
}

function getFrequency(word, wordTokens, regex=false){
    var count = 0;
    if(regex === false){
        for (let i = 0; i < wordTokens.length; i++) {
            if(wordTokens[i] === word){
                count++;
            }
        }
    } else{
        let re = new RegExp("^" + word + "$");
        for (let i = 0; i < wordTokens.length; i++) {
            if(re.test(wordTokens[i])){
                count++;
            }
        }
    }
    return count;
}

function getNgramFrequency(pivot, target, ngrams,regex=false){
    var count = 0;
    if(regex === false){
        for (let i = 0; i < ngrams.length; i++) {
            var element = ngrams[i];
            if(element.word === pivot){
                for (let li = 0; li < element.left.length; li++) {
                    if(element.left[li] === target){
                        count++;
                    }
                }
                for (let ri = 0; ri < element.right.length; ri++) {
                    if(element.right[ri] === target){
                        count++;
                    }
                }
            }
        }
    } else{
        let pivotRe = new RegExp("^" + pivot + "$");
        let targetRe = new RegExp("^" + target + "$");
        for (let i = 0; i < ngrams.length; i++) {
            if(pivotRe.test(element.word)){
                for (let li = 0; li < element.left.length; li++) {
                    if(targetRe.test(element.left[li])){
                        count++;
                    }
                }
                for (let ri = 0; ri < element.right.length; ri++) {
                    if(targetRe.test(element.right[ri])){
                        count++;
                    }
                }
            }
        }
    }
    return count;
}

function calculatePMI(pivotProbs, targetProbs, nGramProbs){
    var pmi = {};
    for(var pivot in pivotProbs){
        pProb = pivotProbs[pivot];
        for(var target in targetProbs){
            pTarget = targetProbs[target];
            pNGram = nGramProbs[pivot + " " + target];
            pmi[pivot + " " + target] = Math.log2(pNGram / (pProb * pTarget));
        }
    }
    return pmi;
}