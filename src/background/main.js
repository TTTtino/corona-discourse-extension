// Listens for changes on any of the tabs

const REQUIRED_SCRIPTS = [
    "stat_storage/collocation_storage.js",
    "stat_storage/concordance_storage.js",
    "stat_functions/generic.js",
    "stat_functions/collocation.js",
    "stat_functions/concordance.js",
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    chrome.action.setIcon({
        path: {
            16: "images/bw_logo16.png",
            48: "images/bw_logo48.png",
            128: "images/bw_logo128.png",
        },
    });
    // only continue if the tab has been loaded and the link starts with http
    if (changeInfo.status === "complete" && /^http/.test(tab.url)) {
        // Get the list of whitelisted websites from the chrome local storage
        chrome.storage.local.get({ whitelistWebsites: [] }, function (result) {
            var whitelist = result.whitelistWebsites;
            var url = new URL(tab.url);

            // compare the current pages url against the whitelist
            if (urlInList(url.hostname, whitelist)) {
                chrome.action.setIcon({
                    path: {
                        16: "images/logo16.png",
                        48: "images/logo48.png",
                        128: "images/logo128.png",
                    },
                });
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
                                    "./foreground.js",
                                ];
                                scripts = REQUIRED_SCRIPTS.concat(scripts);
                                break;
                            }
                        }

                        // Use default parser if none were specified
                        if (!scripts) {
                            var scripts = [
                                "./basic_parser.js",
                                "./foreground.js",
                            ];
                            scripts = REQUIRED_SCRIPTS.concat(scripts);
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
