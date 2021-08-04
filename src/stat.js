// class Stat {
//     constructor() {}
//     performStat(corpus) {
//         console.log("Performing Base Statistic Calculation");
//     }
// }

// class WordCount extends Stat {
//     constructor() {
//         super();
//     }

//     performStat(corpus) {
//         var newString = corpus.split(" ");
//         newString = newString.filter(function (el) {
//             return el != "" && el != null;
//         });
//         return newString.length;
//     }
// }

// class CharCount extends Stat {
//     constructor() {
//         super();
//     }

//     performStat(corpus) {
//         var newString = corpus.replace(/[^a-zA-Z]/g, "");
//         return newString.length;
//     }
// }

// class TokenOccurence extends Stat {
//     constructor(token) {
//         super();
//         this.searchToken = token;
//     }

//     performStat(corpus) {
//         var newString = corpus.replace(/[-]/g, " ").toLowerCase();
//         newString = newString.replace(/[^\w\s!?]/g, "").toLowerCase();
//         var wordArr = newString.split(" ");
//         var count = 0;
//         for (let i = 0; i < wordArr.length; i++) {
//             if (wordArr[i] == this.searchToken) {
//                 count++;
//             }
//         }
//         return count;
//     }
// }

// class Collocation extends Stat {
//     constructor(pivotTokens, targetTokens, selfReference, regex, span) {
//         super();
//         this.pivotTokens = pivotTokens;
//         this.targetTokens = targetTokens;
//         this.allowSelfReference = selfReference;
//         this.parseAsRegex = regex;
//         this.span = span;
//     }
//     performStat(corpus) {
//         // do Collocation Calculations here on corpus here
//         console.log("Performign Collocation on", corpus);
//     }
// }

// class BaseClass{
//     constructor(){
//     }
//     testFunc(){
//         console.log("Base Class testFunc")
//     }
// }

// class SubClass extends BaseClass{
//     constructor(){
//         super();
//     }
//     testFunc(){
//         super.testFunc();
//         console.log("Sub Class testFunc")
//     }
// }

// var testArr = new SubClass();
// console.log(testArr);

// chrome.storage.local.set({"test":testArr}, ()=>{
//     chrome.storage.local.get("test", (result)=>{
//         console.log(result.test);
//     })
// })

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (typeof message.wordCount !== "undefined") {
//         console.log(message.wordCount);
//         var output = WordCount.prototype.performStat.call(
//             message.wordCount,
//             message.corpus
//         );
//         sendResponse(output);
//     }

//     if (typeof message.occurence !== "undefined") {
//         console.log(message.occurence);
//         var output = TokenOccurence.prototype.performStat.call(
//             message.occurence,
//             message.corpus
//         );
//         sendResponse(output);
//     }
// });

// this.pivotTokens= pivots;
// this.targetTokens= targets;
// this.selfReference= selfReference;
// this.parseAsRegex= regexParsing;
// this.span= [leftSpan, rightSpan];

function performCollocation(corpus, collocationInfo) {
    //console.log("Performign Collocation on", corpus);
    var tokens = tokenize(corpus);
    console.log(tokens.sentenceTokens);
    console.log(tokens.wordTokens);
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
