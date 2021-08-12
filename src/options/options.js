// Saves options to chrome.storage
function addWebsiteToWhitelist() {
    var input = document.getElementById("whitelist-input").value;
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
            return true;
        });
    } else {
        return false;
    }
}

function restore_options() {
    chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
        var websites = result.whitelistWebsites;
        // console.log(websites);
        var websiteTable = document.getElementById("whitelist-table");
        for (var i = 0; i < websites.length; i++) {
            createWhitelistRow(websiteTable, websites[i], i);
        }
    });
}

function createWhitelistRow(websiteTable, input, rowI) {
    const row = websiteTable.insertRow(rowI + 1);
    var siteName = row.insertCell(0);
    var delButtonCell = row.insertCell(1);
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
    var jsonIn = JSON.parse(event.target.result);
    // console.log("input", jsonIn);
    storeNewCollocateInstructions(jsonIn["collocate-groups"]);
    resetStoredData();

}

function storeNewCollocateInstructions(collocateInst) {
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
            chrome.storage.local.set({
                collectionStats: defaultCollectionStats,
            });
        } else {
            result.collectionStats.collocation = new Collocation(
                collocateInst["pivot-tokens"],
                collocateInst["target-tokens"],
                collocateInst["allow-self-reference"],
                collocateInst["parse-as-regex"],
                collocateInst["span"][0],
                collocateInst["span"][1]
            );
            
            chrome.storage.local.set({
                collectionStats: result.collectionStats,
            });
        }
    });
}

function resetStoredData(){
    chrome.storage.local.remove("collocationData");
}

document.addEventListener("DOMContentLoaded", restore_options);
document
    .getElementById("whitelist-add-button")
    .addEventListener("click", addWebsiteToWhitelist);
document
    .getElementById("inst-file-input")
    .addEventListener("change", onFileInputChange);

const tabs = document.querySelectorAll('[data-tab-target]');
const tabContents = document.querySelectorAll('[data-tab-content]');
tabs.forEach(tab =>{
    tab.addEventListener('click', ()=>{
        const target = document.querySelector(tab.dataset.tabTarget);
        tabContents.forEach(tabContent => {
            tabContent.classList.remove("active");
        });
        tabs.forEach(tab => {
            tab.classList.remove("active");
        });
        tab.classList.add("active");
        target.classList.add("active");
    })
})
