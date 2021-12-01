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
                        storeNewMetaInstructions(jsonIn['meta-instructions']), () => {
                            storeNewFrequencyInstructions(jsonIn['frequency'],() => {
                            })
                        }
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
    var statOutput = {
        researchName: null,
        metaResults: null,
        collocation: null,
        frequencies : null,
        concordanceLines: {
            concordance: null,
            totalExcluded: null
        }

    };
    getStatsToCollect((result) => {
        if (result != null) {
            statOutput.researchName = result.researchName;
        }

        getCalculatedCollocationData((collocationStats) => {
            if (collocationStats !== null) {

                statOutput.collocation = collocationStats;
            }

            getConcordanceData((concordStats) => {
                if (concordStats !== null) {

                    statOutput.concordanceLines.concordance = concordStats[0];
                    statOutput.concordanceLines.totalExcluded = concordStats[1]
                }

                getMetaInstructionsData((metaInstrData) => {
                    statOutput.metaInstruction = metaInstrData;
                    getMetaResultsData((metaResult) => {
                        statOutput.metaResults = metaResult;

                        

                        callback(statOutput);
                    })



                })

            });
        });
    });

}

// returns percentage of visited pages on allow list with hits
function getMetaResultsData(callback) {
    // init total websites count and total websites with hits count
    chrome.storage.local.get("totalWebsitesAndHits", (result) => {

        var totalHits = 0;

        // check if there is an entry for  total websites count and total websites with hits count
        if (typeof result.totalWebsitesAndHits !== 'undefined') {
            // calculate total hits in relation to total visited pages
            totalHits = Math.round(((1/result.totalWebsitesAndHits.totalWebsites) * result.totalWebsitesAndHits.websitesWithHits) * 100);
        }

        callback(totalHits);




    });
}


