
function findWordCount(string) {
    var newString = string.split(" ");
    newString = newString.filter(function(el) {
        return el != "" && el != null;
    })
    return newString.length;
}

function findCharCount(string) {
    var newString = string.replace(/[^a-zA-Z]/g, "");
    return newString.length;
}

// find the occurrences of some word in a string (content)
function findOccurences(content, term) {
    var newString = content.replace(/[-]/g, ' ').toLowerCase();
    newString = newString.replace(/[^\w\s!?]/g, '').toLowerCase();
    wordArr = newString.split(" ");
    console.log(wordArr)
    var count = 0;
    for (let i = 0; i < wordArr.length; i++) {
        if (wordArr[i] == term) {
            count++;
        }
    }
    return count;
}