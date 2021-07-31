// Saves options to chrome.storage
function addWebsiteToWhitelist() {
    var input = document.getElementById('whitelist-input').value;
    if (/^(http(s)?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/.test(input)) {
        chrome.storage.local.get({ "whitelistWebsites": [] }, function(result) {
            var whitelist = result.whitelistWebsites;
            console.log(result);
            whitelist.push(input);
            chrome.storage.local.set({ "whitelistWebsites": whitelist })

            var websiteTable = document.getElementById("whitelist-table");
            createWhitelistRow(websiteTable, input, whitelist.length - 1);
            return true;
        })
    } else {
        return false;
    }
}


function restore_options() {
    chrome.storage.local.get({ "whitelistWebsites": [] }, function(result) {
        var websites = result.whitelistWebsites;
        console.log(websites);
        var websiteTable = document.getElementById("whitelist-table");
        for (var i = 0; i < websites.length; i++) {
            createWhitelistRow(websiteTable, websites[i], i);
        }
    })
}

function createWhitelistRow(websiteTable, input, rowI) {
    const row = websiteTable.insertRow(rowI + 1);
    var siteName = row.insertCell(0);
    var delButtonCell = row.insertCell(1);
    siteName.innerHTML = input;
    let delButton = document.createElement("button");
    delButton.classList.add("whitelist-delete-button");
    delButton.innerHTML = "Del";
    const website = input;
    delButton.addEventListener("click", function() {
        deleteButtonClicked(website, websiteTable, row);
    });
    delButtonCell.appendChild(delButton);
}

function deleteButtonClicked(websiteURL, table, row) {
    table.deleteRow(row.rowIndex)
    deleteFromWhitelist(websiteURL);
}

function deleteFromWhitelist(websiteURL) {

    chrome.storage.local.get({ "whitelistWebsites": [] }, function(result) {
        var websites = result.whitelistWebsites;
        const index = websites.indexOf(websiteURL);
        if (index > -1) {
            websites.splice(index, 1);
        }
        chrome.storage.local.set({ "whitelistWebsites": websites });
    })
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('whitelist-form').addEventListener('submit', addWebsiteToWhitelist)