// Copy all the stats that have been collected so far and copy it to clipboard as a string
function copyStatsToClipBoard() {
    var textToCopy = "";
    getCombinedStats((statOutput) => {
        if (statOutput.collocation != null || statOutput.concordanceLines != null) {
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


    var file = new Blob([data], {
        type: type
    });
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
        if (statOutput.collocation != null || statOutput.concordanceLines != null) {
            console.log("STAT OUTPUT", statOutput.toString())
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
        console.log("statOutput ", statOutput)
        if (statOutput.collocation != null || statOutput.concordanceLines != null) {
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
                } else {
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


                // export concordance lines as CSV file
                msg = "";

                try {
                    json = JSON.parse(textToCopy);

                    exportConcordanceToCSV(fileName, json['concordanceLines'],json['metaResults']);

                } catch (error) {
                    console.log(error)
                    msg += "No concordance data to download."
                }

                success = "Download was successful. The result file can be found in your browser's download folder or in the folder you specified.";

                // export collocations as CSV file
                try {

                    exportCollocationToCSV(fileName, json["collocation"],json['metaResults']);

                } catch (error) {
                    console.group(error)
                    msg += " No collocation data to download. "
                }

                if (msg != '') {
                    success += " Note: " + msg;
                }

                // export meta results as CSV file

                alert(success);


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

        var titleText = document.createTextNode('');
        // check if object is an array(no keys)
        if (!Array.isArray(obj)) {
            titleText = document.createTextNode(key);
        } else {
            var keyAsNum = parseInt(key);
            titleText = document.createTextNode(String(keyAsNum + 1));
        }

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
function showInputParameters(collectionStats, allowList, parentElement) {

    if (collectionStats == null) {
        parentElement.appendChild(document.createElement("br"));
        let noStatParametersText = document.createTextNode(
            "There are no data collection parameters loaded."
        );
        parentElement.appendChild(noStatParametersText);
        return;
    }
    // Allow list tabel
    if (allowList != null) {
        createTableFromObject(
            allowList,
            ["Allow List Index", "Allow List URL"],
            parentElement)

    }
    // Meta Instruction Table
    if (collectionStats.metaInstruction != null) {
        createTableFromObject(
            collectionStats.metaInstruction,
            ["Meta Instruction Parameters", "Value"],
            parentElement
        );

    }
    // Collocation Table
    if (collectionStats.collocation != null) {
        createTableFromObject(
            collectionStats.collocation,
            ["Collocation Parameters", "Value"],
            parentElement
        );

    }
    // Concordance Table
    if (collectionStats.concordance != null) {
        createTableFromObject(
            collectionStats.concordance,
            ["Concordance Parameter", "Value"],
            parentElement
        );
    }

        // Concordance Table
        if (collectionStats.frequency != null) {
            createTableFromObject(
                collectionStats.frequency,
                ["Frequency Parameter", "Value"],
                parentElement
            );
        }

}


function convertToCSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += ','

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}

function exportCSVFile(headers, items, fileTitle) {

    if (headers) {

        items.unshift(headers);
    }

    var jsonObject = JSON.stringify(items);

    var csv = this.convertToCSV(jsonObject);

    var exportedFilename = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
    if (navigator.msSaveBlob) { // IE 10+ 
        navigator.msSaveBlob(blob, exportedFilename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", exportedFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

//Export collocation lines JSON data into CSV file
function exportCollocationToCSV(title, data,metaResults) {

    // Create headers for collocation table nGramFrequencies
    var headers = {
        index: '#',
        pivot: "Pivot",
        target: "Target",
        pivotFreq: "Pivot Frequency",
        targetFreq: "Target Frequency",
        pivotTargetFreq: "Pivot-Target Frequency",
        pivotProb: "Pivot Probability",
        targetProb: "Target Probability",
        pivotTargetProb: "Pivot-Target Probability",
        pmi: "PMI",
        totalHits: "Total Hits in %"


    };


    var itemsFormatted = [];

    var index = 0;

    // format the data for concordance lines
    data.forEach((item) => {

        index += 1;

        if (index === 1) {
            itemsFormatted.push({
                index: index,
                pivot: '"' + item['pivot'] + '"',
                target: '"' + item['target'] + '"',
                pivotFreq: '"' + item['pivotFreq'] + '"',
                targetFreq: '"' + item['targetFreq'] + '"',
                pivotTargetFreq: '"' + item['pivotTargetFreq'] + '"',
                pivotProb: '"' + item['pivotProb'] + '"',
                targetProb: '"' + item['targetProb'] + '"',
                pivotTargetProb: '"' + item['pivotTargetProb'] + '"',
                pmi: '"' + item['pmi'] + '"',
                totalHits: metaResults

            });

        } else {
            itemsFormatted.push({
                index: index,
                pivot: '"' + item['pivot'] + '"',
                target: '"' + item['target'] + '"',
                pivotFreq: '"' + item['pivotFreq'] + '"',
                targetFreq: '"' + item['targetFreq'] + '"',
                pivotTargetFreq: '"' + item['pivotTargetFreq'] + '"',
                pivotProb: '"' + item['pivotProb'] + '"',
                targetProb: '"' + item['targetProb'] + '"',
                pivotTargetProb: '"' + item['pivotTargetProb'] + '"',
                pmi: '"' + item['pmi'] + '"',

            });
        }

    });



    fileTitle = title + "_Collocations";

    exportCSVFile(headers, itemsFormatted, fileTitle);

}

//Export concordance lines JSON data into CSV file
function exportConcordanceToCSV(title, concordanceJsonData, totalHits) {

    // Create headers for concordance lines table
    var headers = {
        index: '#'.replace(/,/g, ''), // remove commas to avoid errors
        count: "Frequency",
        leftContext:'Left Context',
        left: "Left Span",
        word: "Target Token",
        right: "Right Span",
        rightContext:'Right Context',
        target: "Target Token",
        pmi:"PMI",
        source: "Source",
        totalExcluded: "Total Excluded in %",
        totalHits: "Total Hits in %"



    };

    var itemsFormatted = []

    var index = 0;

    // format the data for concordance lines

    concordanceJsonData['concordance'].forEach(lines => {
        lines['concordanceLines'].forEach(item => {

            index += 1;

            if (index === 1) {
                itemsFormatted.push({
                    index: index,
                    count: item['count'], // remove commas to avoid errors,
                    leftContext:'"' + getCleanedCSVContent(item['leftContext']) + '"',
                    left: '"' + getCleanedCSVContent(item['left']) + '"',
                    word: '"' + getCleanedCSVContent(item['word']) + '"',
                    right: '"' + getCleanedCSVContent(item['right']) + '"',
                    rightContext:'"' + getCleanedCSVContent(item['rightContext']) + '"',
                    target: '"' + getCleanedCSVContent(item['targetToken']) + '"',
                    pmi: item['calculatedMeasurements']['pmi'],
                    source: '"' + getCleanedCSVContent(lines['source']) + '"',
                    totalExcluded: concordanceJsonData['totalExcluded'],
                    totalHits: totalHits
                });
            } else {
                itemsFormatted.push({
                    index: index,
                    count: item['count'], // remove commas to avoid errors,
                    leftContext:'"' + getCleanedCSVContent(item['leftContext']) + '"',
                    left: '"' + getCleanedCSVContent(item['left']) + '"',
                    word: '"' + getCleanedCSVContent(item['word']) + '"',
                    right: '"' + getCleanedCSVContent(item['right']) + '"',
                    rightContext:'"' + getCleanedCSVContent(item['rightContext']) + '"',
                    target: '"' + getCleanedCSVContent(item['targetToken']) + '"',
                    pmi: item['calculatedMeasurements']['pmi'],
                    source: '"' + getCleanedCSVContent(lines['source']) + '"',
                });

            }
        });
    });



    fileTitle = title + "_ConcordanceLines";


    exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download

}

function getCleanedCSVContent(variable) {
    return variable.replace(/"/g, '""');
}