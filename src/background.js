console.log("Runnign Background Script");

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // only continue if the tab has been loaded and the link starts with http
    if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
        // Get the list of whitelisted websites from the chrome local storage
        chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
            var whitelist = result.whitelistWebsites;
            var url = new URL(tab.url);

            // compare the current pages url against the whitelist
            if (urlInList(url.hostname, whitelist)) {
                // get the information on how to parse the current url
                fetch("./data/parser_info.json")
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        // loop through the json to see if there were any parsers specified
                        var scripts = false;
                        for (var i = 0; i < data.parsers.length; i++) {
                            if (
                                url.hostname.includes(data.parsers[i].hostname)
                            ) {
                                var scripts = [
                                    data.parsers[i].parser,
                                    "stat_functions.js",
                                    "./foreground.js",
                                ];
                                break;
                            }
                        }

                        // Use default parser if none were specified
                        if (!scripts) {
                            var scripts = [
                                "stat_functions.js",
                                "./basic_parser.js",
                                "./foreground.js",
                            ];
                        }
                        getStatsToCollect((result) => {
                            console.log(result);
                            importScripts(scripts, tabId);
                        });
                    });
            }
        });
    }
});

function getStatsToCollect(callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        console.log(typeof result.collectionStats);
        if (typeof result.collectionStats === "undefined") {
            const defaultStatCollection = new StatCollectionInfo();
            chrome.storage.local.set(
                { collectionStats: defaultStatCollection },
                function () {
                    console.log("collectionStats not stored using defautlts");
                    callback(defaultStatCollection);
                }
            );
        } else {
            callback(result.collectionStats);
        }
    });
}

// recursively called until the list that is being passed through is empty, where each script in the filelist is executed
function importScripts(fileList, tabId) {
    if (fileList.length > 0) {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                files: [fileList[0]],
            },
            () => {
                importScripts(fileList.slice(1, fileList.length), tabId);
            }
        );
    } else {
        return;
    }
}

// compares a url with every element in a list of urls; returns true if present
function urlInList(url, urlList) {
    for (var i = 0; i < urlList.length; i++) {
        // console.log(urlList[i] + ", " + url);
        if (url.includes(urlList[i])) {
            return true;
        }
    }
    return false;
}

class StatCollectionInfo {
    constructor() {
        this.stats = ["wordCount", "charCount"];
        this.collocationA = ["covid"];
        this.collocationB = ["vaccine"];
    }
}
