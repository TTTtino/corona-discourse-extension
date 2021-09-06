// class for storing the collected concordance data
class ConcordanceData{
    constructor(){
        this.concordanceLines = [];
    }
}

// return if two concordance lines are the same
function concordanceLineEquivalent(lineA, lineB){
    if(lineA.word === lineB.word
        && lineA.left === lineB.left
        && lineA.right === lineB.right){
            return true;
    } else{
        return false
    }
}

// combine two concordanceData objects and adds to count if it already 
// TODO: could be extrememly slow on older systems, try to improve O(n)
function combineConcordanceData(prevConcordData, calcConcordanceLines){
    //var newConcordData = new ConcordanceData();
    // copy the original concordnaceData values to a new ConcordanceData object
    var testConcordData = new ConcordanceData();
    testConcordData.concordanceLines = prevConcordData.concordanceLines

    // iterate through each of the newly calculated concordance lines
    for (let i = 0; i < calcConcordanceLines.length; i++) {

        //const insConcord = calcConcordanceLines[i];
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

        const insConcord = calcConcordanceLines[i];
        // function that returns true if some concordLine is equivalent to the insConcord
        const containsInsConcord = (concordLine) => {
            return concordLine.word === insConcord.word && concordLine.left === insConcord.left && concordLine.right === insConcord.right
        }
        // finds the index of the concordance line where they are equivalent
        const duplLoc = testConcordData.concordanceLines.findIndex(containsInsConcord);
        // if it does exist
        if(duplLoc >= 0){
            // add to the count instead of adding a duplicate
            testConcordData.concordanceLines[duplLoc].count += 1;
        } else{
            // push if concordance line hasn't been seen before
            testConcordData.concordanceLines.push(insConcord);
        }
        
    }

    // sort the new concordance lines by the word
    // testConcordData.concordanceLines.sort((firstEl, secondEl) => {
    //     if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
    //         return -1;
    //     } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
    //         return 1;
    //     } else{
    //         return 0;
    //     }
    // });
    //newConcordData.concordanceLines = prevConcordData.concordanceLines.concat(calcConcordanceLines);
    return testConcordData;
}

// format the concordnace line into a list of strings with the left, word and right combined
function formatConcordanceData(concordanceData){
    let out = [];
    for(let element of concordanceData.concordanceLines){
        out.push(element.left + " " + element.word + " " + element.right);
    }
    return out;
}

// remove duplicates in a concordanceLine object
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