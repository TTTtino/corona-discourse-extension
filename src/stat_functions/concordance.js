
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

    
            if(!concordanceLineExists(concordanceLineTokens,left,right,token)){
                concordanceLineTokens.push({
                    left: left,
                    right: right,
                    wordToken: token,
                });
            }
               
            

         
        }
    }

    return concordanceLineTokens;
}



function concordanceLineExists(lines, left,right,word){

    var alreadyExists = false;

    lines.every(concordObject => {
        alreadyExists =   
        word === concordObject.wordToken &&
        left === concordObject.left &&
        right === concordObject.right
        

        if(alreadyExists === true){
            return false;
        }

        return true;
    });

    return alreadyExists;
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
