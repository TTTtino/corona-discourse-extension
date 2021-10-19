// load the concordance data in the concordance section and then perform the callback function
function loadConcordanceData(callback) {
    chrome.storage.local.get("concordanceData", function (result) {
        // if concordance data does not exist
        console.log(result.concordanceData);
        if (typeof result.concordanceData === "undefined" || result.concordanceData.length == 0) {
            // should create an empty table since there is no data
            createConcordanceTable(
                null,
                document.getElementById("concordance-section")
            );

            callback();
        } else {
            createConcordanceTable(
                result.concordanceData,
                document.getElementById("concordance-section")
            );

            chrome.storage.local.set({
                    concordanceData: result.concordanceData
                },
                function () {
                    callback();
                }
            );
        }
    });
}

function storeNewConcordanceInstructions(concordanceInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if (concordanceInst == null) {
                defaultCollectionStats.concordance = null;
            } else {
                defaultCollectionStats.concordance = new ConcordanceLines(
                    concordanceInst["pivot-tokens"], // pivots
                    concordanceInst["parse-as-regex"], // regex parsing
                    concordanceInst["span"][0], // left span
                    concordanceInst["span"][1] // right span
                );
            }
            chrome.storage.local.set({
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            if (concordanceInst == null) {
                result.collectionStats.concordance = null;
            } else {
                result.collectionStats.concordance = new ConcordanceLines(
                    concordanceInst["pivot-tokens"], // pivots
                    concordanceInst["parse-as-regex"], // regex parsing
                    concordanceInst["span"][0], // left span
                    concordanceInst["span"][1] // right span
                );
            }

            // override the currently stored StatCollectionInfo object
            chrome.storage.local.set({
                    collectionStats: result.collectionStats,
                },
                () => {
                    callback();
                }
            );
        }
    });
}

