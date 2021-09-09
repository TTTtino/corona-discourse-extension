console.log("Loaded basic_parser.js");

function getPageContent() {
    pageText = { value: "" };
    traverse(document.body, pageText);
    return pageText.value;
}

function isExcluded(elm) {
    if (elm.tagName == "STYLE") {
        return true;
    }
    if (elm.tagName == "SCRIPT") {
        return true;
    }
    if (elm.tagName == "NOSCRIPT") {
        return true;
    }
    if (elm.tagName == "IFRAME") {
        return true;
    }
    if (elm.tagName == "OBJECT") {
        return true;
    }
    return false
}

function traverse(elm, pageText) {
    if (elm.nodeType == Node.ELEMENT_NODE || elm.nodeType == Node.DOCUMENT_NODE) {

        // exclude elements with invisible text nodes
        if (isExcluded(elm)) {
            return
        }

        for (var i = 0; i < elm.childNodes.length; i++) {
            // recursively call to traverse
            traverse(elm.childNodes[i], pageText);
        }

    }

    if (elm.nodeType == Node.TEXT_NODE) {

        // exclude text node consisting of only spaces
        if (elm.nodeValue.trim() == "") {
            return
        }

        // elm.nodeValue here is visible text we need.
        //console.log(elm.nodeValue);

        pageText.value = pageText.value.concat(elm.nodeValue);
        pageText.value = pageText.value.concat(" ");
    }
}