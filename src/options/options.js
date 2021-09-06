// Adds the input to the whitelist if it follows the rules of and display it on the tbale.
function addToWhitelistStorage(input, callback) {
    // check if input matches URL regex
    if (
        /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
            input
        )
    ) {
        // get the whitelistWebsites
        chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
            var whitelist = result.whitelistWebsites;
            // push to the whitelist websites list
            whitelist.push(input);
            // rewrite the whitelistWebsites entry on the storage
            chrome.storage.local.set({ whitelistWebsites: whitelist }, callback);
        });
    } else {
        return;
    }
}

// add the value inside the whitelist input to the whitelist table and save to storage
function addEntryToWhitelist(){
    let inputField = document.getElementById("whitelist-input")
    addToWhitelistStorage(inputField.value, () => {
        // add the new website to the whitelist table
        let websiteTable = document.getElementById("whitelist-table");
        createWhitelistRow(websiteTable, inputField.value, websiteTable.rows.length-1);
        inputField.value = "";
    });

}

// load all the necessary things required in the options page
function load_options() {
    chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
        var websites = result.whitelistWebsites;
        var websiteTable = document.getElementById("whitelist-table");
        // iterate through each entry in the whitelist and add to the whitelist table
        for (var i = 0; i < websites.length; i++) {
            createWhitelistRow(websiteTable, websites[i], i);
        }

        // for each type of stat to collect, each one must be loaded using callbacks
        loadCollocationData(()=>{
            loadConcordanceData(()=>{});
        });
    });
}

// load the concordance data in the concordance section and then perform the callback function
function loadConcordanceData(callback){
    chrome.storage.local.get("concordanceData", function (result) {
        // if concordance data does not exist
        if (typeof result.concordanceData === "undefined") {
            // should create an empty table since there is no data
            createConcordanceTable(
                null,
                document.getElementById("concordance-section")
            );
            
            callback();
        } else {
            // remove all duplicates in the concordance saved so far
            let concordLinesNoDuplicates = removeConcordanceDuplicates(result.concordanceData);
            createConcordanceTable(concordLinesNoDuplicates, document.getElementById("concordance-section"));
            
            chrome.storage.local.set({ concordanceData: concordLinesNoDuplicates }, function () {
                callback();
            });
        }
    });
}

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
                    // console.log(result.collocationData);
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

// add a row to the whitelist table containing the input at rowI+1 
function createWhitelistRow(websiteTable, input, rowI) {
    const row = websiteTable.insertRow(rowI + 1);
    var siteName = row.insertCell(0);
    var delButtonCell = row.insertCell(1);
    delButtonCell.classList.add("centered-cell");
    siteName.innerHTML = input;
    let delButton = document.createElement("input");
    delButton.type = "image";
    delButton.src = "../images/trash-can.png";
    delButton.classList.add("whitelist-delete-button");
    delButton.innerHTML = "Del";
    const website = input;
    delButton.addEventListener("click", function () {
        deleteButtonClicked(website, websiteTable, row);
    });
    delButtonCell.appendChild(delButton);
}

// deletes the row on click of the deleteButton on the whitelist table amd removes it from the whitelist
function deleteButtonClicked(websiteURL, table, row) {
    table.deleteRow(row.rowIndex);
    deleteFromWhitelist(websiteURL);
}

// remove a specific website URL from the stored whitelist
function deleteFromWhitelist(websiteURL) {
    chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
        var websites = result.whitelistWebsites;
        // find the first occurence of the URL
        const index = websites.indexOf(websiteURL);
        // if the URL exists then remove it from the location
        if (index > -1) {
            websites.splice(index, 1);
        }
        chrome.storage.local.set({ whitelistWebsites: websites });
    });
}

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
                    () => {}
                );
            });
        });
    });
}

