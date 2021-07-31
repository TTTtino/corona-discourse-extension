class Stat {
    constructor(){
    }
    performStat(corpus){
        console.log("Performing Base Statistic Calculation");
    }
}

class WordCount extends Stat{
    constructor() {
        super();
    }

    performStat(corpus){
        var newString = corpus.split(" ");
        newString = newString.filter(function(el) {
            return el != "" && el != null;
        })
        return newString.length;
    }
}

class CharCount extends Stat{
    constructor() {
        super();
    }

    performStat(corpus){
        var newString = corpus.replace(/[^a-zA-Z]/g, "");
        return newString.length;
    }
}

class TokenOccurence extends Stat {
    constructor(token) {
        super();
        this.searchToken = token;
    }

    performStat(corpus){
        var newString = corpus.replace(/[-]/g, ' ').toLowerCase();
        newString = newString.replace(/[^\w\s!?]/g, '').toLowerCase();
        var wordArr = newString.split(" ");
        var count = 0;
        for (let i = 0; i < wordArr.length; i++) {
            if (wordArr[i] == this.searchToken) {
                count++;
            }
        }
        return count;
    }
}

class Collocation extends Stat {
    constructor(pivotTokens, targetTokens, selfReference, regex, span){
        super();
        this.pivotTokens = pivotTokens;
        this.targetTokens = targetTokens;
        this.allowSelfReference = selfReference;
        this.parseAsRegex = regex;
        this.span = span;
    }
    performStat(corpus){
        // do Collocation Calculations here on corpus here
        console.log("Performign Collocation on", corpus);
    }
}

class BaseClass{
    constructor(){
    }
    testFunc(){
        console.log("Base Class testFunc")
    }
}

class SubClass extends BaseClass{
    constructor(){
        super();
    }
    testFunc(){
        super.testFunc();
        console.log("Sub Class testFunc")
    }
}

var testArr = [new SubClass()];
console.log(testArr);

chrome.storage.local.set({"test":testArr}, ()=>{
    chrome.storage.local.get("test", (result)=>{
        console.log(result.test);
    })
})