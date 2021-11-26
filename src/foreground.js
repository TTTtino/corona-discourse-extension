// requires a parser file executed before
console.log("FOREGROUND.js")



chrome.storage.local.get("collectionStats", function (result) {
    if (result.collectionStats.metaInstruction.loadContentAt === 'close') {

        window.addEventListener("beforeunload", function (e) {
            chrome.runtime.sendMessage({
                "test": getPageContent(),
                "url": window.location.hostname
            });
        });
    } else {
        chrome.runtime.sendMessage({
            "test": getPageContent(),
            "url": window.location.hostname
        });
    }

});
