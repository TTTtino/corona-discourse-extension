class StatCollectionInfo {
    constructor() {
        this.researchName = "Default Input Parameters";
        this.wordCount = true;
        this.charCount = true;
        this.collocation = new Collocation(["sunflower"], ["field", "seed", "oil"], false, true, 0, 1);
        this.concordance = new ConcordanceLines(["sunflower", "field", "seed", "oil"], true, 5, 5);
        // for testing purposes
        this.tokenOccurence = new TokenOccurence("covid");
    }
}

class Collocation{
    constructor(pivots, targets, selfReference, regexParsing, leftSpan, rightSpan) {
        this.pivotTokens= pivots;
        this.targetTokens= targets;
        this.selfReference= selfReference;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
    }
}


class TokenOccurence{
    constructor(token) {
        this.searchToken = token;
    }
}

class ConcordanceLines{
    constructor(pivots, regexParsing, leftSpan, rightSpan){
        this.pivotTokens= pivots;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
    }
}