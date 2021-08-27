class ConcordanceData{
    constructor(){
        this.concordanceLines = [];
    }
}

function combineConcordanceData(prevConcordData, calcConcordanceLines){
    
    var newConcordData = new ConcordanceData();
    newConcordData.concordanceLines = prevConcordData.concordanceLines.concat(calcConcordanceLines);
    
    return newConcordData;
}