// add a row to the allowList table containing the input at rowI+1 
function createAllowListRow(websiteTable, input, rowI) {
    const row = websiteTable.insertRow(rowI + 1);
    var siteName = row.insertCell(0);
    var delButtonCell = row.insertCell(1);
    delButtonCell.classList.add("centered-cell");
    siteName.innerHTML = input;
 
}


// get list with stripped down (removed https/http and www prefix) allow list url
function getStrippedDownAllowListURLS(urls){

    strippedURLS = []
    urls.forEach(url => {
        strippedURLS.push(stripDownAllowListURL(url));
        
    });

    return strippedURLS;
}

// remove https/http and www prefix of url
function stripDownAllowListURL(url){
    // remove http/https and www prefix from url
    url = url.replace(/(^\w+:|^)\/\//, '');
    url = url.replace(/www\./, '');

    return url

}

