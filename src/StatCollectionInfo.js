// Class for storing parsed information from a input parameter json
// 
class StatCollectionInfo {
    constructor() {
        this.researchName = "Default Input Parameters";
        this.metaInstructions = null;
        this.collocation = null;
        this.concordance = null;
    }
}


// Stores parameters for meta instructions of query
class MetaInstructions{
    constructor(standardiseCasing,loadContentAt){
        this.standardiseCasing = standardiseCasing;
       this.loadContentAt =loadContentAt;

    }
}

// Stores parameters for tracking collocation between two lists of words
class Collocation{
    constructor(pivots, targets, selfReference, regexParsing, leftSpan, rightSpan) {
        this.pivotTokens= pivots;
        this.targetTokens= targets;
        this.selfReference= selfReference;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
    }
}

// Stores parameters for token frequencies
class Frequency{
    constructor(tokens,regexParsing){
        this.tokens = tokens;
        this.regexParsing = regexParsing;
    }
}

// Stores parameters for extracting concordance lines
class ConcordanceLines{
    constructor(pivots, regexParsing, leftSpan, rightSpan){
        this.pivotTokens = pivots;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
    }
}