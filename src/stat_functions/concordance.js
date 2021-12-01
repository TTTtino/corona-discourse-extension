function performConcordance(wordTokens, processingTokens, concordanceInfo) {

    // get mapping list that maps processed token to original tokens
    var mapping = mapCleanedCorpus(processingTokens[1], processingTokens[0])

    // get collocations based on pivot and target tokens of concordance lines
    var collocations = performCollocation(wordTokens, concordanceInfo);
    var collocationsCalculated =   calculateFreqPMI(collocations,concordanceInfo.selfReference);

    var concordanceList = []

    var token;
    var pivot, target;
    var leftSpan, leftContext, rightSpan, rightContext;
    var span = concordanceInfo.span;
    var context = concordanceInfo.context;
    var concordanceLineTokens = [];
    var originalTokens = processingTokens[1];
    var n = originalTokens.length;

    // for evert collocation 
    for (var coll in collocations.nGramPivotPositions) {
        try{

        
        pivot = collocations.nGramPivotPositions[coll][0][0];
        target = collocations.nGramPivotPositions[coll][0][1];

        var collPos = collocations.nGramPivotPositions[coll][1];

        // for every occurrence  
        for (var j = 0; j < collPos.length; j++) {
            var pos = collPos[j][0];
            var posTarget = collPos[j][1];

            var lContextExists = true;
            var rContextExists = true;

            // get array of left span
            // span[0] =  number of tokens left from pivot token
            // n = length of original token array
            // Math.max ensures that array indices stay within boundaries
            leftSpan = originalTokens.slice(
                Math.max(0, Math.max(0, mapping[pos] - span[0] - 1)),
                mapping[pos]
            )

            // get array oft right span
            // Math.min ensures that array indices stay within boundaries
            rightSpan = originalTokens.slice(
                Math.min(n - 1, mapping[pos] + 1),
                Math.min(n - 1, mapping[Math.min(pos + 1 + span[1], n)])
            )

            // cut lines at punctuation
            if (concordanceInfo.ignorePunctuation) {
                var left = getTrimmedSpan(leftSpan, target, concordanceInfo.parseAsRegex, true);
                leftSpan = left.span;
                lContextExists = left.contextExists;

                var right = getTrimmedSpan(rightSpan, target, concordanceInfo.parseAsRegex, false);
                rightSpan = right.span;
                rContextExists = right.contextExists;
            }

            // check if additional left context exists.
            // if so, get context
            if (pos - span[0] > 0 && lContextExists) {

                try {
                    // get array of left context tokens
                    leftContext = originalTokens.slice(
                        Math.max(0, Math.max(0, mapping[pos - span[0]] - context[0])),
                        mapping[Math.max(0, pos - span[0])]
                    )

                } catch (error) {
                    if (typeof error === RangeError) {
                        // get array of left context tokens
                        leftContext = originalTokens.slice(
                            Math.max(0, originalTokens[0]),
                            mapping[pos - span[0]]
                        )
                    } else {
                        leftContext = []
                    }
                }

                // else, there is no context
            } else {
                leftContext = []
            }
            // check if additional right context exists.
            // if so, get context
            if (pos + span[1] < originalTokens.length && rContextExists) {
                try {
                    // get array oft right span
                    // Math.min ensures that array indices stay within boundaries
                    rightContext = originalTokens.slice(
                        mapping[Math.min(n, pos + span[1] + 1)],
                        Math.min(n, mapping[pos + span[1] + context[1] + 2])
                    );


                } catch (error) {
                    if (typeof error === RangeError) {
                        // get array oft right span
                        // Math.min ensures that array indices stay within boundaries
                        rightContext = originalTokens.slice(
                            mapping[Math.min(n, pos + span[1] + 1)],
                            n
                        );
                    } else {
                        rightContext = [];
                    }

                }

            } else {
                rightContext = [];
            }
            concordanceList.push({
                leftContext : leftContext.join(' '),
                left: leftSpan.join(' '),
                word: wordTokens[pos],
                right: rightSpan.join(' '),
                rightContext : rightContext.join(' '),
                targetToken : wordTokens[posTarget],
                calculatedMeasurements : getCalculatedConcordanceLine(collocationsCalculated,pivot,target),
                excluded : false,
                count : 1
            });

        }
         }
        catch(error){

        }

    }

    return concordanceList;
}