// Create a stat table using concordanceData as a child of some parentElement
function createConcordanceTable(concordanceData, parentElement) {
    // if input concordanceData is not null
    if (concordanceData !== null || concordanceData.length > 0) {
        // the maximum characters of each side of a concordance line before it is cut off
        const lineLimit = 90;
        // the number of characters that should be displayed if the left or right is past the lineLimit
        const lineDisplayLength = 80;


        // create a table
        var table = document.createElement("table");
        table.classList.add("stat-table");

        // header for the concordance table
        var header = [
            "#",
            "Left Content",
            "Pivot",
            "Right Content",
            "Count",
            "Source",
            "Exclude?",
        ];


        let thead = table.createTHead();

        // loop through every concordance line entry
        concordanceData.forEach(concordEntry => {

           var concordLines = concordEntry.concordanceLines;

            // sort the concordance lines by the word
            concordLines.sort((firstEl, secondEl) => {
                if (firstEl.word.toLowerCase() < secondEl.word.toLowerCase()) {
                    return -1;
                } else if (
                    firstEl.word.toLowerCase() > secondEl.word.toLowerCase()
                ) {
                    return 1;
                } else {
                    return 0;
                }
            });

            var rowNum = 1;

            // iterate through each concordance line and add rows of concordance lines to the table
            for (let element of concordLines) {
                let row = table.insertRow();

                //create cell for current row number
                let cell = row.insertCell();
                cell.append(rowNum)

                // cell left span
                let leftCell = row.insertCell();
                leftCell.style = "text-align: right;";
                // if the left has more than [lineLimit] characters then a span is used and its title would be the whole text
                if (element.left.length > lineLimit) {
                    let text = document.createElement("span");
                    text.innerHTML = "..." + element.left.slice(-lineDisplayLength);
                    text.setAttribute("title", element.left);
                    leftCell.appendChild(text);
                } else {
                    let text = document.createElement("span");
                    text.innerHTML = element.left;
                    leftCell.appendChild(text);
                }

                let wordCell = row.insertCell();
                wordCell.classList.add("centered-cell");
                let text = document.createElement("span");
                text.innerHTML = element.word;
                wordCell.appendChild(text);

                // cell right span
                let rightCell = row.insertCell();
                // if the left has more than [lineLimit] characters then a span is used and its title would be the whole text
                if (element.right.length > lineLimit) {
                    let text = document.createElement("span");
                    text.innerHTML =
                        element.right.slice(0, lineDisplayLength) + "...";
                    text.setAttribute("title", element.right);
                    rightCell.appendChild(text);
                } else {
                    let text = document.createElement("span");
                    text.innerHTML = element.right;
                    rightCell.appendChild(text);
                }

                // cell count
                let countCell = row.insertCell();
                let countText = document.createTextNode(element.count);
                countCell.style = "text-align: center;";
                countCell.appendChild(countText);

                //cell source
                let sourceCell = row.insertCell();
                let sourceText = document.createTextNode(concordEntry.source);
                sourceCell.style = "text-align: center;";
                sourceCell.appendChild(sourceText);


                // cell exclude
                let excludedCell = row.insertCell();
                let checkBox = document.createElement("INPUT");
                checkBox.setAttribute("type", "checkbox");
                checkBox.checked = element.excluded;
                checkBox.addEventListener("click", () => {
                    toggleConcordanceLineExclusion(element, checkBox);
                });
                excludedCell.style = "text-align: center;";
                excludedCell.appendChild(checkBox);

                rowNum += 1;
            }

            let row = thead.insertRow();

            // create each cell of the header and append to the table
        for (let value of header) {
            let th = document.createElement("th");
            let text = document.createTextNode(value);
            th.appendChild(text);
            row.appendChild(th);
        }


        });

        

        // append the concordance table to the parentElement
        parentElement.appendChild(table);
        parentElement.classList.add("scrollable-div");
    } else {
        // Create an element saying no stats have been collected yet.
        var noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Concordance data has been collected so far. Browse some of the allowed websites to collect data.";
        parentElement.appendChild(noDataMessage);
        parentElement.classList.remove("scrollable-div");
    }
}
// Toggles the specific concordLine's exlcusion attribute, depending on the value of checkBoxElement
function toggleConcordanceLineExclusion(concordLine, checkBoxElement) {
    // make concord line excluded
    chrome.storage.local.get("concordanceData", function (result) {
        let concordanceDataResult = result.concordanceData;
        // function that returns true if some concordLine is equivalent to the insConcord
        const containsConcordLine = (concordLineB) => {
            return (
                concordLineB.word === concordLine.word &&
                concordLineB.left === concordLine.left &&
                concordLineB.right === concordLine.right
            );
        };
        // finds the index of the concordance line where they are equivalent
        const loc =
            concordanceDataResult.concordanceLines.findIndex(
                containsConcordLine
            );
        if (checkBoxElement.checked == true) {
            concordanceDataResult.concordanceLines[loc].excluded = true;
        } else {
            concordanceDataResult.concordanceLines[loc].excluded = false;
        }
        chrome.storage.local.set({
                concordanceData: concordanceDataResult
            },
            () => {}
        );
    });
}

// Removes any lines in concordanceData if the line has been marked for exclusion
// returns the new concordanceData.
function removeExcluded(concordanceData) {
    concordanceData.concordanceLines = concordanceData.concordanceLines.filter(line => !line.excluded);
    return concordanceData;
}

// Gets the stored concordance data then performs the callback function with the resulting object as an argument
function getConcordanceData(callback) {
    chrome.storage.local.get("concordanceData", function (result) {
        if (typeof result.concordanceData === "undefined") {
            console.log("No concordance data found");
            callback(null);
        } else {
            let exclRemoved = removeExcluded(result.concordanceData);
            if (exclRemoved.concordanceLines.length > 0) {
                callback(exclRemoved);
            } else {
                callback(null);
            }
        }
    });
}