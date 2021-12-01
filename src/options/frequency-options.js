// load the frequency data in the frequency section and then perform the callback function
function loadFrequencyData(callback) {
    chrome.storage.local.get("frequencyData", function (result) {
        // if no frequency data is currently stored
        if (typeof result.frequencyData === "undefined") {
            // should create an empty table since there is no data
            createFrequencyStatTable(
                null,
                document.getElementById("frequency-section")
            );

            document.getElementById('freq-word-count-section').style.display = 'none';

            


            callback();
        } else {


            createFrequencyStatTable(
                result.frequencyData,
                document.getElementById("frequency-section")
            );

            // show total word count in frequency section
            document.getElementById('freq-word-count').innerHTML = result.frequencyData.totalWordCount;
            document.getElementById('freq-word-count-section').style.visibility = 'visible';

            callback();


        }
    });
}

function getFrequencyInstructions(frequencyInst) {
    var frequency = null;
    if (frequencyInst !== null) {
        frequency = new Frequency(
            frequencyInst["tokens"],
            frequencyInst["parse-as-regex"]

        );
    }

    return frequency;
}

// Takes in an object containing frequency parameters and saves it as a Frequency object 
// and then performs a callback function
function storeNewFrequencyInstructions(frequencyInst, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if (frequencyInst == null) {
                result.collectionStats.frequency = null;
            } else {
                result.collectionStats.frequency = new Frequency(
                    frequencyInst["tokens"],
                    frequencyInst["parse-as-regex"]
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
            if (frequencyInst == null) {
                result.collectionStats.frequency = null;
            } else {
                result.collectionStats.frequency = new Frequency(
                    frequencyInst["tokens"],
                    frequencyInst["parse-as-regex"],
                    frequencyInst["measurement"]
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

// Create a stat table using frequencyData as a child of some parentElement
function createFrequencyStatTable(
    frequencyData,
    parentElement
) {
    // if the input frequencyData was not null
    if (frequencyData !== null) {
        // format the frequency data into a list representing each row to display
        // create a table element
        var table = document.createElement("table");
        table.classList.add("stat-table");

        var rowNum = 1;

        // iterate through formatted frequency data and add each row to the table
        for (var element in frequencyData.tokens) {
            let row = table.insertRow();

            // cell for current row number
            let leftCell = row.insertCell();
            leftCell.style = "text-align: right;";
            leftCell.append(rowNum)


            //  cell for token
            createTextCell(element, row);

            //  cell for absolute freq
            createTextCell(frequencyData.tokens[element].absoluteFrequency, row);

            // cell relative freq
            createTextCell(frequencyData.tokens[element].relativeFrequency, row);

             // cell log freq
             createTextCell(frequencyData.tokens[element].logFrequency, row);


            rowNum += 1;
        }

        // header for the frequency stat table
        var header = [
            "#",
            "Token",
            "Absolute Frequency",
            "Relative Frequency",
            "Logarithmic Frequency"
        ];
        let thead = table.createTHead();
        let row = thead.insertRow();
        // iterate through each header and add a cell to the thead
        for (let value of header) {
            let th = document.createElement("th");
            let text = document.createTextNode(value);
            th.appendChild(text);
            row.appendChild(th);
        }

        // append the table to the parentElement
        parentElement.appendChild(table);
        parentElement.classList.add("scrollable-div");
    } else {

        // Create an element saying no stats have been collected yet if frequencyData is null
        let noDataMessage = document.createElement("p");
        noDataMessage.innerHTML =
            "No Frequency data has been collected so far. Browse some of the allowed websites to collect data.";
        parentElement.appendChild(noDataMessage);
        parentElement.classList.remove("scrollable-div");
    }
}


// Gets the stored frequency data then performs the callback function with the resulting object as an argument
function getFrequencyData(callback) {
    chrome.storage.local.get("frequencyData", function (result) {
        if (typeof result.frequencyData === "undefined") {
            console.log("No frequency data found");
            callback(null);
        } else {
            callback(result.frequencyData);

        }
    });
}