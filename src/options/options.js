// requires: allowList-options.js, concordance-options, collocation-options, save-load-options.js

var SERVER_URL = 'https://pripa.azurewebsites.net';
//var SERVER_URL = 'http://127.0.0.1:8000';
console.log("OPTIONS.js");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action === "test"){
}
});
//chrome.runtime.onMessage.addListener(
//  function(request, sender, sendResponse) {
//   if (request.from == "script1After"){
//
//       console.log(request.message);
//    }
//
//    });

// load all the necessary things required in the options page
function load_options() {
// get all project from server that have status PUBLISHED
    fetch(SERVER_URL+'/get-available-projects/').then(r => r.text()).then(result => {
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

document.getElementById("projectDetails").style.visibility='hidden';


    chrome.storage.local.get({ allowedWebsites: [] }, function (result) {
        var websites = result.allowedWebsites;
        var websiteTable = document.getElementById("allowlist-table");
        // iterate through each entry in the allowlist and add to the allowlist table

        for (var i = 0; i < websites.length; i++) {
            createAllowListRow(websiteTable, websites[i], i);
        }

        // for each type of stat to collect, each one must be loaded using callbacks
        loadCollocationData(()=>{
            console.log("Loading Concordance Data");
            loadConcordanceData(()=>{
            });
        });
    });
}

function loadProject(){


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
          for(var i = 0; i < list.length; i++){
            if(list.options[i].innerHTML === result.project.name){
                optionIndex = i;
                break;
            }
          }

          // fill in data of selected project if project was found within dropdown options
          if(optionIndex > -1){
            list.options.selectedIndex = optionIndex;

            document.getElementById("projectTitle").innerText = result.project.name;
            document.getElementById("projectDescription").innerText = result.project.description;
            document.getElementById("select-analysis").style.visibility = 'hidden';
            document.getElementById("projectDetails").style.visibility='visible';

          }

                 chrome.storage.local.set({extensionActive: true}, ()=>{
        });


    } else{

        // overview tab
        document.getElementById("selected-project-title").innerHTML = "No Project Selected";
        document.getElementById("selected-project-details").style.display = 'none';

                chrome.storage.local.set({extensionActive: false}, ()=>{
        });

        // select project tab
        document.getElementById("projectDetails").style.visibility='none';
    }



        });


}
// Takes in a string and saves it as a title for the data currently being collected and then performs a callback function
function storeNewResearchName(name, callback) {
    chrome.storage.local.get("collectionStats", function (result) {
        // create default data collection and assign value to it if none exists
        if (typeof result.collectionStats === "undefined") {
            var defaultCollectionStats = new StatCollectionInfo();
            if(name == null){
                name = "NoNameProvidedInJSON";
            }
            defaultCollectionStats.researchName = name;
            chrome.storage.local.set(
                {
                    collectionStats: defaultCollectionStats,
                },
                () => {
                    callback();
                }
            );
        } else {
            // set the research name to the input string
            if(name == null){
                name = "NoNameProvidedInJSON";
            } 
            
            result.collectionStats.researchName = name;

            // override the currently stored StatCollectionInfo object
            chrome.storage.local.set(
                {
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
    var deleteWarningMessage = `This will reset all collected data. Would you like to delete all collected data? \nYou can download the collected data first, by going to the section 'Export Collected Statistics' above.`;
    // if the user presses "OK" on the confirm box
    if (confirm(deleteWarningMessage)) {
        // perform the preResetFunction if not null
        if (preResetFunction != null) {
            preResetFunction();
        }
        // remove the stored collocationData and concordanceData
        // add more callbacks for each stat that is added
        chrome.storage.local.remove("collocationData", ()=>{
            chrome.storage.local.remove("concordanceData", ()=>{
                location.reload();
            });
        });
        return true;
    } else {
        return false;
    }
}
// if the user confirms an alert, then "callback" function is performed before resetting the selected Project
function resetStoredProject(preResetFunction) {
    // warning message to display in the confirm box when data is going to be reset
    var deleteWarningMessage = `This will reset the selected project. Do you want to reset the selected project? This will not delete the collected data.`;
    // if the user presses "OK" on the confirm box
    if (confirm(deleteWarningMessage)) {
        // perform the preResetFunction if not null
        if (preResetFunction != null) {
            preResetFunction();
        }
        // remove the stored collocationData and concordanceData
        // add more callbacks for each stat that is added
        chrome.storage.local.remove("collectionStats", ()=>{
            chrome.storage.local.remove("project", ()=>{
             location.reload();
            });
        });
        return true;
    } else {
        return false;
    }
}

// load the necessary data for the options page once the DOM content is loaded
document.addEventListener("DOMContentLoaded", load_options);

// add a row to the allowList table and store the value in the entry field 
// when the allowlist-add-button is clicked
document
    .getElementById("allowlist-add-button")
    .addEventListener("click", addEntryToAllowList);


// ask user for permission to submit results and send results to backend
document
    .getElementById("submit-results")
    .addEventListener("click", () => {

        if(confirm("Are you sure you want to submit you results? If you press 'OK' the results will be send to the researchers.")){
         getResultsAsJSON((textToCopy) =>{

         chrome.storage.local.get("project", function (result) {

        if (typeof result.project !== "undefined") {
           data={
         project_id :result.project.id,
         result : JSON.parse(textToCopy)
         }

        fetch(SERVER_URL+'/submit-results/', {
        method: 'POST',
        body: JSON.stringify(data),
         headers: {
                'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
         credentials: 'include'
    }).then(function(response) {
        if(response.status === 200){
            alert("Results were successfully submitted. Thank you for your help!")
        }else{
            alert("Unfortunately  a problem occurred and your results couldn't be submitted.")
        }
    });
    }else{
        alert("Results couldn't be submitted");

    }
         });
         });
        }
    });



// add a row to the allowList table and store the value in the entry field 
// when the enter key is pressed inside the allowlist-input field
document
    .getElementById("allowlist-input")
    .addEventListener("keyup", (e) => {
        if(e.key === "Enter"){
            addEntryToAllowList();
        }
    });

// reset the stored data when the reset-stats-button is clicked
document.getElementById("reset-stats-button").addEventListener("click", () => {
    resetStoredData();
});
// reset the selected project when the reset-selected-project is clicked
document.getElementById("reset-selected-project").addEventListener("click", () => {
    resetStoredProject();
});

// copy all collected stats to the clipboard when the copy-clipboard button is pressed
document
    .getElementById("copy-clipboard")
    .addEventListener("click", copyStatsToClipBoard);

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
    if (typeof result.collectionStats !== "undefined") {
        showInputParameters(result.collectionStats, document.getElementById("data-collection-info"));
    } else{
        showInputParameters(null, document.getElementById("data-collection-info"));
    }
});



document.getElementById("availableAnalysis").addEventListener("change", () => {

      list = document.getElementById("availableAnalysis");
      var projectId = list.options[list.selectedIndex].value;
      if ( projectId != '-1'){
            fetch(SERVER_URL+'/get-project/?id='+projectId).then(r => r.text()).then(result => {
                try{
                jsonResult = JSON.parse(result)
                document.getElementById("projectTitle").innerText = jsonResult['projectName']
                document.getElementById("projectDescription").innerText = jsonResult['projectDescription']
                document.getElementById("select-analysis").style.visibility = 'visible';
                document.getElementById("projectDetails").style.visibility='visible';

                }
                catch(err){
                alert("We are sorry, something went wrong while fetching the project. Please try again later.")
                document.getElementById("projectTitle").innerText = "No Project Selected";
                }

            })

      }
      else{
      document.getElementById("projectDetails").style.visibility='hidden';
      }
});

document.getElementById("select-analysis").addEventListener("click", () => {
    if (confirm('Are you sure you want to participate in this project? By confirming the selected project will be saved and you currently participating project. NOTE: No data will be collected until you activate the extension. You can change the project at any time. ')) {

       list = document.getElementById("availableAnalysis");
       var projectId = list.options[list.selectedIndex].value;
       var projectName = list.options[list.selectedIndex].text;
       var projectDescription = document.getElementById("projectDescription").innerHTML;

       fetch(SERVER_URL+'/get-query/?id='+projectId).then(r => r.text()).then(result => {
        if(typeof result !== 'undefined'){
            try{
                var jsonIn = JSON.parse(result)
            }catch(err) {
                alert("We are sorry, something went wrong and the project couldn't be set as the current project. Please try again later.")
                return null;
            }



             storeNewResearchName(jsonIn["title"], () => {
                storeNewCollocateInstructions(jsonIn["collocate-groups"], () => {
                     storeNewConcordanceInstructions(
                        jsonIn["concordance-lines"],
                        () => {
                            }
                        );
                    });
                });

                 var project = new ProjectInfo(projectId,projectName,projectDescription);

                 chrome.storage.local.set({collectionStats: jsonIn},()=> {
                 });

                 chrome.storage.local.set({project: project},()=> {
                 });

                  alert("The project "+projectName+" was successfully set as the project you are participating in. You will now be redirected to the overview.")
                    location.reload();



        }



    })
}
});

