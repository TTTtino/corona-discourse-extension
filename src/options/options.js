// Saves options to chrome.storage
function addWebsiteToWhitelist() {
    var inputField = document.getElementById("whitelist-input");
    var input = inputField.value;
    if (
        /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
            input
        )
    ) {
        chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
            var whitelist = result.whitelistWebsites;
            // console.log(result);
            whitelist.push(input);
            chrome.storage.local.set({ whitelistWebsites: whitelist });

            var websiteTable = document.getElementById("whitelist-table");
            createWhitelistRow(websiteTable, input, whitelist.length - 1);
            inputField.value = "";
            return true;
        });
    } else {
        return false;
    }
}

function load_options() {
    chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
        var websites = result.whitelistWebsites;
        // console.log(websites);
        var websiteTable = document.getElementById("whitelist-table");
        for (var i = 0; i < websites.length; i++) {
            createWhitelistRow(websiteTable, websites[i], i);
        }

        loadCollocationData(()=>{
            loadConcordanceData(()=>{});
        });

        


    });
}

function loadConcordanceData(callback){
    chrome.storage.local.get("concordanceData", function (result) {
        // console.log("Result:", result);
        if (typeof result.concordanceData === "undefined") {
            // should create an empty table since there is no data
            createConcordanceTable(
                null,
                document.getElementById("concordance-section")
            );
            
            callback();
        } else {
            console.log(result.concordanceData);
            let concordLinesNoDuplicates = removeConcordanceDuplicates(result.concordanceData);
            createConcordanceTable(concordLinesNoDuplicates, document.getElementById("concordance-section"));
            
            chrome.storage.local.set({ concordanceData: concordLinesNoDuplicates }, function () {
                callback();
            });
        }
    });
}

