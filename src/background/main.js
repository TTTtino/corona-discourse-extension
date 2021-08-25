// Listens for changes on any of the tabs
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
                                    "stat_storage.js",
                                    "stat.js",
                                    data.parsers[i].parser,
                                    "./foreground.js",
                                ];
                                break;
                            }
                        }

                        // Use default parser if none were specified
                        if (!scripts) {
                            var scripts = [
                                "stat_storage.js",
                                "stat.js",
                                "./basic_parser.js",
                                "./foreground.js",
                            ];
                        }

                        // reset- ONLY FOR DEBUGGING
                        // chrome.storage.local.remove("collectionStats");

                        getStatsToCollect((result) => {
                            // console.log("Stats to collect function completed");
                            // fetch("./test.txt")
                            //     .then((response) => response.text())
                            //     .then((textString) => {
                            //         console.log(tokenize(textString));
                            //     });
                            importScripts(scripts, tabId);
                        });
                    });
            }
        });
    }
});

// gets the stat collection info and calls the callback parameter function with result as an argument
function getStatsToCollect(callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // if no collection stats havfe been defined
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            console.log(defaultCollectionStats);
            // create and set a "default collection stat"
            chrome.storage.local.set(
                { collectionStats: defaultCollectionStats },
                function () {
                    console.log("collectionStats not stored using defautlts");
                    callback(defaultCollectionStats);
                }
            );
        } else {
            console.log("result found");
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
