function performConcordance(wordTokens, concordanceInfo){
    // iterate through each pivot token provided
    
    const nGrams = generateNgrams(wordTokens, concordanceInfo.span);
    
    for (let iNGram = 0; iNGram < nGrams.length; iNGram++) {
        var nGram = nGrams[iNGram];
        if(tokenInList(nGram.word, concordanceInfo.pivotTokens, true)){
            for (let iTarget = 0; iTarget < concordanceInfo.targetTokens.length; iTarget++) {
                var target = concordanceInfo.targetTokens[iTarget];
                if(tokenInList(target, nGram.left) || tokenInList(target, nGram.right)){
                    console.log(nGram);
                }
            }
        }
    }
}

function tokenInList(target, tokenList, regex){
    if (regex === false) {
        // iterate through tokens and exactly match the word
        for (let i = 0; i < tokenList.length; i++) {
            if (tokenList[i] === word) {
                return true;
            }
        }
    } else {
        // add ^ and $ to create regex object to define a clear start and end
        // iterate through tokens and test the word regex against each token
        for (let i = 0; i < tokenList.length; i++) {
            const re = new RegExp("^" + tokenList[i] + "$");
            if (re.test(target)) {
                return true;
            }
        }
    }
    return false;
}