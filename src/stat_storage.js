class CollocationData{
    constructor(){
        this.pivotFrequencies = {};
        this.targetFrequencies = {};
        this.nGramFrequencies = {};
        this.nGramSum = 0;
        this.tokenSum = 0;
    }
}

function combineCollocationData(prevCollocationData, collocationData){

    var newCollocationData = new CollocationData();
    for (var key in collocationData.pivotFrequencies) {
        var value = collocationData.pivotFrequencies[key];
        var oldVal = prevCollocationData.pivotFrequencies[key];
        if(oldVal != null){
            newCollocationData.pivotFrequencies[key] = oldVal + value;
        } else{
            newCollocationData.pivotFrequencies[key] = value;
        }
    }

    for (var key in collocationData.targetFrequencies) {
        var value = collocationData.targetFrequencies[key];
        var oldVal = prevCollocationData.targetFrequencies[key];
        if(oldVal != null){
            newCollocationData.targetFrequencies[key] = oldVal + value;
        } else{
            newCollocationData.targetFrequencies[key] = value;
        }
    }

    for (var key in collocationData.nGramFrequencies) {
        var value = collocationData.nGramFrequencies[key];
        var oldVal = prevCollocationData.nGramFrequencies[key];
        if(oldVal != null){
            newCollocationData.nGramFrequencies[key] = oldVal + value;
        } else{
            newCollocationData.nGramFrequencies[key] = value;
        }
        
    }

    if(prevCollocationData.nGramSum != null){
        newCollocationData.nGramSum = prevCollocationData.nGramSum + collocationData.nGramSum;
    } else{
        newCollocationData.nGramSum = collocationData.nGramSum;
    }

    if(prevCollocationData.tokenSum != null){
        newCollocationData.tokenSum = prevCollocationData.tokenSum + collocationData.tokenSum;
    } else{
        newCollocationData.tokenSum = collocationData.tokenSum;
    }
    
    return newCollocationData;
}