function getCalculatedConcordanceLine(colData,pivot,target){
    var calculated = {};
    var key = pivot+" "+target;

    try {
        calculated = {
            nGramFrequencies : colData.nGramFrequencies[key],
            nGramProbabilities: colData.nGramProbabilities[key],
            nGramSum : colData.nGramSum,
            pivotFrequencies : colData.pivotFrequencies[pivot],
            pivotProbabilities : colData.pivotProbabilities[pivot],
            pmi: colData.pmi[key],
            targetFrequencies : colData.targetFrequencies[target],
            targetProbabilities : colData.targetProbabilities[target],
            tokenSum : colData.tokenSum            
        }
    } catch (error) {
        
    }

    return calculated;


}

function getTrimmedSpan(span, target, parseAsRegex, isLeftSpan) {
    try {
        var sliceContainsTarget = tokenInList(target, span, parseAsRegex)
        var punctuationIndex = span.indexOf('.')

        var tmpSpan;

        if (isLeftSpan) {
            tmpSpan = span.slice(
                Math.max(0, punctuationIndex),
                span.length
            );
        } else {
            tmpSpan = span.slice(
                -Math.min(span.length - 1, punctuationIndex + 1),
                span.length
            );
        }

        var tmpSliceContainsTarget = tokenInList(target, tmpSpan, parseAsRegex)

        if (!tmpSliceContainsTarget && sliceContainsTarget) {

        } else {
            span = tmpSpan;
            contextExists = false;
        }

    } catch (error) {
        console.log(error)
        return span
    }

    return {
        span: span,
        contextExists: contextExists
    }
}

function getPivotTokenList(positionList) {
    var pivotToken = []

    for (var i = 0; i < positionList.length; i++) {
        pivotToken.push
    }
}

// map cleaned corpus token to processed tokens(cleaned minus lemma)
function mapCleanedCorpus(originalTokens, processedTokens) {


    // final mapping array
    var mapping = []

    // list with cleaned corpus tokens that are yet to be mapped
    // ('token',index_original_corpus)
    var backlog = []

    // indicates whether all tokens were mapped
    var cleanedDataEnd = false

    var originalToken = '';
    var processedToken = '';

    // for every entry in the unprocessed token list
    for (var i = 0; i < originalTokens.length; i++) {

        // check if i exceeds the length of processed tokens
        // if so, set variable to true (= last iteration loop)
        if (i > processedTokens.length - 1) {
            cleanedDataEnd = true;
        } else {
            processedToken = processedTokens[i].toLowerCase();
        }

        originalToken = originalTokens[i].toLowerCase();


        if (backlog.length > 0) {
            for (var j = 0; j < backlog.length; j++) {
                // check if current backlog token is original token
                // if so, add mapping index to mapping and remove token from backlog
                if (backlog[j][0] === originalToken) {
                    mapping[backlog[j][1]] = i;
                    backlog.splice(j, 1);
                    break;
                }
            }

            // if current token isn't in backlog yet and this isn't last iteration, put token in backlog
            // and add null placeholder to mapping
            // null will later be replaced with mapping index
            if (cleanedDataEnd === false) {
                backlog.push([processedToken, i])
                mapping.push(null);
            }
        }
        // check if current processed token matches original token
        // if so, add current index to mapping
        else if (cleanedDataEnd === false && processedToken === originalToken) {
            mapping.push(i);
        } else if (cleanedDataEnd) {
            break;
        } else {
            backlog.push([processedToken, i])
            mapping.push(null);
        }
    }

    return mapping
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
            const re = new RegExp(formatRegexToken(targetList[i]));
            // const re = new RegExp("^" + targetList[i] + "$");
            if (re.test(token)) {
                return true;
            }
        }
    }
    return false;
}