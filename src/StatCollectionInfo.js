// Class for storing parsed information from a input parameter json
// 
class StatCollectionInfo {
    constructor() {
        this.researchName = "Default Input Parameters";
        this.metaInstruction = null;
        this.collocation = null;
        this.concordance = null;
    }
}

class MetaInstructions{
    constructor(loadContentAt){
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

// For testing purposes
// class TokenOccurence{
//     constructor(token) {
//         this.searchToken = token;
//     }
// }

// Stores parameters for extracting concordance lines
class ConcordanceLines{
    constructor(pivots, regexParsing, leftSpan, rightSpan){
        this.pivotTokens= pivots;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
    }
}