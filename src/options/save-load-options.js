// reads the input in an file input tag
function onFileInputChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

// takes in a json file from a reader and saves input parameters stored inside it and resets any previously stored data
function onReaderLoad(event) {
    // reset the stored data, but performs the parameter function first
    resetStoredData(() => {
        // parse the inputted JSON
        // TODO: ensure that the loaded file is a JSON file before parsing
        var jsonIn = JSON.parse(event.target.result);
        // use callbacks to store each piece of input data that is necessary for the extension
        storeNewResearchName(jsonIn["title"], () => {
            storeNewCollocateInstructions(jsonIn["collocate-groups"], () => {
                storeNewConcordanceInstructions(
                    jsonIn["concordance-lines"],
                    () => {
                    }
                );
            });
        });
    });
}

// copy some input text to the clipboard
// TODO: add support for older browsers (e.g. < Chrome 66)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

// Combine all the collected stats into one object and perform the callback function with it as an argument
function getCombinedStats(callback) {
    var statOutput = {researchName:null, collocation: null, concordance: null };
    getStatsToCollect((result)=>{
        if(result != null){
            statOutput.researchName = result.researchName;
        }
        
        getCalculatedCollocationData((collocationStats) => {
            if (collocationStats !== null) {
                statOutput.collocation = collocationStats;
            }
    
            getConcordanceData((concordStats) => {
                if (concordStats !== null) {
                    statOutput.concordance = concordStats;
                }
                callback(statOutput);
            });
        });
    });

}

// Copy all the stats that have been collected so far and copy it to clipboard as a string
function copyStatsToClipBoard() {
    var textToCopy = "";
    getCombinedStats((statOutput) => {
        if (statOutput.collocation != null || statOutput.concordance != null) {
            textToCopy += JSON.stringify(statOutput, null, "\t");
            copyToClipboard(textToCopy);
        } else {
            alert("No Stats have been collected");
        }
    });
}

// Function to download data to a file
// https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
        // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}
// Download all the collected data as a json file
function getResultsAsJSON(callback) {
    var textToCopy = "";

    getCombinedStats((statOutput) => {
        if (statOutput.collocation != null || statOutput.concordance != null) {
            textToCopy += JSON.stringify(statOutput, null, "\t");
            callback(textToCopy);
        } else {
            alert("No data has been collected");
        }


    });


}

// Download all hte collected data as a json file
function downloadCollectedStats() {
    var textToCopy = "";

    getCombinedStats((statOutput) => {
        if (statOutput.collocation != null || statOutput.concordance != null) {
            textToCopy += JSON.stringify(statOutput, null, "\t");

            var currentDate = new Date();
            getStatsToCollect((result) => {
                // create a file name using the name of the research and the data and time that it is downloaded
                var fileName = "";
                if (result != null) {
                    var fileName =
                        result.researchName +
                        "_Collected_Stats_" +
                        currentDate.getDate() +
                        "-" +
                        currentDate.getMonth() +
                        "-" +
                        currentDate.getFullYear() +
                        "_" +
                        currentDate.getHours() +
                        "-" +
                        currentDate.getMinutes() +
                        "-" +
                        currentDate.getSeconds();
                } else{
                    var fileName =
                    "UnknownParameters_Collected_Stats_" +
                    currentDate.getDate() +
                    "-" +
                    currentDate.getMonth() +
                    "-" +
                    currentDate.getFullYear() +
                    "_" +
                    currentDate.getHours() +
                    "-" +
                    currentDate.getMinutes() +
                    "-" +
                    currentDate.getSeconds();
                    currentDate.getSeconds();
                }
                download(textToCopy, fileName, "application/json");
            });
        } else {
            alert("No Stats have been collected");
        }
    });
}

// create a HTML table using any js object with the header made usign headerList, as a child of parentElement
function createTableFromObject(obj, headerList, parentElement) {
    var table = document.createElement("table");
    // iterate through each key of the obj
    for (const key in obj) {
        let row = table.insertRow();
        let titleCell = row.insertCell();
        // set the first column of the row to be the key
        let titleText = document.createTextNode(key);
        titleCell.appendChild(titleText);

        let valueCell = row.insertCell();

        // if the value of the key is an array, format it neater
        if (Array.isArray(obj[key])) {
            const formattedArr = obj[key].map((x) => {
                switch (typeof x) {
                    // add quotation marks to strings
                    case "string":
                        return '"' + x + '"';
                    default:
                        return x;
                }
            });
            // set the second column of the row to be the formatted value of the key
            let valueText = document.createTextNode(formattedArr.join(",  "));
            valueCell.appendChild(valueText);
        } else {
            let valueText = document.createTextNode(obj[key]);
            valueCell.appendChild(valueText);
        }
    }

    // create the header for the table using headerList
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let value of headerList) {
        let th = document.createElement("th");
        let text = document.createTextNode(value);
        th.appendChild(text);
        row.appendChild(th);
    }

    // append the table to the parentElement
    parentElement.appendChild(table);
}

// show the collection Stats as a child of parentElement
function showInputParameters(collectionStats, parentElement) {
    // TODO: also show the research title
    if (collectionStats == null) {
        parentElement.appendChild(document.createElement("br"));
        let noStatParametersText = document.createTextNode(
            "There are no data collection parameters loaded."
        );
        parentElement.appendChild(noStatParametersText);
        return;
    }
    // Collocation Table
    if(collectionStats.collocation != null){
        createTableFromObject(
            collectionStats.collocation,
            ["Collocation Parameters", "Value"],
            parentElement
        );

    }
    // Concordance Table
    if(collectionStats.concordance != null){
        createTableFromObject(
            collectionStats.concordance,
            ["Concordance Parameter", "Value"],
            parentElement
        );
    }
   
}
