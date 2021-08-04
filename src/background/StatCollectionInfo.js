class StatCollectionInfo {
    constructor() {
        this.wordCount = true;
        this.charCount = true;
        this.collocation = new Collocation(["covid", "vaccine"], ["bad", "effects", "death"], false, false, 5, 5);
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