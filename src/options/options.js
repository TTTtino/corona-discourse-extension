// requires: allowList-options.js, concordance-options, collocation-options, save-load-options.js
var SERVER_URL = 'https://pripa-devel.azurewebsites.net';


console.log("OPTIONS.js");



// load all the necessary things required in the options page
function load_options() {

    // get all project from server that have status PUBLISHED

    fetch(SERVER_URL + '/api/available-projects/', {
        method: 'GET',
        headers: {
            'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'

        },
        credentials: 'include'
    }).then(r => r.text()).then(result => {

        var list = document.getElementById('availableAnalysis');

        jsonResult = JSON.parse(result)

        var option = document.createElement('option');
        option.value = -1
        option.innerHTML = 'Please select a project'
        list.appendChild(option);

        for (let i = 0; i < jsonResult.length; i++) {
            var option = document.createElement('option');
            option.value = jsonResult[i]["id"];
            option.innerHTML = jsonResult[i]["projectName"];
            list.appendChild(option);
        }

        loadProject();

    });

    document.getElementById("projectDetails").style.visibility = 'hidden';


    // ---------------------- ALLOWED LIST TAB ----------------------

    chrome.storage.local.get({
        allowedWebsites: []
    }, function (result) {
        var websites = result.allowedWebsites;
        var websiteTable = document.getElementById("allowlist-table");
        // iterate through each entry in the allowlist and add to the allowlist table
        console.log("websites", websites)

        for (var i = 0; i < websites.length; i++) {
            createAllowListRow(websiteTable, websites[i], i);
        }

        // for each type of stat to collect, each one must be loaded using callbacks

    });

    // ---------------------- OVERVIEW TAB ----------------------
    loadCollocationData(() => {
        console.log("Loading Concordance Data");
        loadConcordanceData(() => {});
    });





    // init total websites count and total websites with hits count
    chrome.storage.local.get("totalWebsitesAndHits", (result) => {

        // init total websites count and total websites with hits count
        if (typeof result.totalWebsitesAndHits === 'undefined') {
            result.totalWebsitesAndHits = {
                totalWebsites: 0,
                websitesWithHits: 0
            };
            // load total visited websites 
            document.getElementById("total-websites-visited").innerHTML = "0";

            // load total visited websites 
            document.getElementById("total-websites-with-hits").innerHTML = "0";

        } else {

            // load total visited websites 
            document.getElementById("total-websites-visited").innerHTML = result.totalWebsitesAndHits.totalWebsites;

            // load total visited websites 
            document.getElementById("total-websites-with-hits").innerHTML = result.totalWebsitesAndHits.websitesWithHits;

        }
    });


}

