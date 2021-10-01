// requires: allowList-options.js, concordance-options, collocation-options, save-load-options.js

// load all the necessary things required in the options page
function load_options() {
    chrome.storage.local.get({ allowedWebsites: [] }, function (result) {
        var websites = result.allowedWebsites;
        var websiteTable = document.getElementById("allowlist-table");
        // iterate through each entry in the allowlist and add to the allowlist table
        for (var i = 0; i < websites.length; i++) {
            createAllowListRow(websiteTable, websites[i], i);
        }

        // for each type of stat to collect, each one must be loaded using callbacks
        loadCollocationData(()=>{
            console.log("Loading Concordance Data");
            loadConcordanceData(()=>{
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
            if(name == null){
                name = "NoNameProvidedInJSON";
            }
            defaultCollectionStats.researchName = name;
            chrome.storage.local.set(
                {
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            // set the research name to the input string
            if(name == null){
                name = "NoNameProvidedInJSON";
            } 
            
            result.collectionStats.researchName = name;

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

// load the necessary data for the options page once the DOM content is loaded
document.addEventListener("DOMContentLoaded", load_options);

// add a row to the allowList table and store the value in the entry field 
// when the allowlist-add-button is clicked
document
    .getElementById("allowlist-add-button")
    .addEventListener("click", addEntryToAllowList);

// add a row to the allowList table and store the value in the entry field 
// when the enter key is pressed inside the allowlist-input field
document
    .getElementById("allowlist-input")
    .addEventListener("keyup", (e) => {
        if(e.key === "Enter"){
            addEntryToAllowList();
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
    if (typeof result.collectionStats !== "undefined") {
        showInputParameters(result.collectionStats, document.getElementById("data-collection-info"));
    } else{
        showInputParameters(null, document.getElementById("data-collection-info"));
    }
});