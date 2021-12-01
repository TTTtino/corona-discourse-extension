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

// Stores parameters for token frequencies
class Frequency{
    constructor(tokens,regexParsing,measurement){
        this.tokens = tokens;
        this.regexParsing = regexParsing;
        this.measurement = measurement;
    }
}

// Stores parameters for extracting concordance lines
class ConcordanceLines{
    constructor(pivots,targets, regexParsing, leftSpan, rightSpan,context,ignorePunctuation,measurement,selfReference){
        this.pivotTokens= pivots;
        this.targetTokens= targets;
        this.parseAsRegex= regexParsing;
        this.span= [leftSpan, rightSpan];
        this.context = context;
        this.selfReference= selfReference;
        this.ignorePunctuation = ignorePunctuation;
        this.measurement = measurement;
    }
}