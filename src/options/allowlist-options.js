// Adds the input to the allowList if it follows the rules of and display it on the tbale.
function addToAllowListStorage(input, callback) {
    // check if input matches URL regex
    if (
        /^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(
            input
        )
    ) {
        // get the allowedWebsites
        chrome.storage.local.get({ allowedWebsites: [] }, function (result) {
            var allowList = result.allowedWebsites;
            // push to the allowList websites list
            allowList.push(input);
            // rewrite the allowedWebsites entry on the storage
            chrome.storage.local.set({ allowedWebsites: allowList }, callback);
        });
    } else {
        return;
    }
}


// add the value inside the allowList input to the allowList table and save to storage
function addEntryToAllowList(){
    let inputField = document.getElementById("allowlist-input")

    // remove http/https and www prefix from url
    url = inputField.value.replace(/(^\w+:|^)\/\//, '');
    url = url.replace(/www\./, '');

    console.log("URL",url);


    addToAllowListStorage(url, () => {
        // add the new website to the allowList table
        let websiteTable = document.getElementById("allowlist-table");
        createAllowListRow(websiteTable, inputField.value, websiteTable.rows.length-1);
        inputField.value = "";
    });

}

// add a row to the allowList table containing the input at rowI+1 
function createAllowListRow(websiteTable, input, rowI) {
    const row = websiteTable.insertRow(rowI + 1);
    var siteName = row.insertCell(0);
    var delButtonCell = row.insertCell(1);
    delButtonCell.classList.add("centered-cell");
    siteName.innerHTML = input;
    let delButton = document.createElement("input");
    delButton.type = "image";
    delButton.src = "../images/trash-can.png";
    delButton.classList.add("allowlist-delete-button");
    delButton.innerHTML = "Del";
    const website = input;
    delButton.addEventListener("click", function () {
        deleteButtonClicked(website, websiteTable, row);
    });
    delButtonCell.appendChild(delButton);
}

// deletes the row on click of the deleteButton on the allowList table amd removes it from the allowList
function deleteButtonClicked(websiteURL, table, row) {
    table.deleteRow(row.rowIndex);
    deleteFromAllowList(websiteURL);
}

// remove a specific website URL from the stored allowList
function deleteFromAllowList(websiteURL) {
    chrome.storage.local.get({ allowedWebsites: [] }, function (result) {
        var websites = result.allowedWebsites;
        // find the first occurence of the URL
        const index = websites.indexOf(websiteURL);
        // if the URL exists then remove it from the location
        if (index > -1) {
            websites.splice(index, 1);
        }
        chrome.storage.local.set({ allowedWebsites: websites });
    });
}
