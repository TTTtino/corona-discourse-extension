// requires a parser file executed before
console.log("FOREGROUND.js")

window.addEventListener("beforeunload", function (e) {
    chrome.runtime.sendMessage({
        "test": getPageContent(),
        "url":window.location.hostname
    });

});

