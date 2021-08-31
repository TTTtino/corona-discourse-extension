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

function formatConcordanceData(concordanceData){
    let out = [];
    for(let element of concordanceData.concordanceLines){
        out.push(element.left + " " + element.word + " " + element.right);
    }
    return out;
}


function removeConcordanceDuplicates(concordanceData){
    if (typeof concordanceData === "undefined") {
        return null;
    } else {
        var concordanceDataCopy = concordanceData;
        concordanceDataCopy.concordanceLines = concordanceDataCopy.concordanceLines.filter((line, index, self) =>
            index === self.findIndex((t) => (
                t.left === line.left && t.right === line.right && t.word === line.word
            ))
        )
        
        return concordanceDataCopy;
    }
}

function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}