class ConcordanceData{
    constructor(){
        this.concordanceLines = [];
    }
}

function concordanceLineEquivalent(lineA, lineB){
    if(lineA.word === lineB.word
        && lineA.left === lineB.left
        && lineA.right === lineB.right){
            return true;
    } else{
        return false
    }
}
function combineConcordanceData(prevConcordData, calcConcordanceLines){
    var newConcordData = new ConcordanceData();
    var testConcordData = new ConcordanceData();
    testConcordData.concordanceLines = prevConcordData.concordanceLines
    console.log(testConcordData, prevConcordData);
    for (let i = 0; i < calcConcordanceLines.length; i++) {
        const insConcord = calcConcordanceLines[i];
        // let j = testConcordData.concordanceLines.length - 1;
        // while(j >= 0 && testConcordData.concordanceLines[j].word.toLowerCase() > insConcord.word.toLowerCase()){
        //     j -= 1;
        // }
        // if(concordanceLineEquivalent(testConcordData.concordanceLines[j], insConcord)){
        //     testConcordData.concordanceLines[j].count += 1;
        // } else if(concordanceLineEquivalent(testConcordData.concordanceLines[j+1], insConcord)){
        //     testConcordData.concordanceLines[j+1].count += 1;
        // }else{
        //     insConcord.count = 1;
        //     testConcordData.concordanceLines.splice(j+1, 0, insConcord);
        // }
        const containsInsConcord = (concordLine) => {
            return concordLine.word === insConcord.word && concordLine.left === insConcord.left && concordLine.right === insConcord.right
        }
        const duplLoc = testConcordData.concordanceLines.findIndex(containsInsConcord);
        if(duplLoc >= 0){
            testConcordData.concordanceLines[duplLoc].count += 1;
        } else{
            testConcordData.concordanceLines.push(insConcord);
        }
        
    }
    testConcordData.concordanceLines.sort((firstEl, secondEl) => {
        if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
            return -1;
        } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
            return 1;
        } else{
            return 0;
        }
    });
    newConcordData.concordanceLines = prevConcordData.concordanceLines.concat(calcConcordanceLines);
    return testConcordData;
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