// Takes in a string and saves it as a title for the data currently being collected and then performs a callback function
function storeNewResearchName(name, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            defaultCollectionStats.researchName = name;
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
            // set the research name to the input string
            result.collectionStats.researchName = name;

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

// Takes in an object containing collocation parameters and saves it as a Collocation object 
// and then performs a callback function
function storeNewCollocateInstructions(collocateInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            defaultCollectionStats.collocation = new Collocation(
                collocateInst["pivot-tokens"],
                collocateInst["target-tokens"],
                collocateInst["allow-self-reference"],
                collocateInst["parse-as-regex"],
                collocateInst["span"][0],
                collocateInst["span"][1]
            );
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
            result.collectionStats.collocation = new Collocation(
                collocateInst["pivot-tokens"],
                collocateInst["target-tokens"],
                collocateInst["allow-self-reference"],
                collocateInst["parse-as-regex"],
                collocateInst["span"][0],
                collocateInst["span"][1]
            );

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

function storeNewConcordanceInstructions(concordanceInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            defaultCollectionStats.concordance = new ConcordanceLines(
                concordanceInst["pivot-tokens"], // pivots
                concordanceInst["parse-as-regex"], // regex parsing
                concordanceInst["span"][0], // left span
                concordanceInst["span"][1] // right span
            );
            chrome.storage.local.set(
                {
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            result.collectionStats.concordance = new ConcordanceLines(
                concordanceInst["pivot-tokens"], // pivots
                concordanceInst["parse-as-regex"], // regex parsing
                concordanceInst["span"][0], // left span
                concordanceInst["span"][1] // right span
            );
            
            // override the currently stored StatCollectionInfo object
            chrome.storage.local.set(
                {
                    collectionStats: result.collectionStats,
                },
                () => {
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
        // create a table element
        var table = document.createElement("table");
        table.classList.add("stat-table");

        // iterate through formatted collocation data and add each row to the table
        for (let element of data) {
            let row = table.insertRow();
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
        }

        // header for the collocation stat table
        var header = [
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
    } else {
        // Create an element saying no stats have been collected yet if collocationData is null
        let noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Collocation data has been collected so far. Browse some whitelisted websites to collect data.";
        parentElement.appendChild(noDataMessage);
    }
}

// Create a stat table using concordanceData as a child of some parentElement
function createConcordanceTable(
    concordanceData,
    parentElement
) {
    // if input concordanceData is not null
    if (concordanceData !== null) {
        // the maximum characters of each side of a concordance line before it is cut off
        const lineLimit = 90;
        // the number of characters that should be displayed if the left or right is past the lineLimit
        const lineDisplayLength = 80;

        var concordLines = concordanceData.concordanceLines;
        // sort the concordance lines by the word
        concordLines.sort((firstEl, secondEl) => {
            if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
                return -1;
            } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
                return 1;
            } else{
                return 0;
            }
        })
        
        
        // create a table
        var table = document.createElement("table");
        table.classList.add("stat-table");

        // iterate through each concordance line and add rows of concordance lines to the table
        for (let element of concordLines) {
            let row = table.insertRow();
            let leftCell = row.insertCell();
            leftCell.style = "text-align: right;";
            // if the left has more than [lineLimit] characters then a span is used and its title would be the whole text
            if(element.left.length > lineLimit){
                let text = document.createElement("span");
                text.innerHTML = "..." + element.left.slice(-lineDisplayLength);
                text.setAttribute("title", element.left);
                leftCell.appendChild(text);
            } else{
                let text = document.createElement("span");
                text.innerHTML = element.left;
                leftCell.appendChild(text);
            }

            let wordCell = row.insertCell();
            wordCell.classList.add("centered-cell");
            let text = document.createElement("span");
            text.innerHTML = element.word;
            wordCell.appendChild(text);

            let rightCell = row.insertCell();
            // if the left has more than [lineLimit] characters then a span is used and its title would be the whole text
            if(element.right.length > lineLimit){
                let text = document.createElement("span");
                text.innerHTML = element.right.slice(0, lineDisplayLength) + "...";
                text.setAttribute("title", element.right);
                rightCell.appendChild(text);
            } else{
                let text = document.createElement("span");
                text.innerHTML = element.right;
                rightCell.appendChild(text);
            }
        }
        
        // header for the concordance table
        var header = [
            "Left Content",
            "Pivot",
            "Right Content"
        ];
        let thead = table.createTHead();
        let row = thead.insertRow();
        // create each cell of the header and append to the table
        for (let value of header) {
            let th = document.createElement("th");
            let text = document.createTextNode(value);
            th.appendChild(text);
            row.appendChild(th);
        }

        // append the concordance table to the parentElement
        parentElement.appendChild(table);
    } else {
        // Create an element saying no stats have been collected yet.
        var noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Concordance data has been collected so far. Browse some whitelisted websites to collect data.";
        parentElement.appendChild(noDataMessage);
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

// if the user confirms an alert, then "callback" function is performed before resetting the stored data
function resetStoredData(preResetFunction) {
    // warning message to display in the confirm box when data is going to be reset
    var deleteWarningMessage = `This will reset all collected data. Would you like to delete all collected data? \nYou can download the collected data first, by going to the "import/export" section on the left.`;
    // if the user presses "OK" on the confirm box
    if (confirm(deleteWarningMessage)) {
        // perform the preResetFunction if not null
        if (preResetFunction != null) {
            preResetFunction();
        }
        // remove the stored collocationData and concordanceData
        // add more callbacks for each stat that is added
        chrome.storage.local.remove("collocationData", ()=>{
            chrome.storage.local.remove("concordanceData", ()=>{
                location.reload();
            });
        });
        return true;
    } else {
        return false;
    }
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

// Gets the stored concordance data then performs the callback function with the resulting object as an argument
function getConcordanceData(callback) {
    chrome.storage.local.get("concordanceData", function (result) {
        if (typeof result.concordanceData === "undefined") {
            console.log("No concordance data found");
            callback(null);
        } else {
            callback(result.concordanceData);
        }
    });
}

// copy some input text to the clipboard
// TODO: add support for older browsers (e.g. < Chrome 66)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

// Combine all the collected stats into one object and perform the callback function with it as an argument
function getCombinedStats(callback){
    var statOutput = {collocation:null, concordance:null};
    getCalculatedCollocationData((collocationStats) => {
        if (collocationStats !== null) {
            statOutput.collocation = collocationStats;
        }

        getConcordanceData((concordStats) =>{
            if (concordStats !== null) {
                statOutput.concordance = concordStats;
            }
            callback(statOutput);
        })
    });
}

// Copy all the stats that have been collected so far and copy it to clipboard as a string
function copyStatsToClipBoard() {
    var textToCopy = "";
    getCombinedStats((statOutput)=>{
        if(statOutput.collocation != null && 
            statOutput.concordance != null){
             textToCopy += JSON.stringify(statOutput, null, "\t");
             copyToClipboard(textToCopy);
         } else{
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

// Download all hte collected data as a json file
function downloadCollectedStats() {
    var textToCopy = "";

    getCombinedStats((statOutput) => {
        if(statOutput.collocation != null && 
            statOutput.concordance != null){
             textToCopy += JSON.stringify(statOutput, null, "\t");
             
             var currentDate = new Date();
                getStatsToCollect((result) => {
                    // create a file name using the name of the research and the data and time that it is downloaded
                    var fileName =
                        result.researchName +
                        "-Collected-Stats-" +
                        currentDate.getDate() +
                        "/" +
                        currentDate.getMonth() +
                        "/" +
                        currentDate.getFullYear() +
                        "-" +
                        currentDate.getHours() +
                        ":" +
                        currentDate.getMinutes() +
                        ":" +
                        currentDate.getSeconds();
                    download(textToCopy, fileName, "application/json");
                });
         } else{
             alert("No Stats have been collected");
         }
    })
}

// create a HTML table using any js object with the header made usign headerList, as a child of parentElement
function createTableFromObject(obj, headerList, parentElement){
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
        if(Array.isArray(obj[key])){
            const formattedArr = obj[key].map((x) => {
                switch(typeof x){
                    // add quotation marks to strings
                    case "string":
                        return ('"' + x + '"');
                    default:
                        return x;
                }   
            })
            // set the second column of the row to be the formatted value of the key
            let valueText = document.createTextNode(formattedArr.join(",  "));
            valueCell.appendChild(valueText);
        } else{
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
function showInputParameters(collectionStats, parentElement){
    // TODO: also show the research title 
    // Collocation Table
    createTableFromObject(collectionStats.collocation, ["Collocation Parameters", "Value"], parentElement);
    // Concordance Table
    createTableFromObject(collectionStats.concordance, ["Concordance Parameter", "Value"], parentElement);
}

// load the necessary data for the options page once the DOM content is loaded
document.addEventListener("DOMContentLoaded", load_options);

// add a row to the whitelist table and store the value in the entry field 
// when the whitelist-add-button is clicked
document
    .getElementById("whitelist-add-button")
    .addEventListener("click", addEntryToWhitelist);

// add a row to the whitelist table and store the value in the entry field 
// when the enter key is pressed inside the whitelist-input field
document
    .getElementById("whitelist-input")
    .addEventListener("keyup", (e) => {
        if(e.key === "Enter"){
            addEntryToWhitelist();
        }
    });

// reset the stored data when the reset-stats-button is clicked
document.getElementById("reset-stats-button").addEventListener("click", () => {
    resetStoredData();
});

// copy all collected stats to the clipboard when the copy-clipboard button is pressed
document
    .getElementById("copy-clipboard")
    .addEventListener("click", copyStatsToClipBoard);

// download all collected stats as a json file when the download-stats button is pressed
document
    .getElementById("download-stats")
    .addEventListener("click", downloadCollectedStats);

// change the parameters for stat collection when the input inst-file-input is changed
document
    .getElementById("inst-file-input")
    .addEventListener("change", onFileInputChange);

const tabs = document.querySelectorAll("[data-tab-target]");
const tabContents = document.querySelectorAll("[data-tab-content]");
// iterate through each tag with "data-tab-target" selector
tabs.forEach((tab) => {
    // add an event listener for clicks to each tab-target element, (essentially becomes a button)
    tab.addEventListener("click", () => {
        // get the tag with query selector of the value of the [tab]'s data target value
        const target = document.querySelector(tab.dataset.tabTarget);
        // iterate through each of the tab-contents and remove "active" from the classList
        tabContents.forEach((tabContent) => {
            tabContent.classList.remove("active");
        });
        // iterate through each of the tab-targets and remove "active" from the classList
        tabs.forEach((tab) => {
            tab.classList.remove("active");
        });
        // add the active class to the classList of the tab and the target
        tab.classList.add("active");
        target.classList.add("active");
    });
});

var coll = document.getElementsByClassName("collapsible-button");
var i;
// iterate through every collapsible-button tags in the page
for (i = 0; i < coll.length; i++) {
    // when the tag is clicked
    coll[i].addEventListener("click", function () {
        // toggle the "active" class
        this.classList.toggle("active");
        // get the next next element sibling (should be the content of the tab)
        var content = this.nextElementSibling;
        // if it is displayed, then stop, else display it as a block
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// get the input parameters for stat collection and display it on the page
chrome.storage.local.get("collectionStats", function (result) {
    showInputParameters(result.collectionStats, document.getElementById("data-collection-info"));
});