function loadCollocationData(callback){
    chrome.storage.local.get("collocationData", function (result) {
        // console.log("Result:", result);
        if (typeof result.collocationData === "undefined") {
            // should create an empty table since there is no data
            createCollocationStatTable(
                null,
                false,
                document.getElementById("collocation-section")
            );
            callback();
        } else {
            chrome.storage.local.get(
                "collectionStats",
                function (collectionResult) {
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

function deleteButtonClicked(websiteURL, table, row) {
    table.deleteRow(row.rowIndex);
    deleteFromWhitelist(websiteURL);
}

function deleteFromWhitelist(websiteURL) {
    chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
        var websites = result.whitelistWebsites;
        const index = websites.indexOf(websiteURL);
        if (index > -1) {
            websites.splice(index, 1);
        }
        chrome.storage.local.set({ whitelistWebsites: websites });
    });
}

function openPage(tabLink, pageName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
        if (tablinks[i].classList.contains("active")) {
            tablinks[i].classList.remove("active");
        }
    }
    document.getElementById(tabLink).classList.add("active");
    document.getElementById(pageName).style.display = "block";
}

function onFileInputChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

function onReaderLoad(event) {
    resetStoredData(() => {
        var jsonIn = JSON.parse(event.target.result);
        // console.log("input", jsonIn);
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

function storeNewResearchName(name, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
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
            result.collectionStats.researchName = name;

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

function storeNewCollocateInstructions(collocateInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
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
                    alert(defaultCollectionStats.concordance);
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
            console.log(result.collectionStats.concordance);
            chrome.storage.local.set(
                {
                    collectionStats: result.collectionStats,
                },
                () => {
                    alert(result.collectionStats.concordance);
                    callback();
                }
            );
        }
    });
}

function createCollocationStatTable(
    collocationData,
    selfReference,
    parentElement
) {
    // console.log("CollcoationData to create:", collocationData)
    if (collocationData !== null) {
        var data = formatCollocationStatsForTable(
            collocationData,
            selfReference
        );
        // console.log("Formated CollocationData", data)
        var table = document.createElement("table");
        table.classList.add("stat-table");

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
        for (let value of header) {
            let th = document.createElement("th");
            let text = document.createTextNode(value);
            th.appendChild(text);
            row.appendChild(th);
        }

        parentElement.appendChild(table);
    } else {
        // Create an element saying no stats have been collected yet.
        let noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Collocation data has been collected so far. Browse some whitelisted websites to collect data.";
        parentElement.appendChild(noDataMessage);
    }
}

function createConcordanceTable(
    concordanceData,
    parentElement
) {
    // console.log("CollcoationData to create:", collocationData)
    if (concordanceData !== null) {
        const lineLimit = 90;
        const lineDisplayLength = 80;
        var concordLines = concordanceData.concordanceLines;
        concordLines.sort((firstEl, secondEl) => {
            if(firstEl.word.toLowerCase() < secondEl.word.toLowerCase()){
                return -1;
            } else if(firstEl.word.toLowerCase() > secondEl.word.toLowerCase()){
                return 1;
            } else{
                return 0;
            }
        })
        // console.log("Formated CollocationData", data)
        var table = document.createElement("table");
        table.classList.add("stat-table");

        for (let element of concordLines) {
            let row = table.insertRow();
            let leftCell = row.insertCell();
            leftCell.style = "text-align: right;";
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
        

        var header = [
            "Left Content",
            "Pivot",
            "Right Content"
        ];
        let thead = table.createTHead();
        let row = thead.insertRow();
        for (let value of header) {
            let th = document.createElement("th");
            let text = document.createTextNode(value);
            th.appendChild(text);
            row.appendChild(th);
        }

        parentElement.appendChild(table);
    } else {
        // Create an element saying no stats have been collected yet.
        var noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Concordance data has been collected so far. Browse some whitelisted websites to collect data.";
        parentElement.appendChild(noDataMessage);
    }
}


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

// if the user confirms the alert, then "callback" function is performed before resetting the stored data
function resetStoredData(callback) {
    var deleteWarningMessage = `This will reset all collected data. Would you like to delete all collected data? \nYou can download the collected data first, by going to the "import/export" section on the left.`;
    if (confirm(deleteWarningMessage)) {
        // console.log(callback);
        if (callback != null) {
            callback();
        }
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
}

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

const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], function (result) {
        if (result[key] === undefined) {
          reject();
        } else {
          resolve(result[key]);
        }
      });
    });
  };

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

function downloadCollectedStats() {
    var textToCopy = "";

    getCombinedStats((statOutput) => {
        if(statOutput.collocation != null && 
            statOutput.concordance != null){
             textToCopy += JSON.stringify(statOutput, null, "\t");
             
             var currentDate = new Date();
                getStatsToCollect((result) => {
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

function getDecimalPlaces(num) {
    if (Math.floor(num) === num) return 0;

    var str = num.toString();
    if (str.indexOf(".") !== -1 && str.indexOf("-") !== -1) {
        return str.split("-")[1] || 0;
    } else if (str.indexOf(".") !== -1) {
        return str.split(".")[1].length || 0;
    }
    return str.split("-")[1] || 0;
}

document.addEventListener("DOMContentLoaded", load_options);
document
    .getElementById("whitelist-add-button")
    .addEventListener("click", addWebsiteToWhitelist);

document
    .getElementById("whitelist-input")
    .addEventListener("keyup", addWebsiteToWhitelist);

document.getElementById("reset-stats-button").addEventListener("click", () => {
    resetStoredData();
});
document
    .getElementById("copy-clipboard")
    .addEventListener("click", copyStatsToClipBoard);

document
    .getElementById("download-stats")
    .addEventListener("click", downloadCollectedStats);
document
    .getElementById("inst-file-input")
    .addEventListener("change", onFileInputChange);

const tabs = document.querySelectorAll("[data-tab-target]");
const tabContents = document.querySelectorAll("[data-tab-content]");
tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        const target = document.querySelector(tab.dataset.tabTarget);
        tabContents.forEach((tabContent) => {
            tabContent.classList.remove("active");
        });
        tabs.forEach((tab) => {
            tab.classList.remove("active");
        });
        tab.classList.add("active");
        target.classList.add("active");
    });
});

var coll = document.getElementsByClassName("collapsible-button");
var i;

for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        // console.log(content);
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