// Get available projects from database and load them into select project tab
function loadProject() {
    // get the input parameters for the currently selected project
    chrome.storage.local.get("project", function (result) {


        // check if there is a currently selected project
        // if so, show project and description
        if (typeof result.project !== "undefined") {
            // display project on overview page
            document.getElementById("selected-project-title").innerHTML = result.project.name;
            document.getElementById("selected-project-description").innerHTML = result.project.description;
            document.getElementById("selected-project-details").style.display = 'block';

            // display project on select project page
            var list = document.getElementById('availableAnalysis');

            var optionIndex = -1;
            // loop through select project dropdown to get index of currently selected project
            for (var i = 0; i < list.length; i++) {
                if (list.options[i].innerHTML === result.project.name) {
                    optionIndex = i;
                    break;
                }
            }

            // fill in data of selected project if project was found within dropdown options
            if (optionIndex > -1) {
                list.options.selectedIndex = optionIndex;

                document.getElementById("projectTitle").innerText = result.project.name;
                document.getElementById("projectDescription").innerText = result.project.description;
                document.getElementById("select-analysis").style.visibility = 'hidden';
                document.getElementById("projectDetails").style.visibility = 'visible';

            }



        } else {

            // overview tab
            document.getElementById("selected-project-title").innerHTML = "No Project Selected";
            document.getElementById("selected-project-details").style.display = 'none';


            // select project tab
            document.getElementById("projectDetails").style.visibility = 'none';
        }



    });


}
// Takes in a string and saves it as a title for the data currently being collected and then performs a callback function
function storeNewResearchName(name, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if (name == null) {
                name = "NoNameProvidedInJSON";
            }
            defaultCollectionStats.researchName = name;
            chrome.storage.local.set({
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            // set the research name to the input string
            if (name == null) {
                name = "NoNameProvidedInJSON";
            }

            result.collectionStats.researchName = name;

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

// if the user confirms an alert, then "callback" function is performed before resetting the stored data
function resetStoredData(preResetFunction) {
    // warning message to display in the confirm box when data is going to be reset
    var deleteWarningMessage = `This will reset the results. Would you like to delete your results? \nIf you would like to download your results first, go to the section 'Export Collected Statistics' above.`;
    // if the user presses "OK" on the confirm box
    if (confirm(deleteWarningMessage)) {
        // perform the preResetFunction if not null
        if (preResetFunction != null) {
            preResetFunction();
        }
        // remove the stored collocationData and concordanceData
        // add more callbacks for each stat that is added
        chrome.storage.local.remove("collocationData", () => {
                chrome.storage.local.remove("concordanceData", () => {
                        chrome.storage.local.remove("extensionActive", () => {
                                chrome.storage.local.remove("totalWebsitesAndHits", () => {

                                    alert("Your results have been successfully deleted.")
                                    location.reload();
                                });
                        });
                });
        });
    return true;
} else {
    return false;
}
}
// if the user confirms an alert, then "callback" function is performed before resetting the selected Project
function resetStoredProject(projectName, preResetFunction) {
    // warning message to display in the confirm box when data is going to be reset
    var deleteWarningMessage = `This will reset the selected project: ` + projectName + `. Do you want to reset this? Resetting the project will not delete your results.`;
    // if the user presses "OK" on the confirm box
    if (confirm(deleteWarningMessage)) {

        // remove the stored collocationData and concordanceData
        // add more callbacks for each stat that is added
        chrome.storage.local.remove("collectionStats", () => {
            chrome.storage.local.remove("allowedWebsites", () => {
                chrome.storage.local.remove("project", () => {
                    chrome.storage.local.remove("extensionActive", () => {
                        resetExtension(() => {
                            // perform the preResetFunction if not null
                            if (preResetFunction != null) {
                                preResetFunction();
                            }

                        })
                    });
                });
            });
        });
        return true;
    } else {
        return false;
    }
}

function resetExtension(preResetFunction) {
    // reset status of extension to inactive/false
    chrome.storage.local.remove(
        'extensionActive', () => {
            if (preResetFunction !== null) {
                preResetFunction();
            }
        });
}
// load the necessary data for the options page once the DOM content is loaded
document.addEventListener("DOMContentLoaded", load_options);

// ask user for permission to submit results and send results to backend
document
    .getElementById("submit-results")
    .addEventListener("click", () => {

        if (confirm("Are you sure you want to submit your results? Select 'OK' to submit these results to the researchers.")) {

            getResultsAsJSON((textToCopy) => {

                chrome.storage.local.get("project", function (result) {

                    if (typeof result.project !== "undefined") {
                        data = {
                            project_id: result.project.id,
                            result: JSON.parse(textToCopy)
                        }


                        fetch(SERVER_URL + '/api/results/', {
                            method: 'POST',
                            body: JSON.stringify(data),
                            headers: {
                                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'

                            },
                            credentials: 'include'
                        }).then(function (response) {
                            if (response.status === 200) {
                                alert("Your results were successfully submitted. Thank you for participating in [project]. \nFor information and further support please navigate to the 'Help' tab.")
                            } else {
                                alert("Unfortunately, a problem occurred and your results couldn't be submitted. Please try again. \nTo contact the researchers and for further support please navigate to the 'Help' tab.")
                            }
                        });
                    } else {
                        alert("Results couldn't be submitted");

                    }
                });
            });
        }
    });

// reset the stored data when the reset-stats-button is clicked
document.getElementById("reset-stats-button").addEventListener("click", () => {
    resetStoredData(() => {
        location.reload();
    });
});
// reset the selected project when the reset-selected-project is clicked
document.getElementById("reset-selected-project").addEventListener("click", () => {
    var projectName = document.getElementById("projectTitle").innerHTML;
    resetStoredProject(projectName, () => {
        location.reload();
    });
});

// // copy all collected stats to the clipboard when the copy-clipboard button is pressed
// document
//     .getElementById("copy-clipboard")
//     .addEventListener("click", copyStatsToClipBoard);

// download all collected stats as a json file when the download-stats button is pressed
document
    .getElementById("download-stats")
    .addEventListener("click", downloadCollectedStats);

// change the parameters for stat collection when the input inst-file-input is changed
document
    .getElementById("inst-file-input")
    .addEventListener("change", onFileInputChange);

const tabs = document.querySelectorAll("[data-tab-target]");
const tabContents = document.querySelectorAll("[data-tab-content]");
// iterate through each tag with "data-tab-target" selector
tabs.forEach((tab) => {
    // add an event listener for clicks to each tab-target element, (essentially becomes a button)
    tab.addEventListener("click", () => {
        // get the tag with query selector of the value of the [tab]'s data target value
        const target = document.querySelector(tab.dataset.tabTarget);
        // iterate through each of the tab-contents and remove "active" from the classList
        tabContents.forEach((tabContent) => {
            tabContent.classList.remove("active");
        });
        // iterate through each of the tab-targets and remove "active" from the classList
        tabs.forEach((tab) => {
            tab.classList.remove("active");
        });
        // add the active class to the classList of the tab and the target
        tab.classList.add("active");
        target.classList.add("active");
    });
});

var coll = document.getElementsByClassName("collapsible-button");
var i;
// iterate through every collapsible-button tags in the page
for (i = 0; i < coll.length; i++) {
    // when the tag is clicked
    coll[i].addEventListener("click", function () {
        // toggle the "active" class
        this.classList.toggle("active");
        // get the next next element sibling (should be the content of the tab)
        var content = this.nextElementSibling;
        // if it is displayed, then stop, else display it as a block
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}

// get the input parameters for stat collection and display it on the page
chrome.storage.local.get("collectionStats", function (result) {
    chrome.storage.local.get({
        allowedWebsites: []
    }, function (resultUrls) {
        if (typeof result.collectionStats !== "undefined" || typeof resultUrls.allowedWebsites !== "undefined") {
            showInputParameters(result.collectionStats, resultUrls.allowedWebsites, document.getElementById("data-collection-info"));
        } else {
            showInputParameters(null, document.getElementById("data-collection-info"));
        }
    });
});


document.getElementById("availableAnalysis").addEventListener("change", () => {

    list = document.getElementById("availableAnalysis");
    var projectId = list.options[list.selectedIndex].value;
    if (projectId != '-1') {
        fetch(SERVER_URL + '/api/project/?id=' + projectId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },

            credentials: 'include'
        }).then(r => r.text()).then(result => {
            try {
                jsonResult = JSON.parse(result)
                document.getElementById("projectTitle").innerText = jsonResult['projectName']
                document.getElementById("projectDescription").innerText = jsonResult['projectDescription']
                document.getElementById("select-analysis").style.visibility = 'visible';
                document.getElementById("projectDetails").style.visibility = 'visible';

            } catch (err) {
                alert("We are sorry, something went wrong while fetching the project. Please try again later.")
                document.getElementById("projectTitle").innerText = "No Project Selected";
            }

        })

    } else {
        document.getElementById("projectDetails").style.visibility = 'hidden';
    }
});

document.getElementById("select-analysis").addEventListener("click", () => {

    var projectName = document.getElementById("projectTitle").innerHTML;
    if (confirm('Please confirm that you agree to participate in the selected project: ' + projectName + '. Please remember to activate the extension to start collecting your results. You can change the project, delete your results, or stop participating at any time.')) {
        resetStoredProject(projectName, () => {
            list = document.getElementById("availableAnalysis");
            var projectId = list.options[list.selectedIndex].value;
            var projectName = list.options[list.selectedIndex].text;
            var projectDescription = document.getElementById("projectDescription").innerHTML;

            fetch(SERVER_URL + '/api/query/?id=' + projectId, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                credentials: 'include'
            }).then(r => r.text()).then(result => {
                if (typeof result !== 'undefined') {
                    try {
                        var jsonIn = JSON.parse(result)
                    } catch (err) {
                        alert("We are sorry, something went wrong and your current project selection has not been set. Please try again. \nFor information and further support please navigate to the 'Help' tab.")
                        return null;
                    }

                    storeProjectData(jsonIn, projectId, projectName, projectDescription);

                }

            })

        });
    }
});

async function storeProjectData(jsonIn, projectId, projectName, projectDescription) {
    let storeStatInstr = new Promise((resolve, reject) => {
        storeNewResearchName(jsonIn["title"], () => {
            storeNewCollocateInstructions(jsonIn["collocate-groups"], () => {
                storeNewConcordanceInstructions(
                    jsonIn["concordance-lines"],
                    () => {
                        storeNewMetaInstructions(jsonIn['meta-instructions'], () => {
                            resolve();
                        });
                    }
                );
            });
        });
    })


    let stripWebsite = new Promise((resolve, reject) => {
        if (typeof jsonIn['allow-list'] !== 'undefined') {
            chrome.storage.local.set({
                allowedWebsites: getStrippedDownAllowListURLS(jsonIn['allow-list']),
            }, () => {
                resolve()
            });
        }
    })

    var project = new ProjectInfo(projectId, projectName, projectDescription);


    let storeInfo = new Promise((resolve, reject) => {
        chrome.storage.local.set({
            collectionStats: jsonIn
        }, () => {
            resolve()
        });

    })
    let storeProject = new Promise((resolve, reject) => {
        chrome.storage.local.set({
            project: project
        }, () => {
            resolve()
        });

    })

    await Promise.all(
        [
            storeStatInstr,
            stripWebsite,
            storeInfo,
            storeProject

        ])

    resetExtension(() => {
        alert("The project " + projectName + " was successfully set as the project you are participating in. You will now be redirected to the overview.")
        location.reload();
    });
    s
}