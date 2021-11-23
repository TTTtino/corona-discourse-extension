function performConcordance(wordTokens, concordanceInfo) {

    var word = "";
    var token;
    var concordanceLineTokens = [];
    for (var iToken = 0; iToken < wordTokens.length; iToken++) {
        token = wordTokens[iToken];
        word = token[0];
        if (tokenInList(word, concordanceInfo.pivotTokens, true)) {
            let left = [];
            for (let j = -concordanceInfo.span[0]; j < 0; j++) {
                if (iToken + j >= 0) {
                    const tokenB = wordTokens[iToken + j];
                    left.push(tokenB);
                }
            }
            let right = [];
            for (let j = 1; j <= concordanceInfo.span[1]; j++) {
                if (iToken + j < wordTokens.length) {
                    const tokenB = wordTokens[iToken + j];
                    right.push(tokenB);
                }
            }
            concordanceLineTokens.push({
                left: left,
                right: right,
                wordToken: token,
            });
        }
    }

    return concordanceLineTokens;
}

function DEPRECATED_performConcordance(wordTokens, concordanceInfo) {
    //console.log(wordTokens);
    // wordTokens.forEach(element => {
    //     console.log(corpus.slice(element[1], element[2]+1));
    //     // console.log(element[1], element[2]+1);
    // });
    var word = "";
    var token;
    var concordanceLineTokens = [];
    for (var iToken = 0; iToken < wordTokens.length; iToken++) {
        token = wordTokens[iToken];
        word = token[0];
        if (tokenInList(word, concordanceInfo.pivotTokens, true)) {
            //console.log("Pivot Found");
            let left = [];
            for (let j = -concordanceInfo.span[0]; j < 0; j++) {
                if (iToken + j >= 0) {
                    const tokenB = wordTokens[iToken + j];
                    left.push(tokenB);
                }
            }
            let right = [];
            for (let j = 1; j <= concordanceInfo.span[1]; j++) {
                if (iToken + j < wordTokens.length) {
                    const tokenB = wordTokens[iToken + j];
                    right.push(tokenB);
                }
            }

            var surround = left.concat(right);
            //console.log(surround);
            for (let i = 0; i < surround.length; i++) {
                const element = surround[i];
                if (tokenInList(element[0], concordanceInfo.targetTokens)) {
                    var leftContext = generateContext(
                        iToken - concordanceInfo.span[0],
                        -concordanceInfo.context[0],
                        wordTokens
                    );
                    var rightContext = generateContext(
                        iToken + concordanceInfo.span[1],
                        concordanceInfo.context[1],
                        wordTokens
                    );
                    concordanceLineTokens.push({
                        left: leftContext.concat(left),
                        right: right.concat(rightContext),
                        wordToken: token,
                    });
                    break;
                }
            }
            //console.log(corpus.slice(concordTokenLine.left[0][1], concordTokenLine.right[concordTokenLine.right.length-1][2]+1));
        }
    }

    return concordanceLineTokens;
    //console.log(generateContext(wordTokens.indexOf(wordTokens.indexOf(concordanceLineTokens[5].left[0]), -5, wordTokens)));
}

function stringifyConcordanceLine(concordLine, corpus = false) {
    if(corpus){
        return {
            left: stringifyTokenArray(concordLine.left, corpus),
            right: stringifyTokenArray(concordLine.right, corpus),
            word: concordLine.wordToken[0]
        };
    } else{
        return {
            left: removePositionsFromTokenList(concordLine.left).join(" "),
            right: removePositionsFromTokenList(concordLine.right).join(" "),
            word: concordLine.wordToken[0]
        };
    }
}

function stringifyTokenArray(array, corpus = false) {
    if(array.length == 0){
        return "";
    }
    if (corpus === false) {
        return removePositionsFromTokenList(array).join(" ");
    } else {
        var outStr = corpus.slice(array[0][1], array[array.length - 1][2] + 1);
        outStr = outStr.replaceAll("\r", "\\r");
        outStr = outStr.replaceAll("\n", "\\n");
        return outStr;
    }
}

function DEPRECATED_generateContext(index, span, wordTokens) {
    var context = [];
    if (span < 0) {
        for (let i = index + span; i < index; i++) {
            if (i >= 0) {
                context.push(wordTokens[i]);
            }
        }
    } else if (span > 0) {
        for (let i = index + 1; i <= index + span; i++) {
            if (i < wordTokens.length) {
                context.push(wordTokens[i]);
            }
        }
    }
    return context;
}

// returns: true if token matches any element in target list by regex, or exact
function tokenInList(token, targetList, regex) {
    if (regex === false) {
        // iterate through tokens and exactly match the word
        for (let i = 0; i < targetList.length; i++) {
            if (targetList[i] === token) {
                return true;
            }
        }
    } else {
        // add ^ and $ to create regex object to define a clear start and end
        // iterate through tokens and test the word regex against each token
        for (let i = 0; i < targetList.length; i++) {
            const re = new RegExp(formatRegexToken( targetList[i]));
            // const re = new RegExp("^" + targetList[i] + "$");
            if (re.test(token)) {
                return true;
            }
        }
    }
    return false;
}