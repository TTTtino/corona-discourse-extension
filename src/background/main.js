// Listens for changes on any of the tabs


console.log("backend file.js");
// Scripts that are required by the foreground script to run on the page
const REQUIRED_SCRIPTS = [
    "stat_storage/collocation_storage.js",
    "stat_storage/concordance_storage.js",
    "stat_functions/generic.js",
    "stat_functions/collocation.js",
    "stat_functions/concordance.js",
];




// listener for changes on all tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // sets the icon to black and white by default
    chrome.action.setIcon({
        path: {
            16: "images/bw_logo16.png",
            48: "images/bw_logo48.png",
            128: "images/bw_logo128.png",
        },
    });
    chrome.storage.local.get({extensionActive: false}, (result)=>{
        if (result.extensionActive && changeInfo.status === "complete" && /^http/.test(tab.url)) {

           // Get the list of allowed list of websites from the chrome local storage
            chrome.storage.local.get({ allowedWebsites: [] }, function (result) {
                var allowList = result.allowedWebsites;
                var url = new URL(tab.url);


                // compare the current pages url against the allowList
                if (urlInList(url.href, allowList)) {

                    // if the foreground script is to be executed then the icon becomes coloured
                    chrome.action.setIcon({
                        path: {
                            16: "images/logo16.png",
                            48: "images/logo48.png",
                            128: "images/logo128.png",
                        },
                    });
                    // get the information on how to parse the current url
                    fetch("/data/parser_info.json")
                        .then((response) => {
                            return response.json();
                        })
                        .then((data) => {
                            // loop through the parser json to see if there were any parsers specified
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
                                    "/parsers/basic_parser.js",
                                    "/foreground.js",
                                ];
                                scripts = REQUIRED_SCRIPTS.concat(scripts);
                            }
    
                            executeMultipleScripts(scripts, tabId);
                        });
                }
            });
        }
    });
    
});

// recursively called until the list that is being passed through is empty, where each script in the filelist is executed
function executeMultipleScripts(fileList, tabId) {
    if (fileList.length > 0) {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabId },
                files: [fileList[0]],
            },
            () => {
                executeMultipleScripts(fileList.slice(1, fileList.length), tabId);
            }
        );
    } else {
        return;
    }
}

// compares a url with every element in a list of urls; returns true if present
function urlInList(url, urlList) {
    for (var i = 0; i < urlList.length; i++) {


        if (url.includes(urlList[i])) {
            return true;
        }
    }
    return false;
}

