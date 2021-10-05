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
