
// load the collocation data in the collocation section and then perform the callback function
function loadCollocationData(callback){
    chrome.storage.local.get("collocationData", function (result) {
        // if no collocation data is currently stored
        if (typeof result.collocationData === "undefined") {
            // should create an empty table since there is no data
            createCollocationStatTable(
                null,
                false,
                document.getElementById("collocation-section")
            );
            callback();
        } else {
            // get the collection stats info to see if self-reference is allowed
            chrome.storage.local.get(
                "collectionStats",
                (collectionResult) => {
                    var statCollection = collectionResult.collectionStats;
                    console.log(result.collocationData);
                    createCollocationStatTable(
                        calculateFreqPMI(
                            result.collocationData,
                            statCollection.collocation.selfReference
                        ),
                        statCollection.collocation.selfReference,
                        document.getElementById("collocation-section")
                    );
                    
            callback();
                }
            );
        }
    });
}


// Takes in an object containing collocation parameters and saves it as a Collocation object 
// and then performs a callback function
function storeNewCollocateInstructions(collocateInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if(collocateInst == null){
                result.collectionStats.collocation = null;
            } else{
                result.collectionStats.collocation = new Collocation(
                    collocateInst["pivot-tokens"],
                    collocateInst["target-tokens"],
                    collocateInst["allow-self-reference"],
                    collocateInst["parse-as-regex"],
                    collocateInst["span"][0],
                    collocateInst["span"][1]
                );
            }
            chrome.storage.local.set(
                {
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    // alert("Collocation Changed to ", defaultCollectionStats.collocation);
                    callback();
                }
            );
        } else {
            if(collocateInst == null){
                result.collectionStats.collocation = null;
            } else{
                result.collectionStats.collocation = new Collocation(
                    collocateInst["pivot-tokens"],
                    collocateInst["target-tokens"],
                    collocateInst["allow-self-reference"],
                    collocateInst["parse-as-regex"],
                    collocateInst["span"][0],
                    collocateInst["span"][1]
                );
            }


            // override the currently stored StatCollectionInfo object
            chrome.storage.local.set(
                {
                    collectionStats: result.collectionStats,
                },
                () => {
                    // alert("Collocation Changed to ", result.collectionStats.collocation);
                    callback();
                }
            );
        }
    });
}

// Create a stat table using collocationData as a child of some parentElement
function createCollocationStatTable(
    collocationData,
    selfReference,
    parentElement
) {
    // if the input collocationData was not null
    if (collocationData !== null) {
        // format the collocation data into a list representing each row to display
        var data = formatCollocationStatsForTable(
            collocationData,
            selfReference
        );
        if(data.length == 0){
            // Create an element saying no stats have been collected yet if collocationData is null
            let noDataMessage = document.createElement("p");
            noDataMessage.innerHTML =
                "Collected data shows that all PMI results are 0";
            parentElement.appendChild(noDataMessage);
            return;
        }
        // create a table element
        var table = document.createElement("table");
        table.classList.add("stat-table");

        var rowNum = 1;

        // iterate through formatted collocation data and add each row to the table
        for (let element of data) {
            let row = table.insertRow();

            //create cell for current row number
            let cell = row.insertCell();
            cell.append(rowNum)

            for (let key in element) {
                let cell = row.insertCell();
             
                if (!isNaN(element[key])) {
                    let text = document.createElement("span");
                    var roundedNum = Number(element[key].toFixed(4));
                    if (roundedNum != element[key]) {
                        text.classList.add("roundedNum");
                    }
                    text.innerHTML = roundedNum;
                    text.setAttribute("title", element[key]);
                    cell.appendChild(text);
                } else {
                    let text = document.createTextNode(element[key]);
                    cell.appendChild(text);
                }
            }

            rowNum+=1;
        }

        // header for the collocation stat table
        var header = [
            "#",
            "Pivot",
            "Target",
            "Pivot Frequency",
            "Target Frequency",
            "Pivot-Target Frequency",
            "Pivot Probability",
            "Target Probability",
            "Pivot-Target Probability",
            "PMI",
        ];
        let thead = table.createTHead();
        let row = thead.insertRow();
        // iterate through each header and add a cell to the thead
        for (let value of header) {
            let th = document.createElement("th");
            let text = document.createTextNode(value);
            th.appendChild(text);
            row.appendChild(th);
        }

        // append the table to the parentElement
        parentElement.appendChild(table);
        parentElement.classList.add("scrollable-div");
    } else {
        // Create an element saying no stats have been collected yet if collocationData is null
        let noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Collocation data has been collected so far. Browse some of the allowed websites to collect data.";
        parentElement.appendChild(noDataMessage);
        parentElement.classList.remove("scrollable-div");
    }
}

// formats the collocationData to a list of target-pivot pairs and its relevant values easier adding to a table
function formatCollocationStatsForTable(collocationData, selfReference) {
    // pivot, target, pivotFreq, targetFreq, pivotTargetFreq, pivotProb, targetProb, pivotTargetProb, PMI(pivot, Target)
    var tableLines = [];

    for (var pivot in collocationData.pivotFrequencies) {
        const pivotFreq = collocationData.pivotFrequencies[pivot];
        const pivotProb = collocationData.pivotProbabilities[pivot];
        for (var target in collocationData.targetFrequencies) {
            if (selfReference || target !== pivot) {
                const targetFreq = collocationData.targetFrequencies[target];
                const targetProb = collocationData.targetProbabilities[target];
                const pivotTargetFreq =
                    collocationData.nGramFrequencies[pivot + " " + target];
                const pivotTargetProb =
                    collocationData.nGramProbabilities[pivot + " " + target];
                const pmi = collocationData.pmi[pivot + " " + target];
                if (pivotFreq !== 0 || targetFreq !== 0) {
                    const line = {
                        pivot: pivot,
                        target: target,
                        pivotFreq: pivotFreq,
                        targetFreq: targetFreq,
                        pivotTargetFreq: pivotTargetFreq,
                        pivotProb: pivotProb,
                        targetProb: targetProb,
                        pivotTargetProb: pivotTargetProb,
                        pmi: pmi,
                    };
                    tableLines.push(line);
                }
            }
        }
    }

    return tableLines;
}


// Calculates the PMI using the stored collocationData (frequencies and tokenSums)
// then performs the callback function with the resulting object as an argument
function getCalculatedCollocationData(callback) {
    chrome.storage.local.get("collocationData", function (result) {
        if (typeof result.collocationData === "undefined") {
            console.log("No collocation data found");
            callback(null);
        } else {
            chrome.storage.local.get(
                "collectionStats",
                function (collectionResult) {
                    // console.log("Collocation data found");
                    var statCollection = collectionResult.collectionStats;
                    var finalCollocationData = calculateFreqPMI(
                        result.collocationData,
                        statCollection.collocation.selfReference
                    );
                    callback(finalCollocationData);
                }
            );
        }
    });
}
