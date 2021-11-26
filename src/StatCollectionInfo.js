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
    constructor(removePunctuation,standardiseVocabulary, standardiseCasing,stopwords,loadContentAt){
        this.removePunctuation = removePunctuation;
        this.standardiseVocabulary = standardiseVocabulary;
        this.standardiseCasing = standardiseCasing;
        this.stopwords = stopwords;
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
    constructor(pivots,targets, regexParsing, leftSpan, rightSpan,context,ignorePunctuation,measurement){
        this.pivotTokens= pivots;
        this.targetTokens= targets;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
        this.context = context;
        this.ignorePunctuation = ignorePunctuation;
        this.measurement = measurement;
    }
}